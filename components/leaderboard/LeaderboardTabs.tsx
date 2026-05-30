"use client";

import { useLeaderboardStore } from "@/store/leaderboard-store";
import type { LeaderboardType } from "@/types/leaderboard";
import { cn } from "@/lib/utils";

const TABS: { key: LeaderboardType; label: string }[] = [
  { key: "global", label: "All Time" },
  { key: "daily", label: "Today" },
  { key: "weekly", label: "This Week" },
];

export function LeaderboardTabs() {
  const { activeTab, setTab } = useLeaderboardStore();

  return (
    <div className="flex bg-white/5 rounded-xl p-1 gap-1">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setTab(tab.key)}
          className={cn(
            "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === tab.key
              ? "bg-arsenal-red text-white shadow-md"
              : "text-white/50 hover:text-white/80"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
