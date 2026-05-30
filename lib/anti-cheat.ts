import type { Difficulty } from "@/types/puzzle";
import { DIFFICULTY_CONFIG } from "@/types/puzzle";

const MIN_TIME_PER_MOVE_MS = 100;

const MINIMUM_TIMES_MS: Record<Difficulty, number> = {
  beginner: 3_000,
  easy: 6_000,
  medium: 12_000,
  hard: 20_000,
  expert: 45_000,
  legendary: 90_000,
};

export interface AntiCheatPayload {
  puzzle_id: string;
  difficulty: Difficulty;
  completion_time_ms: number;
  move_count: number;
  hints_used: number;
  device_id: string;
  session_token: string;
  checksum: string;
}

export function validateScore(payload: AntiCheatPayload): {
  valid: boolean;
  reason?: string;
} {
  const { difficulty, completion_time_ms, move_count, hints_used, checksum } =
    payload;

  const minTime = MINIMUM_TIMES_MS[difficulty];
  if (completion_time_ms < minTime) {
    return {
      valid: false,
      reason: `Impossibly fast completion: ${completion_time_ms}ms (min: ${minTime}ms)`,
    };
  }

  const { tileCount } = DIFFICULTY_CONFIG[difficulty];
  if (move_count < tileCount - hints_used) {
    return {
      valid: false,
      reason: "Move count too low — fewer moves than minimum required",
    };
  }

  const expectedChecksum = generateChecksum(payload);
  if (checksum !== expectedChecksum) {
    return { valid: false, reason: "Checksum mismatch — payload tampered" };
  }

  const minTimeByMoves = move_count * MIN_TIME_PER_MOVE_MS;
  if (completion_time_ms < minTimeByMoves) {
    return {
      valid: false,
      reason: "Time inconsistent with move count",
    };
  }

  return { valid: true };
}

export function generateChecksum(
  payload: Omit<AntiCheatPayload, "checksum">
): string {
  const str = [
    payload.puzzle_id,
    payload.difficulty,
    payload.completion_time_ms,
    payload.move_count,
    payload.hints_used,
    payload.device_id,
    payload.session_token,
  ].join("|");

  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
