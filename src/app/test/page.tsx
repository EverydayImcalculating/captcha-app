'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useCaptchaStore, CaptchaType } from '@/lib/store';
import { ImageCaptcha } from '@/components/captcha/ImageCaptcha';
import { TextCaptcha } from '@/components/captcha/TextCaptcha';
import { SliderCaptcha } from '@/components/captcha/SliderCaptcha';
import { FrustrationMeter } from '@/components/FrustrationMeter';

export default function TestPage() {
  const router = useRouter();
  const { currentRound, nextRound, addResult, resetTests } = useCaptchaStore();
  const [step, setStep] = React.useState<'test' | 'rating'>('test');
  const [tempResult, setTempResult] = React.useState<{ success: boolean; timeTaken: number } | null>(null);

  React.useEffect(() => {
    if (currentRound >= 15) {
      router.push('/summary');
    }
  }, [currentRound, router]);

  if (currentRound >= 15) return null;

  // Determine type and difficulty
  // 0-4: Image, 5-9: Text, 10-14: Slider
  let type: CaptchaType = 'image';
  if (currentRound >= 5 && currentRound < 10) type = 'text';
  if (currentRound >= 10) type = 'slider';

  // Difficulty: 1, 2, 3, 2, 3 (cycling)
  // 0 -> 1
  // 1 -> 2
  // 2 -> 3
  // 3 -> 2
  // 4 -> 3
  const difficultyMap = [1, 2, 3, 2, 3];
  const difficulty = difficultyMap[currentRound % 5];

  const handleTestComplete = (success: boolean, timeTaken: number) => {
    // Save result without frustration score first
    addResult({
      round: currentRound + 1,
      type,
      timeTaken,
      accuracy: success,
      frustrationScore: 0, // Will be set later if needed
    });
    
    setTempResult({ success, timeTaken });
    
    // Only show frustration rating after completing each TYPE (rounds 4, 9, 14 = indices 5, 10, 15)
    // Round 0-4 (indices): Image type, show rating after round 4
    // Round 5-9 (indices): Text type, show rating after round 9  
    // Round 10-14 (indices): Slider type, show rating after round 14
    const shouldRate = (currentRound + 1) % 5 === 0; // After rounds 5, 10, 15 (1-indexed)
    
    if (shouldRate) {
      setStep('rating');
    } else {
      setStep('test');
      nextRound();
    }
  };

  const handleRate = (score: number) => {
    // Update all 5 tests of this type with the frustration score
    const typeStartRound = Math.floor(currentRound / 5) * 5;
    
    // This will be handled in the store - update last 5 results with frustration
    useCaptchaStore.getState().updateTypeFrustration(typeStartRound, score);
    
    setTempResult(null);
    setStep('test');
    nextRound();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md mb-8">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Test {currentRound + 1} of 15</span>
          <span>{type.charAt(0).toUpperCase() + type.slice(1)} Captcha</span>
        </div>
        <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500" 
            style={{ width: `${((currentRound) / 15) * 100}%` }}
          />
        </div>
      </div>

      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        {step === 'test' ? (
          <>
            {type === 'image' && (
              <ImageCaptcha difficulty={difficulty} onComplete={handleTestComplete} />
            )}
            {type === 'text' && (
              <TextCaptcha difficulty={difficulty} onComplete={handleTestComplete} />
            )}
            {type === 'slider' && (
              <SliderCaptcha difficulty={difficulty} onComplete={handleTestComplete} />
            )}
          </>
        ) : (
          <FrustrationMeter onRate={handleRate} />
        )}
      </div>
    </div>
  );
}
