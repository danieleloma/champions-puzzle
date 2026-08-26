import sharp from "sharp";
import { getServiceClient } from "@/lib/supabase";

// Per-puzzle link-preview image — overrides the site-wide default from
// app/opengraph-image.tsx for every /play/[puzzleId] route. Shows the
// puzzle's own photo (the "completed puzzle" the player just solved)
// instead of the generic branding card, so a shared/challenge link is
// recognizable at a glance in a chat preview.
//
// Built with `sharp` instead of next/og's ImageResponse (Satori) on purpose:
// Satori only emits PNG, and a full-bleed 1200x630 photo losslessly encoded
// as PNG comes out to 1.2-2MB. That's well within Facebook's documented 8MB
// og:image cap and loads fine via curl/UA-spoofed fetch — which is exactly
// why this was so hard to diagnose — but WhatsApp's link-preview crawler
// silently drops images over roughly 300KB with no error surfaced anywhere.
// Encoding as JPEG at quality 78 gets a photographic 1200x630 frame to
// ~80-150KB, comfortably under that budget.

export const size = { width: 1200, height: 630 };
export const contentType = "image/jpeg";
// Cache a live-generated image (e.g. a puzzle added after the last build)
// so a crawler re-fetching the same puzzle doesn't repeat the source-fetch
// + sharp-composite cost on every hit.
export const revalidate = 3600;

// This file doesn't automatically inherit the page's own generateStaticParams
// — without its own copy, EVERY request (including every crawler hit) pays
// the full generation cost live, since there's nothing to statically serve.
export async function generateStaticParams() {
  try {
    const supabase = getServiceClient();
    const { data } = await supabase.from("puzzles").select("id").eq("active", true);
    return (data ?? []).map((p) => ({ puzzleId: p.id }));
  } catch {
    return [];
  }
}

const { width: W, height: H } = size;

// Bottom gradient + title, rendered as an SVG overlay and composited with
// sharp — same visual result as the old Satori JSX, minus Satori.
function overlaySvg(title: string) {
  const escaped = title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="#000000" stop-opacity="0.15" />
          <stop offset="50%"  stop-color="#000000" stop-opacity="0.15" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0.85" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="${W}" height="${H}" fill="url(#g)" />
      <text x="60" y="${H - 108}" font-family="sans-serif" font-size="28" font-weight="700" fill="#fcff3f" letter-spacing="-0.5">CHAMPIONS PUZZLE</text>
      <text x="60" y="${H - 60}" font-family="sans-serif" font-size="56" font-weight="700" fill="#ffffff" letter-spacing="-1">${escaped}</text>
    </svg>
  `);
}

async function brandingOnlyCard(title: string): Promise<Buffer> {
  const svg = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${W}" height="${H}" fill="#0f0f10" />
      <text x="60" y="${H - 108}" font-family="sans-serif" font-size="28" font-weight="700" fill="#fcff3f" letter-spacing="-0.5">CHAMPIONS PUZZLE</text>
      <text x="60" y="${H - 60}" font-family="sans-serif" font-size="56" font-weight="700" fill="#ffffff" letter-spacing="-1">${title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</text>
    </svg>
  `);
  return sharp(svg).jpeg({ quality: 82 }).toBuffer();
}

export default async function OpengraphImage({ params }: { params: Promise<{ puzzleId: string }> }) {
  const { puzzleId } = await params;

  let imageUrl: string | null = null;
  let title = "Champions Puzzle";
  try {
    const supabase = getServiceClient();
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

  let jpegBuffer: Buffer;
  try {
    if (!absoluteImageUrl) throw new Error("no source image");
    const res = await fetch(absoluteImageUrl);
    if (!res.ok) throw new Error(`source fetch failed: ${res.status}`);
    const sourceBytes = Buffer.from(await res.arrayBuffer());

    jpegBuffer = await sharp(sourceBytes)
      .resize(W, H, { fit: "cover", position: "centre" })
      .composite([{ input: overlaySvg(title) }])
      .jpeg({ quality: 78 })
      .toBuffer();
  } catch {
    jpegBuffer = await brandingOnlyCard(title);
  }

  return new Response(new Uint8Array(jpegBuffer), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, immutable, no-transform, max-age=3600",
    },
  });
}
