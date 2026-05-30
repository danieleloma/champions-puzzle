"use client";

import { useEffect, useRef, useState } from "react";
import { useGameStore } from "@/store/game-store";
import { useUserStore } from "@/store/user-store";
import { formatTime, calculateScore, calculateXP, getRankBadge } from "@/lib/score-calculator";
import { ShareButtons } from "@/components/social/ShareButtons";
import { ShareCard } from "@/components/social/ShareCard";
import { generateChecksum } from "@/lib/anti-cheat";
import { getOrCreateDeviceId, getSessionToken } from "@/lib/device-identity";
import { cn } from "@/lib/utils";

interface VictoryScreenProps {
  onReplay: () => void;
  onHome: () => void;
}

export function VictoryScreen({ onReplay, onHome }: VictoryScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { puzzle, difficulty, elapsedMs, moveCount, hintsUsed } = useGameStore();
  const { user, addXP } = useUserStore();
  const [rank, setRank] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const score = calculateScore({ difficulty, completionTimeMs: elapsedMs, moveCount, hintsUsed });
  const xpEarned = calculateXP({ difficulty, completionTimeMs: elapsedMs, hintsUsed, score });

  useEffect(() => {
    async function animate() {
      const anime = (await import("animejs")).default;
      const el = containerRef.current;
      if (!el) return;

      anime.timeline({ easing: "easeOutExpo" })
        .add({ targets: el.querySelector(".trophy"), scale: [0, 1.2, 1], opacity: [0, 1], duration: 700 })
        .add({ targets: el.querySelectorAll(".stat-row"), translateY: [20, 0], opacity: [0, 1], duration: 400, delay: anime.stagger(80) })
        .add({ targets: el.querySelector(".cta-row"), translateY: [20, 0], opacity: [0, 1], duration: 400 });
    }
    animate();
  }, []);

  useEffect(() => {
    if (submitted || !puzzle || !user) return;
    setSubmitted(true);

    const device_id = getOrCreateDeviceId();
    const session_token = getSessionToken() ?? "";
    const payload = { puzzle_id: puzzle.id, difficulty, completion_time_ms: elapsedMs, move_count: moveCount, hints_used: hintsUsed, device_id, session_token };
    const checksum = generateChecksum(payload);

    fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, checksum, user_id: user.id }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.new_rank) setRank(data.new_rank);
        if (data.xp_earned) addXP(data.xp_earned);
      })
      .catch(() => {});
  }, []);

  if (!puzzle) return null;

  const shareText = `I just solved the "${puzzle.title}" Arsenal puzzle in ${formatTime(elapsedMs)} on ${difficulty} difficulty! Can you beat me? 🏆⚽`;
  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/play/${puzzle.id}?challenge=${elapsedMs}`;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-sm bg-[#1a1a1a] rounded-3xl overflow-hidden border border-white/10">
        <div className="bg-gradient-to-br from-arsenal-red to-arsenal-red-dark p-6 text-center">
          <div className="trophy text-6xl mb-2 opacity-0">🏆</div>
          <h2 className="text-2xl font-black text-white">Puzzle Complete!</h2>
          {rank && (
            <p className="text-white/80 text-sm mt-1">
              {getRankBadge(rank)} Rank #{rank} globally
            </p>
          )}
        </div>

        <div className="p-5 space-y-3">
          {[
            { label: "Time", value: formatTime(elapsedMs), highlight: true },
            { label: "Score", value: score.toLocaleString() },
            { label: "Moves", value: moveCount },
            { label: "Difficulty", value: difficulty.charAt(0).toUpperCase() + difficulty.slice(1) },
            { label: "XP Earned", value: `+${xpEarned} XP`, highlight: true },
          ].map((stat) => (
            <div key={stat.label} className="stat-row flex justify-between items-center opacity-0">
              <span className="text-white/50 text-sm">{stat.label}</span>
              <span className={cn("font-bold text-sm", stat.highlight ? "text-arsenal-gold" : "text-white")}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        <div className="px-5 pb-2">
          <ShareCard
            username={user?.username ?? "Gunner"}
            puzzleTitle={puzzle.title}
            completionTimeMs={elapsedMs}
            difficulty={difficulty}
            score={score}
            rank={rank}
          />
        </div>

        <div className="cta-row p-5 pt-2 space-y-2 opacity-0">
          <ShareButtons text={shareText} url={shareUrl} />
          <div className="flex gap-2">
            <button
              onClick={onReplay}
              className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-semibold transition-colors text-sm"
            >
              Replay
            </button>
            <button
              onClick={onHome}
              className="flex-1 bg-arsenal-red hover:bg-arsenal-red-dark text-white py-3 rounded-xl font-bold transition-colors text-sm"
            >
              More Puzzles
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
