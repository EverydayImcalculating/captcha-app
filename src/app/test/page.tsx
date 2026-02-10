'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useCaptchaStore, CaptchaType } from '@/lib/store';
import { ImageCaptcha } from '@/components/captcha/ImageCaptcha';
import { TextCaptcha } from '@/components/captcha/TextCaptcha';
import { SliderCaptcha } from '@/components/captcha/SliderCaptcha';
import { FrustrationMeter } from '@/components/FrustrationMeter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress'; // We need a progress bar? I'll make a simple one or use a text indicator for now.

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
    setTempResult({ success, timeTaken });
    setStep('rating');
  };

  const handleRate = (score: number) => {
    if (tempResult) {
      addResult({
        round: currentRound + 1,
        type,
        timeTaken: tempResult.timeTaken,
        accuracy: tempResult.success,
        frustrationScore: score,
      });
      setTempResult(null);
      setStep('test');
      nextRound();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md mb-8">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Test {currentRound + 1} of 15</span>
          <span>{type.charAt(0).toUpperCase() + type.slice(1)} Captcha • Difficulty {difficulty}</span>
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
