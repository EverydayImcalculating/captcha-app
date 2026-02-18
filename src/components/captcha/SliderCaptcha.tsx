"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { sliderImages } from "@/constants/sliderImages";
import { SliderImage } from "@/types/SliderImage.type";
import Image from "next/image";

interface SliderCaptchaProps {
  difficulty: number; // 1-3
  onComplete: (
    success: boolean,
    timeTaken: number,
    userResponse: string,
    correctAnswer: string,
    testID?: string,
  ) => void;
}

export function SliderCaptcha({ difficulty, onComplete }: SliderCaptchaProps) {
  const [sliderValue, setSliderValue] = React.useState(0); // 0 to 100 (percentage of track)
  const [targetPosition, setTargetPosition] = React.useState(0); // percent 10-90
  const [targetY, setTargetY] = React.useState(30); // vertical position (%)
  const [pieceRotation, setPieceRotation] = React.useState(0); // degrees
  const [images, setImages] = React.useState<SliderImage[]>(sliderImages);
  const [imageUrl, setImageUrl] = React.useState("");
  const startTime = React.useRef<number>(Date.now());

  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState(0);

  React.useEffect(() => {
    if (imageUrl) {
      startTime.current = Date.now();
    }
  }, [imageUrl]);

  // Initialize round
  React.useEffect(() => {
    setSliderValue(0);
    setTargetPosition(Math.floor(Math.random() * 60) + 20); // 20% to 80%

    // Difficulty 1: centered Y, no rotation
    // Difficulty 2: random Y (15-55%), no rotation
    // Difficulty 3: random Y (15-55%) + piece rotation (±15°)
    if (difficulty === 1) {
      setTargetY(30);
      setPieceRotation(0);
    } else {
      setTargetY(Math.floor(Math.random() * 40) + 15); // 15% to 55%
      setPieceRotation(difficulty === 3 ? (Math.random() - 0.5) * 30 : 0); // ±15°
    }

    const randomImage = images[Math.floor(Math.random() * images.length)];
    setImageUrl(randomImage.url);

    setImages((prev) => prev.filter((image) => image.id != randomImage.id));

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
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const handleVerify = () => {
    const timeTaken = Date.now() - startTime.current;

    // Check if slider is close to target
    const tolerance = 2.5;
    const diff = Math.abs(sliderValue - targetPosition);

    const success = diff <= tolerance;
    onComplete(
      success,
      timeTaken,
      sliderValue.toString(),
      targetPosition.toString(),
    );
  };

  // derived dimensions
  const pieceWidthPercent = 15; // piece is 15% of container width
  const pieceHeightPercent = 30; // piece is 30% of container height (which is half width usually)

  // To avoid complex math with variable aspect ratios, we'll force aspect ratio 2:1
  const containerHeight = containerWidth / 2;
  const pieceWidth = containerWidth * 0.15; // 15% width
  const pieceHeight = containerHeight * 0.25; // 25% height

  // The piece shows the image at targetPosition.
  // backgroundPosition X = - (targetPosition % of containerWidth)
  // Safe bet: pixel values.
  const bgPosX = -(targetPosition / 100) * containerWidth;
  const bgPosY = -(containerHeight * (targetY / 100)); // Y offset matches hole position

  return (
    <Card
      className="w-full max-w-md mx-auto border-4 border-white/50 shadow-cute rounded-3xl bg-white/80 backdrop-blur-sm"
      data-testid="slider-captcha-card"
      data-target={targetPosition}
    >
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-primary">
          Slide to Fit
        </CardTitle>
        <CardDescription className="text-center font-medium">
          Help the piece find its home!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Puzzle Container */}
        <div
          ref={containerRef}
          className="relative w-full rounded-2xl overflow-hidden bg-muted shadow-inner border-4 border-white"
          style={{ aspectRatio: "2/1" }}
        >
          {/* Background Image */}
          {imageUrl !== "" && (
            <Image
              src={imageUrl}
              alt="Background"
              width={200}
              height={100}
              className={cn(
                "w-full h-full object-cover transition-opacity pointer-events-none select-none opacity-100",
              )}
            />
          )}

          <>
            {/* Target Hole - Completely blank */}
            <div
              className="absolute bg-white border-4 border-primary rounded-lg shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]"
              style={{
                left: `${targetPosition}%`,
                top: `${targetY}%`,
                width: `${pieceWidth}px`,
                height: `${pieceHeight}px`,
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center text-primary/30 text-xs font-bold">
                ?
              </div>
            </div>

            {/* Draggable Piece — outer wrapper handles position + rotation */}
            <div
              className="absolute z-10"
              style={{
                left: `${sliderValue}%`,
                top: `${targetY}%`,
                width: `${pieceWidth}px`,
                height: `${pieceHeight}px`,
                transform:
                  pieceRotation !== 0
                    ? `rotate(${pieceRotation}deg)`
                    : undefined,
              }}
            >
              {/* Inner div handles image + border clipping */}
              <div
                className="w-full h-full border-2 border-white shadow-[0_5px_15px_rgba(0,0,0,0.3)] rounded-lg overflow-hidden"
                style={{
                  backgroundImage: `url(${imageUrl})`,
                  backgroundSize: `${containerWidth}px ${containerHeight}px`,
                  backgroundPosition: `${bgPosX}px ${bgPosY}px`,
                }}
              />
            </div>
          </>
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
            onMouseUp={handleVerify}
            onTouchEnd={handleVerify}
            className="w-full h-4 bg-secondary/50 rounded-full appearance-none cursor-pointer accent-primary focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all"
          />
          <p className="text-xs text-muted-foreground text-center mt-2 font-medium">
            Release the slider to submit
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
