"use client";

// ── Figma node 27:816 "Choose your champion" — 1440 × 1024 px ─────────────────
//
//  Layout (same scale-to-fit frame as /onboarding):
//  • Nav bar — left: CHAMPIONS PUZZLE wordmark  right: user badge + Ranks badge
//    Figma: left 200  top 57  width 1040  justify-between
//  • Content — width 481  cx=720  top 200  gap 41 between header and cards
//    Header: heading (Boldonse 20px) + league filter (BadgeContainer)
//    Cards:  2-column CSS grid  gap 16  each card height 260px
//
//  Club cards (Arsenal & Barcelona from Figma; Inter/Bayern/PSG follow same pattern):
//  • Background: 3-stop gradient (sky tint → club colour → dark base)
//  • Floating icons: positioned with `right` + `top` from Figma, clipped by overflow:hidden
//  • Club badge: left 29.54  top 27.54  size 146 (Icon3D for arsenal/barcelona, letter for rest)
//  • Bottom vignette + footer text (club name, league) + PLAY button
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge, BadgeContainer, ClubCard } from "@/components/ui";
import { CHAMPIONS } from "@/lib/champions-data";
import { useUserStore } from "@/store/user-store";

const FRAME_W = 1440;
const FRAME_H = 1024;

const LEAGUES = [
  { value: "premier-league", label: "Premier League" },
  { value: "la-liga",        label: "La Liga"        },
  { value: "serie-a",        label: "Serie A"        },
  { value: "bundesliga",     label: "Bundesliga"     },
  { value: "ligue-1",        label: "Ligue 1"        },
] as const;

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ChampionsPage() {
  const router = useRouter();
  const user   = useUserStore((s) => s.user);

  const [scale,        setScale]        = useState(1);
  const [activeLeague, setActiveLeague] = useState<string | undefined>(undefined);

  useEffect(() => {
    const compute = () =>
      setScale(Math.min(window.innerWidth / FRAME_W, window.innerHeight / FRAME_H));
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  function handleLeagueChange(val: string) {
    setActiveLeague((prev) => (prev === val ? undefined : val));
  }

  const visible = activeLeague
    ? CHAMPIONS.filter((c) => c.leagueKey === activeLeague)
    : CHAMPIONS;

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#0f0f10] flex items-center justify-center">

      <div
        style={{
          width: FRAME_W, height: FRAME_H, flexShrink: 0, position: "relative",
          overflow: "hidden", transform: `scale(${scale})`, transformOrigin: "center center",
        }}
      >

        {/* ── Nav bar — left 200  top 57  width 1040  justify-between ── */}
        <div style={{ position: "absolute", left: 200, top: 57, width: 1040, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ pointerEvents: "none" }}>
            <p style={{ fontFamily: "var(--font-boldonse), sans-serif", fontSize: 14.667, lineHeight: "22px", letterSpacing: "-0.7333px", color: "#fff", margin: 0, textAlign: "center" }}>CHAMPIONS</p>
            <p style={{ fontFamily: "var(--font-boldonse), sans-serif", fontSize: 14.667, lineHeight: "22px", letterSpacing: "-0.7333px", color: "#fff", margin: 0, textAlign: "center" }}>PUZZLE</p>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            {user && <Badge variant="user-info" username={user.username} avatarColor={user.avatar_color} xp={user.xp} />}
            <Link href="/leaderboard"><Badge variant="featured" label="Ranks" /></Link>
          </div>
        </div>

        {/* ── Content — cx=720  top=200  w=481  flex-col  gap=41 ── */}
        <div style={{ position: "absolute", left: "50%", top: 200, transform: "translateX(-50%)", width: 481, display: "flex", flexDirection: "column", gap: 41 }}>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h1 style={{ fontFamily: "var(--font-boldonse), sans-serif", fontSize: 20, lineHeight: "normal", letterSpacing: "-1px", color: "#fff", margin: 0 }}>
              Choose your champion
            </h1>
            <BadgeContainer
              value={activeLeague}
              onChange={handleLeagueChange}
              items={LEAGUES.map((l) => ({ value: l.value, label: l.label }))}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 196px)", gap: 16 }}>
            {visible.map((c) => (
              <ClubCard
                key={c.id}
                club={c.club}
                league={c.league}
                imageSrc={c.cardImageSrc}
                skyColor={c.skyColor}
                gradFrom={c.gradFrom}
                gradTo={c.gradTo}
                badgeIcon={c.badgeIcon}
                badgeLetter={c.badgeLetter}
                floatIcons={c.floatIcons}
                onPlay={() => router.push(`/club/${c.id}`)}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
