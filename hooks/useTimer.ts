"use client";

import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { useGameStore } from "@/store/game-store";

// A MM:SS.cc display doesn't need 60Hz updates — ticking the store this
// often was re-rendering the entire board/page on every animation frame
// (see the performance audit that flagged this). rAF is still used as the
// scheduling primitive (auto-pauses in background tabs, no setInterval
// drift), just gated to fire the actual store update at most this often.
const TICK_INTERVAL_MS = 100;

export function useTimer() {
  // Scoped + shallow-compared so this hook's own subscription doesn't
  // re-render its calling component (PlayPageClient) on every elapsedMs
  // change — it only needs these five fields, none of which tick.
  const { isStarted, isCompleted, isPaused, startTimeMs, tick } = useGameStore(
    useShallow((s) => ({
      isStarted: s.isStarted,
      isCompleted: s.isCompleted,
      isPaused: s.isPaused,
      startTimeMs: s.startTimeMs,
      tick: s.tick,
    }))
  );
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isStarted || isCompleted || isPaused || !startTimeMs) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    let lastTick = 0;
    const loop = () => {
      const now = Date.now();
      if (now - lastTick >= TICK_INTERVAL_MS) {
        lastTick = now;
        tick(now - startTimeMs);
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isStarted, isCompleted, isPaused, startTimeMs, tick]);
}
