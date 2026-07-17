import { beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  vi.resetModules();
  process.env.SCORE_HMAC_SECRET = "test-secret-do-not-use-in-prod";
});

async function loadAntiCheat() {
  return import("./anti-cheat");
}

describe("issueSessionToken / verifySessionToken", () => {
  it("round-trips a payload issued and verified with the same secret", async () => {
    const { issueSessionToken, verifySessionToken } = await loadAntiCheat();
    const payload = { puzzle_id: "p1", difficulty: "easy" as const, device_id: "d1", issued_at: Date.now() };
    const token = issueSessionToken(payload);
    expect(verifySessionToken(token)).toEqual(payload);
  });

  it("rejects a token whose payload was tampered with (signature no longer matches)", async () => {
    const { issueSessionToken, verifySessionToken } = await loadAntiCheat();
    const token = issueSessionToken({ puzzle_id: "p1", difficulty: "easy", device_id: "d1", issued_at: Date.now() });
    const [body, sig] = token.split(".");
    const tamperedBody = Buffer.from(JSON.stringify({ puzzle_id: "p1", difficulty: "medium", device_id: "d1", issued_at: Date.now() })).toString("base64url");
    expect(verifySessionToken(`${tamperedBody}.${sig}`)).toBeNull();
  });

  it("rejects a token signed with a different secret", async () => {
    const mod1 = await loadAntiCheat();
    const token = mod1.issueSessionToken({ puzzle_id: "p1", difficulty: "easy", device_id: "d1", issued_at: Date.now() });

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
    const token = issueSessionToken({ puzzle_id: "p1", difficulty: "easy", device_id: "d1", issued_at: sevenHoursAgo });
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
    move_count: number;
    hints_used: number;
  }> = {}) {
    const { issueSessionToken } = await loadAntiCheat();
    const base = {
      puzzle_id: "p1",
      difficulty: "beginner" as const,
      device_id: "d1",
      issued_at: Date.now() - 5_000,
      ...overrides,
    };
    const session_token = issueSessionToken({
      puzzle_id: base.puzzle_id,
      difficulty: base.difficulty,
      device_id: base.device_id,
      issued_at: base.issued_at,
    });
    return {
      puzzle_id: base.puzzle_id,
      difficulty: base.difficulty,
      device_id: base.device_id,
      completion_time_ms: overrides.completion_time_ms ?? 5_000,
      move_count: overrides.move_count ?? 9,
      hints_used: overrides.hints_used ?? 0,
      session_token,
    };
  }

  it("accepts a plausible, honestly-timed submission", async () => {
    const { validateScore } = await loadAntiCheat();
    const submission = await buildSubmission({ completion_time_ms: 4_500, move_count: 9, issued_at: Date.now() - 5_000 });
    expect(validateScore(submission)).toEqual({ valid: true });
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
    const submission = await buildSubmission({ issued_at: Date.now() - 3_000, completion_time_ms: 60_000, move_count: 40 });
    expect(validateScore(submission).valid).toBe(false);
  });

  it("rejects a move count below the difficulty's tile count minus hints used", async () => {
    const { validateScore } = await loadAntiCheat();
    const submission = await buildSubmission({ move_count: 2, hints_used: 0, completion_time_ms: 4_000, issued_at: Date.now() - 5_000 });
    expect(validateScore(submission).valid).toBe(false);
  });
});
