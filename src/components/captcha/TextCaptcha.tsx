'use client';

import * as React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { RefreshCcw } from 'lucide-react';

interface TextCaptchaProps {
  difficulty: number; // 1-3
  onComplete: (success: boolean, timeTaken: number) => void;
}

// ─── Perlin Noise (lightweight 2D implementation) ───────────────────────────

function perlinNoise2D() {
  // Permutation table (doubled for overflow wrapping)
  const perm = new Uint8Array(512);
  for (let i = 0; i < 256; i++) perm[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  for (let i = 0; i < 256; i++) perm[i + 256] = perm[i];

  const grad = (hash: number, x: number, y: number) => {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  };

  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a: number, b: number, t: number) => a + t * (b - a);

  return (x: number, y: number) => {
    const xi = Math.floor(x) & 255;
    const yi = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = fade(xf);
    const v = fade(yf);

    const aa = perm[perm[xi] + yi];
    const ab = perm[perm[xi] + yi + 1];
    const ba = perm[perm[xi + 1] + yi];
    const bb = perm[perm[xi + 1] + yi + 1];

    return lerp(
      lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u),
      lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u),
      v
    );
  };
}

export function TextCaptcha({ difficulty, onComplete }: TextCaptchaProps) {
  const [inputValue, setInputValue] = React.useState('');
  const [captchaText, setCaptchaText] = React.useState('');
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const startTime = React.useRef<number>(Date.now());
  const [canvasWidth, setCanvasWidth] = React.useState(300);
  const canvasHeight = 120;

  const generateCaptcha = React.useCallback(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    const length = 4 + difficulty; // 5, 6, 7 chars
    let text = '';
    for (let i = 0; i < length; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(text);
    setInputValue('');
    startTime.current = Date.now();

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ── Background ──────────────────────────────────────────────────────

    const bgColor = '#fdf6f6';
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ── Color helpers ───────────────────────────────────────────────────

    const getPastelColor = () => {
      const h = Math.floor(Math.random() * 360);
      return `hsl(${h}, 70%, 80%)`;
    };

    const getDarkerPastelColor = () => {
      const h = Math.floor(Math.random() * 360);
      return `hsl(${h}, 60%, 50%)`;
    };

    // Store text colors for Bézier strikes to match
    const textColors: string[] = [];
    for (let i = 0; i < text.length; i++) {
      textColors.push(getDarkerPastelColor());
    }

    // ── 1. Perlin Noise Overlay (background layer) ──────────────────────

    const noise = perlinNoise2D();
    const noiseIntensity = 25 + difficulty * 20; // 45, 65, 85
    const noiseFrequency = 0.04 + difficulty * 0.02; // Match stroke-width frequency

    const noiseImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const noiseData = noiseImageData.data;

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const n = noise(x * noiseFrequency, y * noiseFrequency);
        const idx = (y * canvas.width + x) * 4;
        // Modulate background pixels with noise
        const offset = Math.floor(n * noiseIntensity);
        noiseData[idx] = Math.max(0, Math.min(255, noiseData[idx] + offset));       // R
        noiseData[idx + 1] = Math.max(0, Math.min(255, noiseData[idx + 1] + offset)); // G
        noiseData[idx + 2] = Math.max(0, Math.min(255, noiseData[idx + 2] + offset)); // B
      }
    }
    ctx.putImageData(noiseImageData, 0, 0);

    // ── 2. Draw text with Occlusion Overlap ─────────────────────────────

    const fontSize = Math.min(36 - difficulty * 2, canvasWidth / length);
    const computedFont = window.getComputedStyle(document.body).fontFamily;
    ctx.font = `bold ${fontSize}px ${computedFont}`;
    ctx.textBaseline = 'middle';

    // Occlusion Overlap: negative spacing — 10%, 20%, 30% overlap
    const overlapFactor = 0.1 * difficulty;
    const baseSpacing = (canvasWidth - 40) / length;
    const charSpacing = baseSpacing * (1 - overlapFactor);

    // Center the overlapped text block
    const totalTextWidth = charSpacing * (length - 1);
    const startX = (canvasWidth - totalTextWidth) / 2;

    for (let i = 0; i < text.length; i++) {
      ctx.save();
      const targetX = startX + i * charSpacing;
      const jitterX = (Math.random() - 0.5) * 8;
      const y = canvas.height / 2 + (Math.random() - 0.5) * 12;

      ctx.translate(targetX + jitterX, y);
      ctx.rotate((Math.random() - 0.5) * 0.3 * difficulty); // ±0.15, ±0.3, ±0.45 rad
      ctx.fillStyle = textColors[i];
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }

    // ── 3. Color Camouflage ("Swiss-Cheese" effect) ─────────────────────

    const camouflageChance = 0.05 * difficulty; // 5%, 10%, 15% per-pixel drop
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;

    // Parse background color for comparison
    const bgR = 253, bgG = 246, bgB = 246; // #fdf6f6
    const threshold = 60; // Pixel must differ from bg by this much to be "text"

    for (let i = 0; i < pixels.length; i += 4) {
      const dr = Math.abs(pixels[i] - bgR);
      const dg = Math.abs(pixels[i + 1] - bgG);
      const db = Math.abs(pixels[i + 2] - bgB);
      const diff = dr + dg + db;

      // Only affect pixels that are NOT background (i.e., text/line pixels)
      if (diff > threshold && Math.random() < camouflageChance) {
        pixels[i] = bgR;
        pixels[i + 1] = bgG;
        pixels[i + 2] = bgB;
        pixels[i + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // ── 4. Elastic Distortion (Mesh Warp) ───────────────────────────────

    const warpAmplitude = 3 * difficulty; // 3, 6, 9 px
    const warpPeriod = 25 + Math.random() * 15;

    // Read current canvas
    const srcData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const dstData = ctx.createImageData(canvas.width, canvas.height);
    const src = srcData.data;
    const dst = dstData.data;

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        // Sinusoidal displacement — stretches top-left, compresses bottom-right
        const dx = warpAmplitude * Math.sin(y / warpPeriod + x * 0.01);
        const dy = warpAmplitude * Math.cos(x / warpPeriod + y * 0.01);

        const srcX = Math.round(x + dx);
        const srcY = Math.round(y + dy);

        const dstIdx = (y * canvas.width + x) * 4;

        if (srcX >= 0 && srcX < canvas.width && srcY >= 0 && srcY < canvas.height) {
          const srcIdx = (srcY * canvas.width + srcX) * 4;
          dst[dstIdx] = src[srcIdx];
          dst[dstIdx + 1] = src[srcIdx + 1];
          dst[dstIdx + 2] = src[srcIdx + 2];
          dst[dstIdx + 3] = src[srcIdx + 3];
        } else {
          // Fill out-of-bounds with background
          dst[dstIdx] = bgR;
          dst[dstIdx + 1] = bgG;
          dst[dstIdx + 2] = bgB;
          dst[dstIdx + 3] = 255;
        }
      }
    }
    ctx.putImageData(dstData, 0, 0);

    // ── 5. Multi-Point Bézier Strikes ───────────────────────────────────

    const curveCount = 3 + difficulty; // 4, 5, 6 curves
    const strokeWidth = Math.max(2, fontSize * 0.06); // Match font stroke width

    for (let i = 0; i < curveCount; i++) {
      ctx.beginPath();

      // Random start & end spanning the canvas
      const x0 = Math.random() * canvas.width * 0.3;
      const y0 = Math.random() * canvas.height;
      const x3 = canvas.width - Math.random() * canvas.width * 0.3;
      const y3 = Math.random() * canvas.height;

      // Two random control points — creates complex curves
      const cp1x = canvas.width * 0.2 + Math.random() * canvas.width * 0.3;
      const cp1y = Math.random() * canvas.height;
      const cp2x = canvas.width * 0.5 + Math.random() * canvas.width * 0.3;
      const cp2y = Math.random() * canvas.height;

      ctx.moveTo(x0, y0);
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x3, y3);

      // Use a text color to create false-positive strokes
      ctx.strokeStyle = textColors[i % textColors.length];
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  }, [difficulty, canvasWidth, canvasHeight]);

  // Handle Resize
  React.useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const newWidth = containerRef.current.offsetWidth - 32; // - padding
        setCanvasWidth(Math.max(200, newWidth));
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  React.useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const timeTaken = Date.now() - startTime.current;

    // Case-sensitive check
    const success = inputValue === captchaText;

    onComplete(success, timeTaken);
  };

  return (
    <Card className="w-full max-w-md mx-auto border-4 border-white/50 shadow-cute rounded-3xl bg-white/80 backdrop-blur-sm" data-testid="text-captcha-card" data-answer={captchaText}>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-primary">Type the Text</CardTitle>
        <CardDescription className="text-center font-medium">Case sensitive - Watch out!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6" ref={containerRef}>
        <div className="flex justify-center bg-white rounded-2xl border-4 border-secondary/30 p-2 relative overflow-hidden shadow-inner">
           <canvas
             ref={canvasRef}
             width={canvasWidth}
             height={canvasHeight}
             className="rounded-xl max-w-full"
           />
           <Button
             variant="ghost"
             size="icon"
             className="absolute top-2 right-2 text-muted-foreground hover:text-primary bg-white/80 hover:bg-white rounded-full shadow-sm"
             onClick={generateCaptcha}
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type here..."
            className="text-center text-xl tracking-widest font-bold h-14 rounded-2xl border-2 border-border focus:ring-ring focus:border-primary/50 bg-white"
            autoFocus
          />
        </form>
      </CardContent>
      <CardFooter>
        <Button className="w-full text-lg h-12 rounded-2xl font-bold shadow-md bg-primary hover:bg-primary/90 text-white" onClick={handleSubmit}>
          Verify
        </Button>
      </CardFooter>
    </Card>
  );
}
