"use client";

// ── Figma node 29:3387 "Game-board-default" — 1440 × 1024 px ─────────────────
//
//  Nav bar (left 200  top 57  width 1040  justify-between):
//  • Left  — back button: bordered (1px #73767b, radius 4px, 52×32px) with ← arrow icon
//  • Right — eye-preview badge + hint badge (same border style, h-32px)
//
//  Content (cx=720  top=200  flex-col  gap=41  items-center):
//  ├── Info row (w=408  flex  gap=32  items-center  justify-center)
//  │   ├── Left flex-1: puzzle title (Boldonse 16px white) + difficulty (Geist Mono 15px #929498)
//  │   └── Right: "N moves" (Geist Med 24px #929498) + timer (Geist Mono 48px #929498 right-align)
//  ├── PuzzleBoard (408×408 px, size prop, no built-in progress)
//  └── Bottom (flex-col  gap=32  shrink-0)
//      ├── ProgressBar section (w=408, labels 16px, track h=12 #252627, fill #fcff3f)
//      └── RESTART button (w=408  bg #252627  rounded-1000px  Boldonse 16px  #929498)
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useGameStore } from "@/store/game-store";
import { useDeviceIdentity } from "@/hooks/useDeviceIdentity";
import { useTimer } from "@/hooks/useTimer";
import { PuzzleBoard } from "@/components/puzzle/PuzzleBoard";
import { VictoryScreen } from "@/components/game/VictoryScreen";
import { Icon3D } from "@/components/ui";
import { DIFFICULTY_CONFIG, type Puzzle } from "@/types/puzzle";
import { formatTime } from "@/lib/score-calculator";
import { getCompletionPercent } from "@/lib/puzzle-engine";

const FRAME_W    = 1440;
const FRAME_H    = 1024;
const BOARD_SIZE =  408; // Figma: size-[408px] — desktop only, board stays this size
const CONTENT_W  =  648; // desktop content column — matches champions/club/leaderboard

// ── Icon SVGs ─────────────────────────────────────────────────────────────────

function ArrowLeftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M12.5 15L7.5 10L12.5 5" stroke="#73767b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EyeIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M2 10C2 10 4.5 5 10 5C15.5 5 18 10 18 10C18 10 15.5 15 10 15C4.5 15 2 10 2 10Z"
        stroke={active ? "#fff" : "#73767b"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="2.5" stroke={active ? "#fff" : "#73767b"} strokeWidth="1.5" />
    </svg>
  );
}

function LightbulbIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M10 3C7.24 3 5 5.24 5 8C5 9.77 5.93 11.32 7.32 12.24C7.75 12.52 8 12.99 8 13.5V14H12V13.5C12 12.99 12.25 12.52 12.68 12.24C14.07 11.32 15 9.77 15 8C15 5.24 12.76 3 10 3Z"
        stroke="#73767b"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8 14H12V16C12 16.55 11.55 17 11 17H9C8.45 17 8 16.55 8 16V14Z"
        stroke="#73767b" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

// ── Shared nav badge container ─────────────────────────────────────────────────
// Figma: border 1px #73767b  radius 4px  h-32px  flex items-center justify-center

function NavBadge({
  children,
  onClick,
  disabled,
  width,
  style,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  width?: number;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        border:          "1px solid #73767b",
        borderRadius:    4,
        height:          32,
        width:           width,
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        gap:             4,
        paddingLeft:     6,
        paddingRight:    6,
        background:      "transparent",
        cursor:          onClick ? "pointer" : "default",
        opacity:         disabled ? 0.35 : 1,
        flexShrink:      0,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PlayPageClient() {
  const router        = useRouter();
  const { puzzleId }  = useParams<{ puzzleId: string }>();
  const searchParams  = useSearchParams();
  const challengeMs   = searchParams.get("challenge");

  const {
    puzzle,
    difficulty,
    tiles,
    moveCount,
    elapsedMs,
    isStarted,
    isCompleted,
    isPaused,
    previewMode,
    hintsUsed,
    resetGame,
    resumeGame,
    togglePreview,
    useHint,
    setPuzzle,
  } = useGameStore();

  const { isOnboarded, isLoading } = useDeviceIdentity();

  // Tick the timer
  useTimer();

  // Scale frame to viewport — desktop only; mobile is plain responsive flow
  const [scale,    setScale]    = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setIsMobile(w < 768);
      setScale(Math.min(w / FRAME_W, h / FRAME_H));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isLoading && !isOnboarded) router.replace("/onboarding");
  }, [isLoading, isOnboarded, router]);

  // When game store is empty (direct URL / preview iframe), fetch puzzle from API
  const fetchStarted = useRef(false);
  const [isFetching, setIsFetching] = useState(false);
  const [notFound,   setNotFound]   = useState(false);

  useEffect(() => {
    if (puzzle || fetchStarted.current || !puzzleId) return;
    fetchStarted.current = true;
    setIsFetching(true);
    fetch("/api/puzzles")
      .then((r) => r.json())
      .then((data: { puzzles: Puzzle[] }) => {
        const found = (data.puzzles ?? []).find((p) => p.id === puzzleId);
        if (found) {
          setPuzzle(found, found.difficulty);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setIsFetching(false));
  }, [puzzle, puzzleId, setPuzzle]);

  const cfg         = DIFFICULTY_CONFIG[difficulty];
  const placedCount = useMemo(() => tiles.filter((t) => t.isPlaced).length, [tiles]);
  const totalCount  = tiles.length;
  const pct         = useMemo(() => getCompletionPercent(tiles), [tiles]);
  const hintsLeft   = Math.max(0, cfg.hintLimit - hintsUsed);
  const noHints     = cfg.hintLimit === 0;

  if (isFetching) {
    return (
      <div className="fixed inset-0 bg-[#0f0f10] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || (!puzzle && !isFetching)) {
    return (
      <div className="fixed inset-0 bg-[#0f0f10] flex items-center justify-center">
        <p className="text-white/40 font-sans text-sm">Puzzle not found.</p>
      </div>
    );
  }

  if (!puzzle) return null;

  // ── Mobile layout — Figma node 21:341, converted to responsive flow ──────
  // (no scaled 440×926 frame — that let the board letterbox to <full width
  // on shorter viewports, inconsistent with champions/club/leaderboard mobile,
  // which all use plain margin/padding-based full-width layout.)
  //
  //  Content container: padding 84/16/40  flex-col gap:41
  //    └─ Section 1 (flex-col gap:56):
  //         nav row  — back (52×32) + [eye (32×32), hint badge]
  //         info row — [title Boldonse16 + difficulty cfg.color] / [moves Geist24 + timer GeistMono48 h:56 w:109]
  //    └─ PuzzleBoard (no fixed size — auto-fits its full-width container)
  //    └─ Progress bar (labels 16px / track h:12 #252627 / fill #fcff3f)
  //    └─ RESTART (bg #252627 / rounded-1000 / Boldonse 16px #929498)
  // ───────────────────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="min-h-screen overflow-y-auto bg-[#0f0f10]">
        <div style={{ padding: "84px 16px 40px", display: "flex", flexDirection: "column", gap: 41 }}>

          {/* ── Section 1: nav + info (gap:56) ───────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 56 }}>

            {/* Nav — back left, [eye + hint] right */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <NavBadge width={52} onClick={() => router.back()}>
                <ArrowLeftIcon />
              </NavBadge>
              <div style={{ display: "flex", gap: 8 }}>
                <NavBadge width={32} onClick={togglePreview}>
                  <EyeIcon active={previewMode} />
                </NavBadge>
                <NavBadge
                  onClick={noHints || hintsLeft === 0 ? undefined : useHint}
                  disabled={isCompleted || noHints || hintsLeft === 0}
                  style={{ paddingLeft: 4, paddingRight: 6, width: undefined }}
                >
                  <LightbulbIcon />
                  {!noHints && (
                    <span style={{ fontFamily: "var(--font-geist-mono), monospace", fontWeight: 500, fontSize: 14, letterSpacing: "-0.7px", color: "#929498" }}>
                      {hintsLeft}/{cfg.hintLimit}
                    </span>
                  )}
                </NavBadge>
              </div>
            </div>

            {/* Info row — title/difficulty left · moves/timer right */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", width: "100%" }}>
              <div style={{ flex: "1 0 0", minWidth: 0, display: "flex", flexDirection: "column" }}>
                <span style={{ fontFamily: "var(--font-boldonse), sans-serif", fontSize: 16, lineHeight: "normal", color: "#fff", wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
                  {puzzle.title}
                </span>
                <span style={{ fontFamily: "var(--font-geist-mono), monospace", fontWeight: 500, fontSize: 15, letterSpacing: "-0.75px", color: cfg.color }}>
                  {cfg.label}
                </span>
              </div>
              <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                <span style={{ fontFamily: "var(--font-geist-sans), sans-serif", fontWeight: 500, fontSize: 24, letterSpacing: "-1.2px", color: "#929498", whiteSpace: "nowrap" }}>
                  {moveCount} move{moveCount !== 1 ? "s" : ""}
                </span>
                <span style={{ fontFamily: "var(--font-geist-mono), monospace", fontWeight: 500, fontSize: 48, letterSpacing: "-2.4px", color: isStarted && !isCompleted ? "#fff" : "#929498", textAlign: "right", minWidth: 109, height: 56, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                  {formatTime(elapsedMs)}
                </span>
              </div>
            </div>
          </div>

          {/* ── Puzzle board — auto-sizes to fill the full-width container ── */}
          <PuzzleBoard imageUrl={puzzle.image_url} showProgress={false} />

          {/* ── Progress bar ──────────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "var(--font-geist-sans), sans-serif", fontWeight: 500, fontSize: 16, lineHeight: "24px" }}>
                <span style={{ color: pct > 0 ? "#fff" : "#73767b" }}>{pct}%</span>
                <span style={{ color: "#73767b" }}> complete</span>
              </span>
              <span style={{ fontFamily: "var(--font-geist-sans), sans-serif", fontWeight: 500, fontSize: 16, lineHeight: "24px", color: "#73767b", whiteSpace: "nowrap" }}>
                {placedCount}/{totalCount} tiles
              </span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={placedCount}
              aria-valuemin={0}
              aria-valuemax={totalCount}
              style={{ height: 12, borderRadius: 10, backgroundColor: "#252627", overflow: "hidden" }}
            >
              <div style={{ height: "100%", width: `${pct}%`, backgroundColor: "#fcff3f", borderRadius: 12, transition: "width 300ms ease-out" }} />
            </div>
          </div>

          {/* ── RESTART — bg #252627 / Boldonse 16px #929498 ────────────── */}
          <button
            onClick={resetGame}
            style={{ width: "100%", backgroundColor: "#252627", borderRadius: 1000, padding: "24px 20px", fontFamily: "var(--font-boldonse), sans-serif", fontSize: 16, lineHeight: "22px", letterSpacing: "-0.43px", color: "#929498", border: "none", cursor: "pointer", textAlign: "center" }}
          >
            RESTART
          </button>
        </div>

        {/* Hints-exhausted overlay — fixed to the viewport (no scaled frame) */}
        {isPaused && !isCompleted && (
          <>
            <div style={{ position: "fixed", inset: 0, backdropFilter: "blur(4px)", background: "rgba(22,22,22,0.9)", zIndex: 10 }} />
            <div style={{ position: "fixed", left: 24, right: 24, top: "50%", transform: "translateY(-50%)", background: "#0d0d0d", borderRadius: 24, padding: "32px 24px", zIndex: 11, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
              <Icon3D name="red-card" size={120} loading="eager" />
              <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center", textAlign: "center" }}>
                <span style={{ fontFamily: "var(--font-boldonse), sans-serif", fontSize: 20, color: "#fff" }}>
                  You&apos;re on your own
                </span>
                <span style={{ fontFamily: "var(--font-geist-sans), sans-serif", fontWeight: 500, fontSize: 15, lineHeight: "22px", color: "#929498" }}>
                  You have exhausted your hints.<br />Don&apos;t worry, we paused the time
                </span>
              </div>
              <button
                onClick={resumeGame}
                style={{ width: "100%", background: "#252627", borderRadius: 1000, padding: "20px 16px", fontFamily: "var(--font-boldonse), sans-serif", fontSize: 16, color: "#fff", border: "none", cursor: "pointer" }}
              >
                CONTINUE
              </button>
            </div>
          </>
        )}

        {/* Victory */}
        {isCompleted && (
          <VictoryScreen onReplay={resetGame} onHome={() => router.push("/champions")} />
        )}
      </div>
    );
  }

  // ── Desktop layout ──────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 overflow-hidden bg-[#0f0f10] flex items-center justify-center">

      {/* ── Scaled Figma frame ──────────────────────────────────────────── */}
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

        {/* ── Nav bar — centred, width capped at CONTENT_W (648px) ──────── */}
        <div
          style={{
            position:       "absolute",
            left:           "50%",
            top:            57,
            transform:      "translateX(-50%)",
            width:          CONTENT_W,
            display:        "flex",
            alignItems:     "flex-start",
            justifyContent: "space-between",
          }}
        >
          {/* Back — 52×32px bordered button with ← */}
          <NavBadge width={52} onClick={() => router.back()}>
            <ArrowLeftIcon />
          </NavBadge>

          {/* Right — eye + hint badges, gap 8 */}
          <div style={{ display: "flex", gap: 8 }}>
            {/* Preview toggle */}
            <NavBadge width={32} onClick={togglePreview}>
              <EyeIcon active={previewMode} />
            </NavBadge>

            {/* Hint badge — lightbulb + "X/Y" count */}
            <NavBadge
              onClick={noHints || hintsLeft === 0 ? undefined : useHint}
              disabled={isCompleted || noHints || hintsLeft === 0}
              style={{ paddingLeft: 4, paddingRight: 6, width: undefined }}
            >
              <LightbulbIcon />
              {!noHints && (
                <span
                  style={{
                    fontFamily:    "var(--font-geist-mono), monospace",
                    fontWeight:    500,
                    fontSize:      14,
                    lineHeight:    "normal",
                    letterSpacing: "-0.7px",
                    color:         "#929498",
                  }}
                >
                  {hintsLeft}/{cfg.hintLimit}
                </span>
              )}
            </NavBadge>
          </div>
        </div>

        {/* ── Content — cx=720  top=200  flex-col  gap=41  items-center ── */}
        <div
          style={{
            position:      "absolute",
            left:          "50%",
            top:           200,
            transform:     "translateX(-50%)",
            width:         CONTENT_W,
            display:       "flex",
            flexDirection: "column",
            alignItems:    "center",
            gap:           41,
          }}
        >

          {/* ── Info row — fills CONTENT_W (matches nav above); the board
              itself stays a fixed BOARD_SIZE square, centred below ──── */}
          <div
            style={{
              width:          "100%",
              display:        "flex",
              gap:            32,
              alignItems:     "center",
              justifyContent: "center",
            }}
          >
            {/* Left flex-1 — title + difficulty */}
            <div style={{ flex: "1 0 0", minWidth: 0, display: "flex", flexDirection: "column" }}>
              {/* Boldonse 16px / white / word-wrap */}
              <span
                style={{
                  fontFamily:    "var(--font-boldonse), sans-serif",
                  fontSize:      16,
                  lineHeight:    "normal",
                  color:         "#fff",
                  wordBreak:     "break-word",
                  whiteSpace:    "pre-wrap",
                }}
              >
                {puzzle.title}
              </span>
              {/* Geist Mono Medium 15px / #929498 / tracking -0.75px */}
              <span
                style={{
                  fontFamily:    "var(--font-geist-mono), monospace",
                  fontWeight:    500,
                  fontSize:      15,
                  lineHeight:    "normal",
                  letterSpacing: "-0.75px",
                  color:         "#929498",
                }}
              >
                {cfg.label}
              </span>
            </div>

            {/* Right — moves + timer (right-aligned) */}
            <div
              style={{
                flexShrink:    0,
                display:       "flex",
                flexDirection: "column",
                alignItems:    "flex-end",
              }}
            >
              {/* Geist Medium 24px / #929498 / tracking -1.2px */}
              <span
                style={{
                  fontFamily:    "var(--font-geist-sans), sans-serif",
                  fontWeight:    500,
                  fontSize:      24,
                  lineHeight:    "normal",
                  letterSpacing: "-1.2px",
                  color:         "#929498",
                  whiteSpace:    "nowrap",
                }}
              >
                {moveCount} move{moveCount !== 1 ? "s" : ""}
              </span>
              {/* Geist Mono Medium 48px — white once started, grey before */}
              <span
                style={{
                  fontFamily:    "var(--font-geist-mono), monospace",
                  fontWeight:    500,
                  fontSize:      48,
                  lineHeight:    "normal",
                  letterSpacing: "-2.4px",
                  color:         isStarted && !isCompleted ? "#fff" : "#929498",
                  textAlign:     "right",
                }}
              >
                {formatTime(elapsedMs)}
              </span>
            </div>
          </div>

          {/* ── Puzzle board — fixed 408×408 px ──────────────────────── */}
          <PuzzleBoard
            imageUrl={puzzle.image_url}
            size={BOARD_SIZE}
            showProgress={false}
          />

          {/* ── Bottom controls — flex-col  gap=32  shrink-0 ─────────── */}
          <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 32 }}>

            {/* Progress bar — Figma: 29:3674 — labels 16px, track h=12 ── */}
            <div style={{ width: CONTENT_W, display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Labels */}
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                {/* "20%" in white, " complete" in grey — matches Figma ongoing state */}
                <span
                  style={{
                    fontFamily: "var(--font-geist-sans), sans-serif",
                    fontWeight: 500,
                    fontSize:   16,
                    lineHeight: "24px",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span style={{ color: pct > 0 ? "#fff" : "#73767b" }}>{pct}%</span>
                  <span style={{ color: "#73767b" }}> complete</span>
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-geist-sans), sans-serif",
                    fontWeight: 500,
                    fontSize:   16,
                    lineHeight: "24px",
                    color:      "#73767b",
                    whiteSpace: "nowrap",
                  }}
                >
                  {placedCount}/{totalCount} tiles
                </span>
              </div>
              {/* Track — h=12  rounded=10  bg #252627  fill #fcff3f */}
              <div
                role="progressbar"
                aria-valuenow={placedCount}
                aria-valuemin={0}
                aria-valuemax={totalCount}
                style={{
                  position:        "relative",
                  width:           "100%",
                  height:          12,
                  borderRadius:    10,
                  backgroundColor: "#252627",
                  overflow:        "hidden",
                }}
              >
                <div
                  style={{
                    position:        "absolute",
                    left:            0,
                    top:             0,
                    height:          "100%",
                    width:           `${pct}%`,
                    backgroundColor: "#fcff3f",
                    borderRadius:    12,
                    transition:      "width 300ms ease-out",
                  }}
                />
              </div>
            </div>

            {/* RESTART button — Figma 29:3682 — bg #252627  rounded-1000  Boldonse 16px  #929498 */}
            <button
              onClick={resetGame}
              style={{
                width:           CONTENT_W,
                backgroundColor: "#252627",
                borderRadius:    1000,
                padding:         "24px 20px",
                fontFamily:      "var(--font-boldonse), sans-serif",
                fontSize:        16,
                lineHeight:      "22px",
                letterSpacing:   "-0.43px",
                color:           "#929498",
                border:          "none",
                cursor:          "pointer",
                textAlign:       "center",
              }}
            >
              RESTART
            </button>
          </div>
        </div>

        {/* ── Hints-exhausted overlay — Figma node 50:2576 ─────────────── */}
        {/* Shows when isPaused (last hint consumed) and puzzle not yet solved  */}
        {isPaused && !isCompleted && (
          <>
            {/* Backdrop — blur + dark tint over the full 1440×1024 frame */}
            <div
              style={{
                position:       "absolute",
                inset:          0,
                backdropFilter: "blur(4px)",
                background:     "rgba(22,22,22,0.9)",
                zIndex:         10,
              }}
            />

            {/* Modal card — 440×465 px, centred */}
            {/* Figma: left 50%, top calc(50%+0.5px), translate(-50%,-50%), bg #0d0d0d, rounded-24 */}
            <div
              style={{
                position:       "absolute",
                left:           "50%",
                top:            "calc(50% + 0.5px)",
                transform:      "translate(-50%, -50%)",
                width:          440,
                height:         465,
                background:     "#0d0d0d",
                borderRadius:   24,
                zIndex:         11,
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
              }}
            >
              {/* Inner content — 382×395 px */}
              <div
                style={{
                  width:          382,
                  height:         395,
                  display:        "flex",
                  flexDirection:  "column",
                  alignItems:     "center",
                  justifyContent: "space-between",
                }}
              >
                {/* Top: icon + text block */}
                <div
                  style={{
                    display:        "flex",
                    flexDirection:  "column",
                    gap:            16,
                    alignItems:     "center",
                    width:          "100%",
                  }}
                >
                  {/* 3D red card — 160×160px */}
                  <Icon3D name="red-card" size={160} loading="eager" />

                  {/* Text — gap 4 */}
                  <div
                    style={{
                      display:       "flex",
                      flexDirection: "column",
                      gap:           4,
                      alignItems:    "center",
                      textAlign:     "center",
                      width:         "100%",
                    }}
                  >
                    {/* "You're on your own" — Boldonse 20px white */}
                    <span
                      style={{
                        fontFamily: "var(--font-boldonse), sans-serif",
                        fontSize:   20,
                        lineHeight: "normal",
                        color:      "#fff",
                      }}
                    >
                      You&apos;re on your own
                    </span>
                    {/* Body — Geist Medium 16px / lh 24px / #929498 */}
                    <span
                      style={{
                        fontFamily: "var(--font-geist-sans), sans-serif",
                        fontWeight: 500,
                        fontSize:   16,
                        lineHeight: "24px",
                        color:      "#929498",
                        whiteSpace: "pre",
                      }}
                    >
                      {"You have exhausted your hints. \nDon’t worry, we paused the time"}
                    </span>
                  </div>
                </div>

                {/* CONTINUE — bg #252627 rounded-1000 Boldonse 16px white */}
                <button
                  onClick={resumeGame}
                  style={{
                    width:           "100%",
                    background:      "#252627",
                    borderRadius:    1000,
                    padding:         "24px 20px",
                    fontFamily:      "var(--font-boldonse), sans-serif",
                    fontSize:        16,
                    lineHeight:      "22px",
                    letterSpacing:   "-0.43px",
                    color:           "#fff",
                    border:          "none",
                    cursor:          "pointer",
                    textAlign:       "center",
                  }}
                >
                  CONTINUE
                </button>
              </div>
            </div>
          </>
        )}

      </div>

      {/* ── Victory overlay ───────────────────────────────────────────────
          Rendered as a sibling of the scaled frame, not inside it: that
          frame has `transform: scale(...)`, which makes it the containing
          block for any `position: fixed` descendant (per the CSS spec) —
          VictoryScreen's own fixed inset-0 overlay would then fill the
          1440×1024 frame box instead of the real viewport, leaving the
          page's #0f0f10 background exposed as bars on wider screens. ── */}
      {isCompleted && (
        <VictoryScreen
          onReplay={resetGame}
          onHome={() => router.push("/champions")}
        />
      )}
    </div>
  );
}
