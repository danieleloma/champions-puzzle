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

export interface ScoreSubmission {
  puzzle_id: string;
  difficulty: Difficulty;
  completion_time_ms: number;
  move_count: number;
  hints_used: number;
  device_id: string;
  session_token: string;
  checksum: string;
}

export interface ScoreValidationResult {
  valid: boolean;
  reason?: string;
  score: number;
  xp_earned: number;
  new_rank?: number;
  is_personal_best: boolean;
  achievements_unlocked: string[];
}
