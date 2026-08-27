import { NextRequest } from "next/server";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { createElement as h } from "react";
import { BOLDONSE_TTF_BASE64, STOPWATCH_ICON_PNG_BASE64 } from "./assets";

// Personalized "Challenge a Friend" share image — Figma node 191:1349
// ("Can you beat my time?" card, not the on-screen "Puzzle Complete" one).
// Attached as a native share-sheet file (see VictoryScreen's handleShare).
//
// This has failed four different ways before landing here, each confirmed
// against an actual deployed/running route rather than assumed:
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
//     time) into public/fonts/Boldonse-Regular.ttf.
//  4. Fetching that .ttf (and the icon) from this deployment's own origin
//     at request time worked locally but 500'd on an actual Vercel preview
//     deployment: preview URLs sit behind Vercel's SSO deployment
//     protection, and this route's own outbound self-fetch doesn't carry
//     the incoming request's auth — it got back an HTML SSO interstitial
//     instead of the font, which Satori failed to parse identically
//     ("Unsupported OpenType signature <!DO"). Production sits on an
//     exempted custom domain, so that exact failure likely wouldn't
//     reproduce there, but a request-time dependency on this deployment's
//     own reachability is exactly the kind of environment-specific
//     fragility this route has hit repeatedly. Fixed by inlining both
//     assets as base64 constants (./assets.ts, generated once) instead of
//     fetching either at request time — nothing left to be unreachable.
//
// Satori only emits PNG; re-encoding through sharp as JPEG keeps the
// attached file small the way the rest of this app's share images do.

const W = 816;
const H = 1180;
const ICON_SIZE = 280;
const PAD = 48;

const FONT_DATA = Buffer.from(BOLDONSE_TTF_BASE64, "base64");
const ICON_DATA_URL = `data:image/png;base64,${STOPWATCH_ICON_PNG_BASE64}`;

export async function GET(request: NextRequest) {
  const params     = request.nextUrl.searchParams;
  const time       = params.get("time") ?? "0:00";
  const score      = params.get("score") ?? "0";
  const moves      = params.get("moves") ?? "0";
  const difficulty = params.get("difficulty") ?? "";
  const xp         = params.get("xp") ?? "0";
  const rankParam  = params.get("rank");
  const rank       = rankParam ? `#${rankParam} Globally` : null;

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
    h("img", { src: ICON_DATA_URL, width: ICON_SIZE, height: ICON_SIZE }),
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
    fonts:  [{ name: "Boldonse", data: FONT_DATA, style: "normal", weight: 400 }],
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
