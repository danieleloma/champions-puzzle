import { createHmac, timingSafeEqual } from "crypto";
import type { Difficulty } from "@/types/puzzle";
import { DIFFICULTY_CONFIG } from "@/types/puzzle";
import type { MoveLogEntry } from "@/lib/puzzle-engine";
import { createTilesFromOrder, generateShuffleOrder, replayMoveLog } from "@/lib/puzzle-engine";

const MIN_TIME_PER_MOVE_MS = 100;
const SESSION_MAX_AGE_MS = 6 * 60 * 60 * 1000; // 6h — generous for a paused/backgrounded tab
const SERVER_TIME_TOLERANCE_MS = 5_000; // client clock/timer jitter allowance

const MINIMUM_TIMES_MS: Record<Difficulty, number> = {
  beginner: 3_000,
  easy: 6_000,
  medium: 12_000,
};

// ─── Session tokens ──────────────────────────────────────────────────────────
//
// Issued by POST /api/puzzle-sessions when a player actually starts a puzzle.
// It's a stateless HMAC-signed record of {puzzle_id, difficulty, device_id,
// issued_at} — the client carries it opaquely and can't forge or alter it
// without the server-only SCORE_HMAC_SECRET, unlike the old scheme where the
// "checksum" was computed by a function shipped in the client bundle itself.
//
// completion_time_ms is cross-checked against server-measured elapsed time
// (Date.now() - issued_at) rather than trusted outright, so a forged/fast
// client-reported time no longer passes validation on its own.

export interface SessionTokenPayload {
  puzzle_id:      string;
  difficulty:     Difficulty;
  device_id:      string;
  issued_at:      number;
  /** The server-rolled starting shuffle — index i is tile `tile-i`'s starting
   *  currentIndex. Embedded (not just referenced) so verification never
   *  depends on separate server-side session storage, and so a submitted
   *  move log can be replayed against the exact shuffle this token was
   *  issued for. */
  initial_order:  number[];
}

function getSecret(): string {
  const secret = process.env.SCORE_HMAC_SECRET;
  if (!secret) throw new Error("SCORE_HMAC_SECRET is not configured");
  return secret;
}

function sign(data: string): string {
  return createHmac("sha256", getSecret()).update(data).digest("base64url");
}

// Rolls a fresh, server-authoritative shuffle for the given difficulty and
// signs it into a session token — called by POST /api/puzzle-sessions.
export function issueSessionToken(
  payload: Omit<SessionTokenPayload, "initial_order"> & { initial_order?: number[] }
): { token: string; initial_order: number[] } {
  const tileCount = DIFFICULTY_CONFIG[payload.difficulty].tileCount;
  const initial_order = payload.initial_order ?? generateShuffleOrder(tileCount);
  const full: SessionTokenPayload = { ...payload, initial_order };
  const body = Buffer.from(JSON.stringify(full)).toString("base64url");
  return { token: `${body}.${sign(body)}`, initial_order };
}

export function verifySessionToken(token: string): SessionTokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, signature] = parts;

  const expected = sign(body);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (
      typeof payload.puzzle_id !== "string" ||
      typeof payload.difficulty !== "string" ||
      typeof payload.device_id !== "string" ||
      typeof payload.issued_at !== "number" ||
      !Array.isArray(payload.initial_order) ||
      !payload.initial_order.every((n: unknown) => typeof n === "number")
    ) {
      return null;
    }
    if (Date.now() - payload.issued_at > SESSION_MAX_AGE_MS) return null;
    return payload as SessionTokenPayload;
  } catch {
    return null;
  }
}

// ─── Score validation ────────────────────────────────────────────────────────

export interface ScoreSubmission {
  puzzle_id:           string;
  difficulty:          Difficulty;
  completion_time_ms:  number;
  device_id:           string;
  session_token:       string;
  /** Ordered record of every user-driven move/hint — replayed server-side
   *  against the session's server-issued shuffle to confirm the puzzle was
   *  actually, legally solved. See lib/puzzle-engine.ts replayMoveLog. */
  move_log:            MoveLogEntry[];
}

export function validateScore(submission: ScoreSubmission): {
  valid: boolean;
  reason?: string;
  /** Authoritative counts derived from replaying move_log — use these for
   *  scoring, never the client's own claimed numbers. */
  move_count?: number;
  hints_used?: number;
} {
  const { puzzle_id, difficulty, completion_time_ms, device_id, session_token, move_log } =
    submission;

  const session = verifySessionToken(session_token);
  if (!session) {
    return { valid: false, reason: "Invalid or expired session token" };
  }
  if (
    session.puzzle_id !== puzzle_id ||
    session.difficulty !== difficulty ||
    session.device_id !== device_id
  ) {
    return { valid: false, reason: "Session token does not match submitted payload" };
  }

  const minTime = MINIMUM_TIMES_MS[difficulty];
  if (completion_time_ms < minTime) {
    return {
      valid: false,
      reason: `Impossibly fast completion: ${completion_time_ms}ms (min: ${minTime}ms)`,
    };
  }

  const serverElapsedMs = Date.now() - session.issued_at;
  if (completion_time_ms > serverElapsedMs + SERVER_TIME_TOLERANCE_MS) {
    return {
      valid: false,
      reason: "Reported completion time exceeds time since session started",
    };
  }

  const { grid, hintLimit } = DIFFICULTY_CONFIG[difficulty];
  const initialTiles = createTilesFromOrder(difficulty, session.initial_order);
  const replay = replayMoveLog(initialTiles, Array.isArray(move_log) ? move_log : [], grid);

  if (!replay.valid) {
    return { valid: false, reason: replay.reason ?? "Move log failed replay verification" };
  }
  if (replay.hintCount > hintLimit) {
    return { valid: false, reason: "Move log uses more hints than the difficulty allows" };
  }

  const minTimeByMoves = replay.moveCount * MIN_TIME_PER_MOVE_MS;
  if (completion_time_ms < minTimeByMoves) {
    return {
      valid: false,
      reason: "Time inconsistent with move count",
    };
  }

  return { valid: true, move_count: replay.moveCount, hints_used: replay.hintCount };
}
