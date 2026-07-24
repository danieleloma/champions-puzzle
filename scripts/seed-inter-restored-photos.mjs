// Re-adds the two Inter Milan photos (match action + player celebration)
// that were previously removed and have now been re-supplied.
//
// Run with:  node --env-file=.env.local scripts/seed-inter-restored-photos.mjs

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
    club_id: "inter",
    title: "Champions League Action",
    description: "Inter Milan in action during a Champions League match.",
    image_url: "/puzzles/inter/07-champions-league-match-action.jpg",
    thumbnail_url: "/puzzles/inter/07-champions-league-match-action-thumb.jpg",
    difficulty: "easy",
    featured: true,
  },
  {
    club_id: "inter",
    title: "Player Celebration",
    description: "An Inter Milan player celebrates in front of the San Siro crowd.",
    image_url: "/puzzles/inter/08-player-celebration.jpg",
    thumbnail_url: "/puzzles/inter/08-player-celebration-thumb.jpg",
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
