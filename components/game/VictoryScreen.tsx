"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
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
//  ├── Share row — single full-width button (bg=#0d0d0d rounded-16 px=24 py=16)
//  │     link icon 20px + "Challenge a Friend" label Geist 16px white
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
  // Gentle infinite bob — a separate wrapper div from the rotated one below,
  // since GSAP owns the whole `transform` property on whatever it animates
  // and would otherwise fight the static `rotate(deg)` for the same node.
  // Duration/delay are derived from each icon's own position/angle so the
  // seven icons drift out of phase instead of bobbing in robotic unison.
  const floatRef = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    gsap.to(floatRef.current, {
      y:        -(10 + (Math.abs(deg) % 6)),
      duration: 2.4 + (Math.abs(left + top) % 10) / 10,
      delay:    (Math.abs(left) % 10) / 10,
      ease:     "sine.inOut",
      yoyo:     true,
      repeat:   -1,
    });
  }, { scope: floatRef });

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
      <div ref={floatRef}>
        <div style={{ flexShrink: 0, transform: `rotate(${deg}deg)` }}>
          <Icon3D name={name} size={imgSize} loading="eager" />
        </div>
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

// ── Page ──────────────────────────────────────────────────────────────────────

export function VictoryScreen({ onReplay, onHome }: VictoryScreenProps) {
  const cardRef      = useRef<HTMLDivElement>(null);
  const shareBlobRef = useRef<Blob | null>(null);
  const { puzzle, difficulty, elapsedMs, moveCount, hintsUsed, sessionToken, challenge } = useGameStore();
  const { user, addXP } = useUserStore();

  const [rank,        setRank]        = useState<number | null>(null);
  const [submitError, setSubmitError] = useState(false);
  const submittedRef = useRef(false);
  const [copied,      setCopied]      = useState(false);
  const [scale,       setScale]       = useState(1);
  const [mobileScale, setMobileScale] = useState(1);
  const [isMobile,    setIsMobile]    = useState(false);

  // Computed early (rather than after the `if (!puzzle)` guard below) so
  // the prefetch effect can depend on them — they only need difficulty/
  // elapsedMs/moveCount/hintsUsed, all already available from the store.
  const score    = calculateScore({ difficulty, completionTimeMs: elapsedMs, moveCount, hintsUsed });
  const xpEarned = calculateXP({ difficulty, completionTimeMs: elapsedMs, hintsUsed, score });

  // Renders a purpose-built "Can you beat my time?" card server-side (Figma
  // node 191:1349 — distinct from the "Puzzle Complete" card the player
  // sees on-screen) via /api/share-card, and caches the resulting JPEG so
  // tapping "Challenge a Friend" doesn't wait on it mid-click. This used to
  // be a client-side html2canvas screenshot of a hidden DOM node, but in
  // production that raced the Boldonse/Geist webfonts and the stopwatch
  // icon actually being loaded at capture time — real shares went out with
  // tofu-box text and a blank icon. Rendering server-side with sharp has no
  // such race: the route draws plain SVG text and pulls the icon from this
  // deployment's own static assets before compositing, so what comes back
  // is deterministic regardless of the browser's font-loading state.
  async function prefetchShareImage() {
    const params = new URLSearchParams({
      time:       formatTime(elapsedMs),
      score:      score.toLocaleString(),
      moves:      String(moveCount),
      difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
      xp:         String(xpEarned),
    });
    if (rank !== null) params.set("rank", String(rank));
    try {
      const res = await fetch(`/api/share-card?${params.toString()}`);
      if (!res.ok) return;
      const blob = await res.blob();
      shareBlobRef.current = blob;
      (window as unknown as { __TEST_lastShareBlob?: Blob }).__TEST_lastShareBlob = blob;
    } catch {
      // Sharing still works without an attached image — see handleShare.
    }
  }

  // Fires once immediately on mount (rank is still null then) so the image
  // is ready well before a player finds the share button, then again once
  // the score submission below resolves and rank is known — that second
  // fetch overwrites shareBlobRef with a version that includes "#N
  // Globally". If the player taps share in between, they just get the
  // rank-less version instantly rather than waiting on the network.
  useEffect(() => {
    if (!puzzle) return;
    prefetchShareImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzle, rank]);

  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setIsMobile(w < 768);
      setScale(Math.min(w / FRAME_W, h / FRAME_H));
      // Contain (min of both ratios), not width-locked: the whole overlay is
      // fixed to the viewport with no scrolling, so the frame must always
      // fit within the shorter dimension too, or content would get clipped
      // instead of scrolled into view. Centred below, so any resulting
      // side/top-bottom space reads as letterboxing, not a layout bug.
      setMobileScale(Math.min(w / MOBILE_W, h / MOBILE_H));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  // isMobile starts false (no `window` during SSR) and flips to its real
  // value a moment after mount, which swaps this component's whole JSX
  // branch (desktop <-> mobile) — React unmounts the first branch's card
  // element and mounts a fresh one. Without `isMobile` as a dependency this
  // effect only fires once, animating whichever card happened to exist on
  // that very first commit — usually the desktop one, which then gets
  // destroyed a moment later, leaving the real (mobile) card permanently
  // stuck at its initial opacity:0. Depending on isMobile makes it re-fire
  // against whatever card element is actually current after that swap.
  useGSAP(() => {
    const el = cardRef.current;
    if (!el) return;
    gsap.timeline({ defaults: { ease: "expo.out" } })
      .fromTo(el,                              { scale: 0.92, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5 })
      .fromTo(el.querySelector(".v-result"),   { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 }, "-=0.25")
      .fromTo(el.querySelectorAll(".v-stat"),  { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, stagger: 0.055 }, "-=0.15")
      .fromTo(el.querySelector(".v-share"),    { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 }, "-=0.1")
      .fromTo(el.querySelector(".v-cta"),      { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 }, "-=0.1");
  }, { scope: cardRef, dependencies: [isMobile] });

  // Lock body scroll while this overlay is up — without this, a scroll
  // gesture on top of the fixed overlay can still scroll the page
  // underneath, which on mobile browsers changes window.innerHeight as the
  // address bar collapses/expands, visibly jumping the frame's scale.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prevOverflow; };
  }, []);

  useEffect(() => {
    if (submittedRef.current || !sessionToken) return;
    const state = useGameStore.getState();
    const { user, setUser } = useUserStore.getState();
    if (!state.puzzle || !user) return;
    submittedRef.current = true;

    const device_id = getOrCreateDeviceId();
    const payload = {
      puzzle_id: state.puzzle.id,
      difficulty: state.difficulty,
      completion_time_ms: state.elapsedMs,
      device_id,
      session_token: sessionToken,
      // Server replays this against the session's server-issued shuffle to
      // confirm the puzzle was actually, legally solved — see
      // lib/anti-cheat.ts validateScore / lib/puzzle-engine.ts replayMoveLog.
      move_log: state.moveLog,
    };

    async function submitScore() {
      const res = await fetch("/api/scores", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      return { res, data };
    }

    submitScore()
      .then(async ({ res, data }) => {
        // A device the server has no record of (device_id valid, but no
        // matching users row) — e.g. localStorage still says "onboarded"
        // from before an account got removed server-side. Re-register the
        // same username under this device_id (idempotent: /api/users just
        // returns the existing row if one already matches) and retry once,
        // rather than let an otherwise-legitimate run silently not count.
        if (res.status === 404) {
          const reg = await fetch("/api/users", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ username: user.username, device_id }),
          }).then((r) => (r.ok ? r.json() : null)).catch(() => null);

          if (reg?.id) {
            setUser(reg);
            return submitScore();
          }
        }
        return { res, data };
      })
      .then(({ res, data }) => {
        if (!res.ok) {
          // 422 (anti-cheat rejection), 409 (already-submitted session), or
          // a network blip — whatever the cause, the player should see
          // *something* rather than a run that silently doesn't count.
          // See the rendered submitError line below.
          setSubmitError(true);
          return;
        }
        if (data?.new_rank) setRank(data.new_rank);
        if (data?.xp_earned) addXP(data.xp_earned);
      })
      .catch(() => setSubmitError(true));
  }, [sessionToken, addXP]);

  if (!puzzle) return null;

  const shareParams = new URLSearchParams({ challenge: String(elapsedMs), difficulty });
  if (user?.username) shareParams.set("from", user.username);
  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/play/${puzzle.id}?${shareParams.toString()}`;

  // Result vs. the friend's time this puzzle was opened to beat, if any.
  const beatChallenge = challenge ? elapsedMs <= challenge.targetMs : null;

  // Score/XP shown here are computed client-side for instant display, but
  // if the submission was rejected/failed (see submitError above) they were
  // never actually credited — showing them as if they counted would be
  // actively misleading right next to the "couldn't be saved" message.
  const stats = [
    { label: "Time",       value: formatTime(elapsedMs),                                            xp: false },
    { label: "Score",      value: submitError ? "Not saved" : score.toLocaleString(),                xp: false },
    { label: "Moves",      value: moveCount.toString(),                                             xp: false },
    { label: "Difficulty", value: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),        xp: false },
    { label: "XP Earned",  value: submitError ? "Not saved" : `+${xpEarned} XP`,                    xp: !submitError },
  ];

  // Challenge a Friend: attaches the server-rendered "Can you beat my
  // time?" card (see prefetchShareImage above) to the native share sheet,
  // plus a caption inviting the recipient to beat this run's time — same
  // pattern as YouTube Music's "Share Lyrics" flow (a branded image file +
  // text/link, not a bare URL relying on the receiving app's own link-
  // preview crawler). The image is normally already sitting in
  // shareBlobRef by the time this runs (prefetched in the background as
  // soon as the puzzle completed); if it isn't ready yet, this waits up to
  // 1.5s before giving up on the image and sharing text-only, so a slow
  // fetch can't stall the tap past the browser's user-activation window.
  // Falls back to a plain clipboard copy wherever navigator.share isn't
  // supported (most desktop browsers).
  const shareText = `I solved "${puzzle.title}" in ${formatTime(elapsedMs)} — think you can beat it? ${shareUrl}`;

  async function handleShare() {
    let file: File | null = null;
    if (typeof navigator.canShare === "function") {
      if (!shareBlobRef.current) {
        await Promise.race([prefetchShareImage(), new Promise((r) => setTimeout(r, 1500))]);
      }
      if (shareBlobRef.current) {
        const candidate = new File([shareBlobRef.current], "champions-puzzle.jpg", { type: shareBlobRef.current.type || "image/jpeg" });
        if (navigator.canShare({ files: [candidate] })) file = candidate;
      }
    }

    if (navigator.share) {
      try {
        await navigator.share(file ? { files: [file], text: shareText } : { text: shareText });
        return;
      } catch (err) {
        // AbortError = user dismissed the share sheet — respect that
        // instead of silently copying to clipboard behind their back.
        if (err instanceof Error && err.name === "AbortError") return;
      }
    }
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

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
      {/* Challenge result — only when this puzzle was opened via a "beat my time" link */}
      {challenge && (
        <div
          className="v-result"
          style={{
            backgroundColor: "#0d0d0d",
            borderRadius:    16,
            padding:         "12px 16px",
            border:          `1px solid ${beatChallenge ? "#22c55e" : "#cc261a"}`,
            fontFamily:      "var(--font-geist-sans), sans-serif",
            fontWeight:      500,
            fontSize:        14,
            lineHeight:      "20px",
            color:           "#fff",
            textAlign:       "center",
            opacity:         0,
          }}
        >
          {beatChallenge
            ? `🏆 You beat ${challenge.fromUsername}'s time by ${formatTime(challenge.targetMs - elapsedMs)}!`
            : `${challenge.fromUsername}'s time still stands — you were ${formatTime(elapsedMs - challenge.targetMs)} slower.`}
        </div>
      )}

      {/* Stats card — player-facing "Puzzle Complete" (Figma 30:1246 / 21:1418).
          Not the share image — that's rendered server-side, see
          prefetchShareImage/handleShare above. */}
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
          {submitError && (
            <p style={{ fontFamily: "var(--font-geist-mono), monospace", fontWeight: 500, fontSize: 13, lineHeight: "normal", letterSpacing: "-0.65px", color: "#929498", margin: "4px 0 0", textShadow: "0px 4px 24px black" }}>
              Score couldn&apos;t be saved — check your connection and try replaying.
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

      {/* Share — one button, framed as a challenge rather than a plain share */}
      <div className="v-share" style={{ display: "flex", opacity: 0 }}>
        <button
          onClick={handleShare}
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
          <LinkIcon />
          <span style={{ fontFamily: "var(--font-geist-sans), sans-serif", fontWeight: 500, fontSize: 16, letterSpacing: "-0.48px", color: "#fff", lineHeight: 1.4, whiteSpace: "nowrap" }}>
            {copied ? "Copied!" : "Challenge a Friend"}
          </span>
        </button>
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
  // Fixed to the viewport, no scrolling: the frame is scaled to *contain*
  // within the viewport (mobileScale = min of both ratios, see above) so it
  // never exceeds the visible height, and it's centred as a whole rather
  // than anchored top-left — the card sits at 50%/50% of the frame, which
  // now coincides with the true viewport centre.
  //
  // Both branches below are portaled straight into document.body (see
  // ImagePreviewModal's comment for the transform/containing-block half of
  // this) — VictoryScreen is mounted from inside PlayPageClient's own DOM
  // subtree, and rendering `position: fixed` in place there is exactly the
  // class of bug that made the card effectively unreachable on mobile.
  if (isMobile) {
    return createPortal(
      <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center" style={{ background: "#87CEEB" }}>
        {/* Cloud bg — fixed, fills viewport regardless of frame size */}
        <div className="fixed inset-0 pointer-events-none" style={{ filter: "blur(15px)", opacity: 0.6, zIndex: 0 }}>
          <Image src="/splash/bg-clouds.webp" alt="" fill sizes="100vw" style={{ objectFit: "cover" }} />
        </div>

        <div
          style={{
            width:     MOBILE_W,
            height:    MOBILE_H,
            position:  "absolute",
            left:      "50%",
            top:       "50%",
            transform: `translate(-50%, -50%) scale(${mobileScale})`,
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

          {/* Card — centred at 50% / 50% of the frame == centre of viewport */}
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
        </div>
      </div>,
      document.body,
    );
  }

  // ── Desktop layout — Figma 1440 × 1024 scaled frame ────────────────────────
  return createPortal(
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
    </div>,
    document.body,
  );
}
