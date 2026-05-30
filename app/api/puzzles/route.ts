import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function GET() {
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("puzzles")
    .select("*")
    .eq("active", true)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch puzzles" }, { status: 500 });
  }

  return NextResponse.json({ puzzles: data ?? [] });
}
