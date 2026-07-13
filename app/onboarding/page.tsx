"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Input, Button, Icon3D } from "@/components/ui";
import { useUserStore } from "@/store/user-store";
import { getOrCreateDeviceId, generateAvatarColor } from "@/lib/device-identity";

// ── Figma node 27:631 "Create-username" — 1440 × 1024 px ─────────────────────
//
//  Icon pile (bottom half). All positions are the left edge of the container
//  after resolving Figma's -translateX-1/2 + calc(50% ± offset) at frame W=1440.
//
//  Left group (−11.28°)  — container 442 px, img 376 px
//    stadium   left=215  top=630
//    gloves    left=164  top=763
//    ball      left=324  top=776
//    board     left=489  top=763
//
//  Right group (+16.12°) — container 466 px, img 376 px
//    flag      left=617  top=624
//    goal-post left=446  top=624
//    — smaller (container 410 px, img 331 px):
//    boot      left=779  top=690
//    cup       left=862  top=656
//    captain-b left=753  top=844
//
//  Misc
//    jersey    left=700  top=812  container=315  img=292  rot=+4.71°
//    whistle   left=864  top=791  container=412  img=292  rot=−49.06°
// ─────────────────────────────────────────────────────────────────────────────

const FRAME_W  = 1440;
const FRAME_H  = 1024;
const MOBILE_W =  440;
const MOBILE_H =  926;

const usernameSchema = z
  .string()
  .min(3, "At least 3 characters")
  .max(20, "Max 20 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers and underscores only");

// ── FloatIcon ─────────────────────────────────────────────────────────────────

interface FloatIconProps {
  name:          React.ComponentProps<typeof Icon3D>["name"];
  left:          number;
  top:           number;
  containerSize: number;
  imgSize:       number;
  deg:           number;
}

function FloatIcon({ name, left, top, containerSize, imgSize, deg }: FloatIconProps) {
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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router  = useRouter();
  const setUser = useUserStore((s) => s.setUser);

  const [username,     setUsername]     = useState("");
  const [error,        setError]        = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scale,        setScale]        = useState(1);
  const [mobileScale,  setMobileScale]  = useState(1);
  const [isMobile,     setIsMobile]     = useState(false);

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

  const validation = usernameSchema.safeParse(username.trim());
  const isValid    = validation.success;
  const charCount  = username.length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) { setError(validation.error.errors[0].message); return; }

    setError("");
    setIsSubmitting(true);
    try {
      const device_id = getOrCreateDeviceId();
      const res = await fetch("/api/users", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ username: username.trim(), device_id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Something went wrong. Please try again.");
        return;
      }
      const data = await res.json();
      setUser({
        id:           data.id,
        device_id,
        username:     data.username,
        xp:           0,
        avatar_color: generateAvatarColor(data.username),
        created_at:   data.created_at,
      });
      router.push("/champions");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Mobile layout — Figma node 15:114 (440 × 926 iPhone 13 Mini) ──────────
  //
  //  Icon pile positions — all left values are the container left EDGE after
  //  resolving Figma's -translate-x-1/2 + calc(N%±offset) at frame W=440.
  //
  //  Left group  (−11.28°) container 235 img 200: stadium(-55,756) gloves(-82,827) ball(3,834) board(91,827)
  //  Right large (+16.12°) container 248 img 200: flag(159,753) goal-post(68,753)
  //  Right small (+16.12°) container 218 img 176: boot(245,788) cup(289,770) captain-band(231,870)
  //  Misc: jersey(203,853,+4.71°,cont167,img155) whistle(290,842,−49.06°,cont219,img155)
  // ───────────────────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div
        className="fixed inset-0 bg-[#0f0f10] overflow-hidden flex items-center justify-center"
      >
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
          {/* Form — Figma: left:16, top:84, gap:32 */}
          <form
            onSubmit={handleSubmit}
            style={{
              position:      "absolute",
              left:          16,
              top:           84,
              width:         407,
              display:       "flex",
              flexDirection: "column",
              gap:           32,
            }}
          >
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
              Create username
            </h1>
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              <Input
                placeholder="e.g MajeekDaniel"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(""); }}
                maxLength={20}
                autoFocus
                helperText={`${charCount}/20 · Letters, numbers, underscores only`}
                error={error || undefined}
              />
              <Button type="submit" variant="primary" fullWidth disabled={isSubmitting || charCount < 3}>
                {isSubmitting ? "Saving…" : "LET'S PLAY →"}
              </Button>
            </div>
          </form>

          {/* Icon pile — left group −11.28°, container 235, img 200 */}
          <FloatIcon name="stadium"      deg={-11.28} left={-55} top={756}   containerSize={235.248} imgSize={200} />
          <FloatIcon name="gloves"       deg={-11.28} left={-82} top={827}   containerSize={235.248} imgSize={200} />
          <FloatIcon name="ball"         deg={-11.28} left={3}   top={834}   containerSize={235.248} imgSize={200} />
          <FloatIcon name="board"        deg={-11.28} left={91}  top={827}   containerSize={235.248} imgSize={200} />

          {/* Right group large +16.12°, container 248, img 200 */}
          <FloatIcon name="flag"         deg={16.12}  left={159} top={753}   containerSize={247.66}  imgSize={200} />
          <FloatIcon name="goal-post"    deg={16.12}  left={68}  top={753}   containerSize={247.66}  imgSize={200} />

          {/* Right group small +16.12°, container 218, img 176 */}
          <FloatIcon name="boot"         deg={16.12}  left={245} top={788}   containerSize={218.067} imgSize={176} />
          <FloatIcon name="cup"          deg={16.12}  left={289} top={770}   containerSize={218.067} imgSize={176} />
          <FloatIcon name="captain-band" deg={16.12}  left={231} top={870}   containerSize={218.067} imgSize={176} />

          {/* Misc */}
          <FloatIcon name="jersey"  deg={4.71}   left={203} top={853} containerSize={167.656} imgSize={155} />
          <FloatIcon name="whistle" deg={-49.06} left={290} top={842} containerSize={219.243} imgSize={155} />

          {/* Home indicator */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 21, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 8 }}>
            <div style={{ width: 134, height: 5, borderRadius: 100, background: "#fff" }} />
          </div>
        </div>
      </div>
    );
  }

  // ── Desktop layout ──────────────────────────────────────────────────────────
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

        {/* ── Brand wordmark — top-centre ──────────────────────────────────── */}
        {/* Figma: left 200 top 57 w 1040, text centred within */}
        <div
          style={{
            position:      "absolute",
            left:          200,
            top:           57,
            width:         1040,
            textAlign:     "center",
            pointerEvents: "none",
          }}
        >
          <p style={{ fontFamily: "var(--font-boldonse), sans-serif", fontSize: 14.667, lineHeight: "22px", letterSpacing: "-0.7333px", color: "#fff", margin: 0 }}>
            CHAMPIONS
          </p>
          <p style={{ fontFamily: "var(--font-boldonse), sans-serif", fontSize: 14.667, lineHeight: "22px", letterSpacing: "-0.7333px", color: "#fff", margin: 0 }}>
            PUZZLE
          </p>
        </div>

        {/* ── Form — visual centre at (720, 274) ──────────────────────────── */}
        {/* Figma: left calc(50%−0.5px) translateX(−50%), top calc(50%−238px) translateY(−50%) */}
        <form
          onSubmit={handleSubmit}
          style={{
            position:      "absolute",
            left:          "50%",
            top:           "calc(50% - 238px)",
            transform:     "translate(-50%, -50%)",
            width:         407,
            display:       "flex",
            flexDirection: "column",
            gap:           32,
          }}
        >
          {/* Heading — Boldonse 20px / tracking −1px */}
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
            Create username
          </h1>

          <div className="flex flex-col gap-8 w-full">
            <Input
              placeholder="e.g MajeekDaniel"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(""); }}
              maxLength={20}
              autoFocus
              helperText={`${charCount}/20 · Letters, numbers, underscores only`}
              error={error || undefined}
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isSubmitting || charCount < 3}
            >
              {isSubmitting ? "Saving…" : "LET'S PLAY →"}
            </Button>
          </div>
        </form>

        {/* ── 3D icon pile ─────────────────────────────────────────────────── */}

        {/* Left group — −11.28° — container 442 px, img 376 px */}
        <FloatIcon name="stadium" deg={-11.28} left={215} top={630} containerSize={442} imgSize={376} />
        <FloatIcon name="gloves"  deg={-11.28} left={164} top={763} containerSize={442} imgSize={376} />
        <FloatIcon name="ball"    deg={-11.28} left={324} top={776} containerSize={442} imgSize={376} />
        <FloatIcon name="board"   deg={-11.28} left={489} top={763} containerSize={442} imgSize={376} />

        {/* Right group — +16.12° — container 466 px, img 376 px */}
        <FloatIcon name="flag"      deg={16.12} left={617} top={624} containerSize={466} imgSize={376} />
        <FloatIcon name="goal-post" deg={16.12} left={446} top={624} containerSize={466} imgSize={376} />

        {/* Right group — smaller — container 410 px, img 331 px */}
        <FloatIcon name="boot"         deg={16.12} left={779} top={690} containerSize={410} imgSize={331} />
        <FloatIcon name="cup"          deg={16.12} left={862} top={656} containerSize={410} imgSize={331} />
        <FloatIcon name="captain-band" deg={16.12} left={753} top={844} containerSize={410} imgSize={331} />

        {/* Misc */}
        <FloatIcon name="jersey"  deg={4.71}   left={700} top={812} containerSize={315} imgSize={292} />
        <FloatIcon name="whistle" deg={-49.06} left={864} top={791} containerSize={412} imgSize={292} />

      </div>
    </div>
  );
}
