"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useGameStore } from "@/store/game-store";
import { DIFFICULTY_CONFIG } from "@/types/puzzle";
import { getCompletionPercent, isAdjacent } from "@/lib/puzzle-engine";
import type { PuzzleTile as PuzzleTileType } from "@/types/puzzle";
import { playPickUp, playSnap, playMove, playComplete } from "@/lib/sounds";

// ── Visual constants — match PuzzleGridTiles exactly ─────────────────────────
const TILE_GAP    = 2;   // px gap between tiles
const TILE_RADIUS = 12;  // px border-radius on each tile

// ── GameTile ──────────────────────────────────────────────────────────────────
// Rectangular interactive tile — Figma node 39:1208 "Grid Item":
//   Default  — bg #d9d9d9  inset 2px #a7a9ad  rounded-12
//   Selected — bg #d9d9d9  inset 2px #fcff3f  rounded-12
// Plus dnd-kit drag/drop and highlight states.

interface GameTileProps {
  tile:          PuzzleTileType;
  imageUrl:      string;
  grid:          number;
  containerSize: number;
  isHighlighted: boolean;
  previewMode:   boolean;
  activeIndex:   number | null; // currentIndex of the tile being dragged, if any
}

function GameTile({ tile, imageUrl, grid, containerSize, isHighlighted, previewMode, activeIndex }: GameTileProps) {
  const tileVisual = (containerSize - (grid - 1) * TILE_GAP) / grid;
  const col = tile.currentIndex % grid;
  const row = Math.floor(tile.currentIndex / grid);

  const { attributes, listeners, setNodeRef: setDragRef, isDragging } =
    useDraggable({ id: tile.id, disabled: tile.isLocked || previewMode });

  // While a tile is being dragged, only its four cardinal neighbors are
  // valid drop targets — a tile can move only one step at a time.
  const isDragSource  = activeIndex === tile.currentIndex;
  const isValidTarget = activeIndex !== null && !isDragSource && isAdjacent(activeIndex, tile.currentIndex, grid);
  const isBlocked     = activeIndex !== null && !isDragSource && !isValidTarget;

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id:       `drop-${tile.currentIndex}`,
    disabled: previewMode || isBlocked,
  });

  // Border/glow states — inset shadow so it doesn't affect layout
  // Default   → #a7a9ad  |  Selected (placed/locked/hint) → #fcff3f  (Figma 39:1208)
  let boxShadow = "inset 0 0 0 2px #a7a9ad";
  if (tile.isLocked || tile.isPlaced) {
    boxShadow = "inset 0 0 0 2px #fcff3f, 0 0 10px rgba(252,255,63,0.35)";
  } else if (isHighlighted) {
    boxShadow = "inset 0 0 0 2px #fcff3f, 0 0 14px rgba(252,255,63,0.55)";
  } else if (isDragging) {
    boxShadow = "inset 0 0 0 2px #a7a9ad, 0 8px 24px rgba(0,0,0,0.8)";
  } else if (isValidTarget && isOver) {
    boxShadow = "inset 0 0 0 2px #fcff3f, 0 0 12px rgba(252,255,63,0.5)";
  } else if (isValidTarget) {
    boxShadow = "inset 0 0 0 2px #fcff3f88";
  }

  return (
    <div
      ref={(node) => { setDragRef(node); setDropRef(node); }}
      {...attributes}
      {...listeners}
      style={{
        position:           "absolute",
        left:               col * (tileVisual + TILE_GAP),
        top:                row * (tileVisual + TILE_GAP),
        width:              tileVisual,
        height:             tileVisual,
        borderRadius:       TILE_RADIUS,
        overflow:           "hidden",
        boxShadow,
        // Image slice — same math as PuzzleGridTiles
        backgroundColor:    "#d9d9d9",
        backgroundImage:    `url(${imageUrl})`,
        backgroundSize:     `${containerSize}px ${containerSize}px`,
        backgroundPosition: `${-tile.imageX * containerSize}px ${-tile.imageY * containerSize}px`,
        backgroundRepeat:   "no-repeat",
        // Interaction
        touchAction:        "none",
        cursor:             tile.isLocked ? "default" : isDragging ? "grabbing" : "grab",
        zIndex:             isDragging ? 50 : 1,
        opacity:            isDragging ? 0.92 : isBlocked ? 0.35 : 1,
        transform:          isDragging ? "scale(1.04)" : "scale(1)",
        transition:         isDragging ? undefined : "box-shadow 0.15s, transform 0.1s, opacity 0.15s",
        userSelect:         "none",
      }}
    />
  );
}

// ── PuzzleBoard ───────────────────────────────────────────────────────────────

interface PuzzleBoardProps {
  imageUrl:      string;
  size?:         number;
  showProgress?: boolean;
}

export function PuzzleBoard({ imageUrl, size, showProgress = true }: PuzzleBoardProps) {
  const { tiles, difficulty, moveTile, lastHintedTileId, previewMode } =
    useGameStore();

  const boardRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState(size ?? 320);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { grid } = DIFFICULTY_CONFIG[difficulty];

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 0, tolerance: 5 } }),
  );

  useEffect(() => {
    if (size !== undefined) return;
    const update = () => {
      if (boardRef.current) {
        const computed = Math.min(boardRef.current.offsetWidth, window.innerHeight * 0.6);
        setContainerSize(computed);
      }
    };
    update();
    const ro = new ResizeObserver(update);
    if (boardRef.current) ro.observe(boardRef.current);
    return () => ro.disconnect();
  }, [size]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const tile = tiles.find((t) => t.id === event.active.id.toString());
    setActiveIndex(tile?.currentIndex ?? null);
    playPickUp();
  }, [tiles]);

  const handleDragCancel = useCallback(() => {
    setActiveIndex(null);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveIndex(null);

      const { active, over } = event;
      if (!over) return;
      const toIndex = parseInt(over.id.toString().replace("drop-", ""));
      if (isNaN(toIndex)) return;

      const fromTile = tiles.find((t) => t.id === active.id.toString());
      if (!fromTile || toIndex === fromTile.currentIndex) return;
      // A tile can only move one step at a time — into a directly
      // adjacent cell (up/down/left/right), never a distant one.
      if (!isAdjacent(fromTile.currentIndex, toIndex, grid)) return;

      const willSnap    = toIndex === fromTile.correctIndex;
      const wasComplete = tiles.every((t) => t.isPlaced);

      moveTile(active.id.toString(), toIndex);

      if (!wasComplete) {
        const nowComplete = [...tiles]
          .map((t) => t.id === fromTile.id ? { ...t, currentIndex: toIndex } : t)
          .every((t) => t.currentIndex === t.correctIndex);

        if (nowComplete) {
          playComplete();
        } else if (willSnap) {
          playSnap();
        } else {
          playMove();
        }
      }
    },
    [moveTile, tiles, grid],
  );

  const completionPct = useMemo(() => getCompletionPercent(tiles), [tiles]);

  const orderedTiles = useMemo(
    () => [...tiles].sort((a, b) => a.currentIndex - b.currentIndex),
    [tiles],
  );

  return (
    <div className="flex flex-col items-center gap-3">
      <div ref={boardRef} className="w-full max-w-[480px]">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div
            style={{
              position:        "relative",
              width:           containerSize,
              height:          containerSize,
              margin:          "0 auto",
              // Dark gap colour shows between tiles (matches app bg)
              backgroundColor: "#0f0f10",
            }}
          >
            {previewMode ? (
              // Preview: full assembled image
              <img
                src={imageUrl}
                alt="Puzzle preview"
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: TILE_RADIUS }}
              />
            ) : (
              orderedTiles.map((tile) => (
                <GameTile
                  key={tile.id}
                  tile={tile}
                  imageUrl={imageUrl}
                  grid={grid}
                  containerSize={containerSize}
                  isHighlighted={tile.id === lastHintedTileId}
                  previewMode={previewMode}
                  activeIndex={activeIndex}
                />
              ))
            )}
          </div>
        </DndContext>
      </div>

      {showProgress && (
        <div className="w-full max-w-[480px] px-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white/40 text-xs">{completionPct}% complete</span>
            <span className="text-white/40 text-xs">
              {tiles.filter((t) => t.isPlaced).length}/{tiles.length} tiles
            </span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-arsenal-red rounded-full transition-all duration-300"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
