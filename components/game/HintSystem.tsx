"use client";

import { useGameStore } from "@/store/game-store";
import { DIFFICULTY_CONFIG } from "@/types/puzzle";
import { cn } from "@/lib/utils";

export function HintSystem() {
  const { difficulty, hintsUsed, useHint, isCompleted, previewMode, togglePreview } =
    useGameStore();

  const { hintLimit } = DIFFICULTY_CONFIG[difficulty];
  const hintsLeft = Math.max(0, hintLimit - hintsUsed);
  const noHints = hintLimit === 0;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={togglePreview}
        className={cn(
          "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
          previewMode
            ? "bg-arsenal-red text-white"
            : "bg-white/5 text-white/60 hover:bg-white/10"
        )}
      >
        <span>👁</span>
        <span className="hidden sm:inline">Preview</span>
      </button>

      <button
        onClick={useHint}
        disabled={isCompleted || noHints || hintsLeft === 0}
        className={cn(
          "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
          noHints || hintsLeft === 0
            ? "opacity-30 cursor-not-allowed bg-white/5 text-white/40"
            : "bg-white/5 text-white/60 hover:bg-white/10"
        )}
      >
        <span>💡</span>
        {noHints ? (
          <span className="hidden sm:inline">No hints</span>
        ) : (
          <span>
            {hintsLeft}/{hintLimit}
          </span>
        )}
      </button>
    </div>
  );
}
