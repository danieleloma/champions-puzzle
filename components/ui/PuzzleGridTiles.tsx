import { cn } from "@/lib/utils";

// ── Figma node 39:1208 "Grid Item" ───────────────────────────────────────────
//
//  Two states (Figma property1):
//    Default  — bg #d9d9d9  border-2 #a7a9ad  rounded-12
//    Selected — bg #d9d9d9  border-2 #fcff3f  rounded-12
//
//  PuzzleGridTiles composes an N×N grid of these tiles.
//  It is a pure display component — no drag-and-drop, no game state.
//  For the interactive board see components/puzzle/PuzzleBoard.tsx.
//
//  Geometry:
//    tileVisual = (size − (N−1)×gap) / N   (accounts for gaps)
//    tileSlice  = size / N                  (used for bg-position, no gap)
// ─────────────────────────────────────────────────────────────────────────────

export interface PuzzleGridTilesProps {
  /** Grid dimension — N for an N×N board */
  cols: number;
  /** Puzzle image URL. Omit to render placeholder tiles */
  imageUrl?: string;
  /** Total container size in px (default 408) */
  size?: number;
  /** Gap between tiles in px (default 2) */
  gap?: number;
  /** Tile border-radius in px (default 12) */
  tileRadius?: number;
  /**
   * Zero-based indices of tiles to render in the "Selected" state
   * (border #fcff3f). Defaults to none.
   */
  selectedIndices?: number[];
  className?: string;
}

export function PuzzleGridTiles({
  cols,
  imageUrl,
  size           = 408,
  gap            = 2,
  tileRadius     = 12,
  selectedIndices = [],
  className,
}: PuzzleGridTilesProps) {
  const tileVisual = (size - (cols - 1) * gap) / cols;
  const tileSlice  = size / cols;

  const selectedSet = new Set(selectedIndices);

  return (
    <div
      className={cn("shrink-0", className)}
      style={{
        display:             "grid",
        gridTemplateColumns: `repeat(${cols}, ${tileVisual}px)`,
        gridTemplateRows:    `repeat(${cols}, ${tileVisual}px)`,
        gap:                 `${gap}px`,
        width:               size,
        height:              size,
      }}
    >
      {Array.from({ length: cols * cols }).map((_, i) => {
        const col      = i % cols;
        const row      = Math.floor(i / cols);
        const selected = selectedSet.has(i);

        // Default → #a7a9ad border  |  Selected → #fcff3f border  (Figma 39:1208)
        const borderColor = selected ? "#fcff3f" : "#a7a9ad";
        const glowShadow  = selected ? ", 0 0 8px rgba(252,255,63,0.4)" : "";
        const boxShadow   = `inset 0 0 0 2px ${borderColor}${glowShadow}`;

        return (
          <div
            key={i}
            style={{
              width:        tileVisual,
              height:       tileVisual,
              borderRadius: tileRadius,
              overflow:     "hidden",
              boxShadow,
              backgroundColor:    "#d9d9d9",
              ...(imageUrl && {
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
