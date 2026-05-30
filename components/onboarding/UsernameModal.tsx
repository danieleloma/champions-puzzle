"use client";

import { useState } from "react";
import { z } from "zod";
import { useUserStore } from "@/store/user-store";
import {
  getOrCreateDeviceId,
  generateAvatarColor,
} from "@/lib/device-identity";

const usernameSchema = z
  .string()
  .min(3, "At least 3 characters")
  .max(20, "Max 20 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers and underscores");

export function UsernameModal() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setUser } = useUserStore();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const result = usernameSchema.safeParse(username.trim());
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);
    try {
      const device_id = getOrCreateDeviceId();
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), device_id }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Username taken. Try another.");
        return;
      }

      const data = await res.json();
      setUser({
        id: data.id,
        device_id,
        username: data.username,
        xp: 0,
        avatar_color: generateAvatarColor(data.username),
        created_at: data.created_at,
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-[#1a1a1a] rounded-3xl p-6 animate-slide-up border border-white/10">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">⚽</div>
          <h2 className="text-2xl font-black text-white">Pick your name,</h2>
          <h2 className="text-2xl font-black text-arsenal-red">Gunner</h2>
          <p className="text-white/40 text-sm mt-1">
            This is your identity on the leaderboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. GoonerKing"
              maxLength={20}
              autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-lg font-medium focus:outline-none focus:border-arsenal-red transition-colors"
            />
            {error && (
              <p className="text-arsenal-red text-sm mt-1.5 ml-1">{error}</p>
            )}
            <p className="text-white/30 text-xs mt-1.5 ml-1">
              {username.length}/20 · Letters, numbers, underscores only
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || username.length < 3}
            className="w-full bg-arsenal-red hover:bg-arsenal-red-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors text-lg"
          >
            {isSubmitting ? "Saving…" : "Let's Play →"}
          </button>
        </form>

        <div className="mt-4 flex gap-2 flex-wrap justify-center">
          {["GoonerKing", "SakaSpeed", "NorthLondonLegend", "TrophyHunter"].map(
            (s) => (
              <button
                key={s}
                type="button"
                onClick={() => setUsername(s)}
                className="text-xs bg-white/5 hover:bg-white/10 text-white/50 px-2.5 py-1 rounded-full transition-colors"
              >
                {s}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
