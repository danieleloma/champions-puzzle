import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceClient } from "@/lib/supabase";
import { validateScore } from "@/lib/anti-cheat";
import { calculateScore, calculateXP } from "@/lib/score-calculator";

// Coarse upper bound (largest current difficulty is medium: 5x5 = 25 tiles,
// valid indices 0-24) — the authoritative, per-difficulty bound check
// happens in lib/puzzle-engine.ts replayMoveLog, which knows the real grid
// size; this just rejects obvious garbage before it gets there.
const MAX_BOARD_INDEX = 24;

const moveLogEntrySchema = z.union([
  z.object({ type: z.literal("move"), fromId: z.string(), toIndex: z.number().int().min(0).max(MAX_BOARD_INDEX) }),
  z.object({ type: z.literal("hint"), tileId: z.string() }),
]);

const scoreSchema = z.object({
  puzzle_id: z.string().uuid(),
  difficulty: z.enum(["beginner", "easy", "medium"]),
  completion_time_ms: z.number().positive(),
  device_id: z.string().uuid(),
  session_token: z.string(),
  // Ordered record of every move/hint made — replayed server-side against
  // the session's server-issued shuffle so completion can't be forged
  // without actually solving the puzzle. See lib/anti-cheat.ts validateScore.
  move_log: z.array(moveLogEntrySchema).max(2000),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = scoreSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const data = parsed.data;

  const validation = validateScore(data);
  if (!validation.valid || validation.move_count === undefined || validation.hints_used === undefined) {
    return NextResponse.json({ error: validation.reason }, { status: 422 });
  }
  // Authoritative move/hint counts come from server-side replay, never the
  // client's own claim — see validateScore.
  const { move_count, hints_used } = validation;

  const score = calculateScore({
    difficulty: data.difficulty,
    completionTimeMs: data.completion_time_ms,
    moveCount: move_count,
    hintsUsed: hints_used,
  });

  const supabase = getServiceClient();

  try {
    // user_id is derived server-side from device_id — never trust a client-
    // supplied user_id, or any device could submit scores/XP as anyone else.
    const { data: owner, error: ownerError } = await supabase
      .from("users")
      .select("id")
      .eq("device_id", data.device_id)
      .single();

    if (ownerError || !owner) {
      return NextResponse.json({ error: "Unknown device" }, { status: 404 });
    }
    const user_id = owner.id;

    // The attempt insert and the existing-entry lookup both only depend on
    // user_id, so they run concurrently — but the insert's result (replay
    // detection) still gates everything below it.
    const [{ error: attemptError }, { data: existingEntry }] = await Promise.all([
      // session_token carries a unique constraint (partial, non-null) — a
      // second submission for the same session hits it and fails here
      // rather than silently re-awarding XP/leaderboard credit for a
      // replayed request. See supabase/migrations/006_security_hardening.sql.
      supabase.from("puzzle_attempts").insert({
        user_id,
        puzzle_id: data.puzzle_id,
        difficulty: data.difficulty,
        completion_time_ms: data.completion_time_ms,
        move_count,
        hints_used,
        completed: true,
        score,
        session_token: data.session_token,
      }),
      supabase
        .from("leaderboard_entries")
        .select("id, best_time_ms")
        .eq("user_id", user_id)
        .eq("puzzle_id", data.puzzle_id)
        .eq("difficulty", data.difficulty)
        .single(),
    ]);

    if (attemptError) {
      if (attemptError.code === "23505") {
        return NextResponse.json({ error: "This session has already been submitted" }, { status: 409 });
      }
      return NextResponse.json({ error: "Failed to save attempt" }, { status: 500 });
    }

    // XP is only earned on a puzzle+difficulty's first-ever completion for
    // this user — otherwise the same easy puzzle could be replayed
    // indefinitely (by a script or a human) for unbounded XP, since
    // improving your time is a legitimate reason to resubmit but doesn't
    // need to also re-award XP every time. Score/leaderboard credit still
    // updates normally on every genuine improvement.
    const isFirstCompletion = !existingEntry;
    const xp_earned = isFirstCompletion
      ? calculateXP({ difficulty: data.difficulty, completionTimeMs: data.completion_time_ms, hintsUsed: hints_used, score })
      : 0;

    const shouldUpdateLeaderboard = !existingEntry || existingEntry.best_time_ms > data.completion_time_ms;

    // The leaderboard upsert, the XP RPC, and the rank count are mutually
    // independent (upsert depends only on existingEntry, already resolved
    // above) — run them concurrently rather than one after another on the
    // victory-screen's critical path.
    const [upsertResult, xpResult, rankResult] = await Promise.all([
      shouldUpdateLeaderboard
        // onConflict is required: without it, upsert() matches conflicts on
        // the primary key (id) — which is never supplied here, so every call
        // after the first silently violates the unique(user_id, puzzle_id,
        // difficulty) constraint instead of updating the existing row.
        ? supabase.from("leaderboard_entries").upsert(
            {
              user_id,
              puzzle_id: data.puzzle_id,
              difficulty: data.difficulty,
              best_time_ms: data.completion_time_ms,
              score,
            },
            { onConflict: "user_id,puzzle_id,difficulty" }
          )
        : Promise.resolve({ error: null }),
      xp_earned > 0
        ? supabase.rpc("increment_xp", { user_id, amount: xp_earned })
        : Promise.resolve({ error: null }),
      supabase
        .from("leaderboard_entries")
        .select("id", { count: "exact", head: true })
        .eq("puzzle_id", data.puzzle_id)
        .eq("difficulty", data.difficulty)
        .lt("best_time_ms", data.completion_time_ms),
    ]);

    const is_personal_best = shouldUpdateLeaderboard && !upsertResult.error;
    // Only report xp_earned (and let the client persist it) if the RPC
    // actually wrote it — otherwise the client's local XP silently drifts
    // from the DB's with no way to ever reconcile.
    const xp_awarded = xpResult.error ? 0 : xp_earned;
    const new_rank = (rankResult.count ?? 0) + 1;

    return NextResponse.json({
      score,
      xp_earned: xp_awarded,
      new_rank,
      is_personal_best,
    });
  } catch {
    return NextResponse.json({ error: "Failed to save score" }, { status: 500 });
  }
}
