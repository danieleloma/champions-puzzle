import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceClient } from "@/lib/supabase";
import { validateScore } from "@/lib/anti-cheat";
import { calculateScore, calculateXP } from "@/lib/score-calculator";

const scoreSchema = z.object({
  user_id: z.string().uuid(),
  puzzle_id: z.string().uuid(),
  difficulty: z.enum(["beginner", "easy", "medium", "hard", "expert", "legendary"]),
  completion_time_ms: z.number().positive(),
  move_count: z.number().int().positive(),
  hints_used: z.number().int().min(0),
  device_id: z.string(),
  session_token: z.string(),
  checksum: z.string(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = scoreSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const data = parsed.data;

  const validation = validateScore(data);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.reason }, { status: 422 });
  }

  const score = calculateScore({
    difficulty: data.difficulty,
    completionTimeMs: data.completion_time_ms,
    moveCount: data.move_count,
    hintsUsed: data.hints_used,
  });

  const xp_earned = calculateXP({
    difficulty: data.difficulty,
    completionTimeMs: data.completion_time_ms,
    hintsUsed: data.hints_used,
    score,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getServiceClient() as any;

  const { error: attemptError } = await supabase.from("puzzle_attempts").insert({
    user_id: data.user_id,
    puzzle_id: data.puzzle_id,
    difficulty: data.difficulty,
    completion_time_ms: data.completion_time_ms,
    move_count: data.move_count,
    hints_used: data.hints_used,
    completed: true,
    score,
  });

  if (attemptError) {
    return NextResponse.json({ error: "Failed to save attempt" }, { status: 500 });
  }

  const { data: existingEntry } = await supabase
    .from("leaderboard_entries")
    .select("id, best_time_ms")
    .eq("user_id", data.user_id)
    .eq("puzzle_id", data.puzzle_id)
    .eq("difficulty", data.difficulty)
    .single();

  let is_personal_best = false;

  if (!existingEntry || existingEntry.best_time_ms > data.completion_time_ms) {
    is_personal_best = true;
    await supabase.from("leaderboard_entries").upsert({
      user_id: data.user_id,
      puzzle_id: data.puzzle_id,
      difficulty: data.difficulty,
      best_time_ms: data.completion_time_ms,
      score,
    });
  }

  await supabase.rpc("increment_xp", { user_id: data.user_id, amount: xp_earned });

  const { count } = await supabase
    .from("leaderboard_entries")
    .select("id", { count: "exact", head: true })
    .eq("puzzle_id", data.puzzle_id)
    .eq("difficulty", data.difficulty)
    .lt("best_time_ms", data.completion_time_ms);

  const new_rank = (count ?? 0) + 1;

  return NextResponse.json({ score, xp_earned, new_rank, is_personal_best });
}
