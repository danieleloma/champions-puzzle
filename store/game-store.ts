import { create } from "zustand";
import type { Difficulty, Puzzle, PuzzleTile } from "@/types/puzzle";
import { DIFFICULTY_CONFIG } from "@/types/puzzle";
import {
  createTiles,
  swapTiles,
  isComplete,
  applyHint,
} from "@/lib/puzzle-engine";
import { getOrCreateDeviceId } from "@/lib/device-identity";

// Fetches a fresh server-signed session token anchoring the real start time
// for this puzzle/difficulty — see lib/anti-cheat.ts. Fire-and-forget: if it
// fails (offline, etc.) the score submission at the end will just be
// rejected server-side rather than blocking gameplay here.
function requestSessionToken(puzzleId: string, difficulty: Difficulty, set: (partial: Partial<GameState>) => void) {
  const device_id = getOrCreateDeviceId();
  if (!device_id) return;
  fetch("/api/puzzle-sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ puzzle_id: puzzleId, difficulty, device_id }),
  })
    .then((r) => (r.ok ? r.json() : null))
    .then((data: { session_token?: string } | null) => {
      if (data?.session_token) set({ sessionToken: data.session_token });
    })
    .catch(() => {});
}

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
  sessionToken: string | null;
  /** Set when this puzzle was opened via a "beat my time" share link. */
  challenge: { fromUsername: string; targetMs: number } | null;

  setPuzzle: (puzzle: Puzzle, difficulty: Difficulty) => void;
  setChallenge: (challenge: { fromUsername: string; targetMs: number } | null) => void;
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
  sessionToken: null,
  challenge: null,

  setPuzzle: (puzzle, difficulty) => {
    const tiles = createTiles(difficulty);
    set({ puzzle, difficulty, tiles, isStarted: false, isCompleted: false, isPaused: false, elapsedMs: 0, moveCount: 0, hintsUsed: 0, sessionToken: null, challenge: null });
    requestSessionToken(puzzle.id, difficulty, set);
  },

  setChallenge: (challenge) => set({ challenge }),

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
      sessionToken: null,
    });
    requestSessionToken(puzzle.id, difficulty, set);
  },

  pauseGame: () => set({ isPaused: true }),

  resumeGame: () => {
    // Shift startTimeMs forward by the paused duration so elapsedMs continues
    // from exactly where it froze — no "lost" time added back.
    const { elapsedMs } = get();
    set({ isPaused: false, startTimeMs: Date.now() - elapsedMs });
  },
}));

if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
  (window as unknown as { __TEST_gameStore?: typeof useGameStore }).__TEST_gameStore = useGameStore;
}
