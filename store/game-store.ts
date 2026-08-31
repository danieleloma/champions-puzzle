import { create } from "zustand";
import type { Difficulty, Puzzle, PuzzleTile } from "@/types/puzzle";
import { DIFFICULTY_CONFIG } from "@/types/puzzle";
import {
  createTiles,
  createTilesFromOrder,
  swapTiles,
  isComplete,
  applyHint,
  type MoveLogEntry,
} from "@/lib/puzzle-engine";
import { getOrCreateDeviceId } from "@/lib/device-identity";

// Long enough that a genuinely slow-but-working connection isn't flagged as
// broken, short enough that a player isn't staring at a permanently-locked
// board with no explanation.
const SESSION_FETCH_TIMEOUT_MS = 8_000;

// Fetches a fresh server-signed session token anchoring both the real start
// time and the authoritative shuffle for this puzzle/difficulty — see
// lib/anti-cheat.ts. Until this resolves, the board shows a provisional
// local shuffle but stays locked (see PuzzleBoard's sessionToken check) so
// a move never happens against a shuffle the server didn't actually issue.
// On failure or timeout, sets sessionError so the UI can show a retry
// affordance instead of leaving the board silently, permanently locked.
function requestSessionToken(
  puzzleId: string,
  difficulty: Difficulty,
  set: (partial: Partial<GameState>) => void,
  get: () => GameState
) {
  set({ sessionError: false });

  const device_id = getOrCreateDeviceId();
  if (!device_id) {
    set({ sessionError: true });
    return;
  }

  // True only if the store hasn't moved on since this request was issued —
  // guards against a slow/stale response from an earlier puzzle/difficulty
  // landing after the player has already navigated to (or started) a
  // different one, which would otherwise silently overwrite the current
  // board with a session token issued for the wrong puzzle. Quick
  // back-to-back navigation between /play/[id] routes reuses the same
  // client component instance (no per-route key), so an in-flight fetch
  // from the previous puzzle isn't automatically cancelled.
  function stillRelevant() {
    const current = get();
    return current.puzzle?.id === puzzleId && current.difficulty === difficulty && !current.isStarted;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SESSION_FETCH_TIMEOUT_MS);

  fetch("/api/puzzle-sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ puzzle_id: puzzleId, difficulty, device_id }),
    signal: controller.signal,
  })
    .then((r) => (r.ok ? r.json() : null))
    .then((data: { session_token?: string; initial_order?: number[] } | null) => {
      if (!stillRelevant()) return;
      if (!data?.session_token || !data.initial_order) {
        set({ sessionError: true });
        return;
      }
      set({
        sessionToken: data.session_token,
        tiles: createTilesFromOrder(difficulty, data.initial_order),
        moveLog: [],
        sessionError: false,
      });
    })
    .catch(() => {
      if (stillRelevant()) set({ sessionError: true });
    })
    .finally(() => clearTimeout(timeoutId));
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
  /** True when the session-token fetch failed, timed out, or came back
   *  invalid — lets the UI show a retry affordance instead of leaving the
   *  board silently locked forever. See PuzzleBoard's boardLocked/retry UI. */
  sessionError: boolean;
  /** Ordered record of every move/hint, submitted alongside the score so the
   *  server can replay it and confirm the puzzle was legitimately solved. */
  moveLog: MoveLogEntry[];
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
  /** Re-requests a session token for the current puzzle/difficulty after a
   *  failed/timed-out attempt — see sessionError. */
  retrySession: () => void;
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
  sessionError: false,
  moveLog: [],
  challenge: null,

  setPuzzle: (puzzle, difficulty) => {
    const tiles = createTiles(difficulty);
    set({ puzzle, difficulty, tiles, isStarted: false, isCompleted: false, isPaused: false, elapsedMs: 0, moveCount: 0, hintsUsed: 0, sessionToken: null, sessionError: false, moveLog: [], challenge: null });
    requestSessionToken(puzzle.id, difficulty, set, get);
  },

  setChallenge: (challenge) => set({ challenge }),

  startGame: () => {
    if (!get().isStarted) {
      set({ isStarted: true, startTimeMs: Date.now() });
    }
  },

  moveTile: (fromId, toIndex) => {
    const { tiles, isStarted, isCompleted, sessionToken, moveLog } = get();
    if (isCompleted) return;
    // The board is authoritative only once the server-issued shuffle has
    // replaced the provisional local one (see requestSessionToken) — a move
    // before that would be replayed server-side against the wrong tiles.
    if (!sessionToken) return;

    if (!isStarted) {
      get().startGame();
    }

    const updated = swapTiles(tiles, fromId, toIndex);
    const completed = isComplete(updated);

    set({
      tiles: updated,
      moveCount: get().moveCount + 1,
      isCompleted: completed,
      moveLog: [...moveLog, { type: "move", fromId, toIndex }],
    });

    if (completed) {
      get().completeGame();
    }
  },

  useHint: () => {
    const { tiles, hintsUsed, difficulty, isCompleted, sessionToken, moveLog } = get();
    if (isCompleted || !sessionToken) return;

    const maxHints = DIFFICULTY_CONFIG[difficulty].hintLimit;
    if (hintsUsed >= maxHints && maxHints > 0) return;

    if (!get().isStarted) get().startGame();

    const { tiles: updated, hintedTileId } = applyHint(tiles);
    if (!hintedTileId) return;
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
      moveLog: [...moveLog, { type: "hint", tileId: hintedTileId }],
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
      sessionError: false,
      previewMode: false,
      lastHintedTileId: null,
      sessionToken: null,
      moveLog: [],
    });
    requestSessionToken(puzzle.id, difficulty, set, get);
  },

  pauseGame: () => set({ isPaused: true }),

  resumeGame: () => {
    // Shift startTimeMs forward by the paused duration so elapsedMs continues
    // from exactly where it froze — no "lost" time added back.
    const { elapsedMs } = get();
    set({ isPaused: false, startTimeMs: Date.now() - elapsedMs });
  },

  retrySession: () => {
    const { puzzle, difficulty } = get();
    if (!puzzle) return;
    requestSessionToken(puzzle.id, difficulty, set, get);
  },
}));

if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
  (window as unknown as { __TEST_gameStore?: typeof useGameStore }).__TEST_gameStore = useGameStore;
}
