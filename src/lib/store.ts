import { create } from "zustand";

export type CaptchaType = "image" | "text" | "slider";

export interface TestResult {
  round: number;
  type: CaptchaType;
  timeTaken: number; // in milliseconds
  accuracy: boolean | number; // true/false for pass/fail, or percentage
  frustrationScore: number; // 1-5
  startTimestamp?: string; // ISO timestamp
  endTimestamp?: string; // ISO timestamp
}

interface CaptchaStore {
  currentRound: number;
  orderedTypes: CaptchaType[];
  results: TestResult[];
  addResult: (result: TestResult) => void;
  updateTypeFrustration: (typeStartRound: number, score: number) => void;
  nextRound: () => void;
  resetTests: () => void;
}

const initial: CaptchaType[] = ["image", "slider", "text"];

export const useCaptchaStore = create<CaptchaStore>((set) => ({
  currentRound: 0,
  orderedTypes: initial,
  results: [],
  addResult: (result) =>
    set((state) => ({ results: [...state.results, result] })),
  updateTypeFrustration: (typeStartRound, score) =>
    set((state) => ({
      results: state.results.map((r, idx) =>
        idx >= typeStartRound && idx < typeStartRound + 5
          ? { ...r, frustrationScore: score }
          : r,
      ),
    })),
  nextRound: () => set((state) => ({ currentRound: state.currentRound + 1 })),
  resetTests: () =>
    set({
      currentRound: 0,
      results: [],
      orderedTypes: initial.sort(() => Math.random() - 0.5),
    }),
}));
