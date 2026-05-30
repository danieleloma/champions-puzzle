"use client";

import { forwardRef } from "react";
import type { Difficulty } from "@/types/puzzle";
import { formatTime, getRankBadge } from "@/lib/score-calculator";
import { DIFFICULTY_CONFIG } from "@/types/puzzle";

interface ShareCardProps {
  username: string;
  puzzleTitle: string;
  completionTimeMs: number;
  difficulty: Difficulty;
  score: number;
  rank?: number | null;
}

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ username, puzzleTitle, completionTimeMs, difficulty, score, rank }, ref) => {
    const config = DIFFICULTY_CONFIG[difficulty];

    return (
      <div
        ref={ref}
        className="rounded-2xl overflow-hidden border border-white/10"
        style={{ background: "linear-gradient(135deg, #0D0D0D 0%, #1a0505 100%)" }}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-arsenal-red rounded-lg flex items-center justify-center text-sm">
                🏆
              </div>
              <div>
                <p className="text-white font-bold text-sm">{username}</p>
                <p className="text-white/40 text-[11px]">Arsenal Puzzle</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-arsenal-gold font-black text-xl font-mono">
                {formatTime(completionTimeMs)}
              </p>
              {rank && (
                <p className="text-white/40 text-[11px]">
                  {getRankBadge(rank)} Rank #{rank}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-[11px]">Puzzle</p>
              <p className="text-white text-sm font-semibold">{puzzleTitle}</p>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-[11px]">Difficulty</p>
              <p className="text-sm font-bold" style={{ color: config.color }}>
                {config.label}
              </p>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-[11px]">Score</p>
              <p className="text-white text-sm font-bold">{score.toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-white/10 text-center">
            <p className="text-white/30 text-[10px] tracking-widest uppercase">
              Can you beat me? ⚽ arsenal-puzzle.vercel.app
            </p>
          </div>
        </div>
      </div>
    );
  }
);

ShareCard.displayName = "ShareCard";
