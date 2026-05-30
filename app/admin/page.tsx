"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Puzzle } from "@/types/puzzle";

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-puzzles"],
    queryFn: async () => {
      const res = await fetch("/api/puzzles");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      return res.json() as Promise<{ puzzles: Puzzle[] }>;
    },
  });

  const puzzles = data?.puzzles ?? [];

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploadError(null);
    setUploadSuccess(false);
    setUploading(true);

    const formEl = e.currentTarget;
    const form = new FormData(formEl);

    try {
      const res = await fetch("/api/admin/puzzles", {
        method: "POST",
        body: form,
      });

      const body = await res.json();

      if (!res.ok) {
        setUploadError(body.error ?? `Upload failed (HTTP ${res.status})`);
        return;
      }

      setUploadSuccess(true);
      formEl.reset();
      queryClient.invalidateQueries({ queryKey: ["admin-puzzles"] });
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Network error — is the dev server running?");
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="min-h-screen bg-arsenal-black p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-white font-black text-2xl">Admin Dashboard</h1>
          <p className="text-white/40 text-sm">Manage puzzles and content</p>
        </div>

        {/* Upload form */}
        <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
          <h2 className="text-white font-bold mb-4">Upload New Puzzle</h2>

          <form onSubmit={handleUpload} className="space-y-3">
            <input
              name="title"
              required
              placeholder="Puzzle title"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-arsenal-red"
            />
            <input
              name="description"
              placeholder="Description (optional)"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-arsenal-red"
            />
            <select
              name="difficulty"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-arsenal-red"
            >
              {["beginner", "easy", "medium", "hard", "expert", "legendary"].map((d) => (
                <option key={d} value={d} className="bg-[#1a1a1a]">
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </option>
              ))}
            </select>
            <input
              type="file"
              name="image"
              accept="image/avif,image/webp,image/jpeg,image/png,image/gif,image/*"
              required
              className="w-full text-white/60 text-sm file:bg-arsenal-red file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1.5 file:mr-3 file:cursor-pointer"
            />
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-white/60 text-sm cursor-pointer">
                <input type="checkbox" name="featured" className="accent-arsenal-red" />
                Featured
              </label>
              <label className="flex items-center gap-2 text-white/60 text-sm cursor-pointer">
                <input type="checkbox" name="active" defaultChecked className="accent-arsenal-red" />
                Active
              </label>
            </div>

            {/* Error banner */}
            {uploadError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm font-medium">Upload failed</p>
                <p className="text-red-400/70 text-xs mt-0.5 font-mono break-all">{uploadError}</p>
              </div>
            )}

            {/* Success banner */}
            {uploadSuccess && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3">
                <p className="text-green-400 text-sm font-medium">✓ Puzzle uploaded successfully</p>
              </div>
            )}

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-arsenal-red hover:bg-arsenal-red-dark text-white font-bold py-3 rounded-xl disabled:opacity-50 transition-colors"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading…
                </span>
              ) : (
                "Upload Puzzle"
              )}
            </button>
          </form>
        </div>

        {/* Puzzle list */}
        <div>
          <h2 className="text-white font-bold mb-3">
            All Puzzles ({puzzles.length})
          </h2>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : puzzles.length === 0 ? (
            <div className="text-center py-8 text-white/30 text-sm">
              No puzzles yet — upload one above.
            </div>
          ) : (
            <div className="space-y-2">
              {puzzles.map((puzzle) => (
                <div
                  key={puzzle.id}
                  className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/5"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                    {puzzle.thumbnail_url && (
                      <img
                        src={puzzle.thumbnail_url}
                        alt={puzzle.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{puzzle.title}</p>
                    <p className="text-white/40 text-xs">
                      {puzzle.difficulty} · {puzzle.play_count ?? 0} plays
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {puzzle.featured && (
                      <span className="text-[10px] bg-arsenal-gold/20 text-arsenal-gold px-2 py-0.5 rounded-full font-bold">
                        FEATURED
                      </span>
                    )}
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        puzzle.active
                          ? "bg-green-500/20 text-green-400"
                          : "bg-white/10 text-white/30"
                      }`}
                    >
                      {puzzle.active ? "LIVE" : "DRAFT"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
