"use client";

import { cn } from "@/lib/utils";
import { playClick } from "@/lib/sounds";

// ── Figma node 13:201 "ImageClubContainer" — "puzzle" variant ────────────────
//
//  196×196px  rounded-12px  border #252627
//  ├─ Puzzle thumbnail fills card (object-cover)
//  ├─ Bottom: puzzle title (Boldonse 14px, white)
//  │          + "Nx×N · Tap to play" (Geist Mono Med 15px)
//  │            grid/tap-label #d4d4d6 (grey-200) · dot #73767b (grey-600)
//  ├─ Bottom blur overlay (blur-20px gradient, mix-blend-multiply)
//  └─ "View" badge — top-right 10px inset, hidden until hover/focus
//                    (Figma "View Button" instance — reveals on :hover to
//                    mirror the live app)
//
//  The club-selection card (Figma's other "ImageClubContainer" variant) is a
//  separate component — see components/ui/ClubCard.tsx.
// ─────────────────────────────────────────────────────────────────────────────

// ── Puzzle card ───────────────────────────────────────────────────────────────

/** Eye icon — same path as the play page's preview toggle, for visual consistency */
function ViewIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 20 20" fill="none" aria-hidden style={{ flexShrink: 0 }}>
      <path
        d="M2 10C2 10 4.5 5 10 5C15.5 5 18 10 18 10C18 10 15.5 15 10 15C4.5 15 2 10 2 10Z"
        stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="2.5" stroke="white" strokeWidth="1.5" />
    </svg>
  );
}

export interface PuzzleCardProps {
  variant: "puzzle";
  /** Puzzle thumbnail URL */
  src: string;
  /** Puzzle display title  e.g. "Arteta Celebration" */
  title: string;
  /** Grid dimension N — renders "N×N · Tap to play"  e.g. 3 → "3×3" */
  gridSize: number;
  /** Override the secondary line  default "Tap to play" */
  tapLabel?: string;
  onClick?: () => void;
  /** Shows the hover "View" badge (top-right) — opens a fullscreen preview */
  onView?: () => void;
  /** Gates play — true until a difficulty is chosen. View still works. */
  disabled?: boolean;
  className?: string;
}

function PuzzleCard({
  src,
  title,
  gridSize,
  tapLabel = "Tap to play",
  onClick,
  onView,
  disabled = false,
  className,
}: PuzzleCardProps) {
  return (
    <div
      className={cn(
        // Container — 196×196px square, rounded-12px, border #252627
        "group relative size-[196px] rounded-[12px] overflow-hidden",
        "border border-[#252627]",
        disabled && "opacity-60",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => { if (disabled || !onClick) return; playClick(); onClick(); }}
        disabled={disabled}
        className={cn(
          "absolute inset-0 w-full h-full text-left", // prevent inherited button centering
          disabled ? "cursor-default" : "cursor-pointer",
        )}
      >
        {/* ── Puzzle thumbnail ─────────────────────────────────────── */}
        <img
          src={src}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* ── Bottom blur overlay ──────────────────────────────────── */}
        <div
          className="absolute bottom-[-80px] left-[-50px] w-[297px] h-[146px] blur-[20px] mix-blend-multiply pointer-events-none"
          style={{
            background:
              "linear-gradient(180.13deg, rgb(126,126,126) 43.894%, rgb(0,0,0) 63.836%)",
          }}
        />

        {/* ── Bottom info ────────────────────────────────────────────── */}
        {/* Figma "title exceeds one or two lines" variant — leading-20px so
            2-3 line titles get proper line spacing instead of collapsing tight.
            Spans left-9/right-9 (not a fixed width) so it adapts to any card
            size — the 196px desktop card and the smaller 3-per-row grid cells. */}
        <div className="absolute bottom-[13px] left-[9px] right-[9px] flex flex-col gap-0 items-start">
          {/* Puzzle title — Boldonse 14px / white / leading-20px, wraps within the card */}
          <span className="font-boldonse text-[14px] leading-[20px] text-white break-words min-w-full w-[min-content]">
            {title}
          </span>

          {disabled ? (
            <span className="font-mono font-medium text-[15px] leading-none tracking-[-0.75px] text-[#d4d4d6]">
              Select difficulty
            </span>
          ) : (
            /* Grid spec row — Geist Mono Medium 15px / grid+label #d4d4d6, dot #73767b */
            <div className="flex items-baseline font-mono font-medium">
              <span className="text-[15px] leading-none tracking-[-0.75px] text-[#d4d4d6]">
                {gridSize}×{gridSize}
              </span>
              <span className="text-[12px] leading-none tracking-[-0.6px] mx-px text-[#73767b]">·</span>
              <span className="text-[15px] leading-none tracking-[-0.75px] text-[#d4d4d6]">
                {tapLabel}
              </span>
            </div>
          )}
        </div>
      </button>

      {/* ── "View" badge — Figma "View Button" instance, top-right 10px inset ── */}
      {/* Hidden until hover/focus on desktop; always shown under md (no real
          hover on touch) — always enabled so the image can be previewed
          fullscreen before a difficulty is chosen ("view before committing") */}
      {onView && (
        <button
          type="button"
          onClick={() => onView()}
          aria-label={`View ${title} fullscreen`}
          className={cn(
            "absolute top-[10px] right-[10px] z-10",
            "flex items-center gap-1 h-5 pl-1.5 pr-2 rounded-full bg-[#252627]",
            "opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity",
          )}
        >
          <ViewIcon />
          <span className="font-sans font-medium text-[11px] leading-none text-white">View</span>
        </button>
      )}
    </div>
  );
}

// ── Unified export ────────────────────────────────────────────────────────────

export type ImageCardProps = PuzzleCardProps;

export function ImageCard(props: ImageCardProps) {
  return <PuzzleCard {...props} />;
}
