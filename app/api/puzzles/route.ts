import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const supabase = getServiceClient();
    const clubId = request.nextUrl.searchParams.get("clubId");

    let query = supabase
      .from("puzzles")
      .select("*")
      .eq("active", true);

    if (clubId) {
      query = query.eq("club_id", clubId);
    }

    const { data, error } = await query
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch puzzles" }, { status: 500 });
    }

    return NextResponse.json({ puzzles: data ?? [] });
  } catch {
    return NextResponse.json({ error: "Failed to fetch puzzles" }, { status: 500 });
  }
}
