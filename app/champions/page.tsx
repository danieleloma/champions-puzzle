"use client";

// ── Figma node 27:816 "Choose your champion" — 1440 × 1024 px (desktop) ──────
//  ── Figma node 9:619  "Choose your champion" — 440 × 926 px  (mobile)  ──────
//
//  Desktop layout (scaled frame):
//  • Nav bar — CHAMPIONS PUZZLE wordmark (left) + user badge + Ranks (right)
//    Figma: left 200  top 57  width 1040  justify-between
//  • Content — width 684  cx=720  top 200  flex-col gap 41
//    Header: heading (Boldonse 20px) + league filter  gap 16
//    Cards:  3-column CSS grid  gap 16  each card 196×260px
//
//  Mobile layout (responsive scroll):
//  • Figma: left 16  top 84  width 407  flex-col gap 41
//  • Header section  flex-col gap 32:
//      Nav row: user badge (left) + Ranks badge (right)
//      Title block  flex-col gap 16: heading + league pills
//  • Cards: 2-column CSS grid  gap 16  cards 196×260px
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
  const [isMobile,     setIsMobile]     = useState(false);
  const [activeLeague, setActiveLeague] = useState<string | undefined>(undefined);

  useEffect(() => {
    const compute = () => {
      setIsMobile(window.innerWidth < 768);
      setScale(Math.min(window.innerWidth / FRAME_W, window.innerHeight / FRAME_H));
    };
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

  // ── Mobile layout — Figma node 9:619 (440 × 926) ──────────────────────────
  // left:16  top:84  width:407  flex-col  gap:41
  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#0f0f10] overflow-y-auto">
        <div style={{ padding: "84px 16px 40px", display: "flex", flexDirection: "column", gap: 41 }}>

          {/* Header section — flex-col  gap:32 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

            {/* Nav row — user badge (left)  Ranks (right) */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              {user && (
                <Badge
                  variant="user-info"
                  username={user.username}
                  avatarColor={user.avatar_color}
                  xp={user.xp}
                />
              )}
              <Link href="/leaderboard">
                <Badge variant="featured" label="Ranks" />
              </Link>
            </div>

            {/* Title + league pills — flex-col  gap:16 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h1
                style={{
                  fontFamily:    "var(--font-boldonse), sans-serif",
                  fontSize:      20,
                  lineHeight:    "normal",
                  letterSpacing: "-1px",
                  color:         "#fff",
                  margin:        0,
                }}
              >
                Choose your champion
              </h1>
              <BadgeContainer
                value={activeLeague}
                onChange={handleLeagueChange}
                items={LEAGUES.map((l) => ({ value: l.value, label: l.label }))}
              />
            </div>
          </div>

          {/* Cards — 2-col grid  gap:16  each card 196×260px */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
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
                className="w-full"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Desktop layout ──────────────────────────────────────────────────────────
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

        {/* ── Content — cx=720  top=200  w=684  flex-col  gap=41 ── */}
        <div style={{ position: "absolute", left: "50%", top: 200, transform: "translateX(-50%)", width: 684, display: "flex", flexDirection: "column", gap: 41 }}>

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

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 196px)", gap: 16 }}>
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
