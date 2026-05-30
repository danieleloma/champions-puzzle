"use client";

import { useLeaderboardStore } from "@/store/leaderboard-store";
import { useUserStore } from "@/store/user-store";
import { LeaderboardCard } from "@/components/ui/LeaderboardCard";

export function LeaderboardTable() {
  const { entries, isLoading } = useLeaderboardStore();
  const { user } = useUserStore();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-[72px] rounded-xl bg-[#161617] border border-[#252627] animate-pulse"
            style={{ opacity: 1 - i * 0.15 }}
          />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="font-mono font-medium text-[#73767b] text-sm">
          No scores yet — be the first!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {entries.map((entry) => (
        <LeaderboardCard
          key={entry.id}
          rank={entry.rank}
          username={entry.username}
          difficulty={entry.difficulty}
          puzzleTitle={entry.puzzle_title}
          timeMs={entry.best_time_ms}
          points={entry.score}
          isCurrentUser={entry.user_id === user?.id}
        />
      ))}
    </div>
  );
}
