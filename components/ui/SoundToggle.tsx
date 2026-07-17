"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { isSoundMuted, toggleSoundMuted } from "@/lib/sounds";

// ── Soundwave mute toggle ─────────────────────────────────────────────────────
// 4-bar equalizer icon — bars animate (scaleY pulse, staggered) while sound is
// on, freeze to static heights when muted. Placed before the username badge
// in the nav. Mute state persists via lib/sounds.ts (localStorage).
// ─────────────────────────────────────────────────────────────────────────────

const BAR_HEIGHTS = [7, 13, 17, 10]; // px — "at rest" / static heights
const BAR_DELAYS  = [0, 0.15, 0.3, 0.15]; // s — stagger for the animated state

export interface SoundToggleProps {
  className?: string;
}

export function SoundToggle({ className }: SoundToggleProps) {
  // Default to "on" for the first paint (server + pre-hydration client match);
  // the real persisted value is read after mount to avoid a hydration mismatch.
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(isSoundMuted());
  }, []);

  return (
    <button
      type="button"
      onClick={() => setMuted(toggleSoundMuted())}
      aria-label={muted ? "Turn sound on" : "Turn sound off"}
      aria-pressed={!muted}
      className={cn(
        "flex items-center justify-center gap-[3px] size-8 rounded-full bg-[#252627] shrink-0",
        className,
      )}
    >
      {BAR_HEIGHTS.map((h, i) => (
        <span
          key={i}
          className={cn("w-[2.5px] rounded-full bg-[#bdbec1]", !muted && "soundwave-bar")}
          style={{
            height:         h,
            opacity:        muted ? 0.5 : 1,
            animationDelay: !muted ? `${BAR_DELAYS[i]}s` : undefined,
          }}
        />
      ))}
    </button>
  );
}
