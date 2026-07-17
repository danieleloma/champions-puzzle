"use client";

import { useEffect, useRef } from "react";
import type Anime from "animejs";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function animate() {
      // animejs v3 exports the function as `module.exports` (CJS).
      // Webpack's ESM interop puts it on `.default`; if that's absent fall back to the module itself.
      const mod = (await import("animejs")) as unknown as { default?: typeof Anime };
      const anime = mod.default?.timeline ? mod.default : (mod as unknown as typeof Anime);
      const el = containerRef.current;
      if (!el) return;

      anime
        .timeline({ easing: "easeOutExpo" })
        .add({
          targets: el.querySelector(".logo"),
          scale: [0.5, 1],
          opacity: [0, 1],
          duration: 600,
        })
        .add({
          targets: el.querySelector(".tagline"),
          translateY: [20, 0],
          opacity: [0, 1],
          duration: 500,
        })
        .add({
          targets: el,
          opacity: [1, 0],
          duration: 400,
          delay: 800,
          complete: onComplete,
        });
    }

    animate();
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-arsenal-black"
    >
      <div className="logo flex flex-col items-center gap-4 opacity-0">
        <div className="relative">
          <div className="w-24 h-24 bg-arsenal-red rounded-2xl flex items-center justify-center shadow-2xl">
            <span className="text-5xl">🏆</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-arsenal-gold rounded-full flex items-center justify-center text-xs font-bold text-white">
            PL
          </div>
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight">
          Arsenal <span className="text-arsenal-red">Puzzle</span>
        </h1>
      </div>
      <p className="tagline mt-3 text-white/50 text-sm tracking-widest uppercase opacity-0">
        Champions 2025–26
      </p>
    </div>
  );
}
