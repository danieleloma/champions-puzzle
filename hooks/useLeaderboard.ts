"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLeaderboardStore } from "@/store/leaderboard-store";
import { getSupabaseClient } from "@/lib/supabase";
import type { LeaderboardType } from "@/types/leaderboard";

export function useLeaderboard(puzzleId?: string) {
  const { activeTab, setEntries, setLoading, setUserRank } =
    useLeaderboardStore();

  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard", activeTab, puzzleId],
    queryFn: async () => {
      const params = new URLSearchParams({ type: activeTab });
      if (puzzleId) params.set("puzzle_id", puzzleId);
      const res = await fetch(`/api/leaderboard?${params}`);
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return res.json();
    },
    refetchInterval: 30_000,
  });

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  useEffect(() => {
    if (data?.entries) {
      setEntries(data.entries);
      setUserRank(data.user_rank ?? null);
    }
  }, [data, setEntries, setUserRank]);

  useEffect(() => {
    const sb = getSupabaseClient();
    const channel = sb
      .channel("leaderboard-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "leaderboard_entries" },
        () => {
          // Invalidation handled by refetchInterval
        }
      )
      .subscribe();

    return () => {
      sb.removeChannel(channel);
    };
  }, []);
}
