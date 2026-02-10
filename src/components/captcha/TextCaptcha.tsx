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

export function TextCaptcha({ difficulty, onComplete }: TextCaptchaProps) {
  const [inputValue, setInputValue] = React.useState('');
  const [captchaText, setCaptchaText] = React.useState('');
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const startTime = React.useRef<number>(Date.now());
  const [canvasWidth, setCanvasWidth] = React.useState(300);

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
    
    // Draw on canvas
    const canvas = canvasRef.current;
    if (canvas) {
      // Ensure canvas dimensions match state (handling high DPI screens could be better but keeping simple)
      canvas.width = canvasWidth;
      canvas.height = 100;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Background
        ctx.fillStyle = '#fdf6f6'; // Match global background
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Pastel colors helper
        const getPastelColor = () => {
          const h = Math.floor(Math.random() * 360);
          return `hsl(${h}, 70%, 80%)`;
        };

        const getDarkerPastelColor = () => {
          const h = Math.floor(Math.random() * 360);
          return `hsl(${h}, 60%, 50%)`; // Darker for text readability
        };
        
        // Noise lines
        for (let i = 0; i < 7 + difficulty * 2; i++) {
          ctx.beginPath();
          ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
          ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
          ctx.strokeStyle = getPastelColor();
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        
        // Text
        const fontSize = Math.min(32 - difficulty * 2, canvasWidth / length); // Scale down if narrow
        
        // Get the computed font family from the body to ensure we use the Next.js loaded font
        const computedFont = window.getComputedStyle(document.body).fontFamily;
        ctx.font = `bold ${fontSize}px ${computedFont}`;
        
        ctx.textBaseline = 'middle';
        const totalWidth = ctx.measureText(text).width; // Crude estimate since we draw chars individually
        // Better centering logic:
        // available width per char = width / length? No, too spread.
        // Start x
        let x = (canvasWidth - totalWidth * 1.5) / 2; // Rough centering
        if (x < 10) x = 10;
        
        const charSpacing = (canvasWidth - 40) / length;

        for (let i = 0; i < text.length; i++) {
          ctx.save();
          // Distributed position
          const targetX = 20 + i * charSpacing + (charSpacing / 2);
          const jitterX = (Math.random() - 0.5) * 10;
          
          const y = canvas.height / 2 + (Math.random() - 0.5) * 10;
          
          ctx.translate(targetX + jitterX, y);
          ctx.rotate((Math.random() - 0.5) * 0.4 * difficulty); // Rotate more with difficulty
          ctx.fillStyle = getDarkerPastelColor();
          ctx.fillText(text[i], -10, 0); // Offset to center on translation point roughly
          ctx.restore();
        }
      }
    }
  }, [difficulty, canvasWidth]);

  // Handle Resize
  React.useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const newWidth = containerRef.current.offsetWidth - 32; // - padding
        setCanvasWidth(Math.max(200, newWidth)); // Min width 200
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
             height={100} 
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
