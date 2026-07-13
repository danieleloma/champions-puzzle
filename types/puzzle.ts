export type Difficulty =
  | "beginner"
  | "easy"
  | "medium"
  | "hard"
  | "expert"
  | "legendary";

export interface DifficultyConfig {
  label: string;
  grid: number;
  tileCount: number;
  xpMultiplier: number;
  hintLimit: number;
  color: string;
}

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  beginner: {
    label: "Beginner",
    grid: 3,
    tileCount: 9,
    xpMultiplier: 1,
    hintLimit: 5,
    color: "#22c55e",
  },
  easy: {
    label: "Easy",
    grid: 4,
    tileCount: 16,
    xpMultiplier: 1.5,
    hintLimit: 4,
    color: "#84cc16",
  },
  medium: {
    label: "Medium",
    grid: 5,
    tileCount: 25,
    xpMultiplier: 2,
    hintLimit: 3,
    color: "#eab308",
  },
  hard: {
    label: "Hard",
    grid: 6,
    tileCount: 36,
    xpMultiplier: 3,
    hintLimit: 2,
    color: "#f97316",
  },
  expert: {
    label: "Expert",
    grid: 8,
    tileCount: 64,
    xpMultiplier: 5,
    hintLimit: 1,
    color: "#ef4444",
  },
  legendary: {
    label: "Legendary",
    grid: 10,
    tileCount: 100,
    xpMultiplier: 10,
    hintLimit: 0,
    color: "#9C824A",
  },
};

export interface Puzzle {
  id: string;
  title: string;
  description: string;
  image_url: string;
  thumbnail_url: string;
  difficulty: Difficulty;
  tile_count: number;
  active: boolean;
  featured: boolean;
  club_id: string;
  created_at: string;
  play_count: number;
}

export interface PuzzleTile {
  id: string;
  correctIndex: number;
  currentIndex: number;
  imageX: number;
  imageY: number;
  isPlaced: boolean;
  isLocked: boolean;
}

export interface PuzzleState {
  puzzle: Puzzle;
  tiles: PuzzleTile[];
  difficulty: Difficulty;
  isStarted: boolean;
  isCompleted: boolean;
  elapsedMs: number;
  moveCount: number;
  hintsUsed: number;
  hintsRemaining: number;
  previewMode: boolean;
}

export interface PuzzleAttempt {
  id: string;
  user_id: string;
  puzzle_id: string;
  difficulty: Difficulty;
  completion_time_ms: number;
  move_count: number;
  hints_used: number;
  completed: boolean;
  score: number;
  created_at: string;
}
