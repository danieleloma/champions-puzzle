// Seeds the celebration-photo puzzles sourced from Wikimedia Commons (see
// public/puzzles/ATTRIBUTIONS.md) into the `puzzles` table, one row per club.
//
// Requires migration 003_puzzle_club_id.sql to already be applied.
// Run with:  node --env-file=.env.local scripts/seed-club-puzzles.mjs

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
    title: "FA Cup Winners Parade, 2015",
    description: "Arsenal players on the open-top bus during the 2015 FA Cup victory parade.",
    image_url: "/puzzles/arsenal/01-fa-cup-parade-2015.jpg",
    thumbnail_url: "/puzzles/arsenal/01-fa-cup-parade-2015-thumb.jpg",
    difficulty: "easy",
    featured: true,
  },
  {
    club_id: "arsenal",
    title: "Lifting the 2015 FA Cup",
    description: "Per Mertesacker and Mikel Arteta lifting the FA Cup at the trophy parade.",
    image_url: "/puzzles/arsenal/02-arteta-fa-cup-2015.jpg",
    thumbnail_url: "/puzzles/arsenal/02-arteta-fa-cup-2015-thumb.jpg",
    difficulty: "medium",
    featured: false,
  },
  {
    club_id: "barcelona",
    title: "Champions League Celebration, La Rambla 2011",
    description: "Barcelona's Champions League victory celebration at La Rambla, Barcelona.",
    image_url: "/puzzles/barcelona/01-ucl-2011-la-rambla.jpg",
    thumbnail_url: "/puzzles/barcelona/01-ucl-2011-la-rambla-thumb.jpg",
    difficulty: "easy",
    featured: true,
  },
  {
    club_id: "barcelona",
    title: "Champions of Europe, 2009",
    description: "Barcelona players celebrating on the pitch after winning the 2008-09 UEFA Champions League final.",
    image_url: "/puzzles/barcelona/02-copa-campeones-2009.jpg",
    thumbnail_url: "/puzzles/barcelona/02-copa-campeones-2009-thumb.jpg",
    difficulty: "medium",
    featured: false,
  },
  {
    club_id: "inter",
    title: "Scudetto Number 17, 2009",
    description: "San Siro celebrations after Inter Milan clinched their 17th Serie A title.",
    image_url: "/puzzles/inter/01-scudetto-17-2009.jpg",
    thumbnail_url: "/puzzles/inter/01-scudetto-17-2009-thumb.jpg",
    difficulty: "easy",
    featured: true,
  },
  {
    club_id: "inter",
    title: "Coppa Italia, 2006",
    description: "Inter Milan lifting the Coppa Italia after beating Roma at San Siro.",
    image_url: "/puzzles/inter/02-coppa-italia-2006.jpg",
    thumbnail_url: "/puzzles/inter/02-coppa-italia-2006-thumb.jpg",
    difficulty: "medium",
    featured: false,
  },
  {
    club_id: "bayern",
    title: "Rathaus Balcony Celebration, 2025",
    description: "FC Bayern's championship celebration on the Munich Rathaus balcony.",
    image_url: "/puzzles/bayern/01-balkon-2025.jpg",
    thumbnail_url: "/puzzles/bayern/01-balkon-2025-thumb.jpg",
    difficulty: "easy",
    featured: true,
  },
  {
    club_id: "bayern",
    title: "Meisterschaftsfeier, Marienplatz 2025",
    description: "FC Bayern's title celebration at Marienplatz in Munich.",
    image_url: "/puzzles/bayern/02-marienplatz-2025.jpg",
    thumbnail_url: "/puzzles/bayern/02-marienplatz-2025-thumb.jpg",
    difficulty: "medium",
    featured: false,
  },
  {
    club_id: "psg",
    title: "Trocadéro Celebration, 2013",
    description: "Thousands of PSG supporters gathered at Trocadéro for the club's Ligue 1 title celebration.",
    image_url: "/puzzles/psg/01-festa-trocadero-2013.jpg",
    thumbnail_url: "/puzzles/psg/01-festa-trocadero-2013-thumb.jpg",
    difficulty: "easy",
    featured: true,
  },
  {
    club_id: "psg",
    title: "Intertoto Cup, 2001",
    description: "PSG captain Frédéric Déhu lifting the UEFA Intertoto Cup in Brescia.",
    image_url: "/puzzles/psg/02-intertoto-2001.jpg",
    thumbnail_url: "/puzzles/psg/02-intertoto-2001-thumb.jpg",
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
