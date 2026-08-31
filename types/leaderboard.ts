import type { Difficulty } from "./puzzle";

export type LeaderboardType = "global" | "daily" | "weekly" | "puzzle";

export interface LeaderboardEntry {
  id: string;
  rank: number;
  user_id: string;
  username: string;
  avatar_color: string;
  puzzle_id: string;
  puzzle_title: string;
  difficulty: Difficulty;
  best_time_ms: number;
  score: number;
  completed_at: string;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  total: number;
  user_entry?: LeaderboardEntry;
  user_rank?: number;
}
