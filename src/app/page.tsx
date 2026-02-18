"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { useCaptchaStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { getFileHandle, saveFileHandle } from "@/lib/fileHandleStorage";

export default function Home() {
  const { resetTests } = useCaptchaStore();
  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(
    null,
  );

  const chooseFile = async () => {
    try {
      if (!("showSaveFilePicker" in window)) {
        alert("Browser not supported (use Chrome/Edge)");
        return;
      }

      const handle = await window.showSaveFilePicker({
        suggestedName: "captcha-results.csv",
        types: [
          {
            description: "CSV",
            accept: { "text/csv": [".csv"] },
          },
        ],
      });

      await saveFileHandle(handle);

      setFileHandle(handle);
    } catch (err: any) {
      console.error(err);
      throw new Error(err);
    }
  };

  const loadHandle = async () => {
    const handle = await getFileHandle();
    if (!handle) return null;

    // ขอ permission ใหม่ (สำคัญมาก)
    const permission = await handle.requestPermission?.({
      mode: "readwrite",
    });

    if (permission !== "granted") return null;

    return handle;
  };

  useEffect(() => {
    const setUpFileHandle = async () => {
      const handle = await loadHandle();

      setFileHandle(handle);
    };

    setUpFileHandle();
  }, []);

  useEffect(() => {
    resetTests();
  }, [resetTests]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Decorative background blobs */}
      {!fileHandle && (
        <button
          onClick={chooseFile}
          className="
          absolute top-10 right-10
          px-5 py-3
          text-lg font-medium
          rounded-xl
          bg-secondary hover:bg-emerald-200 text-emerald-700 border-2 border-white/50
          shadow-sm hover:shadow-md
          transform transition-all hover:scale-105 active:scale-95 duration-300
          flex items-center justify-center gap-2
        "
        >
          📂 Choose CSV File
        </button>
      )}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-3xl opacity-50" />

      <Card className="max-w-lg w-full z-10 border-2 border-primary/10 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-4xl font-bold text-foreground">
            Captcha Test
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Help us evaluate the user experience of different captcha types.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Link
            href="/test"
            className="block transform transition-all hover:scale-105 active:scale-95 duration-300"
          >
            <Button
              size="lg"
              className="w-full text-xl h-16 rounded-full bg-primary hover:bg-primary/90 text-white font-extrabold shadow-[0_10px_20px_-5px_rgba(255,183,178,0.6)] border-4 border-white/50"
            >
              Start The Test
              <Sparkles className="ml-2 h-6 w-6 animate-pulse" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
