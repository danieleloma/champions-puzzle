import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

// ── Figma node 21:1244 "Leaderboard-list-card" ──────────────────────────────
//
//  ┌─────────────────────────────────────────────────┐
//  │  #1   Username                        0.00s     │
//  │       Difficulty type · Puzzle type   0 pts     │
//  └─────────────────────────────────────────────────┘
//
//  Container:   bg #161617  border 1px #252627  rounded-12px  p-16px
//  Left column: rank (Geist Mono Med 14/20 #73767b) + username (Geist Med 16/24 white)
//               + achievement row (Geist Mono Med 12/12 #73767b)
//  Right column: time (Geist Mono Med 16/24 #ffd324) + pts (Geist Mono Med 12/12 #73767b)
// ────────────────────────────────────────────────────────────────────────────

export interface LeaderboardCardProps extends HTMLAttributes<HTMLDivElement> {
  rank: number;
  username: string;
  /** e.g. "Medium" */
  difficulty: string;
  /** e.g. "Arteta Celebration" */
  puzzleTitle: string;
  /** Raw milliseconds — rendered as "X.XXs" */
  timeMs: number;
  points: number;
  /** Highlights the row when it belongs to the current user */
  isCurrentUser?: boolean;
}

function formatTime(ms: number): string {
  return (ms / 1000).toFixed(2) + "s";
}

export function LeaderboardCard({
  rank,
  username,
  difficulty,
  puzzleTitle,
  timeMs,
  points,
  isCurrentUser = false,
  className,
  ...props
}: LeaderboardCardProps) {
  return (
    <div
      className={cn(
        // Container — Figma: bg #161617, border #252627, rounded-12px, p-16px
        "flex items-center justify-between overflow-hidden p-4 rounded-xl",
        "bg-[#161617] border border-[#252627]",
        // Current-user highlight (not in Figma but required UX)
        isCurrentUser && "border-arsenal-gold/40 bg-[#1a1810]",
        className,
      )}
      {...props}
    >
      {/* ── Left: rank + user info ─────────────────────────────────────── */}
      <div className="flex items-center gap-3 min-w-0">

        {/* Rank — Geist Mono Medium 14px / lh 20px / #73767b */}
        <span className="font-mono font-medium text-sm leading-5 text-[#73767b] shrink-0 w-7 text-center">
          #{rank}
        </span>

        {/* Username + achievement */}
        <div className="flex flex-col gap-1 min-w-0">
          {/* Username — Geist Medium 16px / lh 24px / white */}
          <span className="font-sans font-medium text-base leading-6 text-white truncate">
            {username}
          </span>

          {/* Achievement row — Geist Mono Medium 12px / lh 12px / #73767b */}
          <div className="flex items-center font-mono font-medium text-[12px] leading-3 text-[#73767b] whitespace-nowrap">
            <span>{difficulty}</span>
            <span className="mx-0.5">·</span>
            <span className="truncate">{puzzleTitle}</span>
          </div>
        </div>
      </div>

      {/* ── Right: time + points ───────────────────────────────────────── */}
      <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
        {/* Time — Geist Mono Medium 16px / lh 24px / yellow #ffd324 */}
        <span className="font-mono font-medium text-base leading-6 text-[#ffd324] whitespace-nowrap">
          {formatTime(timeMs)}
        </span>

        {/* Points — Geist Mono Medium 12px / lh 12px / #73767b */}
        <span className="font-mono font-medium text-[12px] leading-3 text-[#73767b] whitespace-nowrap">
          {points} pts
        </span>
      </div>
    </div>
  );
}
