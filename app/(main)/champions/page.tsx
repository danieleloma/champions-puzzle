"use client";

// ── Figma node 27:816 "Choose your champion" — 1440 × 1024 px (desktop) ──────
//  ── Figma node 9:619  "Choose your champion" — 440 × 926 px  (mobile)  ──────
//
// Nav bar + scaled desktop frame live in app/(main)/layout.tsx (shared with
// /club/[clubId] so it never remounts when navigating between the two).
//
//  Desktop layout:
//  • Content — width 648 (CONTENT_W)  cx=720  top 200  flex-col gap 41
//    Header: heading (Boldonse 20px) + league filter  gap 16
//    Cards:  3-column CSS grid  gap 16  each card 196×260px
//
//  Mobile layout (responsive scroll):
//  • Header block  flex-col gap 16: heading + league pills
//  • Cards: 2-column CSS grid  gap 16  cards 196×260px
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { BadgeContainer, ClubCard } from "@/components/ui";
import { CHAMPIONS } from "@/lib/champions-data";
import { prefetchPuzzles } from "@/lib/puzzle-cache";

// Matches CONTENT_W in app/(main)/layout.tsx
const CONTENT_W = 648;

// Order = latest first: World Cup final → Champions League final (after all
// domestic leagues finish) → Premier League/La Liga/Serie A (same final
// weekend) → Bundesliga/Ligue 1 (~1 week earlier).
const LEAGUES = [
  { value: "world-cup",        label: "World Cup"        },
  { value: "champions-league", label: "Champions League" },
  { value: "premier-league",   label: "Premier League"   },
  { value: "la-liga",          label: "La Liga"          },
  { value: "serie-a",          label: "Serie A"          },
  { value: "bundesliga",       label: "Bundesliga"       },
  { value: "ligue-1",          label: "Ligue 1"          },
] as const;

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ChampionsPage() {
  const [isMobile,     setIsMobile]     = useState(false);
  const [activeLeague, setActiveLeague] = useState<string | undefined>(undefined);

  useEffect(() => {
    const compute = () => setIsMobile(window.innerWidth < 768);
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  function handleLeagueChange(val: string) {
    setActiveLeague((prev) => (prev === val ? undefined : val));
  }

  const visible = activeLeague
    ? CHAMPIONS.filter((c) => c.leagueKeys.includes(activeLeague))
    : CHAMPIONS;

  // ── Mobile ──────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ padding: "32px 16px 40px", display: "flex", flexDirection: "column", gap: 41 }}>
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
              href={`/club/${c.id}`}
              onHoverIntent={() => prefetchPuzzles(c.id)}
              className="w-full"
            />
          ))}
        </div>
      </div>
    );
  }

  // ── Desktop ─────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        position:      "absolute",
        left:          "50%",
        top:           200,
        transform:     "translateX(-50%)",
        width:         CONTENT_W,
        display:       "flex",
        flexDirection: "column",
        gap:           41,
      }}
    >
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
            href={`/club/${c.id}`}
            onHoverIntent={() => prefetchPuzzles(c.id)}
          />
        ))}
      </div>
    </div>
  );
}
