"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/Card";
import { Check } from "lucide-react";
import { Image } from "@/types/Image.type";
import { imageCollections as mockImageCollections } from "@/constants/imageCollection";
import { ImageCollection } from "@/types/ImageCollection.type";

interface ImageCaptchaProps {
  difficulty: number; // 1-3
  onComplete: (success: boolean, timeTaken: number) => void;
}

export function ImageCaptcha({ difficulty, onComplete }: ImageCaptchaProps) {
  const [selected, setSelected] = React.useState<Set<number>>(new Set());
  const startTime = React.useRef<number>(Date.now());
  const [gridSize, setGridSize] = React.useState(3); // 3x3
  const [images, setImages] = React.useState<Image[]>([]);
  const [imageCollection, setImageCollection] = React.useState<ImageCollection | null>(null);
  const [imageCollections, setImageCollections] =
    React.useState<ImageCollection[]>(mockImageCollections);

  // Initialize round
  React.useEffect(() => {
    startTime.current = Date.now();
    const size = 3; // Always 3x3 grid for better UX
    setGridSize(size);

    const randomCollection =
      imageCollections[Math.floor(Math.random() * imageCollections.length)];
    setImageCollection(randomCollection);

    setImageCollections((prev) =>
      prev.filter((collection) => collection.id != randomCollection.id),
    );

    const newImages = randomCollection.images;

    // Shuffle
    if (randomCollection.canShuffle) {
      setImages(newImages.sort(() => Math.random() - 0.5));
    } else {
      setImages(newImages);
    }
    setSelected(new Set());
  }, [difficulty]);

  const toggleSelect = (id: number) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const [loadedCount, setLoadedCount] = React.useState(0);
  const handleImageLoad = () => {
    setLoadedCount((prev) => prev + 1);
  };

  const handleVerify = () => {
    const timeTaken = Date.now() - startTime.current;

    // Verify selection
    const missedTargets = images.filter(
      (img) => img.isTarget && !selected.has(img.id),
    );
    const falsePositives = images.filter(
      (img) => !img.isTarget && selected.has(img.id),
    );

    const success = missedTargets.length === 0 && falsePositives.length === 0;

    onComplete(success, timeTaken);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-4 border-white/50 shadow-cute rounded-3xl bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex flex-col justify-center items-center text-primary">
          <span className="text-lg">
            Select all images with
          </span>
          <span className="text-3xl">
            {imageCollection?.name}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="grid gap-2 p-3"
          style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
        >
          {images.map((img) => (
            <div
              key={img.id}
              className={cn(
                "relative aspect-square cursor-pointer overflow-hidden rounded-[8px] transition-all duration-300 transform",
                "hover:shadow-lg hover:-translate-y-1 active:scale-95",
                selected.has(img.id)
                  ? "ring-4 ring-secondary ring-offset-2 scale-95"
                  : "hover:opacity-90",
                "bg-secondary/20",
              )}
              onClick={() => toggleSelect(img.id)}
            >
              <img
                src={img.url}
                alt="Captcha tile"
                className={cn(
                  "h-full w-full object-cover transition-opacity duration-500",
                  loadedCount < images.length ? "opacity-0" : "opacity-100",
                )}
                onLoad={handleImageLoad}
              />
              {loadedCount < images.length && (
                <div className="absolute inset-0 animate-pulse bg-secondary/30" />
              )}
              {selected.has(img.id) && (
                <div className="absolute inset-0 flex items-center justify-center bg-secondary/40 backdrop-blur-[2px] transition-all duration-300">
                  <div className="bg-white rounded-full p-1 shadow-lg transform scale-110">
                    <Check className="h-6 w-6 text-secondary font-bold" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full text-lg h-12 rounded-2xl font-bold shadow-md bg-primary hover:bg-primary/90 text-white"
          onClick={handleVerify}
        >
          Verify
        </Button>
      </CardFooter>
    </Card>
  );
}
