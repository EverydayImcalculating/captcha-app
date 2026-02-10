'use client';

import * as React from 'react';
import Link from 'next/link';
import { useCaptchaStore, CaptchaType } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BarChart3, Clock, Frown, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

export default function SummaryPage() {
  const { results, resetTests } = useCaptchaStore();
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const getStats = (type: CaptchaType) => {
    const typeResults = results.filter((r) => r.type === type);
    if (typeResults.length === 0) return { totalTime: 0, avgTime: 0, avgFrustration: 0, accuracy: 0 };

    const totalTime = typeResults.reduce((acc, r) => acc + r.timeTaken, 0);
    const avgTime = totalTime / typeResults.length;
    const avgFrustration =
      typeResults.reduce((acc, r) => acc + r.frustrationScore, 0) /
      typeResults.length;
    const accuracy =
      (typeResults.filter((r) => r.accuracy).length / typeResults.length) * 100;

    return { totalTime, avgTime, avgFrustration, accuracy };
  };

  const imageStats = getStats('image');
  const textStats = getStats('text');
  const sliderStats = getStats('slider');

  const StatCard = ({
    title,
    stats,
    color,
  }: {
    title: string;
    stats: ReturnType<typeof getStats>;
    color: string;
  }) => {
    return (
      <Card className={cn("overflow-hidden border-4 border-white/50 shadow-sm bg-white hover:shadow-cute transition-shadow duration-300 rounded-3xl", color)}>
        <CardHeader className="pb-2 bg-white/50">
          <CardTitle className="text-lg font-bold text-foreground/80">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm pt-4">
          <div className="flex justify-between items-center bg-white/60 p-2 rounded-xl">
             <div className="flex items-center gap-2 text-muted-foreground font-medium">
                <Clock className="h-4 w-4 text-primary" /> Avg Time
             </div>
             <span className="font-bold text-foreground">{(stats.avgTime / 1000).toFixed(2)}s</span>
          </div>
          <div className="flex justify-between items-center bg-white/60 p-2 rounded-xl">
             <div className="flex items-center gap-2 text-muted-foreground font-medium">
                <Frown className="h-4 w-4 text-primary" /> Frustration
             </div>
             <div className="flex gap-1" title={`Score: ${stats.avgFrustration.toFixed(1)}`}>
               {Array.from({ length: 5 }).map((_, i) => (
                 <div 
                   key={i} 
                   className={cn(
                     "h-2 w-2 rounded-full transition-all",
                     i < Math.round(stats.avgFrustration) ? "bg-primary scale-110" : "bg-gray-200"
                   )}
                 />
               ))}
             </div>
          </div>
          <div className="flex justify-between items-center bg-white/60 p-2 rounded-xl">
             <div className="flex items-center gap-2 text-muted-foreground font-medium">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Accuracy
             </div>
             <span className="font-bold text-foreground">{stats.accuracy.toFixed(0)}%</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  const totalTime = results.reduce((acc, r) => acc + r.timeTaken, 0);
  const totalCorrect = results.filter(r => r.accuracy).length;
  const avgTotalFrustration = results.length ? results.reduce((acc, r) => acc + r.frustrationScore, 0) / results.length : 0;

  return (
    <div className="min-h-screen p-4 md:p-8 bg-background max-w-5xl mx-auto flex flex-col justify-center font-sans">
       <div className="mb-10 text-center space-y-3">
         <h1 className="text-5xl font-extrabold tracking-tight text-primary drop-shadow-sm">Results Summary</h1>
         <p className="text-lg text-foreground/70 font-medium">Here's how you performed!</p>
       </div>

       <div className="grid gap-6 md:grid-cols-3 mb-10">
          <StatCard title="Image Captcha" stats={imageStats} color="bg-blue-100 border-blue-200" />
          <StatCard title="Text Captcha" stats={textStats} color="bg-green-100 border-green-200" />
          <StatCard title="Slider Captcha" stats={sliderStats} color="bg-purple-100 border-purple-200" />
       </div>

       <Card className="border-4 border-white/50 shadow-cute bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
         <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-white/50">
            <CardTitle className="text-2xl text-center font-bold text-foreground">Total Experience</CardTitle>
            <CardDescription className="text-center">Overall performance metrics</CardDescription>
         </CardHeader>
         <CardContent className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-6 bg-secondary/30 rounded-3xl flex flex-col justify-center items-center gap-2 transform hover:scale-105 transition-transform">
                 <div className="text-4xl font-black text-secondary-foreground">{results.length}</div>
                 <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Rounds</div>
              </div>
              <div className="p-6 bg-primary/20 rounded-3xl flex flex-col justify-center items-center gap-2 transform hover:scale-105 transition-transform">
                 <div className="text-4xl font-black text-primary">
                    {(totalTime / 1000).toFixed(1)}s
                 </div>
                 <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Time</div>
              </div>
              <div className="p-6 bg-accent/40 rounded-3xl flex flex-col justify-center items-center gap-2 transform hover:scale-105 transition-transform">
                 <div className="text-4xl font-black text-accent-foreground">
                    {avgTotalFrustration.toFixed(1)}
                 </div>
                 <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Avg Frustration</div>
              </div>
              <div className="p-6 bg-muted rounded-3xl flex flex-col justify-center items-center gap-2 transform hover:scale-105 transition-transform">
                  <div className="text-4xl font-black text-foreground">
                    {results.length ? ((totalCorrect / results.length) * 100).toFixed(0) : 0}%
                  </div>
                 <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Accuracy</div>
              </div>
            </div>
         </CardContent>
       </Card>

       <div className="mt-12 flex justify-center">
         <Link href="/">
           <Button variant="outline" size="lg" onClick={resetTests} className="gap-2 h-14 px-8 rounded-full text-lg border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all shadow-sm font-bold">
             <BarChart3 className="h-5 w-5" />
             Start New Test
           </Button>
         </Link>
       </div>
    </div>
  );
}
