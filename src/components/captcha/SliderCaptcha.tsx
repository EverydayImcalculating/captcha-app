'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface SliderCaptchaProps {
  difficulty: number; // 1-3
  onComplete: (success: boolean, timeTaken: number) => void;
}

export function SliderCaptcha({ difficulty, onComplete }: SliderCaptchaProps) {
  const [sliderValue, setSliderValue] = React.useState(0); // 0 to 100 (percentage of track)
  const [targetPosition, setTargetPosition] = React.useState(0); // percent 10-90
  const [imageUrl, setImageUrl] = React.useState('');
  const startTime = React.useRef<number>(Date.now());
  const [imageLoaded, setImageLoaded] = React.useState(false);
  
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState(0);

  // Initialize round
  React.useEffect(() => {
    setSliderValue(0);
    setTargetPosition(Math.floor(Math.random() * 60) + 20); // 20% to 80%
    setImageLoaded(false);
    setImageUrl(`https://loremflickr.com/600/300/landscape?lock=${Date.now()}`); // Higher res for responsiveness
    startTime.current = Date.now();
  }, [difficulty]);

  // Handle Resize
  React.useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const handleVerify = () => {
    const timeTaken = Date.now() - startTime.current;
    
    // Check if slider is close to target
    const tolerance = 5 - difficulty; // 4%, 3%, 2%
    const diff = Math.abs(sliderValue - targetPosition);
    
    const success = diff <= tolerance;
    onComplete(success, timeTaken);
  };

  // derived dimensions
  const pieceWidthPercent = 15; // piece is 15% of container width
  const pieceHeightPercent = 30; // piece is 30% of container height (which is half width usually)
  // Actually simpler to use px for piece if we want strict control, but % is better for true responsiveness.
  // Let's stick to pixels for the piece logic to match the look, but scaled?
  // Let's try % for piece position (sliderValue) and targetPosition.
  
  // To avoid complex math with variable aspect ratios, we'll force aspect ratio 2:1
  const containerHeight = containerWidth / 2;
  const pieceWidth = containerWidth * 0.15; // 15% width
  const pieceHeight = containerHeight * 0.25; // 25% height
  
  // The piece shows the image at targetPosition. 
  // backgroundPosition X = - (targetPosition % of containerWidth)
  // But wait, css background-position percentage is tricky. 
  // It matches point P of image to point P of container.
  // Safe bet: pixel values.
  const bgPosX = -(targetPosition / 100) * containerWidth;
  const bgPosY = -(containerHeight * 0.3); // Fixed Y offset for the hole (30% down)

  return (
    <Card className="w-full max-w-md mx-auto border-4 border-white/50 shadow-cute rounded-3xl bg-white/80 backdrop-blur-sm" data-testid="slider-captcha-card" data-target={targetPosition}>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-primary">Slide to Fit</CardTitle>
        <CardDescription className="text-center font-medium">Help the piece find its home!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Puzzle Container */}
        <div 
          ref={containerRef}
          className="relative w-full rounded-2xl overflow-hidden bg-muted shadow-inner border-4 border-white"
          style={{ aspectRatio: '2/1' }}
        >
           {!imageLoaded && (
             <div className="absolute inset-0 flex items-center justify-center bg-secondary/20 animate-pulse text-muted-foreground text-sm font-medium">
               Loading puzzle...
             </div>
           )}
           
           {/* Background Image */}
           <img 
             src={imageUrl} 
             alt="Background" 
             className={cn(
               "w-full h-full object-cover transition-opacity duration-300 pointer-events-none select-none", 
               imageLoaded ? "opacity-100" : "opacity-0"
             )}
             onLoad={() => setImageLoaded(true)}
           />
           
           {imageLoaded && (
             <>
               {/* Target Hole - Completely blank */}
               <div 
                 className="absolute bg-white border-4 border-primary rounded-lg shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]"
                 style={{ 
                   left: `${targetPosition}%`,
                   top: '30%',
                   width: `${pieceWidth}px`,
                   height: `${pieceHeight}px`,
                 }}
               >
                 <div className="absolute inset-0 flex items-center justify-center text-primary/30 text-xs font-bold">
                   ?
                 </div>
               </div>
               
               {/* Draggable Piece */}
               <div 
                 className="absolute border-2 border-white shadow-[0_5px_15px_rgba(0,0,0,0.3)] z-10 rounded-lg filter drop-shadow-lg"
                 style={{ 
                   left: `${sliderValue}%`,
                   top: '30%',
                   width: `${pieceWidth}px`,
                   height: `${pieceHeight}px`,
                   backgroundImage: `url(${imageUrl})`,
                   backgroundSize: `${containerWidth}px ${containerHeight}px`,
                   backgroundPosition: `${bgPosX}px ${bgPosY}px` 
                 }}
               />
             </>
           )}
        </div>
        
        {/* Slider Control */}
        <div className="relative pt-2 px-2">
            <input 
              type="range" 
              min="0" 
              max={100 - 15} // 100 - pieceWidth% roughly
              step="0.1"
              value={sliderValue}
              onChange={(e) => setSliderValue(parseFloat(e.target.value))}
              className="w-full h-4 bg-secondary/50 rounded-full appearance-none cursor-pointer accent-primary focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all"
            />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full text-lg h-12 rounded-2xl font-bold shadow-md bg-primary hover:bg-primary/90 text-white" onClick={handleVerify}>
          Verify
        </Button>
      </CardFooter>
    </Card>
  );
}
