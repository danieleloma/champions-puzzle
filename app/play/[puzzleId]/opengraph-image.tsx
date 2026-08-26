import { ImageResponse } from "next/og";
import { getServiceClient } from "@/lib/supabase";

// Per-puzzle link-preview image — overrides the site-wide default from
// app/opengraph-image.tsx for every /play/[puzzleId] route. Shows the
// puzzle's own photo (the "completed puzzle" the player just solved)
// instead of the generic branding card, so a shared/challenge link is
// recognizable at a glance in a chat preview.

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// Cache a live-generated image (e.g. a puzzle added after the last build)
// so a crawler re-fetching the same puzzle doesn't repeat the ~3s
// Supabase-query + image-fetch + Satori-render cost on every hit.
export const revalidate = 3600;

// This file doesn't automatically inherit the page's own generateStaticParams
// — without its own copy, EVERY request (including every crawler hit) pays
// the full ~3s generation cost live, since there's nothing to statically
// serve. That's almost certainly why link-preview bots (which time out much
// faster than that) were never actually getting the image: `next build`
// now pre-renders one of these per known puzzle, same as the page itself.
export async function generateStaticParams() {
  try {
    const supabase = getServiceClient();
    const { data } = await supabase.from("puzzles").select("id").eq("active", true);
    return (data ?? []).map((p) => ({ puzzleId: p.id }));
  } catch {
    return [];
  }
}

export default async function OpengraphImage({ params }: { params: Promise<{ puzzleId: string }> }) {
  const { puzzleId } = await params;

  let imageUrl: string | null = null;
  let title = "Champions Puzzle";
  try {
    const supabase = getServiceClient();
    // thumbnail_url over the full-resolution image_url: smaller source
    // means a faster fetch + faster Satori decode/composite, and a smaller
    // final PNG — all three directly cut into the crawler-timeout risk.
    const { data } = await supabase
      .from("puzzles")
      .select("thumbnail_url, image_url, title")
      .eq("id", puzzleId)
      .single();
    if (data) {
      imageUrl = data.thumbnail_url || data.image_url;
      title = data.title;
    }
  } catch {
    // Fall through to the branding-only card below.
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const absoluteImageUrl = imageUrl
    ? (imageUrl.startsWith("http") ? imageUrl : `${appUrl}${imageUrl}`)
    : null;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", position: "relative", display: "flex", background: "#0f0f10" }}>
        {absoluteImageUrl && (
          <img
            src={absoluteImageUrl}
            alt=""
            width={1200}
            height={630}
            // Satori (next/og's renderer) doesn't support the `inset`
            // shorthand — it silently no-ops, leaving the element unsized
            // instead of stretched to fill. Explicit edges are required.
            style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, objectFit: "cover", width: "100%", height: "100%" }}
          />
        )}
        <div
          style={{
            position:      "absolute",
            top:           0,
            right:         0,
            bottom:        0,
            left:          0,
            display:       "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding:       60,
            background:    "linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.35) 100%)",
          }}
        >
          <div style={{ display: "flex", fontSize: 28, fontWeight: 700, color: "#fcff3f", letterSpacing: -0.5 }}>
            CHAMPIONS PUZZLE
          </div>
          <div style={{ display: "flex", fontSize: 56, fontWeight: 700, color: "#ffffff", marginTop: 8, letterSpacing: -1 }}>
            {title}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
