"use client";

// ── Shared chrome for /champions and /club/[clubId] ──────────────────────────
//
// A Next.js layout persists across navigation between routes that share it —
// this nav bar (and the scaled desktop frame around it) never unmounts when
// moving between "Choose your champion" and a club's puzzle-selection screen,
// so only the content below visibly changes instead of the whole screen
// appearing to reload/jump.
//
// isMobile/scale are duplicated here and in each page (rather than shared via
// context) because a layout's `children` slot can't receive custom props —
// both sides compute the same value from the same resize listener, so they
// never disagree.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge, SoundToggle } from "@/components/ui";
import { useDeviceIdentity } from "@/hooks/useDeviceIdentity";

const FRAME_W = 1440;
const FRAME_H = 1024;

// Shared desktop content-column width — every page under this layout aligns
// its own content to this so nothing ever visibly shifts width on navigation.
export const CONTENT_W = 648;

function NavWordmark() {
  return (
    <div style={{ pointerEvents: "none" }}>
      <p style={{ fontFamily: "var(--font-boldonse), sans-serif", fontSize: 14.667, lineHeight: "22px", letterSpacing: "-0.7333px", color: "#fff", margin: 0 }}>
        CHAMPIONS
      </p>
      <p style={{ fontFamily: "var(--font-boldonse), sans-serif", fontSize: 14.667, lineHeight: "22px", letterSpacing: "-0.7333px", color: "#fff", margin: 0 }}>
        PUZZLE
      </p>
    </div>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user } = useDeviceIdentity();
  const pathname = usePathname();

  // /club/[clubId] is a drill-down from /champions and already has its own
  // back button — repeating the hub's logo/XP/Ranks row on top of that is
  // redundant chrome and, on short viewports, pushes real content down
  // further than a detail screen warrants. Hub-level nav stays for
  // /champions itself and everywhere else under this layout.
  const hideTopNav = pathname?.startsWith("/club/") ?? false;

  const [scale,       setScale]       = useState(1);
  const [isMobile,    setIsMobile]    = useState(false);
  const [frameHeight, setFrameHeight] = useState(FRAME_H);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const compute = () => {
      setIsMobile(window.innerWidth < 768);
      setScale(Math.min(window.innerWidth / FRAME_W, window.innerHeight / FRAME_H));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  // Re-measures whenever the frame's rendered content changes size —
  // including on navigation, since `children` swaps but this layout (and the
  // observer watching it) never unmounts.
  useEffect(() => {
    if (isMobile) return;
    const el = frameRef.current;
    if (!el) return;
    const update = () => setFrameHeight(Math.max(FRAME_H, el.scrollHeight));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isMobile]);

  const navBadges = (
    <>
      <SoundToggle />
      {user && <Badge variant="user-info" username={user.username} avatarColor={user.avatar_color} xp={user.xp} />}
      <Link href="/leaderboard"><Badge variant="featured" label="Ranks" /></Link>
    </>
  );

  // ── Mobile — plain flow, nav row then page content ────────────────────────
  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#0f0f10] overflow-y-auto">
        {/* flexWrap is a safety net: long usernames (up to the 20-char max)
            push the badge group below the logo instead of clipping Ranks.
            No padding reserved when hideTopNav is true — the page's own
            back button owns the standard 24px top offset instead, so the
            two don't stack into a doubled gap. */}
        <div style={hideTopNav ? undefined : { padding: "24px 16px 0", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8, rowGap: 12 }}>
          {!hideTopNav && (
            <>
              <div style={{ pointerEvents: "none", flexShrink: 0 }}>
                <p style={{ fontFamily: "var(--font-boldonse), sans-serif", fontSize: 14.667, lineHeight: "22px", letterSpacing: "-0.7333px", color: "#fff", margin: 0 }}>CHAMPIONS</p>
                <p style={{ fontFamily: "var(--font-boldonse), sans-serif", fontSize: 14.667, lineHeight: "22px", letterSpacing: "-0.7333px", color: "#fff", margin: 0 }}>PUZZLE</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                {navBadges}
              </div>
            </>
          )}
        </div>
        {children}
      </div>
    );
  }

  // ── Desktop — scaled Figma frame; not `fixed`/`overflow-hidden` so a tall
  // page (e.g. a club with many puzzle rows) grows and scrolls instead of
  // clipping. The spacer below is sized to the *scaled* height since
  // transform never shrinks an element's own layout footprint. ─────────────
  return (
    <div className="min-h-screen w-full bg-[#0f0f10] flex flex-col items-center overflow-x-hidden">
      <div style={{ width: FRAME_W * scale, height: frameHeight * scale, position: "relative" }}>
        <div
          ref={frameRef}
          style={{
            width:           FRAME_W,
            minHeight:       FRAME_H,
            position:        "absolute",
            top:             0,
            left:            0,
            transform:       `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {/* ── Nav bar — centred, width CONTENT_W ── */}
          {/* Absolutely positioned, so hiding it doesn't shift `children` —
              those position themselves independently within the frame. */}
          {!hideTopNav && (
            <div style={{ position: "absolute", left: "50%", top: 57, transform: "translateX(-50%)", width: CONTENT_W, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <NavWordmark />
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                {navBadges}
              </div>
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}
