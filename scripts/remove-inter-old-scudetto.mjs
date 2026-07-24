// Removes the original Wikimedia-sourced Inter Milan scudetto photo, keeping
// only the newly-supplied "Campioni d'Italia" celebration photo.
//
// Run with:  node --env-file=.env.local scripts/remove-inter-old-scudetto.mjs

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const IDS_TO_REMOVE = [
  "820b460d-b6c0-472e-8594-b38e7b90ac1c", // inter — 03-scudetto-21-garibaldi-2026
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
