import { NextRequest } from "next/server";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { createElement as h } from "react";

// Personalized "Challenge a Friend" share image — Figma node 191:1349
// ("Can you beat my time?" card, not the on-screen "Puzzle Complete" one).
// Attached as a native share-sheet file (see VictoryScreen's handleShare).
//
// This has failed three different ways before landing here, each confirmed
// against the actual deployed/running route rather than assumed:
//  1. html2canvas (client-side DOM screenshot) raced the browser's own
//     Boldonse/Geist webfonts and the stopwatch icon loading, and shipped
//     tofu-box text with a blank icon in real shares.
//  2. sharp + a hand-built SVG (`font-family: sans-serif`) moved rendering
//     server-side but hit the same tofu-box symptom for a different reason:
//     Vercel's serverless Node runtime ships with *no system fonts at all*,
//     so there's nothing for any font-family to resolve to. Embedding
//     Boldonse as a base64 `@font-face` in the SVG *loaded* fine (verified
//     via a debug overlay printing the fetched byte length) but librsvg
//     silently ignored it and fell back to its own default anyway —
//     invisible locally, where a real "sans-serif" system font exists to
//     fall back to, but would reproduce the exact same bug on Vercel.
//  3. Switching to Satori (next/og's ImageResponse) for its documented,
//     no-system-font-dependency `fonts` option — but passed straight
//     through with the app's own .woff2 file, Satori's parser rejects
//     WOFF2 outright ("Unsupported OpenType signature wOF2"). Fixed by
//     decompressing it once (via the `wawoff2` package, not at request
//     time) into public/fonts/Boldonse-Regular.ttf, which is what this
//     route actually fetches.
// This project's own site-wide app/opengraph-image.tsx already relies on
// Satori's font handling working with zero system-font dependency, so
// using it here isn't a new assumption — just needed a format Satori
// actually accepts.
//
// Satori only emits PNG; re-encoding through sharp as JPEG keeps the
// attached file small the way the rest of this app's share images do.

const W = 816;
const H = 1180;
const ICON_SIZE = 280;
const PAD = 48;

// Cached across warm invocations of the same Lambda instance so these
// self-fetches only happen once per container, not once per share.
// .ttf, not the app's own .woff2 (app/fonts/Boldonse-Regular.woff2, used by
// next/font/local for the real UI) — Satori's font parser rejects WOFF2
// outright ("Unsupported OpenType signature wOF2"), confirmed by hitting
// this route locally before adding the decompressed copy at
// public/fonts/Boldonse-Regular.ttf (see that file's origin: decompressed
// once via the `wawoff2` package, not converted at request time).
let fontDataPromise: Promise<ArrayBuffer | null> | null = null;
function getFontData(origin: string): Promise<ArrayBuffer | null> {
  if (!fontDataPromise) {
    fontDataPromise = fetch(new URL("/fonts/Boldonse-Regular.ttf", origin))
      .then((res) => (res.ok ? res.arrayBuffer() : null))
      .catch(() => null);
  }
  return fontDataPromise;
}

async function getIconDataUrl(origin: string): Promise<string | null> {
  try {
    const res = await fetch(new URL("/icons/3d/stopwatch.webp", origin));
    if (!res.ok) return null;
    const png = await sharp(Buffer.from(await res.arrayBuffer()))
      .resize(ICON_SIZE, ICON_SIZE, { fit: "contain" })
      .png()
      .toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const params     = request.nextUrl.searchParams;
  const time       = params.get("time") ?? "0:00";
  const score      = params.get("score") ?? "0";
  const moves      = params.get("moves") ?? "0";
  const difficulty = params.get("difficulty") ?? "";
  const xp         = params.get("xp") ?? "0";
  const rankParam  = params.get("rank");
  const rank       = rankParam ? `#${rankParam} Globally` : null;

  const origin = request.nextUrl.origin;
  const [fontData, iconDataUrl] = await Promise.all([
    getFontData(origin),
    getIconDataUrl(origin),
  ]);

  const rows: [string, string, boolean][] = [
    ["Time",       time,        false],
    ["Score",      score,       false],
    ["Moves",      moves,       false],
    ["Difficulty", difficulty,  false],
    ["XP Earned",  `+${xp} XP`, true],
  ];

  const tree = h(
    "div",
    { style: { width: W, minHeight: H, display: "flex", flexDirection: "column", alignItems: "center", background: "#0d0d0d", padding: `${PAD}px` } },
    iconDataUrl && h("img", { src: iconDataUrl, width: ICON_SIZE, height: ICON_SIZE }),
    h(
      "div",
      { style: { display: "flex", flexDirection: "column", width: "100%", marginTop: 48 } },
      h("div", { style: { display: "flex", fontSize: 38, color: "#ffffff", fontFamily: "Boldonse", letterSpacing: -1 } }, "Can you beat my time?"),
      rank && h("div", { style: { display: "flex", fontSize: 24, color: "#929498", marginTop: 8 } }, rank),
    ),
    h(
      "div",
      { style: { display: "flex", flexDirection: "column", width: "100%", marginTop: 48, gap: 24 } },
      ...rows.map(([label, value, isXp]) =>
        h(
          "div",
          { key: label, style: { display: "flex", justifyContent: "space-between", width: "100%" } },
          h("div", { style: { display: "flex", fontSize: 26, color: "#a7a9ad" } }, label),
          h("div", { style: { display: "flex", fontSize: 28, fontWeight: 600, color: isXp ? "#fcff3f" : "#ffffff" } }, value),
        ),
      ),
    ),
    h("div", { style: { display: "flex", width: "100%", height: 2, background: "#1D1E25", marginTop: 48 } }),
    h(
      "div",
      { style: { display: "flex", flexDirection: "column", alignItems: "center", width: "100%", marginTop: 48 } },
      h("div", { style: { display: "flex", fontSize: 32, color: "#ffffff", fontFamily: "Boldonse", letterSpacing: -1 } }, "CHAMPIONS"),
      h("div", { style: { display: "flex", fontSize: 32, color: "#ffffff", fontFamily: "Boldonse", letterSpacing: -1 } }, "PUZZLE"),
    ),
  );

  const pngResponse = new ImageResponse(tree, {
    width:  W,
    height: H,
    fonts:  fontData ? [{ name: "Boldonse", data: fontData, style: "normal", weight: 400 }] : [],
  });

  const pngBuffer  = Buffer.from(await pngResponse.arrayBuffer());
  const jpegBuffer = await sharp(pngBuffer).jpeg({ quality: 85 }).toBuffer();

  return new Response(new Uint8Array(jpegBuffer), {
    headers: {
      "Content-Type": "image/jpeg",
      // Per-completion (time/score/moves in the query string), never
      // cached — every share is a fresh render.
      "Cache-Control": "private, no-store",
    },
  });
}
