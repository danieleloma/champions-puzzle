// Removes older/non-2026 celebration puzzles that are being retired in favor
// of the 2025/26 season photos: the 2015 Arsenal images, the 2009 Barcelona
// image and its duplicate "bus parade" shot, the non-2026/balcony/Marienplatz
// Bayern images, the non-2026 Inter Milan images, and the older PSG images.
//
// Run with:  node --env-file=.env.local scripts/remove-old-celebration-photos.mjs

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const IDS_TO_REMOVE = [
  "d663393d-dd57-4145-be91-55e6bb76eae6", // arsenal — 01-fa-cup-parade-2015
  "e4f3c111-5d8c-40f2-82de-3ccfc3f5d865", // arsenal — 02-arteta-fa-cup-2015
  "5c65d66f-3948-4648-ba88-59d5619b0f5d", // barcelona — 02-copa-campeones-2009
  "4e894cb2-14bb-432f-8a0a-c0d314c977e8", // barcelona — 04-campions-bus-parade-2026
  "4b783fbc-d999-4de9-aac5-9573b23df8fc", // bayern — 01-balkon-2025
  "656335fe-52c6-436e-8c9c-f9280a9c8972", // bayern — 02-marienplatz-2025
  "3402b4a4-023d-4afa-9485-282ef649c7d3", // bayern — 03-rathaus-balkon-2026
  "2dd20a2b-46e4-4396-a1e4-5ca8bd05042d", // bayern — 04-marienplatz-crowd-2026
  "46d63e3a-4a07-47c4-b766-c9c4a7a3029a", // inter — 01-scudetto-17-2009
  "44d475d9-7503-4281-87ad-084c2c023213", // inter — 02-coppa-italia-2006
  "41eb6140-ed25-4846-809f-5e3e4b4d2945", // inter — 04-champions-league-match-action
  "e65c8fe0-0cc0-45e7-9d3f-77b976300419", // inter — 05-player-celebration
  "4e751283-27c2-4fb7-a812-4faff62cd669", // psg — 01-festa-trocadero-2013
  "7a91027f-8d81-46ac-b579-f6d598d187c7", // psg — 02-intertoto-2001
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
