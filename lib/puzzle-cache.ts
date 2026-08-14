import type { Puzzle } from "@/types/puzzle";

// In-memory cache of in-flight/completed `/api/puzzles` requests, keyed by
// clubId ("" = unfiltered). Lets a card's hover/touchstart kick off the
// fetch well before the click lands, so the destination page reads an
// already-resolved (or nearly resolved) promise instead of starting cold.
// Module-level singleton — survives across client-side navigations within
// the same session, cleared only on a full page reload.
const cache = new Map<string, Promise<Puzzle[]>>();

function keyFor(clubId?: string) {
  return clubId ?? "";
}

/** Starts (or reuses) the fetch for a club's puzzles. Safe to call repeatedly. */
export function prefetchPuzzles(clubId?: string): Promise<Puzzle[]> {
  const key = keyFor(clubId);
  const existing = cache.get(key);
  if (existing) return existing;

  const promise = fetch(clubId ? `/api/puzzles?clubId=${encodeURIComponent(clubId)}` : "/api/puzzles")
    .then((r) => r.json())
    .then((data: { puzzles?: Puzzle[] }) => data.puzzles ?? [])
    .catch(() => {
      // Don't poison the cache with a rejected promise — let the next caller retry.
      cache.delete(key);
      return [];
    });

  cache.set(key, promise);
  return promise;
}

/** Returns the cached promise if a prefetch/fetch is already in flight or done. */
export function getCachedPuzzles(clubId?: string): Promise<Puzzle[]> | undefined {
  return cache.get(keyFor(clubId));
}
