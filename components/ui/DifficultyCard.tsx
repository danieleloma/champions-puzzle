import { cn } from "@/lib/utils";
import { DIFFICULTY_CONFIG, type Difficulty } from "@/types/puzzle";
import { PuzzleTypeGrid } from "@/components/ui/PuzzleTypeGrid";
import type { ButtonHTMLAttributes } from "react";
import { playClick } from "@/lib/sounds";

// ── Figma node 50:1077 "difficulty-type" ─────────────────────────────────────
//
//  Default   — bg #161617  border #252627
//  Hover     — bg #1e1e1f (unselected only), per request
//  Selected  — border #ff6a0c  shadow: 0px 1px 20px 1px rgba(255,106,12,0.5)
//
//  Left:  level name  Geist Med 16/24 white
//         spec row    Geist Mono Med 14/20  grid (#73767b) · (#73767b) XP (#ffd324)
//  Right: PuzzleTypeGrid 46×46px
// ─────────────────────────────────────────────────────────────────────────────

export interface DifficultyCardProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  difficulty: Difficulty;
  selected?: boolean;
}

export function DifficultyCard({
  difficulty,
  selected = false,
  className,
  onClick,
  ...props
}: DifficultyCardProps) {
  const { label, grid, xpMultiplier } = DIFFICULTY_CONFIG[difficulty];

  return (
    <button
      type="button"
      onClick={(e) => { playClick(); onClick?.(e); }}
      className={cn(
        "flex items-center justify-between overflow-hidden p-3 rounded-xl",
        "bg-[#161617] border transition-all",
        selected
          ? "border-[#ff6a0c] shadow-[0px_1px_20px_1px_rgba(255,106,12,0.5)]"
          : "border-[#252627] hover:bg-[#1e1e1f]",
        className,
      )}
      {...props}
    >
      {/* Left: level name + spec row */}
      <div className="flex flex-col gap-1 items-start text-left">
        <span className="font-sans font-medium text-base leading-6 text-white">
          {label}
        </span>
        <div className="flex items-center font-mono font-medium text-sm leading-5">
          <span className="text-[#73767b]">{grid}×{grid}</span>
          <span className="text-[#73767b] mx-0.5 text-xs tracking-[-0.6px]">·</span>
          <span className="text-[#ffd324]">x{xpMultiplier} XP</span>
        </div>
      </div>

      {/* Right: grid visual */}
      <PuzzleTypeGrid difficulty={difficulty} />
    </button>
  );
}
