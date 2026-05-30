"use client";

import { useEffect, useRef } from "react";
import { useGameStore } from "@/store/game-store";

export function useTimer() {
  const { isStarted, isCompleted, isPaused, startTimeMs, tick } = useGameStore();
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isStarted || isCompleted || isPaused || !startTimeMs) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const loop = () => {
      tick(Date.now() - startTimeMs);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isStarted, isCompleted, isPaused, startTimeMs, tick]);
}
