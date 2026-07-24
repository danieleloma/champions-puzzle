import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { getServiceClient } from "@/lib/supabase";
import { isAuthorizedAdmin } from "@/lib/admin-auth";

const VALID_CLUB_IDS = ["arsenal", "barcelona", "inter", "bayern", "psg", "spain"] as const;

export async function POST(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let supabase: ReturnType<typeof getServiceClient>;
  try {
    supabase = getServiceClient();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json(
      { error: `Supabase config error: ${msg}` },
      { status: 500 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Failed to parse form data" }, { status: 400 });
  }

  const title = (form.get("title") as string | null)?.trim();
  const description = (form.get("description") as string | null)?.trim() || null;
  const difficulty = (form.get("difficulty") as string) || "medium";
  const clubId = form.get("club_id") as string | null;
  const featured = form.get("featured") === "on";
  const active = form.get("active") === "on";
  const imageFile = form.get("image") as File | null;

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (!clubId || !VALID_CLUB_IDS.includes(clubId as (typeof VALID_CLUB_IDS)[number])) {
    return NextResponse.json({ error: "A valid club is required" }, { status: 400 });
  }
  if (!imageFile || imageFile.size === 0) {
    return NextResponse.json({ error: "Image file is required" }, { status: 400 });
  }

  const filename = `puzzles/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
  const contentType = "image/jpeg";

  const arrayBuffer = await imageFile.arrayBuffer();
  const raw = Buffer.from(arrayBuffer);

  const meta = await sharp(raw).metadata();
  const size = Math.min(meta.width ?? 1000, meta.height ?? 1000);
  const buffer = await sharp(raw)
    .resize(size, size, { fit: "cover", position: "centre" })
    .jpeg({ quality: 90 })
    .toBuffer();

  const { error: uploadError } = await supabase.storage
    .from("puzzle-images")
    .upload(filename, buffer, { contentType, upsert: false });

  if (uploadError) {
    return NextResponse.json(
      { error: `Storage upload failed: ${uploadError.message}` },
      { status: 500 }
    );
  }

  const { data: urlData } = supabase.storage
    .from("puzzle-images")
    .getPublicUrl(filename);

  const { data: puzzle, error: dbError } = await supabase
    .from("puzzles")
    .insert({
      title,
      description,
      image_url: urlData.publicUrl,
      thumbnail_url: urlData.publicUrl,
      difficulty,
      club_id: clubId,
      active,
      featured,
      play_count: 0,
    })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json(
      { error: `Database insert failed: ${dbError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json(puzzle, { status: 201 });
}
