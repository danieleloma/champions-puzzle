// Seeds puzzles for each club's 2025/26 season championship win (see
// public/puzzles/ATTRIBUTIONS.md for image sourcing/licensing).
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
  {
    club_id: "barcelona",
    title: "La Liga Champions Parade, 2026",
    description: "Barcelona's title-winning squad greet fans from the open-top bus during the 2025/26 La Liga champions parade.",
    image_url: "/puzzles/barcelona/03-laliga-champions-parade-2026.jpg",
    thumbnail_url: "/puzzles/barcelona/03-laliga-champions-parade-2026-thumb.jpg",
    difficulty: "easy",
    featured: true,
  },
  {
    club_id: "barcelona",
    title: "Campions! Bus Parade, 2026",
    description: "The Barça team bus makes its way through Barcelona as thousands of fans celebrate the 29th La Liga title.",
    image_url: "/puzzles/barcelona/04-campions-bus-parade-2026.jpg",
    thumbnail_url: "/puzzles/barcelona/04-campions-bus-parade-2026-thumb.jpg",
    difficulty: "medium",
    featured: false,
  },
  {
    club_id: "inter",
    title: "Scudetto Number 21, 2026",
    description: "Inter fans celebrate the club's 21st Serie A title atop the Monumento a Giuseppe Garibaldi in Milan.",
    image_url: "/puzzles/inter/03-scudetto-21-garibaldi-2026.jpg",
    thumbnail_url: "/puzzles/inter/03-scudetto-21-garibaldi-2026-thumb.jpg",
    difficulty: "easy",
    featured: true,
  },
  {
    club_id: "bayern",
    title: "Rathaus Balcony Celebration, 2026",
    description: "FC Bayern's squad celebrate their 35th German championship on the Munich Rathaus balcony.",
    image_url: "/puzzles/bayern/03-rathaus-balkon-2026.jpg",
    thumbnail_url: "/puzzles/bayern/03-rathaus-balkon-2026-thumb.jpg",
    difficulty: "easy",
    featured: true,
  },
  {
    club_id: "bayern",
    title: "Marienplatz Meisterfeier, 2026",
    description: "Thousands of Bayern fans fill Marienplatz for the 2025/26 Bundesliga championship celebration.",
    image_url: "/puzzles/bayern/04-marienplatz-crowd-2026.jpg",
    thumbnail_url: "/puzzles/bayern/04-marienplatz-crowd-2026-thumb.jpg",
    difficulty: "medium",
    featured: false,
  },
  {
    club_id: "psg",
    title: "UEFA Champions League Final, 2026",
    description: "The Parc des Princes fan zone during PSG's 2025/26 Champions League final victory over Arsenal.",
    image_url: "/puzzles/psg/03-ucl-final-parc-des-princes-2026.jpg",
    thumbnail_url: "/puzzles/psg/03-ucl-final-parc-des-princes-2026-thumb.jpg",
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
