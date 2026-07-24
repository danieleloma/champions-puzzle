// Seeds puzzles for each club's 2025/26 season championship win (see
// public/puzzles/ATTRIBUTIONS.md for image sourcing/licensing).
//
// NOTE: the Barcelona "bus parade" and "champions parade" entries, the Bayern
// balcony/Marienplatz entries, the PSG "Champions League Final" fan-zone
// entry, and the Inter "Scudetto Number 21" Garibaldi-monument entry this
// script originally seeded were later retired in favor of other 2025/26
// season photos (see scripts/remove-old-celebration-photos.mjs,
// scripts/remove-more-old-photos.mjs, and
// scripts/remove-inter-old-scudetto.mjs) and removed from this file so
// re-running it can't resurrect them.
//
// Requires migration 003_puzzle_club_id.sql to already be applied and
// scripts/seed-club-puzzles.mjs to have already been run once.
// Run with:  node --env-file=.env.local scripts/seed-2026-championship-puzzles.mjs

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const PUZZLES = [
  {
    club_id: "arsenal",
    title: "Premier League Champions, 2025/26",
    description: "Arsenal players lift the Premier League trophy after ending a 22-year wait for the title.",
    image_url: "/puzzles/arsenal/03-premier-league-champions-2026.jpg",
    thumbnail_url: "/puzzles/arsenal/03-premier-league-champions-2026-thumb.jpg",
    difficulty: "easy",
    featured: true,
  },
  {
    club_id: "arsenal",
    title: "Trophy Presentation, Selhurst Park 2026",
    description: "Josh and Stan Kroenke carry the Premier League trophy onto the pitch at Selhurst Park.",
    image_url: "/puzzles/arsenal/04-trophy-presentation-2026.jpg",
    thumbnail_url: "/puzzles/arsenal/04-trophy-presentation-2026-thumb.jpg",
    difficulty: "medium",
    featured: false,
  },
].map((p) => ({ ...p, active: true }));

const { data, error } = await supabase.from("puzzles").insert(PUZZLES).select("id, club_id, title");

if (error) {
  console.error("Seed failed:", error.message);
  process.exit(1);
}

console.log(`Inserted ${data.length} puzzles:`);
for (const row of data) {
  console.log(`  [${row.club_id}] ${row.title} (${row.id})`);
}
