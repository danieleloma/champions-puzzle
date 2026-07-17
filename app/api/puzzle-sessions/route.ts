import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { issueSessionToken } from "@/lib/anti-cheat";

const requestSchema = z.object({
  puzzle_id:  z.string().uuid(),
  difficulty: z.enum(["beginner", "easy", "medium"]),
  device_id:  z.string().uuid(),
});

// Called when a player actually starts a puzzle. Returns an opaque,
// server-signed token anchoring the real start time — POST /api/scores
// requires this token and measures elapsed time against it server-side,
// so a client can no longer just report an arbitrary fast completion time.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { puzzle_id, difficulty, device_id } = parsed.data;
  const session_token = issueSessionToken({
    puzzle_id,
    difficulty,
    device_id,
    issued_at: Date.now(),
  });

  return NextResponse.json({ session_token });
}
