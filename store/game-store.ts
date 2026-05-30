import { create } from "zustand";
import type { Difficulty, Puzzle, PuzzleTile } from "@/types/puzzle";
import { DIFFICULTY_CONFIG } from "@/types/puzzle";
import {
  createTiles,
  swapTiles,
  isComplete,
  applyHint,
} from "@/lib/puzzle-engine";

interface GameState {
  puzzle: Puzzle | null;
  difficulty: Difficulty;
  tiles: PuzzleTile[];
  isStarted: boolean;
  isCompleted: boolean;
  isPaused: boolean;
  startTimeMs: number | null;
  elapsedMs: number;
  moveCount: number;
  hintsUsed: number;
  previewMode: boolean;
  lastHintedTileId: string | null;

  setPuzzle: (puzzle: Puzzle, difficulty: Difficulty) => void;
  startGame: () => void;
  moveTile: (fromId: string, toIndex: number) => void;
  useHint: () => void;
  togglePreview: () => void;
  tick: (elapsedMs: number) => void;
  resetGame: () => void;
  completeGame: () => void;
  /** Freeze the timer (hints exhausted). */
  pauseGame: () => void;
  /** Resume from the frozen elapsedMs — adjusts startTimeMs so no time is lost. */
  resumeGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  puzzle: null,
  difficulty: "medium",
  tiles: [],
  isStarted: false,
  isCompleted: false,
  isPaused: false,
  startTimeMs: null,
  elapsedMs: 0,
  moveCount: 0,
  hintsUsed: 0,
  previewMode: false,
  lastHintedTileId: null,

  setPuzzle: (puzzle, difficulty) => {
    const tiles = createTiles(difficulty);
    set({ puzzle, difficulty, tiles, isStarted: false, isCompleted: false, isPaused: false, elapsedMs: 0, moveCount: 0, hintsUsed: 0 });
  },

  startGame: () => {
    if (!get().isStarted) {
      set({ isStarted: true, startTimeMs: Date.now() });
    }
  },

  moveTile: (fromId, toIndex) => {
    const { tiles, isStarted, isCompleted } = get();
    if (isCompleted) return;

    if (!isStarted) {
      get().startGame();
    }

    const updated = swapTiles(tiles, fromId, toIndex);
    const completed = isComplete(updated);

    set({
      tiles: updated,
      moveCount: get().moveCount + 1,
      isCompleted: completed,
    });

    if (completed) {
      get().completeGame();
    }
  },

  useHint: () => {
    const { tiles, hintsUsed, difficulty, isCompleted } = get();
    if (isCompleted) return;

    const maxHints = DIFFICULTY_CONFIG[difficulty].hintLimit;
    if (hintsUsed >= maxHints && maxHints > 0) return;

    if (!get().isStarted) get().startGame();

    const { tiles: updated, hintedTileId } = applyHint(tiles);
    const completed = isComplete(updated);
    const newHintsUsed = hintsUsed + 1;
    const allUsed = maxHints > 0 && newHintsUsed >= maxHints;

    set({
      tiles: updated,
      hintsUsed: newHintsUsed,
      lastHintedTileId: hintedTileId,
      isCompleted: completed,
      // Pause as soon as the last hint is consumed (not if puzzle also completes)
      isPaused: allUsed && !completed,
    });

    if (completed) get().completeGame();
  },

  togglePreview: () => set((s) => ({ previewMode: !s.previewMode })),

  tick: (elapsedMs) => set({ elapsedMs }),

  completeGame: () => {
    const { startTimeMs } = get();
    const elapsedMs = startTimeMs ? Date.now() - startTimeMs : 0;
    set({ isCompleted: true, isPaused: false, elapsedMs });
  },

  resetGame: () => {
    const { puzzle, difficulty } = get();
    if (!puzzle) return;
    const tiles = createTiles(difficulty);
    set({
      tiles,
      isStarted: false,
      isCompleted: false,
      isPaused: false,
      startTimeMs: null,
      elapsedMs: 0,
      moveCount: 0,
      hintsUsed: 0,
      previewMode: false,
      lastHintedTileId: null,
    });
  },

  pauseGame: () => set({ isPaused: true }),

  resumeGame: () => {
    // Shift startTimeMs forward by the paused duration so elapsedMs continues
    // from exactly where it froze — no "lost" time added back.
    const { elapsedMs } = get();
    set({ isPaused: false, startTimeMs: Date.now() - elapsedMs });
  },
}));
