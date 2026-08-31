import type { Difficulty, PuzzleTile } from "@/types/puzzle";
import { DIFFICULTY_CONFIG } from "@/types/puzzle";

function baseTiles(difficulty: Difficulty): PuzzleTile[] {
  const { grid } = DIFFICULTY_CONFIG[difficulty];
  const total = grid * grid;

  return Array.from({ length: total }, (_, i) => ({
    id: `tile-${i}`,
    correctIndex: i,
    currentIndex: i,
    imageX: (i % grid) / grid,
    imageY: Math.floor(i / grid) / grid,
    isPlaced: false,
    isLocked: false,
  }));
}

// A random permutation of 0..n-1 — index i is the currentIndex assigned to
// tile `tile-i`. Used both for the client's instant local shuffle and (via
// the server-signed session token) as the authoritative starting position a
// submitted move log gets replayed against — see lib/anti-cheat.ts.
export function generateShuffleOrder(tileCount: number): number[] {
  const indices = Array.from({ length: tileCount }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

export function createTiles(difficulty: Difficulty): PuzzleTile[] {
  const tiles = baseTiles(difficulty);
  const order = generateShuffleOrder(tiles.length);
  return tiles.map((tile, i) => ({ ...tile, currentIndex: order[i] }));
}

// Builds tiles from an explicit, already-known starting order (rather than
// rolling a new random one) — used to reconstruct the exact shuffle a
// session token was issued for, both client-side (once the server responds)
// and server-side (to replay a submitted move log against).
export function createTilesFromOrder(difficulty: Difficulty, order: number[]): PuzzleTile[] {
  const tiles = baseTiles(difficulty);
  if (order.length !== tiles.length) return tiles;
  return checkPlacements(tiles.map((tile, i) => ({ ...tile, currentIndex: order[i] })));
}

// True when the two grid cells share an edge — a tile can only swap into a
// directly adjacent cell (up/down/left/right), one step at a time.
export function isAdjacent(indexA: number, indexB: number, grid: number): boolean {
  const rowA = Math.floor(indexA / grid), colA = indexA % grid;
  const rowB = Math.floor(indexB / grid), colB = indexB % grid;
  return Math.abs(rowA - rowB) + Math.abs(colA - colB) === 1;
}

export function swapTiles(
  tiles: PuzzleTile[],
  fromId: string,
  toIndex: number
): PuzzleTile[] {
  const updated = [...tiles];
  const fromTileIdx = updated.findIndex((t) => t.id === fromId);
  if (fromTileIdx === -1) return tiles;

  const fromTile = updated[fromTileIdx];
  const toTileIdx = updated.findIndex((t) => t.currentIndex === toIndex);

  if (toTileIdx !== -1) {
    const toTile = updated[toTileIdx];
    updated[toTileIdx] = { ...toTile, currentIndex: fromTile.currentIndex };
  }

  updated[fromTileIdx] = { ...fromTile, currentIndex: toIndex };

  return checkPlacements(updated);
}

function checkPlacements(tiles: PuzzleTile[]): PuzzleTile[] {
  return tiles.map((tile) => ({
    ...tile,
    isPlaced: tile.currentIndex === tile.correctIndex,
  }));
}

export function isComplete(tiles: PuzzleTile[]): boolean {
  return tiles.every((tile) => tile.isPlaced);
}

export function getCompletionPercent(tiles: PuzzleTile[]): number {
  const placed = tiles.filter((t) => t.isPlaced).length;
  return Math.round((placed / tiles.length) * 100);
}

export function getTileAtIndex(
  tiles: PuzzleTile[],
  index: number
): PuzzleTile | undefined {
  return tiles.find((t) => t.currentIndex === index);
}

export function applyHint(tiles: PuzzleTile[]): {
  tiles: PuzzleTile[];
  hintedTileId: string | null;
} {
  const unplaced = tiles.filter((t) => !t.isPlaced && !t.isLocked);
  if (unplaced.length === 0) return { tiles, hintedTileId: null };

  const target = unplaced[Math.floor(Math.random() * unplaced.length)];
  const updated = swapTiles(tiles, target.id, target.correctIndex);

  const lockedUpdate = updated.map((t) =>
    t.id === target.id ? { ...t, isLocked: true } : t
  );

  return { tiles: lockedUpdate, hintedTileId: target.id };
}

// ─── Move-log replay ────────────────────────────────────────────────────────
//
// A record of every user-driven action taken during a puzzle attempt, in
// order. The client appends to this as the player plays (see
// store/game-store.ts) and submits it with the final score. The server
// replays it from the exact shuffle its session token was issued for
// (createTilesFromOrder) to confirm the puzzle was actually, legally solved
// — rather than trusting a client-reported "it's complete" flag, which is
// free to fabricate since the solved tile arrangement is always the same
// fixed sequence regardless of the starting shuffle.
export type MoveLogEntry =
  | { type: "move"; fromId: string; toIndex: number }
  | { type: "hint"; tileId: string };

export function replayMoveLog(
  initialTiles: PuzzleTile[],
  log: MoveLogEntry[],
  grid: number
): { tiles: PuzzleTile[]; valid: boolean; moveCount: number; hintCount: number; reason?: string } {
  let tiles = initialTiles;
  let moveCount = 0;
  let hintCount = 0;

  const boardSize = grid * grid;

  for (const entry of log) {
    if (entry.type === "move") {
      const fromTile = tiles.find((t) => t.id === entry.fromId);
      if (!fromTile) return { tiles, valid: false, moveCount, hintCount, reason: "Unknown tile in move log" };
      if (fromTile.isLocked) return { tiles, valid: false, moveCount, hintCount, reason: "Attempted to move a hint-locked tile" };
      // isAdjacent's row/col math is unbounded — without this check, an
      // off-board toIndex (e.g. one full grid-width past a real cell) can
      // still compute as "adjacent" and, since no tile occupies it,
      // swapTiles silently vacates the real cell instead of swapping —
      // opening a "blank" cell this puzzle's rules don't otherwise have.
      if (!Number.isInteger(entry.toIndex) || entry.toIndex < 0 || entry.toIndex >= boardSize) {
        return { tiles, valid: false, moveCount, hintCount, reason: "Move log targets an out-of-board index" };
      }
      if (!isAdjacent(fromTile.currentIndex, entry.toIndex, grid)) {
        return { tiles, valid: false, moveCount, hintCount, reason: "Illegal non-adjacent move in log" };
      }
      tiles = swapTiles(tiles, entry.fromId, entry.toIndex);
      moveCount++;
    } else {
      const target = tiles.find((t) => t.id === entry.tileId);
      if (!target) return { tiles, valid: false, moveCount, hintCount, reason: "Unknown tile in hint log" };
      if (target.isPlaced || target.isLocked) {
        return { tiles, valid: false, moveCount, hintCount, reason: "Hint replayed against an already-placed tile" };
      }
      tiles = swapTiles(tiles, entry.tileId, target.correctIndex).map((t) =>
        t.id === entry.tileId ? { ...t, isLocked: true } : t
      );
      hintCount++;
    }
  }

  if (!isComplete(tiles)) {
    return { tiles, valid: false, moveCount, hintCount, reason: "Move log does not reach a solved state" };
  }

  return { tiles, valid: true, moveCount, hintCount };
}

export function getTileStyle(
  tile: PuzzleTile,
  grid: number,
  containerSize: number
): React.CSSProperties {
  const size = containerSize / grid;
  const bgSize = containerSize;
  const bgX = -tile.imageX * bgSize;
  const bgY = -tile.imageY * bgSize;

  return {
    width: size,
    height: size,
    backgroundSize: `${bgSize}px ${bgSize}px`,
    backgroundPosition: `${bgX}px ${bgY}px`,
  };
}
