import { create } from "zustand";
import { persist } from "zustand/middleware";

type DrillScore = { correct: number; total: number };

type ProgressState = {
  lectures: Record<string, boolean>;
  labs: Record<string, boolean>;
  drills: Record<string, DrillScore>;
  briefs: Record<string, boolean>;
  boardBest: number | null;
  boardSittings: number;
  cursor: string | null;
  markLecture: (id: string) => void;
  markLab: (id: string) => void;
  markBrief: (id: string) => void;
  saveDrill: (moduleId: string, correct: number, total: number) => void;
  saveBoard: (pct: number) => void;
  setCursor: (id: string) => void;
  reset: () => void;
};

const empty = {
  lectures: {} as Record<string, boolean>,
  labs: {} as Record<string, boolean>,
  drills: {} as Record<string, DrillScore>,
  briefs: {} as Record<string, boolean>,
  boardBest: null as number | null,
  boardSittings: 0,
  cursor: null as string | null,
};

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      ...empty,
      markLecture: (id) => set((s) => ({ lectures: { ...s.lectures, [id]: true }, cursor: id })),
      markLab: (id) => set((s) => ({ labs: { ...s.labs, [id]: true } })),
      markBrief: (id) => set((s) => ({ briefs: { ...s.briefs, [id]: true } })),
      saveDrill: (moduleId, correct, total) =>
        set((s) => {
          const prev = s.drills[moduleId];
          const prevRate = prev ? prev.correct / prev.total : -1;
          if (correct / total < prevRate) return s;
          return { drills: { ...s.drills, [moduleId]: { correct, total } } };
        }),
      saveBoard: (pct) =>
        set((s) => ({
          boardSittings: s.boardSittings + 1,
          boardBest: s.boardBest === null ? pct : Math.max(s.boardBest, pct),
        })),
      setCursor: (id) => set({ cursor: id }),
      reset: () => set({ ...empty }),
    }),
    { name: "master-boards-mfin-v1", skipHydration: true },
  ),
);

export const REQUIRED_PREP = 5;
export const REQUIRED_LECTURES = 9;
export const REQUIRED_LABS = 6;
export const BOARD_BAR = 0.7;
