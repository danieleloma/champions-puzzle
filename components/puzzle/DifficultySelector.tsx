"use client";

import { DIFFICULTY_CONFIG, type Difficulty } from "@/types/puzzle";
import { cn } from "@/lib/utils";

interface DifficultySelectorProps {
  selected: Difficulty;
  onChange: (d: Difficulty) => void;
}

export function DifficultySelector({ selected, onChange }: DifficultySelectorProps) {
  const difficulties = Object.entries(DIFFICULTY_CONFIG) as [
    Difficulty,
    (typeof DIFFICULTY_CONFIG)[Difficulty]
  ][];

  return (
    <div className="grid grid-cols-3 gap-2">
      {difficulties.map(([key, config]) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={cn(
            "flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all",
            selected === key
              ? "border-arsenal-red bg-arsenal-red/10 scale-[1.02]"
              : "border-white/10 bg-white/5 hover:border-white/20"
          )}
        >
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: config.color }}
          >
            {config.label}
          </span>
          <span className="text-white/50 text-[11px]">
            {config.grid}×{config.grid}
          </span>
          <span className="text-white/30 text-[10px]">
            ×{config.xpMultiplier} XP
          </span>
        </button>
      ))}
    </div>
  );
}
