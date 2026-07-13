import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceClient } from "@/lib/supabase";
import { generateAvatarColor } from "@/lib/device-identity";

const createUserSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/),
  device_id: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = createUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { username, device_id } = parsed.data;

  try {
    const supabase = getServiceClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    const { data: existing } = await db
      .from("users")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    const { data: deviceUser } = await db
      .from("users")
      .select("*")
      .eq("device_id", device_id)
      .maybeSingle();

    if (deviceUser) {
      return NextResponse.json(deviceUser);
    }

    const { data: newUser, error } = await db
      .from("users")
      .insert({
        device_id,
        username,
        xp: 0,
        avatar_color: generateAvatarColor(username),
      })
      .select()
      .single();

    if (error) {
      console.error("[POST /api/users] Supabase insert error:", { code: error.code, message: error.message, details: error.details, hint: error.hint });
      if (error.code === "23505") {
        const isUsernameDupe = error.message?.includes("username");
        return NextResponse.json(
          { error: isUsernameDupe ? "Username already taken" : "Device already registered" },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }

    return NextResponse.json(newUser, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/users] Unexpected error:", msg);
    if (msg.includes("fetch failed") || msg.includes("ENOTFOUND") || msg.includes("ECONNREFUSED")) {
      return NextResponse.json({ error: "Database unreachable. Please try again later." }, { status: 503 });
    }
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
