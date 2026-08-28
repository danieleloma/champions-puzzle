"use client";

// ── Figma node 29:2304 "Club-game-section" — 1440 × 1024 px ──────────────────
//
// Nav bar + scaled desktop frame live in app/(main)/layout.tsx (shared with
// /champions so it never remounts when navigating between the two).
//
//  Content — flex-col  gap 41  items-center  cx=720  top=200
//  ├── Hero (408 × 225 px, grid overlap):
//  │   ├── Club badge (Icon3D, 146px, 60% opacity, top-0 centered)
//  │   ├── 4 ghost icons (123px, 20% opacity, absolute within hero)
//  │   └── Text overlay (absolute, centred, top 33px)
//  │       "Relive the Glory"     Boldonse 32px  tracking -1.6px
//  │       "{LEAGUE} CHAMPIONS"  Geist SemiBold 14px  tracking -0.7px
//  └── Game section (648px wide, flex-col gap 32):
//      ├── Difficulty section (flex-col gap 10)
//      │   ├── "Difficulty" label  Boldonse 16px
//      │   └── Row of DifficultyCards, fills CONTENT_W (gap 8)
//      └── Puzzle section (flex-col gap 10)
//          ├── "Choose a puzzle" label  Boldonse 16px
//          └── 3-column grid of puzzle cards (gap 8) — every puzzle is
//              available at every difficulty; a difficulty must be picked
//              before a card becomes playable (View still works either way)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { DifficultyCard, Icon3D, ImageCard, ImagePreviewModal } from "@/components/ui";
import { getChampion } from "@/lib/champions-data";
import { DIFFICULTY_CONFIG, type Difficulty, type Puzzle } from "@/types/puzzle";
import { useGameStore } from "@/store/game-store";
import { prefetchPuzzles, getCachedPuzzles } from "@/lib/puzzle-cache";
import { preloadImage } from "@/lib/preload-image";

// Matches CONTENT_W in app/(main)/layout.tsx
const CONTENT_W = 648;

// Mobile has no hover state, so touchstart only buys a few dozen ms of lead
// time before the tap lands — not enough to hide a cold image/route fetch.
// Instead, eagerly warm the first few puzzles (in the order they're shown)
// as soon as they're loaded, so the most likely taps are already primed.
const MOBILE_EAGER_PRELOAD_COUNT = 3;

const DIFFICULTIES = Object.keys(DIFFICULTY_CONFIG) as Difficulty[];

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

export default function ClubPageClient() {
  const router    = useRouter();
  const { clubId } = useParams<{ clubId: string }>();
  const setPuzzle = useGameStore((s) => s.setPuzzle);

  const [isMobile,           setIsMobile]           = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [puzzles,            setPuzzles]            = useState<Puzzle[]>([]);
  const [puzzlesLoading,     setPuzzlesLoading]     = useState(true);
  const [previewPuzzle,      setPreviewPuzzle]      = useState<Puzzle | null>(null);

  const club = getChampion(clubId ?? "");

  useEffect(() => {
    const compute = () => setIsMobile(window.innerWidth < 768);
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  // Load puzzles for this club — puzzlesLoading defaults to true, and this
  // page remounts (fresh initial state) when navigating to a different club.
  // Reuses the shared cache: if the champions-page card was hovered/touched
  // before this navigation, the fetch is already in flight (or done), so
  // this often resolves on the next tick instead of a cold round trip.
  useEffect(() => {
    if (!clubId) return;
    (getCachedPuzzles(clubId) ?? prefetchPuzzles(clubId))
      .then((puzzles) => setPuzzles(puzzles))
      .finally(() => setPuzzlesLoading(false));
  }, [clubId]);

  // Mobile: eagerly warm the top few puzzles' board image + /play route the
  // moment the list loads, rather than waiting for a hover/touch that mobile
  // barely gives any lead time on. Desktop still relies on onHoverIntent
  // below — no need to burn bandwidth eagerly there.
  useEffect(() => {
    if (!isMobile || puzzles.length === 0) return;
    for (const puzzle of puzzles.slice(0, MOBILE_EAGER_PRELOAD_COUNT)) {
      preloadImage(puzzle.image_url);
      router.prefetch(`/play/${puzzle.id}`);
    }
  }, [isMobile, puzzles, router]);

  function handleDifficultyClick(d: Difficulty) {
    setSelectedDifficulty((prev) => (prev === d ? null : d));
  }

  function handlePuzzlePlay(puzzle: Puzzle) {
    // Gated in the UI (cards are disabled until a difficulty is chosen), but
    // guard here too since disabled cards still exist in the DOM.
    if (!selectedDifficulty) return;
    setPuzzle(puzzle, selectedDifficulty);
    router.push(`/play/${puzzle.id}`);
  }

  // Warms the /play route chunk + full-resolution board image on hover/touch,
  // well before the click — the click itself then does no cold network work.
  function handlePuzzleHoverIntent(puzzle: Puzzle) {
    preloadImage(puzzle.image_url);
    router.prefetch(`/play/${puzzle.id}`);
  }

  // Every puzzle image is playable at every difficulty — the grid size comes
  // from whichever difficulty is selected, not from the puzzle's own record.
  const visiblePuzzles = puzzles;

  // Fallback while club not found
  if (!club) {
    return (
      <div className="flex items-center justify-center" style={{ padding: "84px 16px" }}>
        <p className="text-white/40 font-sans">Club not found.</p>
      </div>
    );
  }

  // ── Mobile layout — Figma node 29:2582 (440 × 926) ────────────────────────
  //
  //  Hero  — left:16  top:84   w:408  h:225  (no gradient bg, just dark page)
  //    badge  centre-top  146px  opacity:60%
  //    heroIcons  123px  opacity:20%  (Figma positions, no rescaling)
  //    text overlay at top:123 — "Relive the Glory" Boldonse 32px + subtitle white
  //  Game section — left:16  top:372 (63px below hero)  w:408  flex-col gap:32
  //    Difficulty  flex-col gap:20  |  horizontal scroll flex gap:8
  //    Puzzles     flex-col gap:10  |  horizontal scroll flex gap:8  h:200px cards
  if (isMobile) {
    return (
      <>
        {/* ── Back button — top offset matches the site-wide mobile standard
            (24px, same as the layout's own nav row on every other page) now
            that this page's own hub-nav row above it is empty/hidden. Size
            (32×32) matches the leaderboard page's back button. ──────────── */}
        <div style={{ padding: "24px 16px 0" }}>
          <button
            onClick={() => router.push("/champions")}
            style={{
              border:          "1px solid #73767b",
              borderRadius:    4,
              height:          32,
              width:           32,
              display:         "flex",
              alignItems:      "center",
              justifyContent:  "center",
              background:      "transparent",
              cursor:          "pointer",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path d="M12.5 15L7.5 10L12.5 5" stroke="#73767b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* ── Hero — full width, no overflow clip so icons bleed ────────── */}
        {/* 32px top margin, not 16 — Figma (node 29:2582) gives the back
            button row a flat 32px gap to the hero text below it (matching
            the desktop page's own back-button gap), same as the 32px gap
            /champions' mobile nav row keeps to "Choose your champion". */}
        <div
          style={{
            position: "relative",
            margin:   "32px 16px 0",
            height:   250,
          }}
        >
          {/* Club badge — centred top, 146px, 60% opacity */}
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

          {/* Ghost icons — 123px, 20% opacity, Figma positions */}
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

          {/* Text overlay — top:63 (Figma-spec 123, shifted up 20px, then a
              further 40px by request — 103→63 — so only the "Relive the
              Glory" text block moves; the badge and ghost icons above keep
              their own positions unchanged). */}
          <div
            style={{
              position:      "absolute",
              left:          0,
              right:         0,
              top:           63,
              display:       "flex",
              flexDirection: "column",
              alignItems:    "center",
              textAlign:     "center",
              textShadow:    "0px 4px 24px black",
              pointerEvents: "none",
            }}
          >
            <span
              style={{
                fontFamily:    "var(--font-boldonse), sans-serif",
                fontSize:      18,
                lineHeight:    "normal",
                letterSpacing: "-0.9px",
                textTransform: "uppercase",
                color:         "#fcff3f",
                whiteSpace:    "nowrap",
              }}
            >
              {club.club}
            </span>
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

        {/* ── Game section — margin-top shifted up 20px (63→43) along with
            the text overlay above, then a further 40px per request (43→3),
            matching the desktop game section's -40px shift. ── */}
        <div
          style={{
            margin:        "3px 16px 40px",
            display:       "flex",
            flexDirection: "column",
            gap:           32,
          }}
        >

          {/* Difficulty — flex-col gap:20 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <SectionLabel>Difficulty</SectionLabel>
            <div className="no-scrollbar" style={{ display: "flex", gap: 8, overflowX: "auto" }}>
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

          {/* Puzzles — flex-col gap:10 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <SectionLabel>Choose a puzzle</SectionLabel>
            {!selectedDifficulty && !puzzlesLoading && (
              <p style={{ fontFamily: "var(--font-geist-sans), sans-serif", fontSize: 13, color: "#73767b", margin: 0 }}>
                Select a difficulty above to unlock a puzzle.
              </p>
            )}
            {puzzlesLoading ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{ aspectRatio: "1 / 1", borderRadius: 12, backgroundColor: "#161617", border: "1px solid #252627" }}
                  />
                ))}
              </div>
            ) : visiblePuzzles.length === 0 ? (
              <p style={{ fontFamily: "var(--font-geist-sans), sans-serif", fontSize: 14, color: "#73767b", margin: 0 }}>
                No puzzles available.
              </p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {visiblePuzzles.map((puzzle) => (
                  <ImageCard
                    key={puzzle.id}
                    variant="puzzle"
                    src={puzzle.thumbnail_url || puzzle.image_url}
                    title={puzzle.title}
                    disabled={!selectedDifficulty}
                    onClick={() => handlePuzzlePlay(puzzle)}
                    onView={() => setPreviewPuzzle(puzzle)}
                    onHoverIntent={() => handlePuzzleHoverIntent(puzzle)}
                    className="aspect-square w-full"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {previewPuzzle && (
          <ImagePreviewModal
            src={previewPuzzle.image_url}
            title={previewPuzzle.title}
            onClose={() => setPreviewPuzzle(null)}
          />
        )}
      </>
    );
  }

  // ── Desktop layout ──────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Back button — left-aligned with the CONTENT_W column below ── */}
      {/* top:57 matches the hub nav's position on /champions (this page's
          own logo/XP/Ranks row is hidden here, so the back button takes
          over that same row instead of sitting down at the content's own
          top) — keeps the two pages' header rows aligned when navigating
          between them. */}
      <button
        onClick={() => router.push("/champions")}
        style={{
          position:        "absolute",
          left:            `calc(50% - ${CONTENT_W / 2}px)`,
          top:             57,
          zIndex:          1,
          border:          "1px solid #73767b",
          borderRadius:    4,
          height:          32,
          width:           32,
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "center",
          background:      "transparent",
          cursor:          "pointer",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M12.5 15L7.5 10L12.5 5" stroke="#73767b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* ── Content — cx=720  top=189  items-center  flex-col  gap=41 ──
          Figma (node 29:2304) puts a flat 100px gap under the back-button
          row, not a fixed top position: back button top:57 + its own 32px
          height + 100px gap = 189. This used to be hardcoded to 200 (the
          /champions page's own value), but that page's nav row is a taller
          44px wordmark, not this 32px back button, so reusing the same
          absolute top under-counted this page's gap as ~111px instead of
          100px. */}
      <div
        style={{
          position:      "absolute",
          left:          "50%",
          top:           189,
          transform:     "translateX(-50%)",
          display:       "flex",
          flexDirection: "column",
          alignItems:    "center",
          gap:           41,
        }}
      >

        {/* ── Hero — 408 × 225 px ────────────────────────────────────── */}
        {/* Figma 29:2549: badge at top-0 centred (60% opacity), ghost icons
            at absolute positions (20% opacity), text overlaid from top 33px.
            transform:translateY(-40) shifts the whole hero (crest, ghost
            icons, text) up 40px per request without affecting the game
            section's layout position below it. */}
        <div style={{ position: "relative", width: 408, height: 225, flexShrink: 0, transform: "translateY(-40px)" }}>

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
            <span
              style={{
                fontFamily:    "var(--font-boldonse), sans-serif",
                fontSize:      18,
                lineHeight:    "normal",
                letterSpacing: "-0.9px",
                textTransform: "uppercase",
                color:         "#fcff3f",
                whiteSpace:    "nowrap",
              }}
            >
              {club.club}
            </span>
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

        {/* ── Game section — CONTENT_W wide  flex-col  gap=32 ── */}
        {/* marginTop:-40 pulls this section up 40px from the hero's gap:41
            flex spacing above, per request — hero stays at its own position. */}
        <div style={{ width: CONTENT_W, marginTop: -40, display: "flex", flexDirection: "column", gap: 32 }}>

          {/* Difficulty section — gap 10 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <SectionLabel>Difficulty</SectionLabel>

            {/* Row of difficulty cards — each fills an equal share of
                CONTENT_W (gap 8) instead of a fixed pixel width */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {DIFFICULTIES.map((d) => (
                <DifficultyCard
                  key={d}
                  difficulty={d}
                  selected={selectedDifficulty === d}
                  onClick={() => handleDifficultyClick(d)}
                  style={{ flex: "1 1 0", minWidth: 180, cursor: "pointer" }}
                />
              ))}
            </div>
          </div>

          {/* Puzzle section — gap 10 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <SectionLabel>Choose a puzzle</SectionLabel>

            {!selectedDifficulty && !puzzlesLoading && (
              <p style={{ fontFamily: "var(--font-geist-sans), sans-serif", fontSize: 13, color: "#73767b", margin: 0 }}>
                Select a difficulty above to unlock a puzzle.
              </p>
            )}

            {/* 3 equal-width columns filling CONTENT_W, same as the
                difficulty row above — both share the same total width */}
            {puzzlesLoading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      aspectRatio:     "1 / 1",
                      borderRadius:    12,
                      backgroundColor: "#161617",
                      border:          "1px solid #252627",
                    }}
                  />
                ))}
              </div>
            ) : visiblePuzzles.length === 0 ? (
              <p style={{ fontFamily: "var(--font-geist-sans), sans-serif", fontSize: 14, color: "#73767b", margin: 0 }}>
                No puzzles available.
              </p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {visiblePuzzles.map((puzzle) => (
                  <ImageCard
                    key={puzzle.id}
                    variant="puzzle"
                    src={puzzle.thumbnail_url || puzzle.image_url}
                    title={puzzle.title}
                    disabled={!selectedDifficulty}
                    onClick={() => handlePuzzlePlay(puzzle)}
                    onView={() => setPreviewPuzzle(puzzle)}
                    onHoverIntent={() => handlePuzzleHoverIntent(puzzle)}
                    className="w-full aspect-square"
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {previewPuzzle && (
        <ImagePreviewModal
          src={previewPuzzle.image_url}
          title={previewPuzzle.title}
          onClose={() => setPreviewPuzzle(null)}
        />
      )}
    </>
  );
}
