// Removes further retired puzzles: Barcelona's La Liga parade and 2011 La
// Rambla photos, and PSG's Parc des Princes fan-zone Champions League final
// photo.
//
// Run with:  node --env-file=.env.local scripts/remove-more-old-photos.mjs

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const IDS_TO_REMOVE = [
  "9a7f71ff-18f7-40ce-b52e-2d40c9e0e34b", // barcelona — 03-laliga-champions-parade-2026
  "f4f642cd-b89a-48f1-9296-c07c9180f680", // barcelona — 01-ucl-2011-la-rambla
  "e1a347ad-7631-4f21-9923-3f9e56ad0b8e", // psg — 03-ucl-final-parc-des-princes-2026
];

const { data, error } = await supabase.from("puzzles").delete().in("id", IDS_TO_REMOVE).select("id, club_id, title");

if (error) {
  console.error("Delete failed:", error.message);
  process.exit(1);
}

console.log(`Deleted ${data.length} puzzles:`);
for (const row of data) {
  console.log(`  [${row.club_id}] ${row.title} (${row.id})`);
}
