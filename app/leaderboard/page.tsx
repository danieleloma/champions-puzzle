"use client";

import Link from "next/link";
import Image from "next/image";
import { MenuSwitcher } from "@/components/ui/MenuSwitcher";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useLeaderboardStore } from "@/store/leaderboard-store";
import type { LeaderboardType } from "@/types/leaderboard";

const TABS: { value: LeaderboardType; label: string }[] = [
  { value: "global", label: "All Time" },
  { value: "daily", label: "Today" },
  { value: "weekly", label: "This Week" },
];

export default function LeaderboardPage() {
  const { activeTab, setTab } = useLeaderboardStore();
  useLeaderboard();

  return (
    <main className="relative min-h-screen bg-[#0f0f10] overflow-hidden">
      {/* Medal decoration — bottom-right, rotated, partially clipped */}
      <div
        className="absolute bottom-[-60px] right-[-70px] pointer-events-none select-none z-0"
        style={{ transform: "rotate(16.63deg)" }}
      >
        <Image
          src="/icons/3d/medal.png"
          alt=""
          width={220}
          height={220}
          priority
        />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-12 pb-4">
        <Link
          href="/"
          className="flex items-center justify-center border border-[#73767b] rounded-[4px] h-8 w-8 shrink-0"
          aria-label="Go back"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M12.5 15L7.5 10L12.5 5"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>

        <div className="flex flex-col items-center">
          <h1 className="font-boldonse text-white text-[20px] leading-normal">
            Leaderboard
          </h1>
          <p className="font-mono font-medium text-[15px] text-[#929498] tracking-[-0.75px] leading-normal">
            Global Rankings
          </p>
        </div>

        {/* Invisible spacer to keep title centered */}
        <div className="w-8 shrink-0" aria-hidden />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-[440px] mx-auto px-4 flex flex-col gap-10 mt-6 pb-24">
        <MenuSwitcher tabs={TABS} value={activeTab} onChange={setTab} />
        <LeaderboardTable />
      </div>
    </main>
  );
}
