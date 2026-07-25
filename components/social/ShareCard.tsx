"use client";

// ── Figma node 191:1349 "Share-page-shot" — 660×980 px ───────────────────────
//
//  Offscreen-only template captured via html2canvas (see hooks/useShareCard.ts)
//  and attached to native shares / downloads as a personalized result image.
//  Never rendered visibly — VictoryScreen mounts it positioned off-canvas.
//
//  Same 7 floating 3D icons as VictoryScreen's mobile layout (identical
//  containerSize/imgSize per icon, confirmed against Figma metadata), just
//  repositioned for this wider 660px frame instead of the 440px mobile one.
//
//  Card — 510×752  bg=#0d0d0d  rounded-20  px=30 py=40  gap=30  items-center:
//  ├── stopwatch icon 200px
//  ├── "Puzzle Complete" (Boldonse 25px) + "#N Globally" (Geist Mono 18.75px) — centred
//  ├── stat rows (gap=15): label Geist Mono 18.75px #a7a9ad / value Geist 20px white
//  ├── divider (1px, 10% white)
//  └── "CHAMPIONS PUZZLE" wordmark (Boldonse 26.667px, centred, 2 lines)
// ─────────────────────────────────────────────────────────────────────────────

import { forwardRef } from "react";
import Image from "next/image";
import { Icon3D } from "@/components/ui";
import type { Icon3DName } from "@/components/ui";

const FRAME_W = 660;
const FRAME_H = 980;

interface FloatIconDef {
  name:          Icon3DName;
  left:          number;
  top:           number;
  containerSize: number;
  imgSize:       number;
  deg:           number;
}

const FLOAT_ICONS: FloatIconDef[] = [
  { name: "flag",             left: -198,   top: 641.76, containerSize: 446.279, imgSize: 333.54,  deg: -26.1  },
  { name: "stadium",          left:  376,   top: 530.30, containerSize: 251.076, imgSize: 239.089, deg:  -2.95 },
  { name: "jersey",           left:  460.58,top: -63,    containerSize: 368.921, imgSize: 271.768, deg:  28.72 },
  { name: "gloves",           left: -141,   top:  76.33, containerSize: 486.869, imgSize: 365.17,  deg: -25.52 },
  { name: "whistle",          left:  341,   top: 330.62, containerSize: 193.647, imgSize: 150.522, deg: -20.46 },
  { name: "medal",            left:   23,   top: 485.62, containerSize: 193.647, imgSize: 150.522, deg: -20.46 },
  { name: "substitute-board", left:  395.68,top: 727,    containerSize: 399.692, imgSize: 288.846, deg:  33.09 },
];

export interface ShareCardStat {
  label: string;
  value: string;
  xp?:   boolean;
}

export interface ShareCardProps {
  rank:  number | null;
  stats: ShareCardStat[];
}

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(function ShareCard(
  { rank, stats },
  ref
) {
  return (
    <div
      ref={ref}
      style={{
        width:    FRAME_W,
        height:   FRAME_H,
        position: "relative",
        overflow: "hidden",
        background: "#87CEEB",
      }}
    >
      {/* Blurred cloud background — same asset as the live VictoryScreen */}
      <div style={{ position: "absolute", inset: 0, filter: "blur(15px)", opacity: 0.6 }}>
        <Image src="/splash/bg-clouds.webp" alt="" fill sizes={`${FRAME_W}px`} style={{ objectFit: "cover" }} />
      </div>

      {/* Floating icons */}
      {FLOAT_ICONS.map((icon) => (
        <div
          key={icon.name}
          style={{
            position: "absolute",
            left:     icon.left,
            top:      icon.top,
            width:    icon.containerSize,
            height:   icon.containerSize,
            display:  "flex",
            alignItems:     "center",
            justifyContent: "center",
          }}
        >
          <div style={{ transform: `rotate(${icon.deg}deg)` }}>
            <Icon3D name={icon.name} size={icon.imgSize} loading="eager" />
          </div>
        </div>
      ))}

      {/* Card */}
      <div
        style={{
          position:        "absolute",
          left:            75,
          top:             114,
          width:           510,
          display:         "flex",
          flexDirection:   "column",
          alignItems:      "center",
          gap:             30,
          padding:         "40px 30px",
          backgroundColor: "#0d0d0d",
          borderRadius:    20,
        }}
      >
        <Icon3D name="stopwatch" size={200} loading="eager" />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
          <p style={{ fontFamily: "var(--font-boldonse), sans-serif", fontSize: 25, lineHeight: "normal", color: "#fff", margin: 0, textAlign: "center" }}>
            Puzzle Complete
          </p>
          {rank !== null && (
            <p style={{ fontFamily: "var(--font-geist-mono), monospace", fontWeight: 500, fontSize: 18.75, lineHeight: "normal", letterSpacing: "-0.9375px", color: "#929498", margin: "6px 0 0", textAlign: "center" }}>
              #{rank} Globally
            </p>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 15, width: "100%" }}>
          {stats.map((s) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "var(--font-geist-mono), monospace", fontWeight: 500, fontSize: 18.75, letterSpacing: "-0.9375px", color: "#a7a9ad" }}>
                {s.label}
              </span>
              <span style={{ fontFamily: "var(--font-geist-sans), sans-serif", fontWeight: 500, fontSize: 20, letterSpacing: "-0.6px", color: s.xp ? "#fcff3f" : "#fff", lineHeight: 1.4 }}>
                {s.value}
              </span>
            </div>
          ))}
        </div>

        <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.1)" }} />

        <p style={{ fontFamily: "var(--font-boldonse), sans-serif", fontSize: 26.667, lineHeight: "40px", letterSpacing: "-1.3333px", color: "#fff", textAlign: "center", margin: 0 }}>
          CHAMPIONS<br />PUZZLE
        </p>
      </div>

      {/* Home indicator — decorative, matches Figma's mobile-shot framing */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 21, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 8 }}>
        <div style={{ width: 134, height: 5, borderRadius: 100, background: "#1d1e25" }} />
      </div>
    </div>
  );
});
