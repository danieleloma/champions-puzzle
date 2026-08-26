import { NextRequest } from "next/server";
import sharp from "sharp";
import { getServiceClient } from "@/lib/supabase";
import { formatTime } from "@/lib/score-calculator";

// Personalized "Challenge a Friend" share image — attached as a native
// share-sheet file (see VictoryScreen's handleShare), not used for link
// previews (that's app/play/[puzzleId]/opengraph-image.tsx, which has no
// per-completion stats). Same sharp/JPEG approach as that route: a photo
// full-bleed PNG composited via Satori would run 1-2MB, well past the
// ~300KB WhatsApp silently drops link-preview images over — this attaches
// the file directly instead of relying on any crawler, but keeping it a
// small JPEG still matters for a fast fetch inside the share click's user-
// activation window.

const W = 1080;
const H = 1350;

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function overlaySvg(opts: {
  title: string;
  time: string;
  score: string;
  moves: string;
  difficulty: string;
  xp: string;
  rank: string | null;
}) {
  const { title, time, score, moves, difficulty, xp, rank } = opts;

  const rows: [string, string, boolean][] = [
    ["Time",       time,       false],
    ["Score",      score,      false],
    ["Moves",      moves,      false],
    ["Difficulty", difficulty, false],
    ["XP Earned",  `+${xp} XP`, true],
  ];

  const rowsStart = H - 300;
  const rowGap = 46;
  const rowsSvg = rows
    .map(([label, value, isXp], i) => {
      const y = rowsStart + i * rowGap;
      return `
        <text x="60" y="${y}" font-family="sans-serif" font-size="26" font-weight="500" fill="#a7a9ad">${esc(label)}</text>
        <text x="${W - 60}" y="${y}" font-family="sans-serif" font-size="27" font-weight="600" fill="${isXp ? "#fcff3f" : "#ffffff"}" text-anchor="end">${esc(value)}</text>
      `;
    })
    .join("");

  return Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="#000000" stop-opacity="0.05" />
          <stop offset="45%"  stop-color="#000000" stop-opacity="0.35" />
          <stop offset="62%"  stop-color="#0d0d0d" stop-opacity="0.92" />
          <stop offset="100%" stop-color="#0d0d0d" stop-opacity="0.98" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="${W}" height="${H}" fill="url(#g)" />

      <text x="60" y="${H - 470}" font-family="sans-serif" font-size="30" font-weight="700" fill="#fcff3f" letter-spacing="-0.5">PUZZLE COMPLETE</text>
      <text x="60" y="${H - 415}" font-family="sans-serif" font-size="46" font-weight="700" fill="#ffffff" letter-spacing="-1">${esc(title)}</text>
      ${rank ? `<text x="60" y="${H - 365}" font-family="sans-serif" font-size="24" font-weight="500" fill="#929498">${esc(rank)}</text>` : ""}

      <rect x="60" y="${H - 335}" width="${W - 120}" height="1" fill="#ffffff" opacity="0.15" />

      ${rowsSvg}

      <text x="60" y="${H - 40}" font-family="sans-serif" font-size="24" font-weight="700" fill="#73767b" letter-spacing="-0.5">CHAMPIONS PUZZLE</text>
    </svg>
  `);
}

async function brandingOnlyCard(opts: Parameters<typeof overlaySvg>[0]): Promise<Buffer> {
  const svg = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${W}" height="${H}" fill="#0f0f10" />
    </svg>
  `);
  return sharp(svg).composite([{ input: overlaySvg(opts) }]).jpeg({ quality: 82 }).toBuffer();
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const puzzleId  = params.get("puzzleId") ?? "";
  const timeMs    = Number(params.get("timeMs") ?? 0);
  const score     = params.get("score") ?? "0";
  const moves     = params.get("moves") ?? "0";
  const difficulty = params.get("difficulty") ?? "";
  const xp        = params.get("xp") ?? "0";
  const rankParam = params.get("rank");

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

  const cardOpts = {
    title,
    time: formatTime(timeMs),
    score,
    moves,
    difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
    xp,
    rank: rankParam ? `#${rankParam} Globally` : null,
  };

  let jpegBuffer: Buffer;
  try {
    if (!imageUrl) throw new Error("no source image");
    const res = await fetch(imageUrl);
    if (!res.ok) throw new Error(`source fetch failed: ${res.status}`);
    const sourceBytes = Buffer.from(await res.arrayBuffer());

    jpegBuffer = await sharp(sourceBytes)
      .resize(W, H, { fit: "cover", position: "centre" })
      .composite([{ input: overlaySvg(cardOpts) }])
      .jpeg({ quality: 80 })
      .toBuffer();
  } catch {
    jpegBuffer = await brandingOnlyCard(cardOpts);
  }

  return new Response(new Uint8Array(jpegBuffer), {
    headers: {
      "Content-Type": "image/jpeg",
      // Per-completion (time/score/moves in the query string), never
      // cached — every share is a fresh render.
      "Cache-Control": "private, no-store",
    },
  });
}
