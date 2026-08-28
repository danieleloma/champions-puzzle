"use client";

// ── Figma node 29:3387 desktop / 21:900 mobile ────────────────────────────────
//
//  Mobile frame: 440 × 926 (iPhone 13 Mini)
//  Medal decoration: right:-262.302 bottom:-192.3 size:597.302px, no rotation
//  Content: centred (left:50% -translate-x-1/2) top:24 width:408 gap:24
//    ├── Header row: back (32×32) + flex-1 title centre + w-52 placeholder
//    ├── MenuSwitcher
//    └── LeaderboardTable (gap:8 between cards)
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
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

  useEffect(() => {
    const compute = () => {
      setIsMobile(window.innerWidth < 768);
      setScale(Math.min(window.innerWidth / FRAME_W, window.innerHeight / FRAME_H));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  // ── Mobile layout — Figma node 21:900, responsive flow (no scaled frame —
  // that let content letterbox narrower than full width on shorter viewports,
  // inconsistent with champions/club mobile). Header + tab switcher stay
  // fixed on screen; only the card list scrolls (clipped to the remaining
  // viewport height) — so switching tabs or going back never requires
  // scrolling back up first. ───────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="h-[100dvh] overflow-hidden bg-[#0f0f10] relative flex flex-col">

        {/* Medal — decorative, pinned to the viewport's bottom-right corner
            (Figma node 21:900: 597.302px icon, no rotation, bottom:-192.3).
            Anchored with `right` (not the Figma-literal `left:105`, which
            assumed the 440px reference frame and drifted off the right edge
            on any other device width) so it stays flush to the actual
            corner regardless of viewport width. */}
        <div
          style={{
            position:      "fixed",
            right:         -262.302,
            bottom:        -192.3,
            width:         597.302,
            height:        597.302,
            pointerEvents: "none",
            zIndex:        0,
          }}
        >
          <Icon3D name="medal" size={597} loading="eager" />
        </div>

        {/* Fixed header + tabs — full width, 16px margins, gap:24 */}
        <div
          style={{
            position:      "relative",
            zIndex:        1,
            flexShrink:    0,
            padding:       "24px 16px 0",
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
                className="bg-transparent hover:bg-[#161617] transition-colors"
                style={{
                  border:          "1px solid #73767b",
                  borderRadius:    4,
                  width:           32,
                  height:          32,
                  display:         "flex",
                  alignItems:      "center",
                  justifyContent:  "center",
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
              <p style={{ fontFamily: "var(--font-geist-mono), monospace", fontWeight: 500, fontSize: 15, lineHeight: "normal", letterSpacing: "-0.75px", color: "#929498", margin: 0, textShadow: "0px 4px 24px black" }}>
                Global Rankings
              </p>
            </div>

            {/* Right spacer balances the 52px back container */}
            <div style={{ width: 52, flexShrink: 0 }} aria-hidden />
          </div>

          {/* Tab switcher */}
          <MenuSwitcher tabs={TABS} value={activeTab} onChange={setTab} />
        </div>

        {/* Scrollable list region — clipped to the remaining viewport height */}
        <div
          className="flex-1 min-h-0 overflow-y-auto"
          style={{ position: "relative", zIndex: 1, padding: "24px 16px 40px" }}
        >
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
  // Header + tab switcher stay fixed on screen; only the card list scrolls,
  // clipped to the frame's own height — so switching tabs or going back
  // never requires scrolling back up to the top first.
  return (
    <div className="h-[100dvh] w-full bg-[#0f0f10] flex items-center justify-center overflow-hidden">
      {/* Medal decoration — Figma node 147:1424: 796.403px container
          (bottom:-241.4 right:-302.4) centring a 640px icon, rotated
          16.63deg. Pinned to the viewport (not the scaled/scrolling frame
          content below) so it stays fixed to the bottom-right corner
          instead of scrolling away once the leaderboard grows past one
          screen. Dimensions scaled by the same `scale` factor as the frame
          so it stays visually consistent with the Figma frame at any
          viewport size. */}
      <div
        className="pointer-events-none select-none z-0"
        style={{
          position:       "fixed",
          bottom:         -241.4 * scale,
          right:          -302.4 * scale,
          width:          796.403 * scale,
          height:         796.403 * scale,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
        }}
      >
        <div style={{ flexShrink: 0, transform: "rotate(16.63deg)" }}>
          <Image src="/icons/3d/medal.webp" alt="" width={Math.round(640 * scale)} height={Math.round(640 * scale)} />
        </div>
      </div>

      <div style={{ width: FRAME_W * scale, height: FRAME_H * scale, position: "relative" }}>
        <div
          style={{
            width:           FRAME_W,
            height:          FRAME_H,
            position:        "absolute",
            top:             0,
            left:            0,
            transform:       `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {/* Header + tabs/content — Figma node 147:1409: flex-col, gap:85
              between the header row and the tabs block. top:57 bottom:40
              gives the whole column an explicit height within the frame
              (fixed FRAME_H, no longer growing), so the header + tab
              switcher stay put and only the list below them scrolls/clips. */}
          <div
            style={{
              position:      "absolute",
              left:          "50%",
              top:           57,
              bottom:        40,
              transform:     "translateX(-50%)",
              width:         CONTENT_W,
              zIndex:        10,
              display:       "flex",
              flexDirection: "column",
              alignItems:    "center",
              gap:           85,
            }}
          >
            {/* Header row — shrink-0, stays fixed height */}
            <div className="flex items-center justify-between w-full shrink-0">
              <button
                onClick={() => router.back()}
                className="flex items-center justify-center border border-[#73767b] rounded-[4px] h-8 w-8 shrink-0 bg-transparent hover:bg-[#161617] transition-colors"
                aria-label="Go back"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M12.5 15L7.5 10L12.5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <div className="flex flex-col items-center">
                <h1 className="font-boldonse text-white text-[20px] leading-normal">Leaderboard</h1>
                <p
                  className="font-mono font-medium text-[15px] text-[#929498] tracking-[-0.75px] leading-normal"
                  style={{ textShadow: "0px 4px 24px black" }}
                >
                  Global Rankings
                </p>
              </div>

              <div className="w-8 shrink-0" aria-hidden />
            </div>

            {/* Tabs + content — fills remaining height so the list below
                the tab switcher can scroll/clip within it. */}
            <div className="flex flex-col items-center w-full flex-1 min-h-0 gap-10">
              <MenuSwitcher tabs={TABS} value={activeTab} onChange={setTab} />
              <div className="flex-1 min-h-0 overflow-y-auto w-full">
                <LeaderboardTable />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
