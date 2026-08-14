"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.timeline({ defaults: { ease: "expo.out" } })
      .fromTo(".logo", { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6 })
      .fromTo(".tagline", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 })
      .to(containerRef.current, { opacity: 0, duration: 0.4, delay: 0.8, onComplete });
  }, { scope: containerRef, dependencies: [onComplete] });

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
