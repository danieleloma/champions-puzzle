import { cn } from "@/lib/utils";

// ── Figma node 29:2014 "PuzzleGridTiles" ─────────────────────────────────────
//
//  Display-only flat grid of puzzle tiles. Two Figma variants:
//
//  Default   — placeholder grey tiles (pre-game / loading)
//  Variant2  — puzzle image sliced across the N×N grid
//
//  Figma prototype: 408×408px container, 3×3, 2px gap, rounded tiles (≈12px).
//  Geometry generalises to any N×N difficulty.
//
//  Image slicing (matches existing PuzzleTile approach):
//    slice = containerSize / N          (conceptual, ignores gap)
//    tile  = (containerSize − (N−1)×gap) / N   (visual rendered size)
//    backgroundSize:     containerSize × containerSize
//    backgroundPosition: -(col × slice)px  -(row × slice)px
//
//  This is a pure display component — no drag-and-drop, no game state.
//  For the interactive board see components/puzzle/PuzzleBoard.tsx.
// ─────────────────────────────────────────────────────────────────────────────

export interface PuzzleGridTilesProps {
  /** Grid dimension — N for an N×N board */
  cols: number;
  /** Puzzle image URL. Omit to render placeholder tiles */
  imageUrl?: string;
  /** Total container size in px (default 408 — full iPhone content width) */
  size?: number;
  /** Gap between tiles in px (default 2) */
  gap?: number;
  /** Tile border-radius in px (default 12) */
  tileRadius?: number;
  className?: string;
}

export function PuzzleGridTiles({
  cols,
  imageUrl,
  size       = 408,
  gap        = 2,
  tileRadius = 12,
  className,
}: PuzzleGridTilesProps) {
  // Visual tile size accounts for the gaps between cells
  const tileVisual = (size - (cols - 1) * gap) / cols;
  // Conceptual slice size used for background-position (no gap deduction —
  // matches the PuzzleTile convention so seam edges align cleanly)
  const tileSlice  = size / cols;

  return (
    <div
      className={cn("shrink-0", className)}
      style={{
        display:               "grid",
        gridTemplateColumns:   `repeat(${cols}, ${tileVisual}px)`,
        gridTemplateRows:      `repeat(${cols}, ${tileVisual}px)`,
        gap:                   `${gap}px`,
        width:                 size,
        height:                size,
      }}
    >
      {Array.from({ length: cols * cols }).map((_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);

        return (
          <div
            key={i}
            style={{
              width:        tileVisual,
              height:       tileVisual,
              borderRadius: tileRadius,
              overflow:     "hidden",
              // Border drawn on top via inset shadow so it doesn't affect
              // background-size / background-position calculations
              boxShadow:    "inset 0 0 0 2px #a7a9ad",
              // ── Placeholder (Default variant) ──────────────────────────
              ...(!imageUrl && {
                backgroundColor: "#d9d9d9",
              }),
              // ── Image slice (Variant2) ─────────────────────────────────
              ...(imageUrl && {
                backgroundColor:    "#d9d9d9",
                backgroundImage:    `url(${imageUrl})`,
                backgroundSize:     `${size}px ${size}px`,
                backgroundPosition: `-${col * tileSlice}px -${row * tileSlice}px`,
                backgroundRepeat:   "no-repeat",
              }),
            }}
          />
        );
      })}
    </div>
  );
}
