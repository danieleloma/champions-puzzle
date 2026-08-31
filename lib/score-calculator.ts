import type { Difficulty } from "@/types/puzzle";
import { DIFFICULTY_CONFIG } from "@/types/puzzle";

const BASE_SCORE = 10_000;
const TIME_PENALTY_PER_SECOND = 10;
const HINT_PENALTY = 500;
const MOVE_EFFICIENCY_BONUS = 200;

export function calculateScore({
  difficulty,
  completionTimeMs,
  moveCount,
  hintsUsed,
}: {
  difficulty: Difficulty;
  completionTimeMs: number;
  moveCount: number;
  hintsUsed: number;
}): number {
  const { tileCount, xpMultiplier } = DIFFICULTY_CONFIG[difficulty];
  // A backward system-clock jump mid-puzzle could otherwise make elapsed
  // time negative, turning the time penalty into an unbounded bonus.
  const seconds = Math.max(0, completionTimeMs) / 1000;

  const baseScore = BASE_SCORE * xpMultiplier;
  const timePenalty = Math.min(seconds * TIME_PENALTY_PER_SECOND, baseScore * 0.8);
  const hintPenalty = hintsUsed * HINT_PENALTY;

  const perfectMoves = tileCount;
  // Clamped to perfectMoves: solving in fewer than tileCount moves (possible
  // — a single swap can place two tiles at once) would otherwise push
  // moveEfficiency above perfectMoves and the bonus past its intended
  // MOVE_EFFICIENCY_BONUS cap.
  const moveEfficiency = Math.min(perfectMoves, Math.max(0, perfectMoves - (moveCount - perfectMoves)));
  const moveBonus = (moveEfficiency / perfectMoves) * MOVE_EFFICIENCY_BONUS;

  const raw = baseScore - timePenalty - hintPenalty + moveBonus;
  return Math.max(Math.round(raw), 1);
}

export function calculateXP({
  difficulty,
  completionTimeMs,
  hintsUsed,
  score,
}: {
  difficulty: Difficulty;
  completionTimeMs: number;
  hintsUsed: number;
  score: number;
}): number {
  const { xpMultiplier } = DIFFICULTY_CONFIG[difficulty];
  const base = Math.floor(score / 100);
  const speedBonus = completionTimeMs < 60_000 ? 50 : 0;
  const noHintBonus = hintsUsed === 0 ? 25 : 0;
  return Math.round((base + speedBonus + noHintBonus) * xpMultiplier);
}

export function formatTime(rawMs: number): string {
  const ms = Math.max(0, rawMs);
  if (ms < 1000) return `${ms}ms`;
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);

  if (minutes > 0) {
    return `${minutes}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
  }
  return `${seconds}.${String(centiseconds).padStart(2, "0")}s`;
}

export function getRankBadge(rank: number): string {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  if (rank <= 10) return "🏆";
  if (rank <= 100) return "⭐";
  return "🎖️";
}
