"use client";

// ── Figma node 29:2304 "Club-game-section" — 1440 × 1024 px ──────────────────
//
//  Nav bar — identical to /champions (CHAMPIONS PUZZLE + user + Ranks)
//  Figma: left 200  top 57  width 1040  justify-between
//
//  Content — flex-col  gap 41  items-center  cx=720  top=200
//  ├── Hero (408 × 225 px, grid overlap):
//  │   ├── Club badge (Icon3D, 146px, 60% opacity, top-0 centered)
//  │   ├── 4 ghost icons (123px, 20% opacity, absolute within hero)
//  │   └── Text overlay (absolute, centred, top 33px)
//  │       "Relive the Glory"     Boldonse 32px  tracking -1.6px
//  │       "{LEAGUE} CHAMPIONS"  Geist SemiBold 14px  tracking -0.7px
//  └── Game section (640px wide, flex-col gap 32):
//      ├── Difficulty section (flex-col gap 10)
//      │   ├── "Difficulty" label  Boldonse 16px
//      │   └── Horizontal scroll row of DifficultyCards (all 6, gap 8)
//      └── Puzzle section (flex-col gap 10)
//          ├── "Choose a puzzle" label  Boldonse 16px
//          └── Flex row of puzzle cards (flex-1, h-200, gap 8)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Badge, DifficultyCard, Icon3D, ImageCard, PuzzleGridTiles } from "@/components/ui";
import { getChampion } from "@/lib/champions-data";
import { DIFFICULTY_CONFIG, type Difficulty, type Puzzle } from "@/types/puzzle";
import { useUserStore } from "@/store/user-store";
import { useGameStore } from "@/store/game-store";

const FRAME_W = 1440;
const FRAME_H = 1024;

const DIFFICULTIES = Object.keys(DIFFICULTY_CONFIG) as Difficulty[];

// ── Shared nav wordmark ────────────────────────────────────────────────────────

function NavWordmark() {
  return (
    <div style={{ pointerEvents: "none" }}>
      <p style={{ fontFamily: "var(--font-boldonse), sans-serif", fontSize: 14.667, lineHeight: "22px", letterSpacing: "-0.7333px", color: "#fff", margin: 0, textAlign: "center" }}>
        CHAMPIONS
      </p>
      <p style={{ fontFamily: "var(--font-boldonse), sans-serif", fontSize: 14.667, lineHeight: "22px", letterSpacing: "-0.7333px", color: "#fff", margin: 0, textAlign: "center" }}>
        PUZZLE
      </p>
    </div>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────
// Boldonse 16px / tracking -0.8px / text-shadow 0 4 24 black

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily:    "var(--font-boldonse), sans-serif",
        fontSize:      16,
        lineHeight:    "normal",
        letterSpacing: "-0.8px",
        color:         "#fff",
        margin:        0,
        textShadow:    "0px 4px 24px black",
      }}
    >
      {children}
    </p>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ClubPage() {
  const router    = useRouter();
  const { clubId } = useParams<{ clubId: string }>();
  const user      = useUserStore((s) => s.user);
  const setPuzzle = useGameStore((s) => s.setPuzzle);

  const [scale,              setScale]              = useState(1);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [puzzles,            setPuzzles]            = useState<Puzzle[]>([]);
  const [puzzlesLoading,     setPuzzlesLoading]     = useState(true);

  const club = getChampion(clubId ?? "");

  // Scale frame to viewport
  useEffect(() => {
    const compute = () =>
      setScale(Math.min(window.innerWidth / FRAME_W, window.innerHeight / FRAME_H));
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  // Load puzzles
  useEffect(() => {
    fetch("/api/puzzles")
      .then((r) => r.json())
      .then((data: { puzzles: Puzzle[] }) => {
        setPuzzles(data.puzzles ?? []);
      })
      .catch(() => setPuzzles([]))
      .finally(() => setPuzzlesLoading(false));
  }, []);

  function handleDifficultyClick(d: Difficulty) {
    setSelectedDifficulty((prev) => (prev === d ? null : d));
  }

  function handlePuzzlePlay(puzzle: Puzzle) {
    const difficulty = selectedDifficulty ?? puzzle.difficulty;
    setPuzzle(puzzle, difficulty);
    router.push(`/play/${puzzle.id}`);
  }

  const visiblePuzzles = selectedDifficulty
    ? puzzles.filter((p) => p.difficulty === selectedDifficulty)
    : puzzles;

  // Fallback while club not found
  if (!club) {
    return (
      <div className="fixed inset-0 bg-[#0f0f10] flex items-center justify-center">
        <p className="text-white/40 font-sans">Club not found.</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#0f0f10] flex items-center justify-center">

      {/* ── Scaled Figma frame ─────────────────────────────────────────────── */}
      <div
        style={{
          width:           FRAME_W,
          height:          FRAME_H,
          flexShrink:      0,
          position:        "relative",
          overflow:        "hidden",
          transform:       `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >

        {/* ── Nav bar — left 200  top 57  width 1040  justify-between ── */}
        <div
          style={{
            position: "absolute", left: 200, top: 57, width: 1040,
            display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          }}
        >
          <NavWordmark />
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            {user && (
              <Badge variant="user-info" username={user.username} avatarColor={user.avatar_color} xp={user.xp} />
            )}
            <Link href="/leaderboard"><Badge variant="featured" label="Ranks" /></Link>
          </div>
        </div>

        {/* ── Content — cx=720  top=200  items-center  flex-col  gap=41 ── */}
        <div
          style={{
            position:      "absolute",
            left:          "50%",
            top:           200,
            transform:     "translateX(-50%)",
            display:       "flex",
            flexDirection: "column",
            alignItems:    "center",
            gap:           41,
          }}
        >

          {/* ── Hero — 408 × 225 px ────────────────────────────────────── */}
          {/* Figma 29:2549: badge at top-0 centred (60% opacity), ghost icons
              at absolute positions (20% opacity), text overlaid from top 33px */}
          <div style={{ position: "relative", width: 408, height: 225, flexShrink: 0 }}>

            {/* Ghost icons — 20% opacity, 123px, absolute within hero */}
            {club.heroIcons.map((hi, i) => (
              <div
                key={i}
                style={{
                  position:       "absolute",
                  left:           hi.left,
                  top:            hi.top,
                  width:          123,
                  height:         123,
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  pointerEvents:  "none",
                }}
              >
                <div style={{ flexShrink: 0, transform: `rotate(${hi.deg}deg)`, opacity: 0.2 }}>
                  <Icon3D name={hi.name} size={123} loading="eager" />
                </div>
              </div>
            ))}

            {/* Club badge — centred, top 0, 60% opacity, 146px */}
            <div
              style={{
                position:  "absolute",
                top:       0,
                left:      "50%",
                transform: "translateX(-50%)",
                opacity:   0.6,
                pointerEvents: "none",
              }}
            >
              {club.badgeIcon ? (
                <Icon3D name={club.badgeIcon} size={146} loading="eager" />
              ) : (
                <div
                  style={{
                    width:           146,
                    height:          146,
                    borderRadius:    "50%",
                    backgroundColor: "rgba(255,255,255,0.15)",
                    border:          "1px solid rgba(255,255,255,0.25)",
                    display:         "flex",
                    alignItems:      "center",
                    justifyContent:  "center",
                  }}
                >
                  <span style={{ fontFamily: "var(--font-boldonse), sans-serif", fontSize: 56, color: "#fff", lineHeight: 1 }}>
                    {club.badgeLetter}
                  </span>
                </div>
              )}
            </div>

            {/* Text overlay — top 33px, full-width centred */}
            {/* Figma 29:2577: col-1 row-1 ml-55.5 mt-33 items-center text-center */}
            <div
              style={{
                position:  "absolute",
                left:      0,
                right:     0,
                top:       33,
                display:   "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                textShadow: "0px 4px 24px black",
                pointerEvents: "none",
              }}
            >
              {/* Boldonse 32px / tracking -1.6px */}
              <span
                style={{
                  fontFamily:    "var(--font-boldonse), sans-serif",
                  fontSize:      32,
                  lineHeight:    "normal",
                  letterSpacing: "-1.6px",
                  color:         "#fff",
                  whiteSpace:    "nowrap",
                }}
              >
                Relive the Glory
              </span>
              {/* Geist SemiBold 14px / tracking -0.7px */}
              <span
                style={{
                  fontFamily:    "var(--font-geist-sans), sans-serif",
                  fontWeight:    600,
                  fontSize:      14,
                  lineHeight:    "normal",
                  letterSpacing: "-0.7px",
                  color:         "#fff",
                  whiteSpace:    "nowrap",
                }}
              >
                {club.leagueTitle}
              </span>
            </div>
          </div>

          {/* ── Game section — 640px wide  flex-col  gap=32 ── */}
          <div style={{ width: 640, display: "flex", flexDirection: "column", gap: 32 }}>

            {/* Difficulty section — gap 10 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <SectionLabel>Difficulty</SectionLabel>

              {/* Horizontal scrollable row — gap 8, no scrollbar */}
              <div
                className="no-scrollbar"
                style={{ display: "flex", gap: 8, overflowX: "auto" }}
              >
                {DIFFICULTIES.map((d) => (
                  <DifficultyCard
                    key={d}
                    difficulty={d}
                    selected={selectedDifficulty === d}
                    onClick={() => handleDifficultyClick(d)}
                    style={{ flexShrink: 0, width: 200, cursor: "pointer" }}
                  />
                ))}
              </div>
            </div>

            {/* Puzzle section — gap 10 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <SectionLabel>Choose a puzzle</SectionLabel>

              {puzzlesLoading ? (
                <div style={{ display: "flex", gap: 8 }}>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        flexShrink:      0,
                        width:           200,
                        height:          200,
                        borderRadius:    12,
                        backgroundColor: "#161617",
                        border:          "1px solid #252627",
                      }}
                    />
                  ))}
                </div>
              ) : visiblePuzzles.length === 0 ? (
                <p style={{ fontFamily: "var(--font-geist-sans), sans-serif", fontSize: 14, color: "#73767b", margin: 0 }}>
                  No puzzles available{selectedDifficulty ? ` for ${DIFFICULTY_CONFIG[selectedDifficulty].label}` : ""}.
                </p>
              ) : (
                <div style={{ display: "flex", gap: 8, overflowX: "auto" }} className="no-scrollbar">
                  {visiblePuzzles.map((puzzle) => (
                    <ImageCard
                      key={puzzle.id}
                      variant="puzzle"
                      src={puzzle.thumbnail_url || puzzle.image_url}
                      title={puzzle.title}
                      gridSize={DIFFICULTY_CONFIG[puzzle.difficulty].grid}
                      onClick={() => handlePuzzlePlay(puzzle)}
                      className="flex-shrink-0 w-[200px] h-[200px]"
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
