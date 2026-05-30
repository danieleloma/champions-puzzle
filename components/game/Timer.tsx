"use client";

import { useGameStore } from "@/store/game-store";
import { useTimer } from "@/hooks/useTimer";
import { formatTime } from "@/lib/score-calculator";
import { cn } from "@/lib/utils";

export function Timer() {
  useTimer();
  const { elapsedMs, isStarted, isCompleted, moveCount } = useGameStore();

  return (
    <div className="flex items-center gap-4">
      <div
        className={cn(
          "font-mono font-bold text-2xl tabular-nums",
          !isStarted && "text-white/30",
          isStarted && !isCompleted && "text-white",
          isCompleted && "text-arsenal-gold"
        )}
      >
        {formatTime(elapsedMs)}
      </div>
      <div className="text-white/30 text-sm">
        {moveCount} move{moveCount !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
