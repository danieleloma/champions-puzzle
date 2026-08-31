import { describe, expect, it } from "vitest";
import {
  applyHint,
  createTiles,
  createTilesFromOrder,
  getCompletionPercent,
  getTileAtIndex,
  isAdjacent,
  isComplete,
  replayMoveLog,
  swapTiles,
  type MoveLogEntry,
} from "./puzzle-engine";

describe("createTiles", () => {
  it("creates grid*grid tiles for each difficulty", () => {
    expect(createTiles("beginner")).toHaveLength(9);
    expect(createTiles("easy")).toHaveLength(16);
    expect(createTiles("medium")).toHaveLength(25);
  });

  it("shuffles currentIndex while preserving correctIndex as a 0..n-1 permutation", () => {
    const tiles = createTiles("medium");
    const correct = tiles.map((t) => t.correctIndex).sort((a, b) => a - b);
    const current = tiles.map((t) => t.currentIndex).sort((a, b) => a - b);
    expect(correct).toEqual([...Array(25).keys()]);
    expect(current).toEqual([...Array(25).keys()]);
  });
});

describe("isAdjacent", () => {
  const grid = 3;
  it("is true for horizontally adjacent cells", () => {
    expect(isAdjacent(0, 1, grid)).toBe(true);
  });
  it("is true for vertically adjacent cells", () => {
    expect(isAdjacent(0, 3, grid)).toBe(true);
  });
  it("is false for diagonal neighbors", () => {
    expect(isAdjacent(0, 4, grid)).toBe(false);
  });
  it("is false for non-adjacent cells on the same row", () => {
    expect(isAdjacent(0, 2, grid)).toBe(false);
  });
  it("is false for a cell and itself", () => {
    expect(isAdjacent(4, 4, grid)).toBe(false);
  });
});

describe("swapTiles", () => {
  it("swaps currentIndex between the moved tile and whatever occupied the target cell", () => {
    const tiles = createTiles("beginner").map((t, i) => ({ ...t, currentIndex: i }));
    const fromTile = tiles[0];
    const updated = swapTiles(tiles, fromTile.id, 1);

    const moved = updated.find((t) => t.id === fromTile.id)!;
    expect(moved.currentIndex).toBe(1);

    const displaced = updated.find((t) => t.currentIndex === 0)!;
    expect(displaced.id).not.toBe(fromTile.id);
  });

  it("recomputes isPlaced for every tile after the swap", () => {
    const tiles = createTiles("beginner").map((t, i) => ({ ...t, currentIndex: i }));
    const updated = swapTiles(tiles, tiles[0].id, 0);
    const solved = updated.find((t) => t.correctIndex === 0)!;
    expect(solved.isPlaced).toBe(solved.currentIndex === 0);
  });

  it("returns the original array unchanged for an unknown tile id", () => {
    const tiles = createTiles("beginner");
    expect(swapTiles(tiles, "does-not-exist", 0)).toBe(tiles);
  });
});

describe("isComplete / getCompletionPercent", () => {
  it("reports 0% and incomplete for a freshly created (shuffled) board unless it happened to solve itself", () => {
    const tiles = createTiles("beginner").map((t, i) => ({ ...t, currentIndex: i === t.correctIndex ? (i + 1) % 9 : i }));
    expect(isComplete(tiles)).toBe(false);
  });

  it("reports 100% and complete once every tile is in its correctIndex", () => {
    const solved = createTiles("beginner").map((t) => ({ ...t, currentIndex: t.correctIndex, isPlaced: true }));
    expect(isComplete(solved)).toBe(true);
    expect(getCompletionPercent(solved)).toBe(100);
  });

  it("rounds completion percent", () => {
    const tiles = createTiles("beginner").map((t) => ({ ...t, currentIndex: t.correctIndex, isPlaced: t.correctIndex < 3 }));
    expect(getCompletionPercent(tiles)).toBe(33); // 3/9 -> 33.33 -> 33
  });
});

describe("getTileAtIndex", () => {
  it("finds the tile occupying a given grid cell", () => {
    const tiles = createTiles("beginner").map((t, i) => ({ ...t, currentIndex: i }));
    expect(getTileAtIndex(tiles, 4)?.currentIndex).toBe(4);
  });

  it("returns undefined for an unoccupied index", () => {
    const tiles = createTiles("beginner").slice(0, 1).map((t) => ({ ...t, currentIndex: 0 }));
    expect(getTileAtIndex(tiles, 5)).toBeUndefined();
  });
});

describe("applyHint", () => {
  it("locks the hinted tile into its correct position", () => {
    const tiles = createTiles("beginner").map((t, i) => ({ ...t, currentIndex: (i + 1) % 9 }));
    const { tiles: updated, hintedTileId } = applyHint(tiles);

    expect(hintedTileId).not.toBeNull();
    const hinted = updated.find((t) => t.id === hintedTileId)!;
    expect(hinted.isLocked).toBe(true);
    expect(hinted.currentIndex).toBe(hinted.correctIndex);
  });

  it("never hints an already-placed or locked tile", () => {
    const tiles = createTiles("beginner").map((t) => ({ ...t, currentIndex: t.correctIndex, isPlaced: true }));
    const { hintedTileId } = applyHint(tiles);
    expect(hintedTileId).toBeNull();
  });
});

describe("replayMoveLog", () => {
  // A 3x3 shuffle exactly one legal adjacent swap away from solved.
  const grid = 3;
  const oneMoveOrder = [1, 0, 2, 3, 4, 5, 6, 7, 8];

  it("accepts a log that legally reaches a solved state", () => {
    const initial = createTilesFromOrder("beginner", oneMoveOrder);
    const log: MoveLogEntry[] = [{ type: "move", fromId: "tile-0", toIndex: 0 }];
    const result = replayMoveLog(initial, log, grid);
    expect(result).toMatchObject({ valid: true, moveCount: 1, hintCount: 0 });
    expect(isComplete(result.tiles)).toBe(true);
  });

  it("rejects an empty log against a shuffled (unsolved) board", () => {
    const initial = createTilesFromOrder("beginner", oneMoveOrder);
    const result = replayMoveLog(initial, [], grid);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/solved state/i);
  });

  it("rejects a non-adjacent (teleporting) move", () => {
    const initial = createTilesFromOrder("beginner", oneMoveOrder);
    // tile-0 starts at position 1; position 8 isn't adjacent to it on a 3x3.
    const log: MoveLogEntry[] = [{ type: "move", fromId: "tile-0", toIndex: 8 }];
    const result = replayMoveLog(initial, log, grid);
    expect(result.valid).toBe(false);
  });

  it("rejects a toIndex outside the real board — the off-board 'blank cell' exploit", () => {
    const initial = createTilesFromOrder("beginner", oneMoveOrder);
    // tile-0 sits at position 1 (row 0, col 1). Position 4 is directly below
    // it (row 1, col 1) — genuinely adjacent by row/col arithmetic — but for
    // a 3x3 board the real exploit is one *grid width* past a real edge
    // cell, which the raw isAdjacent math (unbounded) would still call
    // "adjacent." Use a large out-of-range index to confirm the explicit
    // bounds check rejects it regardless of what the row/col math says.
    const log: MoveLogEntry[] = [{ type: "move", fromId: "tile-0", toIndex: 42 }];
    const result = replayMoveLog(initial, log, grid);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/out-of-board/i);
  });

  it("rejects a hint replayed against an already-placed tile", () => {
    const initial = createTilesFromOrder("beginner", oneMoveOrder);
    const log: MoveLogEntry[] = [{ type: "hint", tileId: "tile-2" }]; // tile-2 already at correctIndex 2
    const result = replayMoveLog(initial, log, grid);
    expect(result.valid).toBe(false);
  });

  it("applies a legal hint and locks the tile, same as applyHint", () => {
    const initial = createTilesFromOrder("beginner", oneMoveOrder);
    // Hinting tile-0 swaps it into its correct position 0 — which also
    // happens to place tile-1 (previously occupying position 0) into its
    // own correct position 1, fully solving this particular shuffle in a
    // single hint.
    const log: MoveLogEntry[] = [{ type: "hint", tileId: "tile-0" }];
    const result = replayMoveLog(initial, log, grid);
    expect(result).toMatchObject({ valid: true, moveCount: 0, hintCount: 1 });
    expect(isComplete(result.tiles)).toBe(true);
    expect(result.tiles.find((t) => t.id === "tile-0")?.isLocked).toBe(true);
  });
});

describe("createTilesFromOrder", () => {
  it("assigns currentIndex from the given order rather than randomizing", () => {
    const order = [8, 7, 6, 5, 4, 3, 2, 1, 0];
    const tiles = createTilesFromOrder("beginner", order);
    for (const tile of tiles) {
      const i = parseInt(tile.id.replace("tile-", ""), 10);
      expect(tile.currentIndex).toBe(order[i]);
    }
  });
});
