import { create } from "zustand";
import type { LeaderboardEntry, LeaderboardType } from "@/types/leaderboard";

interface LeaderboardState {
  activeTab: LeaderboardType;
  entries: LeaderboardEntry[];
  isLoading: boolean;
  userRank: number | null;

  setTab: (tab: LeaderboardType) => void;
  setEntries: (entries: LeaderboardEntry[]) => void;
  setLoading: (loading: boolean) => void;
  setUserRank: (rank: number | null) => void;
  prependEntry: (entry: LeaderboardEntry) => void;
}

export const useLeaderboardStore = create<LeaderboardState>((set, get) => ({
  activeTab: "global",
  entries: [],
  isLoading: false,
  userRank: null,

  setTab: (tab) => set({ activeTab: tab }),
  setEntries: (entries) => set({ entries }),
  setLoading: (isLoading) => set({ isLoading }),
  setUserRank: (userRank) => set({ userRank }),

  prependEntry: (entry) => {
    const current = get().entries;
    const existing = current.findIndex((e) => e.user_id === entry.user_id);
    let updated: LeaderboardEntry[];

    if (existing >= 0 && current[existing].best_time_ms > entry.best_time_ms) {
      updated = [entry, ...current.filter((_, i) => i !== existing)];
    } else if (existing === -1) {
      updated = [entry, ...current];
    } else {
      return;
    }

    updated = updated
      .sort((a, b) => a.best_time_ms - b.best_time_ms)
      .map((e, i) => ({ ...e, rank: i + 1 }));

    set({ entries: updated.slice(0, 100) });
  },
}));
