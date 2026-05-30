import { type Difficulty } from "@/types/puzzle";
import { cn } from "@/lib/utils";

// ── Figma node 16:4556 "PuzzleTypeGrid" ──────────────────────────────────────
//
//  Exact geometry from Figma (updated values):
//
//  Container   46×46px   p-2px   rounded-4px   flex center
//  Inner area  42×42px   flex-wrap
//
//  3×3  gap 1.5px  cell 13px    radius 2px      bg #007914  cell #fcff3f
//  4×4  gap 1px    cell 9.75px  radius 1.278px  bg #ff6a0c  cell #fff827
//  5×5  gap 1px    cell 7.6px   radius 1.278px  bg #ff594d  cell #fcff3f
//
//  Formula: inner=42, gap = n===3 ? 1.5 : 1,  cell = (42 − (n−1)×gap) / n
//  Generalises to hard(6×6) / expert(8×8) / legendary(10×10).
//
//  Colours for Figma-undefined difficulties extended from the design system.
// ─────────────────────────────────────────────────────────────────────────────

// ── Constants ─────────────────────────────────────────────────────────────────

const OUTER  = 46;   // px — outer container (explicit size-[46px])
const PAD    = 2;    // px — padding each side (p-[2px])
const RADIUS = 4;    // px — container border-radius (rounded-[4px])
const INNER  = OUTER - PAD * 2; // 42px

function gap(n: number)        { return n === 3 ? 1.5 : 1; }
function cellSize(n: number)   { return (INNER - (n - 1) * gap(n)) / n; }
function cellRadius(n: number) { return n === 3 ? 2 : n === 4 ? 1.5 : 1; }

// ── Colour map ────────────────────────────────────────────────────────────────
// Figma specifies 3×3 / 4×4 / 5×5; hard / expert / legendary extended from
// the same design-system tokens.

const BG: Record<Difficulty, string> = {
  beginner:  "#007914", // --color/green/green-700
  easy:      "#ff6a0c", // --poll/spot-ornage-bright
  medium:    "#ff594d", // --color/red/red-400
  hard:      "#dc2626", // --color/red/red-600  (extended)
  expert:    "#3a3b3e", // --color/grey/grey-800 (extended)
  legendary: "#9C824A", // arsenal-gold          (extended)
};

const CELL: Record<Difficulty, string> = {
  beginner:  "#fcff3f", // --logo-green
  easy:      "#fff827",
  medium:    "#fcff3f", // --logo-green
  hard:      "#fcff3f", // --logo-green
  expert:    "#fcff3f", // --logo-green
  legendary: "#fff827",
};

const GRID_N: Record<Difficulty, number> = {
  beginner:  3,
  easy:      4,
  medium:    5,
  hard:      6,
  expert:    8,
  legendary: 10,
};

// ── Component ─────────────────────────────────────────────────────────────────

export interface PuzzleTypeGridProps {
  difficulty: Difficulty;
  className?: string;
}

export function PuzzleTypeGrid({ difficulty, className }: PuzzleTypeGridProps) {
  const n    = GRID_N[difficulty];
  const bg   = BG[difficulty];
  const cell = CELL[difficulty];
  const size = cellSize(n);
  const r    = cellRadius(n);
  const g    = gap(n);

  return (
    <div
      className={cn("flex-shrink-0", className)}
      style={{
        width:           OUTER,
        height:          OUTER,
        padding:         PAD,
        backgroundColor: bg,
        borderRadius:    RADIUS,
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
      }}
    >
      {/* Inner 42×42 flex-wrap grid */}
      <div
        style={{
          width:        INNER,
          height:       INNER,
          display:      "flex",
          flexWrap:     "wrap",
          gap:          `${g}px`,
          alignContent: "flex-start",
          alignItems:   "flex-start",
        }}
      >
        {Array.from({ length: n * n }).map((_, i) => (
          <div
            key={i}
            style={{
              width:           size,
              height:          size,
              backgroundColor: cell,
              borderRadius:    r,
              flexShrink:      0,
            }}
          />
        ))}
      </div>
    </div>
  );
}
