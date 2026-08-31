import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MoveLogEntry } from "./puzzle-engine";

beforeEach(() => {
  vi.resetModules();
  process.env.SCORE_HMAC_SECRET = "test-secret-do-not-use-in-prod";
});

async function loadAntiCheat() {
  return import("./anti-cheat");
}

// A 3x3 (beginner) shuffle that's exactly one legal adjacent swap away from
// solved: tile-0 and tile-1 start swapped, everything else already in place.
const ONE_MOVE_ORDER = [1, 0, 2, 3, 4, 5, 6, 7, 8];
const SOLVING_LOG: MoveLogEntry[] = [{ type: "move", fromId: "tile-0", toIndex: 0 }];

describe("issueSessionToken / verifySessionToken", () => {
  it("round-trips a payload issued and verified with the same secret", async () => {
    const { issueSessionToken, verifySessionToken } = await loadAntiCheat();
    const payload = { puzzle_id: "p1", difficulty: "easy" as const, device_id: "d1", issued_at: Date.now() };
    const { token, initial_order } = issueSessionToken(payload);
    expect(verifySessionToken(token)).toEqual({ ...payload, initial_order });
  });

  it("rolls a fresh permutation of the right length for the difficulty", async () => {
    const { issueSessionToken } = await loadAntiCheat();
    const { initial_order } = issueSessionToken({ puzzle_id: "p1", difficulty: "medium", device_id: "d1", issued_at: Date.now() });
    expect(initial_order).toHaveLength(25);
    expect([...initial_order].sort((a, b) => a - b)).toEqual([...Array(25).keys()]);
  });

  it("rejects a token whose payload was tampered with (signature no longer matches)", async () => {
    const { issueSessionToken, verifySessionToken } = await loadAntiCheat();
    const { token } = issueSessionToken({ puzzle_id: "p1", difficulty: "easy", device_id: "d1", issued_at: Date.now() });
    const [body, sig] = token.split(".");
    const tamperedBody = Buffer.from(JSON.stringify({ puzzle_id: "p1", difficulty: "medium", device_id: "d1", issued_at: Date.now(), initial_order: [] })).toString("base64url");
    expect(verifySessionToken(`${tamperedBody}.${sig}`)).toBeNull();
  });

  it("rejects a token signed with a different secret", async () => {
    const mod1 = await loadAntiCheat();
    const { token } = mod1.issueSessionToken({ puzzle_id: "p1", difficulty: "easy", device_id: "d1", issued_at: Date.now() });

    vi.resetModules();
    process.env.SCORE_HMAC_SECRET = "a-completely-different-secret";
    const mod2 = await loadAntiCheat();
    expect(mod2.verifySessionToken(token)).toBeNull();
  });

  it("rejects malformed tokens", async () => {
    const { verifySessionToken } = await loadAntiCheat();
    expect(verifySessionToken("not-a-real-token")).toBeNull();
    expect(verifySessionToken("")).toBeNull();
  });

  it("rejects a token older than the session max age", async () => {
    const { issueSessionToken, verifySessionToken } = await loadAntiCheat();
    const sevenHoursAgo = Date.now() - 7 * 60 * 60 * 1000;
    const { token } = issueSessionToken({ puzzle_id: "p1", difficulty: "easy", device_id: "d1", issued_at: sevenHoursAgo });
    expect(verifySessionToken(token)).toBeNull();
  });
});

describe("validateScore", () => {
  async function buildSubmission(overrides: Partial<{
    puzzle_id: string;
    difficulty: "beginner" | "easy" | "medium";
    device_id: string;
    issued_at: number;
    completion_time_ms: number;
    move_log: MoveLogEntry[];
    initial_order: number[];
  }> = {}) {
    const { issueSessionToken } = await loadAntiCheat();
    const base = {
      puzzle_id: "p1",
      difficulty: "beginner" as const,
      device_id: "d1",
      issued_at: Date.now() - 5_000,
      initial_order: ONE_MOVE_ORDER,
      ...overrides,
    };
    const { token: session_token } = issueSessionToken({
      puzzle_id: base.puzzle_id,
      difficulty: base.difficulty,
      device_id: base.device_id,
      issued_at: base.issued_at,
      initial_order: base.initial_order,
    });
    return {
      puzzle_id: base.puzzle_id,
      difficulty: base.difficulty,
      device_id: base.device_id,
      completion_time_ms: overrides.completion_time_ms ?? 5_000,
      move_log: overrides.move_log ?? SOLVING_LOG,
      session_token,
    };
  }

  it("accepts a plausible, honestly-timed submission that actually reaches a solved state", async () => {
    const { validateScore } = await loadAntiCheat();
    const submission = await buildSubmission({ completion_time_ms: 4_500, issued_at: Date.now() - 5_000 });
    expect(validateScore(submission)).toEqual({ valid: true, move_count: 1, hints_used: 0 });
  });

  it("rejects a session token that was never issued (forged by a client without the secret)", async () => {
    const { validateScore } = await loadAntiCheat();
    const submission = await buildSubmission();
    expect(validateScore({ ...submission, session_token: "forged.token" }).valid).toBe(false);
  });

  it("rejects when the submitted puzzle_id doesn't match the one the session was issued for", async () => {
    const { validateScore } = await loadAntiCheat();
    const submission = await buildSubmission({ puzzle_id: "p1" });
    expect(validateScore({ ...submission, puzzle_id: "different-puzzle" }).valid).toBe(false);
  });

  it("rejects a completion time faster than the per-difficulty floor", async () => {
    const { validateScore } = await loadAntiCheat();
    const submission = await buildSubmission({ completion_time_ms: 500, issued_at: Date.now() });
    expect(validateScore(submission).valid).toBe(false);
  });

  it("rejects a completion time longer than the server-measured elapsed time since session start", async () => {
    const { validateScore } = await loadAntiCheat();
    // Session started 3s ago, but the client claims a 60s completion — the
    // server elapsed time can't support that, so this must be rejected.
    const submission = await buildSubmission({ issued_at: Date.now() - 3_000, completion_time_ms: 60_000 });
    expect(validateScore(submission).valid).toBe(false);
  });

  it("rejects a move log claiming victory with zero moves against a shuffled board (curl-only forgery)", async () => {
    const { validateScore } = await loadAntiCheat();
    // Exactly the attack this replaces: no puzzle ever touched, just an
    // empty/fabricated log claiming completion.
    const submission = await buildSubmission({ move_log: [] });
    const result = validateScore(submission);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/solved state/i);
  });

  it("rejects a move log claiming the already-solved tile ids as the final state without earning it", async () => {
    const { validateScore } = await loadAntiCheat();
    // Attacker guesses the (always-identical) solved id ordering and submits
    // it directly as a single self-serving "move" that isn't a legal
    // adjacent swap from the real server-issued shuffle.
    const submission = await buildSubmission({
      move_log: [{ type: "move", fromId: "tile-0", toIndex: 5 }],
    });
    expect(validateScore(submission).valid).toBe(false);
  });

  it("rejects a move log with a non-adjacent (teleporting) move", async () => {
    const { validateScore } = await loadAntiCheat();
    const submission = await buildSubmission({
      // tile-0 starts at position 1; position 8 is nowhere near it on a 3x3.
      move_log: [{ type: "move", fromId: "tile-0", toIndex: 8 }],
    });
    expect(validateScore(submission).valid).toBe(false);
  });

  it("rejects a move log that uses more hints than the difficulty allows", async () => {
    const { validateScore } = await loadAntiCheat();
    // beginner hintLimit is 5 — fabricate 6 hint entries for tiles that
    // aren't even placeable that way to exceed it.
    const bogusHints: MoveLogEntry[] = Array.from({ length: 6 }, (_, i) => ({ type: "hint" as const, tileId: `tile-${i}` }));
    const submission = await buildSubmission({ move_log: bogusHints, completion_time_ms: 4_000 });
    expect(validateScore(submission).valid).toBe(false);
  });

  it("derives move_count/hints_used from the verified log, not any client-claimed number", async () => {
    const { validateScore } = await loadAntiCheat();
    const submission = await buildSubmission({ completion_time_ms: 4_500 });
    const result = validateScore(submission);
    expect(result).toMatchObject({ valid: true, move_count: 1, hints_used: 0 });
  });
});
