export interface User {
  id: string;
  device_id: string;
  username: string;
  xp: number;
  level: number;
  avatar_color: string;
  created_at: string;
  last_seen_at: string;
}

export interface UserProfile extends User {
  total_puzzles_completed: number;
  best_rank: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  key: AchievementKey;
  label: string;
  description: string;
  icon: string;
  unlocked_at: string;
}

export type AchievementKey =
  | "first_win"
  | "top_100"
  | "no_hints"
  | "speed_demon"
  | "legendary_solver"
  | "streak_7"
  | "social_sharer"
  | "challenger";

export const ACHIEVEMENT_CONFIGS: Record<
  AchievementKey,
  Omit<Achievement, "id" | "unlocked_at">
> = {
  first_win: {
    key: "first_win",
    label: "First Win",
    description: "Complete your first puzzle",
    icon: "🏆",
  },
  top_100: {
    key: "top_100",
    label: "Top 100",
    description: "Finish in the global top 100",
    icon: "🌍",
  },
  no_hints: {
    key: "no_hints",
    label: "Purist",
    description: "Complete a puzzle without any hints",
    icon: "👁️",
  },
  speed_demon: {
    key: "speed_demon",
    label: "Speed Demon",
    description: "Complete a puzzle in under 60 seconds",
    icon: "⚡",
  },
  legendary_solver: {
    key: "legendary_solver",
    label: "Legendary Solver",
    description: "Complete a Legendary difficulty puzzle",
    icon: "🔱",
  },
  streak_7: {
    key: "streak_7",
    label: "7-Day Gunner",
    description: "Play for 7 consecutive days",
    icon: "🔥",
  },
  social_sharer: {
    key: "social_sharer",
    label: "Social Gooner",
    description: "Share a completed puzzle",
    icon: "📣",
  },
  challenger: {
    key: "challenger",
    label: "Challenger",
    description: "Challenge a friend to beat your score",
    icon: "⚔️",
  },
};

export function getLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function xpForNextLevel(level: number): number {
  return Math.pow(level, 2) * 100;
}
