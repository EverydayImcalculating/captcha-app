'use client';

import * as React from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface FrustrationMeterProps {
  onRate: (score: number) => void;
}

export function FrustrationMeter({ onRate }: FrustrationMeterProps) {
  const [hovered, setHovered] = React.useState<number | null>(null);

  const ratings = [
    { score: 1, emoji: '😌', label: 'Very Easy' },
    { score: 2, emoji: '🙂', label: 'Easy' },
    { score: 3, emoji: '😐', label: 'Neutral' },
    { score: 4, emoji: '😠', label: 'Frustrating' },
    { score: 5, emoji: '🤬', label: 'Very Frustrating' },
  ];

  return (
    <Card className="mx-auto max-w-md text-center border-4 border-white/50 shadow-cute rounded-3xl bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-primary">
          How frustrating was that?
        </CardTitle>
      </CardHeader>
      <CardContent className="flex justify-between gap-2 px-4 pb-8">
        {ratings.map((rating) => (
          <div key={rating.score} className="flex flex-col items-center gap-2 group">
            <button
              className={cn(
                "h-14 w-14 text-3xl rounded-full transition-all duration-300 transform flex items-center justify-center border-2",
                hovered === rating.score ? "scale-125 shadow-lg border-primary bg-primary/10" : "border-transparent hover:scale-110 bg-secondary/10"
              )}
              onMouseEnter={() => setHovered(rating.score)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onRate(rating.score)}
            >
              {rating.emoji}
            </button>
            <span className={cn(
              "text-xs font-bold transition-colors",
              hovered === rating.score ? "text-primary" : "text-muted-foreground"
            )}>
              {rating.label}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
