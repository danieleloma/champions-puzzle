"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import type { PuzzleTile as PuzzleTileType } from "@/types/puzzle";

const TAB_RATIO = 0.28;

// Deterministic connector type for the right edge of piece at (row, col): 1=tab out, -1=notch in
function rightEdge(row: number, col: number): number {
  return (row * 7 + col) % 2 === 0 ? 1 : -1;
}

// Deterministic connector type for the bottom edge of piece at (row, col)
function bottomEdge(row: number, col: number): number {
  return (row + col * 7) % 2 === 0 ? 1 : -1;
}

function getConnectors(correctIndex: number, grid: number) {
  const col = correctIndex % grid;
  const row = Math.floor(correctIndex / grid);
  return {
    top:    row === 0        ? 0 : -bottomEdge(row - 1, col),
    right:  col === grid - 1 ? 0 :  rightEdge(row, col),
    bottom: row === grid - 1 ? 0 :  bottomEdge(row, col),
    left:   col === 0        ? 0 : -rightEdge(row, col - 1),
  };
}

// Draws one side of the jigsaw piece from (ax,ay) to (bx,by).
// bump > 0 means tab protrudes in the positive-axis perpendicular direction,
// bump < 0 means notch goes in the negative direction.
function side(ax: number, ay: number, bx: number, by: number, bump: number): string {
  if (bump === 0) return `L${bx},${by}`;

  const horiz = ay === by;
  const span  = horiz ? Math.abs(bx - ax) : Math.abs(by - ay);
  const fwd   = horiz ? (bx > ax ? 1 : -1) : (by > ay ? 1 : -1);

  // pt(f, perp) returns "x,y" at fraction f along the side, offset perp pixels perpendicular
  const pt = (f: number, perp = 0): string =>
    horiz
      ? `${+(ax + fwd * span * f).toFixed(2)},${+(ay + perp).toFixed(2)}`
      : `${+(ax + perp).toFixed(2)},${+(ay + fwd * span * f).toFixed(2)}`;

  return [
    `L${pt(0.3)}`,
    // left shoulder: cubic bezier shoots up/down then levels off at tab peak
    `C${pt(0.3, bump * 0.8)} ${pt(0.38, bump)} ${pt(0.4, bump)}`,
    `L${pt(0.6, bump)}`,
    // right shoulder: levels off then curves back down to baseline
    `C${pt(0.62, bump)} ${pt(0.7, bump * 0.8)} ${pt(0.7)}`,
    `L${bx},${by}`,
  ].join("");
}

// Builds the full SVG path for a piece in (W+2T)×(W+2T) coordinate space.
// Base rect sits at (T,T). Tabs protrude outside; notches cut inward.
function jigsawPath(W: number, T: number, top: number, right: number, bottom: number, left: number): string {
  const [l, r, t, b] = [T, T + W, T, T + W];
  return [
    `M${l},${t}`,
    side(l, t, r, t,  -top    * T),  // top:    tab=1 → up (−y)
    side(r, t, r, b,   right  * T),  // right:  tab=1 → right (+x)
    side(r, b, l, b,   bottom * T),  // bottom: tab=1 → down (+y), path goes r→l
    side(l, b, l, t,  -left   * T),  // left:   tab=1 → left (−x), path goes b→t
    "Z",
  ].join("");
}

interface PuzzleTileProps {
  tile: PuzzleTileType;
  imageUrl: string;
  grid: number;
  containerSize: number;
  isHighlighted?: boolean;
  previewMode?: boolean;
}

export function PuzzleTile({
  tile,
  imageUrl,
  grid,
  containerSize,
  isHighlighted,
  previewMode,
}: PuzzleTileProps) {
  const tileSize = containerSize / grid;
  const tab      = tileSize * TAB_RATIO;
  const extSize  = tileSize + 2 * tab;
  const bgSize   = containerSize;
  const bgX      = -(tile.imageX * bgSize) + tab;
  const bgY      = -(tile.imageY * bgSize) + tab;

  const c       = getConnectors(tile.correctIndex, grid);
  const path    = jigsawPath(tileSize, tab, c.top, c.right, c.bottom, c.left);

  const { attributes, listeners, setNodeRef: setDragRef, isDragging } =
    useDraggable({ id: tile.id, disabled: tile.isLocked || previewMode });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `drop-${tile.currentIndex}`,
    disabled: previewMode,
  });

  const dropShadow = tile.isLocked
    ? "drop-shadow(0 0 5px rgba(156,130,74,0.9)) drop-shadow(0 0 2px rgba(156,130,74,0.6))"
    : isHighlighted
    ? "drop-shadow(0 0 8px rgba(156,130,74,0.95))"
    : isDragging
    ? "drop-shadow(0 6px 18px rgba(0,0,0,0.9)) drop-shadow(0 0 6px rgba(220,38,38,0.5))"
    : isOver
    ? "drop-shadow(0 0 6px rgba(255,255,255,0.5))"
    : "drop-shadow(0 1px 3px rgba(0,0,0,0.65))";

  return (
    <div
      ref={(node) => { setDragRef(node); setDropRef(node); }}
      {...attributes}
      {...listeners}
      style={{
        width: tileSize,
        height: tileSize,
        position: "relative",
        touchAction: "none",
        zIndex: isDragging ? 50 : undefined,
      }}
      className={cn(
        "select-none cursor-grab active:cursor-grabbing transition-all duration-150",
        tile.isPlaced && !isDragging && "animate-tile-snap",
        tile.isLocked && "cursor-default",
        isDragging && "opacity-90 scale-105",
      )}
    >
      <div
        style={{
          position: "absolute",
          left: -tab,
          top:  -tab,
          width:   extSize,
          height:  extSize,
          backgroundImage:    `url(${imageUrl})`,
          backgroundSize:     `${bgSize}px ${bgSize}px`,
          backgroundPosition: `${bgX}px ${bgY}px`,
          clipPath:  `path('${path}')`,
          filter:    dropShadow,
          transition: "filter 0.15s",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
