import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

// Shape returned by the joined .select() below — postgrest-js can't infer
// join result types from a plain Database interface without full generated
// relationship metadata, so this is asserted once here instead of casting
// each field to `any` at every use site.
interface LeaderboardRow {
  id: string;
  best_time_ms: number;
  score: number;
  difficulty: string;
  updated_at: string;
  users: { id: string; username: string; avatar_color: string } | null;
  puzzles: { id: string; title: string } | null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "global";
  const puzzle_id = searchParams.get("puzzle_id");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);

  try {
    const supabase = getServiceClient();

    let query = supabase
      .from("leaderboard_entries")
      .select(
        `
        id,
        best_time_ms,
        score,
        difficulty,
        updated_at,
        users ( id, username, avatar_color ),
        puzzles ( id, title )
      `
      )
      .order("best_time_ms", { ascending: true })
      .limit(limit);

    if (puzzle_id) {
      query = query.eq("puzzle_id", puzzle_id);
    }

    if (type === "daily") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      query = query.gte("updated_at", start.toISOString());
    } else if (type === "weekly") {
      const start = new Date();
      start.setDate(start.getDate() - start.getDay());
      start.setHours(0, 0, 0, 0);
      query = query.gte("updated_at", start.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
    }

    const entries = ((data ?? []) as unknown as LeaderboardRow[]).map((row, i) => ({
      id: row.id,
      rank: i + 1,
      user_id: row.users?.id,
      username: row.users?.username ?? "Unknown",
      avatar_color: row.users?.avatar_color ?? "#EF0107",
      puzzle_id: puzzle_id ?? "",
      puzzle_title: row.puzzles?.title ?? "",
      difficulty: row.difficulty,
      best_time_ms: row.best_time_ms,
      score: row.score,
      completed_at: row.updated_at,
    }));

    return NextResponse.json({ entries, total: entries.length });
  } catch {
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
