import type { Difficulty, PuzzleTile } from "@/types/puzzle";
import { DIFFICULTY_CONFIG } from "@/types/puzzle";

export function createTiles(difficulty: Difficulty): PuzzleTile[] {
  const { grid } = DIFFICULTY_CONFIG[difficulty];
  const total = grid * grid;

  const tiles: PuzzleTile[] = Array.from({ length: total }, (_, i) => ({
    id: `tile-${i}`,
    correctIndex: i,
    currentIndex: i,
    imageX: (i % grid) / grid,
    imageY: Math.floor(i / grid) / grid,
    isPlaced: false,
    isLocked: false,
  }));

  return shuffleTiles(tiles);
}

function shuffleTiles(tiles: PuzzleTile[]): PuzzleTile[] {
  const shuffled = [...tiles];
  const indices = shuffled.map((_, i) => i);

  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  return shuffled.map((tile, i) => ({
    ...tile,
    currentIndex: indices[i],
  }));
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
