// Seeds the puzzle for Spain's 2026 World Cup championship win (see
// public/puzzles/ATTRIBUTIONS.md for image sourcing/licensing).
//
// Requires migration 005_add_spain_club.sql to already be applied.
// Run with:  node --env-file=.env.local scripts/seed-spain-puzzles.mjs

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
    club_id: "spain",
    title: "World Cup Champions, 2026",
    description: "Spain's squad, including Lamine Yamal, lift the World Cup trophy after beating Argentina in the final.",
    image_url: "/puzzles/spain/01-world-cup-final-yamal-2026.jpg",
    thumbnail_url: "/puzzles/spain/01-world-cup-final-yamal-2026-thumb.jpg",
    difficulty: "easy",
    featured: true,
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
