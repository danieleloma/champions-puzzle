"use client";

import { useRouter } from "next/navigation";
import { useLeaderboardStore } from "@/store/leaderboard-store";
import { useUserStore } from "@/store/user-store";
import { LeaderboardCard } from "@/components/ui/LeaderboardCard";
import { Icon3D } from "@/components/ui/Icon3D";
import { Button } from "@/components/ui/Button";

export function LeaderboardTable() {
  const router = useRouter();
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
      <div
        className="flex flex-col items-center justify-center text-center gap-8 w-full"
        style={{ paddingTop: 8, paddingBottom: 48, marginTop: -40 }}
      >
        <Icon3D name="substitute-board" size={200} loading="eager" />
        {/* Figma node 147:1489: text block + button, gap:24 (distinct from
            the 32px icon→text gap above, owned by the outer flex's gap-8) */}
        <div className="flex flex-col items-center gap-6 w-full">
          <div className="flex flex-col items-center gap-1">
            <h2 className="font-boldonse text-white text-[20px] leading-normal">
              No scores yet
            </h2>
            <p
              className="font-sans font-medium text-[#929498] text-base leading-6"
              style={{ textShadow: "0px 4px 24px black" }}
            >
              Be the first
            </p>
          </div>
          <Button
            variant="secondary"
            fullWidth
            className="md:w-[380px] md:mx-auto"
            onClick={() => router.push("/champions")}
          >
            GO TO PUZZLE
          </Button>
        </div>
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
