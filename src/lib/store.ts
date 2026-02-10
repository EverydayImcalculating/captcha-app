import { create } from 'zustand';

export type CaptchaType = 'image' | 'text' | 'slider';

export interface TestResult {
  round: number;
  type: CaptchaType;
  timeTaken: number; // in milliseconds
  accuracy: boolean | number; // true/false for pass/fail, or percentage
  frustrationScore: number; // 1-5
}

interface CaptchaStore {
  currentRound: number;
  results: TestResult[];
  addResult: (result: TestResult) => void;
  nextRound: () => void;
  resetTests: () => void;
}

export const useCaptchaStore = create<CaptchaStore>((set) => ({
  currentRound: 0,
  results: [],
  addResult: (result) =>
    set((state) => ({ results: [...state.results, result] })),
  nextRound: () => set((state) => ({ currentRound: state.currentRound + 1 })),
  resetTests: () => set({ currentRound: 0, results: [] }),
}));
