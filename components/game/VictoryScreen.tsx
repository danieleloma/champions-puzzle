"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useGameStore } from "@/store/game-store";
import { useUserStore } from "@/store/user-store";
import { formatTime, calculateScore, calculateXP } from "@/lib/score-calculator";
import { getOrCreateDeviceId } from "@/lib/device-identity";
import { Icon3D } from "@/components/ui";

// ── Figma nodes: 30:1246 desktop (1440×1024) · 21:1418 mobile (440×926) ──────
//
//  Background: sky-blue (#87CEEB) + blurred cloud image
//
//  Desktop — 7 floating icons at 1440px-frame absolute positions
//  Mobile  — same 7 icons, same positions as the splash screen (440px frame):
//    flag             left=−198  top=495   c=446.279  i=333.54  deg=−26.1
//    stadium          left=266   top=518   c=251.076  i=239.089 deg=−2.95
//    jersey           left=220   top=−63   c=368.921  i=271.768 deg=+28.72
//    gloves           left=−169  top=−81   c=486.869  i=365.17  deg=−25.52
//    whistle          left=203   top=278   c=193.647  i=150.522 deg=−20.46
//    medal            left=−5    top=433   c=193.647  i=150.522 deg=−20.46
//    substitute-board left=100   top=727   c=399.692  i=288.846 deg=+33.09
//
//  Card column — w=408  flex-col  gap=16  centred at 50%/50%:
//  ├── Stats card  bg=#0d0d0d  rounded-16  px=24 pt=24 pb=32
//  │     stopwatch icon 160px centred
//  │     "Puzzle Complete"  Boldonse 20px  white
//  │     "#N Globally"      Geist Mono 15px  #929498  tracking −0.75px
//  │     stat rows (gap=12): label Geist Mono 15px #a7a9ad / value Geist 16px white
//  │     XP Earned value in #fcff3f
//  ├── Share row  gap=8  3× (bg=#0d0d0d rounded-16 px=24 py=16 flex-col gap=12)
//  │     icon 20px + label Geist 16px white
//  └── CTA row  gap=8  2× pill buttons (black / #cc261a)  Boldonse 16px  py=24
// ─────────────────────────────────────────────────────────────────────────────

interface VictoryScreenProps {
  onReplay: () => void;
  onHome:   () => void;
}

const FRAME_W  = 1440;
const FRAME_H  = 1024;
const MOBILE_W =  440;
const MOBILE_H =  926;

// ── FloatIcon ─────────────────────────────────────────────────────────────────

interface FloatIconProps {
  left:          number;
  top:           number;
  containerSize: number;
  imgSize:       number;
  deg:           number;
  name:          React.ComponentProps<typeof Icon3D>["name"];
}

function FloatIcon({ left, top, containerSize, imgSize, deg, name }: FloatIconProps) {
  return (
    <div
      style={{
        position:       "absolute",
        left,
        top,
        width:          containerSize,
        height:         containerSize,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        pointerEvents:  "none",
      }}
    >
      <div style={{ flexShrink: 0, transform: `rotate(${deg}deg)` }}>
        <Icon3D name={name} size={imgSize} loading="eager" />
      </div>
    </div>
  );
}

// ── Share icon SVGs ───────────────────────────────────────────────────────────

function LinkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M8.5 11.5a4.5 4.5 0 0 0 6.364 0l2-2a4.5 4.5 0 0 0-6.364-6.364l-1.115 1.115" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11.5 8.5a4.5 4.5 0 0 0-6.364 0l-2 2a4.5 4.5 0 0 0 6.364 6.364l1.115-1.115" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M11.59 8.49 17.24 2h-1.35L10.98 7.6 6.81 2H2l5.93 8.4L2 18h1.35l5.18-5.9L13.19 18H18L11.59 8.49Zm-1.83 2.09-.6-.85L3.38 3h2.06l3.86 5.42.6.84 5.02 7.07h-2.06L9.76 10.58Z" fill="white"/>
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path fillRule="evenodd" clipRule="evenodd" d="M10 2a8 8 0 0 0-6.93 11.97L2 18l4.15-1.05A8 8 0 1 0 10 2Zm0 14.5a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13Z" fill="white"/>
      <path d="M13.35 11.49c-.2-.1-1.17-.58-1.35-.64-.18-.07-.31-.1-.44.1s-.51.64-.63.77-.23.14-.43.05c-.2-.1-.85-.31-1.61-1.01-.6-.54-1-1.21-1.12-1.41s-.01-.3.09-.41c.09-.09.2-.23.3-.35.1-.12.13-.2.2-.33.07-.14.04-.25-.02-.35-.05-.1-.44-1.07-.6-1.46-.16-.38-.32-.33-.44-.34a7.9 7.9 0 0 0-.38-.007c-.13 0-.34.05-.52.25-.18.2-.68.66-.68 1.62s.7 1.88.8 2.01c.1.13 1.37 2.1 3.33 2.94.46.2.83.32 1.11.41.47.15.89.13 1.23.08.37-.06 1.15-.47 1.32-.93.16-.46.16-.85.11-.93-.05-.08-.18-.13-.38-.23Z" fill="white"/>
    </svg>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function VictoryScreen({ onReplay, onHome }: VictoryScreenProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { puzzle, difficulty, elapsedMs, moveCount, hintsUsed, sessionToken } = useGameStore();
  const { addXP } = useUserStore();

  const [rank,        setRank]        = useState<number | null>(null);
  const submittedRef = useRef(false);
  const [copied,      setCopied]      = useState(false);
  const [scale,       setScale]       = useState(1);
  const [mobileScale, setMobileScale] = useState(1);
  const [isMobile,    setIsMobile]    = useState(false);

  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setIsMobile(w < 768);
      setScale(Math.min(w / FRAME_W, h / FRAME_H));
      // Width-locked, not min(w,h) — same fix as app/landing & app/onboarding:
      // "contain" scaling leaves dead space down both sides on short/wide
      // viewports. Fills the screen edge-to-edge and scrolls (below) instead.
      setMobileScale(w / MOBILE_W);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  useEffect(() => {
    async function animate() {
      const anime = (await import("animejs")).default;
      const el = cardRef.current;
      if (!el) return;
      anime.timeline({ easing: "easeOutExpo" })
        .add({ targets: el,                              scale: [0.92, 1], opacity: [0, 1], duration: 500 })
        .add({ targets: el.querySelectorAll(".v-stat"),  translateY: [10, 0], opacity: [0, 1], duration: 350, delay: anime.stagger(55) }, "-=200")
        .add({ targets: el.querySelector(".v-share"),    translateY: [10, 0], opacity: [0, 1], duration: 300 }, "-=100")
        .add({ targets: el.querySelector(".v-cta"),      translateY: [10, 0], opacity: [0, 1], duration: 300 }, "-=100");
    }
    animate();
  }, []);

  useEffect(() => {
    if (submittedRef.current || !sessionToken) return;
    const state = useGameStore.getState();
    const { user } = useUserStore.getState();
    if (!state.puzzle || !user) return;
    submittedRef.current = true;

    const device_id = getOrCreateDeviceId();
    const payload = {
      puzzle_id: state.puzzle.id,
      difficulty: state.difficulty,
      completion_time_ms: state.elapsedMs,
      move_count: state.moveCount,
      hints_used: state.hintsUsed,
      device_id,
      session_token: sessionToken,
    };
    fetch("/api/scores", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.new_rank) setRank(data.new_rank);
        if (data.xp_earned) addXP(data.xp_earned);
      })
      .catch(() => {});
  }, [sessionToken, addXP]);

  if (!puzzle) return null;

  const shareText = `I just solved the "${puzzle.title}" Arsenal puzzle in ${formatTime(elapsedMs)} on ${difficulty} difficulty! Can you beat me? ⚽`;
  const shareUrl  = `${typeof window !== "undefined" ? window.location.origin : ""}/play/${puzzle.id}?challenge=${elapsedMs}`;

  const score    = calculateScore({ difficulty, completionTimeMs: elapsedMs, moveCount, hintsUsed });
  const xpEarned = calculateXP({ difficulty, completionTimeMs: elapsedMs, hintsUsed, score });

  const stats = [
    { label: "Time",       value: formatTime(elapsedMs),                                            xp: false },
    { label: "Score",      value: score.toLocaleString(),                                           xp: false },
    { label: "Moves",      value: moveCount.toString(),                                             xp: false },
    { label: "Difficulty", value: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),        xp: false },
    { label: "XP Earned",  value: `+${xpEarned} XP`,                                              xp: true  },
  ];

  async function handleCopy() {
    await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  function handleXShare()   { window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, "_blank"); }
  function handleWhatsApp() { window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`, "_blank"); }

  // ── Shared card JSX (used in both layouts) ──────────────────────────────────

  const cardContent = (
    <div
      ref={cardRef}
      style={{
        width:   408,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        opacity: 0,
      }}
    >
      {/* Stats card */}
      <div
        style={{
          backgroundColor: "#0d0d0d",
          borderRadius:    16,
          padding:         "24px 24px 32px",
          display:         "flex",
          flexDirection:   "column",
          gap:             24,
          alignItems:      "center",
          width:           "100%",
        }}
      >
        {/* Stopwatch */}
        <Icon3D name="stopwatch" size={160} loading="eager" />

        {/* Title + rank */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 0 }}>
          <p style={{ fontFamily: "var(--font-boldonse), sans-serif", fontSize: 20, lineHeight: "normal", color: "#fff", margin: 0 }}>
            Puzzle Complete
          </p>
          {rank !== null && (
            <p style={{ fontFamily: "var(--font-geist-mono), monospace", fontWeight: 500, fontSize: 15, lineHeight: "normal", letterSpacing: "-0.75px", color: "#929498", margin: "4px 0 0", textShadow: "0px 4px 24px black" }}>
              #{rank} Globally
            </p>
          )}
        </div>

        {/* Stat rows */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
          {stats.map((s) => (
            <div key={s.label} className="v-stat" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", opacity: 0 }}>
              <span style={{ fontFamily: "var(--font-geist-mono), monospace", fontWeight: 500, fontSize: 15, letterSpacing: "-0.75px", color: "#a7a9ad" }}>
                {s.label}
              </span>
              <span style={{ fontFamily: "var(--font-geist-sans), sans-serif", fontWeight: 500, fontSize: 16, letterSpacing: "-0.48px", color: s.xp ? "#fcff3f" : "#fff", lineHeight: 1.4 }}>
                {s.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Share buttons */}
      <div className="v-share" style={{ display: "flex", gap: 8, opacity: 0 }}>
        {[
          { label: copied ? "Copied!" : "Copy Link", icon: <LinkIcon />,     onClick: handleCopy    },
          { label: "X",                               icon: <XIcon />,        onClick: handleXShare  },
          { label: "WhatsApp",                        icon: <WhatsAppIcon />, onClick: handleWhatsApp },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={btn.onClick}
            style={{
              flex:            "1 0 0",
              backgroundColor: "#0d0d0d",
              borderRadius:    16,
              padding:         "16px 24px",
              display:         "flex",
              flexDirection:   "column",
              alignItems:      "center",
              gap:             12,
              border:          "none",
              cursor:          "pointer",
            }}
          >
            {btn.icon}
            <span style={{ fontFamily: "var(--font-geist-sans), sans-serif", fontWeight: 500, fontSize: 16, letterSpacing: "-0.48px", color: "#fff", lineHeight: 1.4, whiteSpace: "nowrap" }}>
              {btn.label}
            </span>
          </button>
        ))}
      </div>

      {/* CTA buttons */}
      <div className="v-cta" style={{ display: "flex", gap: 8, opacity: 0 }}>
        <button
          onClick={onReplay}
          style={{ flex: "1 0 0", backgroundColor: "#000", borderRadius: 1000, padding: "24px 20px", fontFamily: "var(--font-boldonse), sans-serif", fontSize: 16, lineHeight: "22px", letterSpacing: "-0.43px", color: "#fff", border: "none", cursor: "pointer" }}
        >
          REPLAY
        </button>
        <button
          onClick={onHome}
          style={{ flex: "1 0 0", backgroundColor: "#cc261a", borderRadius: 1000, padding: "24px 20px", fontFamily: "var(--font-boldonse), sans-serif", fontSize: 16, lineHeight: "22px", letterSpacing: "-0.43px", color: "#fff", border: "none", cursor: "pointer" }}
        >
          MORE PUZZLES
        </button>
      </div>
    </div>
  );

  // ── Mobile layout — Figma node 21:1418 (440 × 926) ────────────────────────
  // Scrollable overlay, not fixed/overflow-hidden + centred: on a short/wide
  // viewport a width-locked scale can render the frame taller than the
  // viewport, and this card sits at 50%/50% within it — cropping instead of
  // scrolling would risk clipping the card itself. Same fix as app/landing
  // & app/onboarding.
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden flex justify-center" style={{ background: "#87CEEB" }}>

        {/* Cloud bg — fixed, fills viewport regardless of scroll/frame size */}
        <div className="fixed inset-0 pointer-events-none" style={{ filter: "blur(15px)", opacity: 0.6, zIndex: 0 }}>
          <Image src="/splash/bg-clouds.webp" alt="" fill sizes="100vw" style={{ objectFit: "cover" }} />
        </div>

        {/* Spacer sized to the scaled frame height — transform doesn't shrink
            layout footprint, so this keeps the scroll region correct. */}
        <div style={{ width: MOBILE_W * mobileScale, height: MOBILE_H * mobileScale, position: "relative", zIndex: 1 }}>
        <div
          style={{
            width:           MOBILE_W,
            height:          MOBILE_H,
            position:        "absolute",
            top:             0,
            left:            0,
            transform:       `scale(${mobileScale})`,
            transformOrigin: "top left",
          }}
        >
          {/* 7 floating icons — same positions as splash screen */}
          <FloatIcon name="flag"             left={-198} top={495} containerSize={446.279} imgSize={333.54}  deg={-26.1}  />
          <FloatIcon name="stadium"          left={266}  top={518} containerSize={251.076} imgSize={239.089} deg={-2.95}  />
          <FloatIcon name="jersey"           left={220}  top={-63} containerSize={368.921} imgSize={271.768} deg={28.72}  />
          <FloatIcon name="gloves"           left={-169} top={-81} containerSize={486.869} imgSize={365.17}  deg={-25.52} />
          <FloatIcon name="whistle"          left={203}  top={278} containerSize={193.647} imgSize={150.522} deg={-20.46} />
          <FloatIcon name="medal"            left={-5}   top={433} containerSize={193.647} imgSize={150.522} deg={-20.46} />
          <FloatIcon name="substitute-board" left={100}  top={727} containerSize={399.692} imgSize={288.846} deg={33.09}  />

          {/* Card — centred at 50% / 50% */}
          <div
            style={{
              position:  "absolute",
              left:      "50%",
              top:       "50%",
              transform: "translate(-50%, -50%)",
              zIndex:    10,
            }}
          >
            {cardContent}
          </div>

          {/* Home indicator — #1d1e25 per Figma */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 21, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 8, zIndex: 5 }}>
            <div style={{ width: 134, height: 5, borderRadius: 100, background: "#1d1e25" }} />
          </div>
        </div>
        </div>
      </div>
    );
  }

  // ── Desktop layout — Figma 1440 × 1024 scaled frame ────────────────────────
  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center" style={{ background: "#87CEEB" }}>

      {/* Cloud background — stretches edge-to-edge */}
      <div className="absolute inset-0 pointer-events-none" style={{ filter: "blur(15px)", opacity: 0.6 }}>
        <Image src="/splash/bg-clouds.webp" alt="" fill sizes="100vw" style={{ objectFit: "cover" }} />
      </div>

      {/* Scaled Figma frame — icons + card */}
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
        {/* ── 7 floating 3D icons at Figma positions ─────────────────── */}
        <FloatIcon name="flag"             left={20}     top={481} containerSize={446.279} imgSize={333.54}  deg={-26.1}  />
        <FloatIcon name="stadium"          left={1053}   top={472} containerSize={251.076} imgSize={239.089} deg={-2.95}  />
        <FloatIcon name="jersey"           left={995}    top={-14} containerSize={368.921} imgSize={271.768} deg={28.72}  />
        <FloatIcon name="gloves"           left={380.43} top={-31} containerSize={486.869} imgSize={365.17}  deg={-25.52} />
        <FloatIcon name="whistle"          left={802.82} top={278} containerSize={193.647} imgSize={150.522} deg={-20.46} />
        <FloatIcon name="medal"            left={594.82} top={433} containerSize={193.647} imgSize={150.522} deg={-20.46} />
        <FloatIcon name="substitute-board" left={741.85} top={666} containerSize={399.692} imgSize={288.846} deg={33.09}  />

        {/* ── Card column — cx=720  top=calc(50%−22px) ─────────────────── */}
        <div
          style={{
            position:  "absolute",
            left:      "50%",
            top:       "calc(50% - 22px)",
            transform: "translate(-50%, -50%)",
          }}
        >
          {cardContent}
        </div>
      </div>
    </div>
  );
}
