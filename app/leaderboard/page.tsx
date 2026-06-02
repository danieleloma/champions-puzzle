"use client";

// ── Figma node 29:3387 desktop / 21:900 mobile ────────────────────────────────
//
//  Mobile frame: 440 × 926 (iPhone 13 Mini)
//  Medal decoration: left:105 bottom:-192.3 container:597px img:480px rot:16.63°
//  Content: centred (left:50% -translate-x-1/2) top:84 width:408 gap:24
//    ├── Header row: back (32×32) + flex-1 title centre + w-52 placeholder
//    ├── MenuSwitcher
//    └── LeaderboardTable (gap:8 between cards)
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MenuSwitcher } from "@/components/ui/MenuSwitcher";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { Icon3D } from "@/components/ui";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useLeaderboardStore } from "@/store/leaderboard-store";
import type { LeaderboardType } from "@/types/leaderboard";

const MOBILE_W = 440;
const MOBILE_H = 926;

const TABS: { value: LeaderboardType; label: string }[] = [
  { value: "global", label: "All Time" },
  { value: "daily",  label: "Today" },
  { value: "weekly", label: "This Week" },
];

export default function LeaderboardPage() {
  const router = useRouter();
  const { activeTab, setTab } = useLeaderboardStore();
  useLeaderboard();

  const [isMobile,    setIsMobile]    = useState(false);
  const [mobileScale, setMobileScale] = useState(1);

  useEffect(() => {
    const compute = () => {
      setIsMobile(window.innerWidth < 768);
      setMobileScale(Math.min(window.innerWidth / MOBILE_W, window.innerHeight / MOBILE_H));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  // ── Mobile layout — Figma node 21:900 (440 × 926) ──────────────────────────
  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-[#0f0f10] overflow-hidden flex items-center justify-center">

        {/* Scaled 440 × 926 Figma frame */}
        <div
          style={{
            width:           MOBILE_W,
            height:          MOBILE_H,
            flexShrink:      0,
            position:        "relative",
            overflow:        "hidden",
            transform:       `scale(${mobileScale})`,
            transformOrigin: "center center",
          }}
        >

          {/* Medal — left:105, bottom:-192.3, container:597, img:480, rot:16.63° */}
          <div
            style={{
              position:       "absolute",
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

          {/* Content — centred, top:84, width:408, gap:24 */}
          <div
            style={{
              position:      "absolute",
              left:          "50%",
              transform:     "translateX(-50%)",
              top:           84,
              width:         408,
              display:       "flex",
              flexDirection: "column",
              gap:           24,
              zIndex:        1,
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
                  GUNFC Rankings
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

          {/* Home indicator */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 21, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 8 }}>
            <div style={{ width: 134, height: 5, borderRadius: 100, background: "#fff" }} />
          </div>

        </div>
      </div>
    );
  }

  // ── Desktop layout ──────────────────────────────────────────────────────────
  return (
    <main className="relative min-h-screen bg-[#0f0f10] overflow-hidden">
      {/* Medal decoration */}
      <div
        className="absolute bottom-[-60px] right-[-70px] pointer-events-none select-none z-0"
        style={{ transform: "rotate(16.63deg)" }}
      >
        <img src="/icons/3d/medal.png" alt="" width={220} height={220} />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-12 pb-4">
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
            GUNFC Rankings
          </p>
        </div>

        <div className="w-8 shrink-0" aria-hidden />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto px-4 flex flex-col gap-10 mt-6 pb-24" style={{ width: 684 }}>
        <MenuSwitcher tabs={TABS} value={activeTab} onChange={setTab} />
        <LeaderboardTable />
      </div>
    </main>
  );
}
