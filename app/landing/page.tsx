"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { Icon3D } from "@/components/ui";
import { useDeviceIdentity } from "@/hooks/useDeviceIdentity";

// ── Figma node 27:592 "Splash screen" — desktop, 1440×1024 px ────────────────
//
//  Sky-blue cloud background (blur-15px, opacity-60) with seven floating
//  3D sport icons and a centred title + CTA button.
//
//  Icon positions use the Figma absolute values. Elements marked
//  -translate-x-1/2 in the Figma have their centre at the stated `left`,
//  so their left edge = left − containerSize/2 (pre-computed below).
//
//  Frame centre X = 1440/2 = 720px.
//    Gloves:   centre = 720 − 339.57 = 380.43 → edge = 380.43 − 243.43 = 137 px
//    Whistle:  centre = 720 + 82.82  = 802.82 → edge = 802.82 −  96.82 = 706 px
//    Medal:    centre = 720 − 125.18 = 594.82 → edge = 594.82 −  96.82 = 498 px
//    Sub-board:centre = 720 + 221.85 = 941.85 → edge = 941.85 − 199.85 = 742 px
// ─────────────────────────────────────────────────────────────────────────────

const FRAME_W  = 1440;
const FRAME_H  = 1024;
const MOBILE_W =  440;
const MOBILE_H =  926;

export default function LandingPage() {
  const router = useRouter();
  const { isOnboarded } = useDeviceIdentity();
  const [scale,       setScale]       = useState(1);
  const [mobileScale, setMobileScale] = useState(1);
  const [isMobile,    setIsMobile]    = useState(false);

  useEffect(() => {
    const compute = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setScale(Math.min(window.innerWidth / FRAME_W, window.innerHeight / FRAME_H));
      setMobileScale(Math.min(window.innerWidth / MOBILE_W, window.innerHeight / MOBILE_H));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  // ── Mobile layout — Figma node 1:18 (440 × 926 iPhone 13 Mini) ───────────
  if (isMobile) {
    return (
      <div
        className="fixed inset-0 overflow-hidden flex items-center justify-center"
        style={{ background: "#87CEEB" }}
      >
        {/* Cloud bg fills full viewport behind the scaled frame */}
        <div style={{ position: "absolute", inset: 0, filter: "blur(15px)", opacity: 0.6, pointerEvents: "none" }}>
          <img src="/splash/bg-clouds.png" alt="" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
        </div>

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
          {/* Flag — left:-198, top:495, container:446, icon:334, rot:-26.1° */}
          <FloatIcon left={-198} top={495} containerSize={446.279} deg={-26.1}>
            <Icon3D name="flag" size={333.54} loading="eager" />
          </FloatIcon>

          {/* Stadium — left:266, top:518, container:251, icon:239, rot:-2.95° */}
          <FloatIcon left={266} top={518} containerSize={251.076} deg={-2.95}>
            <Icon3D name="stadium" size={239.089} loading="eager" />
          </FloatIcon>

          {/* Jersey — left:220 (50%), top:-63, container:369, icon:272, rot:28.72° */}
          <FloatIcon left={220} top={-63} containerSize={368.921} deg={28.72}>
            <Icon3D name="jersey" size={271.768} loading="eager" />
          </FloatIcon>

          {/* Gloves — centre:74, edge:-169, top:-81, container:487, icon:365, rot:-25.52° */}
          <FloatIcon left={-169} top={-81} containerSize={486.869} deg={-25.52}>
            <Icon3D name="gloves" size={365.17} loading="eager" />
          </FloatIcon>

          {/* Whistle — centre:300, edge:203, top:278, container:194, icon:151, rot:-20.46° */}
          <FloatIcon left={203} top={278} containerSize={193.647} deg={-20.46}>
            <Icon3D name="whistle" size={150.522} loading="eager" />
          </FloatIcon>

          {/* Medal — centre:92, edge:-5, top:433, container:194, icon:151, rot:-20.46° */}
          <FloatIcon left={-5} top={433} containerSize={193.647} deg={-20.46}>
            <Icon3D name="medal" size={150.522} loading="eager" />
          </FloatIcon>

          {/* Substitute board — centre:300, edge:100, top:727, container:400, icon:289, rot:33.09° */}
          <FloatIcon left={100} top={727} containerSize={399.692} deg={33.09}>
            <Icon3D name="substitute-board" size={288.846} loading="eager" />
          </FloatIcon>

          {/* Title — centred at 50% / 50% */}
          <div
            style={{
              position:      "absolute",
              left:          "50%",
              top:           "50%",
              transform:     "translate(-50%, -50%)",
              textAlign:     "center",
              pointerEvents: "none",
              whiteSpace:    "nowrap",
            }}
          >
            <p style={{ fontFamily: "var(--font-boldonse), sans-serif", fontSize: 48, lineHeight: "72px", letterSpacing: "-2.4px", color: "#000", margin: 0 }}>
              CHAMPIONS
            </p>
            <p style={{ fontFamily: "var(--font-boldonse), sans-serif", fontSize: 48, lineHeight: "72px", letterSpacing: "-2.4px", color: "#000", margin: 0 }}>
              PUZZLE
            </p>
          </div>

          {/* CTA — Figma: left:16, top:848, w:408 */}
          <div style={{ position: "absolute", left: 16, top: 848, width: 408 }}>
            <Button variant="primary" fullWidth onClick={() => router.push(isOnboarded ? "/champions" : "/onboarding")}>
              LET&apos;S PLAY
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Desktop layout ──────────────────────────────────────────────────────────
  return (
    // Sky-blue letterbox fills any remaining viewport space
    // Inline style used intentionally — the arbitrary hex class may not be
    // in the compiled Tailwind bundle until the page has been visited.
    <div className="fixed inset-0 overflow-hidden flex items-center justify-center" style={{ background: "#87CEEB" }}>

      {/* ── Cloud background — L+R constraint: fills the full viewport ── */}
      {/* Pulled out of the scaled frame so it stretches edge-to-edge on  */}
      {/* any screen width, not clipped to the 1440 px Figma frame.        */}
      <div
        style={{
          position:      "absolute",
          inset:         0,
          filter:        "blur(15px)",
          opacity:       0.6,
          pointerEvents: "none",
        }}
      >
        <img
          src="/splash/bg-clouds.png"
          alt=""
          style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      {/* ── Scaled Figma frame (icons + content only) ─────────────────── */}
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

        {/* ── Flag — bottom-left, left:20, top:481 ─────────────────────── */}
        <FloatIcon deg={-26.1} containerSize={446.279} left={20} top={481}>
          <Icon3D name="flag" size={333.54} loading="eager" />
        </FloatIcon>

        {/* ── Gloves — top-left-centre, edge:137, top:-31 ──────────────── */}
        <FloatIcon deg={-25.52} containerSize={486.869} left={137} top={-31}>
          <Icon3D name="gloves" size={365.17} loading="eager" />
        </FloatIcon>

        {/* ── Medal — left-of-centre, edge:498, top:433 ────────────────── */}
        <FloatIcon deg={-20.46} containerSize={193.647} left={498} top={433}>
          <Icon3D name="medal" size={150.522} loading="eager" />
        </FloatIcon>

        {/* ── Whistle — right-of-centre, edge:706, top:278 ─────────────── */}
        <FloatIcon deg={-20.46} containerSize={193.647} left={706} top={278}>
          <Icon3D name="whistle" size={150.522} loading="eager" />
        </FloatIcon>

        {/* ── Jersey — top-right, left:995, top:-14 ────────────────────── */}
        <FloatIcon deg={28.72} containerSize={368.921} left={995} top={-14}>
          <Icon3D name="jersey" size={271.768} loading="eager" />
        </FloatIcon>

        {/* ── Stadium — right, left:1053, top:472 ──────────────────────── */}
        <FloatIcon deg={-2.95} containerSize={251.076} left={1053} top={472}>
          <Icon3D name="stadium" size={239.089} loading="eager" />
        </FloatIcon>

        {/* ── Substitute board — bottom-right, edge:742, top:666 ───────── */}
        <FloatIcon deg={33.09} containerSize={399.692} left={742} top={666}>
          <Icon3D name="substitute-board" size={288.846} loading="eager" />
        </FloatIcon>

        {/* ── Centre content: title + CTA ───────────────────────────────── */}
        {/* Figma: left:516, top:418, w:408, gap:48 — centred at x=720 */}
        <div
          style={{
            position:        "absolute",
            left:            516,
            top:             418,
            width:           408,
            display:         "flex",
            flexDirection:   "column",
            alignItems:      "center",
            gap:             48,
          }}
        >
          {/* Title — Boldonse 48px / lh 72px / tracking -2.4px */}
          <div style={{ textAlign: "center", pointerEvents: "none", whiteSpace: "nowrap" }}>
            <p
              style={{
                fontFamily:    "var(--font-boldonse), sans-serif",
                fontSize:      48,
                lineHeight:    "72px",
                letterSpacing: "-2.4px",
                color:         "#000",
                margin:        0,
              }}
            >
              CHAMPIONS
            </p>
            <p
              style={{
                fontFamily:    "var(--font-boldonse), sans-serif",
                fontSize:      48,
                lineHeight:    "72px",
                letterSpacing: "-2.4px",
                color:         "#000",
                margin:        0,
              }}
            >
              PUZZLE
            </p>
          </div>

          {/* Button — Figma: black bg, Boldonse 16px, w-408px, py-24px */}
          <Button
            variant="primary"
            fullWidth
            onClick={() => router.push(isOnboarded ? "/champions" : "/onboarding")}
          >
            LET&apos;S PLAY
          </Button>
        </div>

      </div>
    </div>
  );
}

// ── FloatIcon helper ──────────────────────────────────────────────────────────
// Wraps a child in the Figma's "flex items-center justify-center" container
// (exact containerSize square) then applies the rotation to the inner div.

interface FloatIconProps {
  left:          number;
  top:           number;
  containerSize: number;
  deg:           number;
  children:      React.ReactNode;
}

function FloatIcon({ left, top, containerSize, deg, children }: FloatIconProps) {
  return (
    <div
      style={{
        position:        "absolute",
        left,
        top,
        width:           containerSize,
        height:          containerSize,
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        pointerEvents:   "none",
      }}
    >
      <div style={{ flexShrink: 0, transform: `rotate(${deg}deg)` }}>
        {children}
      </div>
    </div>
  );
}
