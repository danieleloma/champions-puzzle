"use client";

// ── Figma node 29:3387 desktop / 21:900 mobile ────────────────────────────────
//
//  Mobile frame: 440 × 926 (iPhone 13 Mini)
//  Medal decoration: left:105 bottom:-192.3 container:597px img:480px rot:16.63°
//  Content: centred (left:50% -translate-x-1/2) top:24 width:408 gap:24
//    ├── Header row: back (32×32) + flex-1 title centre + w-52 placeholder
//    ├── MenuSwitcher
//    └── LeaderboardTable (gap:8 between cards)
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MenuSwitcher } from "@/components/ui/MenuSwitcher";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { Icon3D } from "@/components/ui";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useLeaderboardStore } from "@/store/leaderboard-store";
import type { LeaderboardType } from "@/types/leaderboard";

const FRAME_W = 1440;
const FRAME_H = 1024;

// Shared desktop content-column width — matches champions/club/play so
// switching between screens doesn't visibly shift or resize the content.
const CONTENT_W = 648;

const TABS: { value: LeaderboardType; label: string }[] = [
  { value: "global", label: "All Time" },
  { value: "daily",  label: "Today" },
  { value: "weekly", label: "This Week" },
];

export default function LeaderboardPage() {
  const router = useRouter();
  const { activeTab, setTab } = useLeaderboardStore();
  useLeaderboard();

  const [isMobile, setIsMobile] = useState(false);
  const [scale,    setScale]    = useState(1);
  const [frameHeight, setFrameHeight] = useState(FRAME_H);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const compute = () => {
      setIsMobile(window.innerWidth < 768);
      setScale(Math.min(window.innerWidth / FRAME_W, window.innerHeight / FRAME_H));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  // Track the frame's natural content height — a long leaderboard can push
  // it past FRAME_H, and the outer spacer needs the *scaled* height so the
  // page's scroll region matches what's actually visible (transform doesn't
  // shrink an element's own layout footprint — see club/[clubId]/page.tsx).
  useEffect(() => {
    if (isMobile) return;
    const el = frameRef.current;
    if (!el) return;
    const update = () => setFrameHeight(Math.max(FRAME_H, el.scrollHeight));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isMobile]);

  // ── Mobile layout — Figma node 21:900, responsive flow (no scaled frame —
  // that let content letterbox narrower than full width on shorter viewports,
  // inconsistent with champions/club mobile) ─────────────────────────────────
  if (isMobile) {
    return (
      <div className="min-h-screen overflow-y-auto bg-[#0f0f10] relative">

        {/* Medal — decorative, fixed to the viewport corner (Figma px values,
            not rescaled — same convention as club/champions hero icons) */}
        <div
          style={{
            position:       "fixed",
            left:           105,
            bottom:         -192.3,
            width:          597.302,
            height:         597.302,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            pointerEvents:  "none",
            zIndex:         0,
          }}
        >
          <div style={{ flexShrink: 0, transform: "rotate(16.63deg)" }}>
            <Icon3D name="medal" size={480} loading="eager" />
          </div>
        </div>

        {/* Content — full width, 16px margins, gap:24 */}
        <div
          style={{
            position:      "relative",
            zIndex:        1,
            padding:       "24px 16px 40px",
            display:       "flex",
            flexDirection: "column",
            gap:           24,
          }}
        >

          {/* Header row — back button + centred title */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", width: "100%" }}>

            {/* Back — 32×32 bordered, inside a 52px-wide holder */}
            <div style={{ width: 52, display: "flex", alignItems: "center" }}>
              <button
                onClick={() => router.back()}
                aria-label="Go back"
                style={{
                  border:          "1px solid #73767b",
                  borderRadius:    4,
                  width:           32,
                  height:          32,
                  display:         "flex",
                  alignItems:      "center",
                  justifyContent:  "center",
                  background:      "transparent",
                  cursor:          "pointer",
                  flexShrink:      0,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                  <path d="M12.5 15L7.5 10L12.5 5" stroke="#73767b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Title — flex-1, centred */}
            <div style={{ flex: "1 0 0", minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <h1 style={{ fontFamily: "var(--font-boldonse), sans-serif", fontSize: 20, lineHeight: "normal", color: "#fff", margin: 0 }}>
                Leaderboard
              </h1>
              <p style={{ fontFamily: "var(--font-geist-mono), monospace", fontWeight: 500, fontSize: 15, lineHeight: "normal", letterSpacing: "-0.75px", color: "#929498", margin: 0 }}>
                Global Rankings
              </p>
            </div>

            {/* Right spacer balances the 52px back container */}
            <div style={{ width: 52, flexShrink: 0 }} aria-hidden />
          </div>

          {/* Tab switcher */}
          <MenuSwitcher tabs={TABS} value={activeTab} onChange={setTab} />

          {/* Leaderboard cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
            <LeaderboardTable />
          </div>
        </div>
      </div>
    );
  }

  // ── Desktop layout — scaled Figma frame, same technique as champions/club/
  // play (previously this page used plain unscaled flow, which rendered its
  // content at a visibly different actual size than those pages whenever the
  // viewport was shorter than FRAME_H — the "screen jump" when navigating).
  // Not `fixed`/`overflow-hidden`: frameHeight is a floor, not a ceiling, so
  // a long leaderboard grows the page and scrolls instead of clipping.
  return (
    <div className="min-h-screen w-full bg-[#0f0f10] flex flex-col items-center overflow-x-hidden">
      <div style={{ width: FRAME_W * scale, height: frameHeight * scale, position: "relative" }}>
        <div
          ref={frameRef}
          style={{
            width:           FRAME_W,
            minHeight:       FRAME_H,
            position:        "absolute",
            top:             0,
            left:            0,
            transform:       `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {/* Medal decoration — Figma node 147:1424: 796.403px container
              (bottom:-241.4 right:-302.4) centring a 640px icon, rotated
              16.63deg. Was hardcoded to 220px, well below the design's 640px. */}
          <div
            className="pointer-events-none select-none z-0"
            style={{
              position:       "absolute",
              bottom:         -241.4,
              right:          -302.4,
              width:          796.403,
              height:         796.403,
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
            }}
          >
            <div style={{ flexShrink: 0, transform: "rotate(16.63deg)" }}>
              <Image src="/icons/3d/medal.webp" alt="" width={640} height={640} />
            </div>
          </div>

          {/* Header — centred, width CONTENT_W (matches content below) */}
          <div
            style={{ position: "absolute", left: "50%", top: 57, transform: "translateX(-50%)", width: CONTENT_W, zIndex: 10 }}
            className="flex items-center justify-between"
          >
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center border border-[#73767b] rounded-[4px] h-8 w-8 shrink-0"
              aria-label="Go back"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="flex flex-col items-center">
              <h1 className="font-boldonse text-white text-[20px] leading-normal">Leaderboard</h1>
              <p className="font-mono font-medium text-[15px] text-[#929498] tracking-[-0.75px] leading-normal">
                Global Rankings
              </p>
            </div>

            <div className="w-8 shrink-0" aria-hidden />
          </div>

          {/* Content — centred, width CONTENT_W (matches header above) */}
          <div
            style={{ position: "absolute", left: "50%", top: 160, transform: "translateX(-50%)", width: CONTENT_W, zIndex: 10 }}
            className="flex flex-col gap-10 pb-24"
          >
            <MenuSwitcher tabs={TABS} value={activeTab} onChange={setTab} />
            <LeaderboardTable />
          </div>
        </div>
      </div>
    </div>
  );
}
