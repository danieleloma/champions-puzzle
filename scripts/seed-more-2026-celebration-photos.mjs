// Seeds a second wave of 2025/26 celebration-photo puzzles across all six
// clubs (see public/puzzles/ATTRIBUTIONS.md — these images were supplied
// directly and don't require CC attribution, unlike the first wave).
//
// NOTE: this script originally also seeded two non-2026-dated Inter Milan
// action/celebration shots ("Champions League Action" and "Player
// Celebration"); those were later retired (see
// scripts/remove-old-celebration-photos.mjs) and removed from this file so
// re-running it can't resurrect them.
//
// Run with:  node --env-file=.env.local scripts/seed-more-2026-celebration-photos.mjs

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const PUZZLES = [
  // ── Arsenal ──────────────────────────────────────────────────────────────
  {
    club_id: "arsenal",
    title: "Lifting the Premier League Trophy, 2026",
    description: "Arsenal's players lift the Premier League trophy on the pitch, ribbons and confetti flying.",
    image_url: "/puzzles/arsenal/05-trophy-lift-2026.jpg",
    thumbnail_url: "/puzzles/arsenal/05-trophy-lift-2026-thumb.jpg",
    difficulty: "easy",
    featured: true,
  },
  {
    club_id: "arsenal",
    title: "Tossing Arteta in the Air, 2026",
    description: "Arsenal players throw manager Mikel Arteta into the air in celebration after securing the title.",
    image_url: "/puzzles/arsenal/06-manager-toss-celebration-2026.jpg",
    thumbnail_url: "/puzzles/arsenal/06-manager-toss-celebration-2026-thumb.jpg",
    difficulty: "medium",
    featured: false,
  },
  {
    club_id: "arsenal",
    title: "Title-Winning Goal Celebration",
    description: "Arsenal players celebrate a goal during the 2025/26 title-winning campaign.",
    image_url: "/puzzles/arsenal/07-title-winning-goal-celebration-2026.jpg",
    thumbnail_url: "/puzzles/arsenal/07-title-winning-goal-celebration-2026-thumb.jpg",
    difficulty: "medium",
    featured: false,
  },
  {
    club_id: "arsenal",
    title: "Arteta with the Premier League Trophy, 2026",
    description: "Mikel Arteta poses with the Premier League trophy after Arsenal's title win.",
    image_url: "/puzzles/arsenal/08-arteta-trophy-2026.jpg",
    thumbnail_url: "/puzzles/arsenal/08-arteta-trophy-2026-thumb.jpg",
    difficulty: "medium",
    featured: false,
  },
  {
    club_id: "arsenal",
    title: "Champions 2025/26 Confetti Celebration",
    description: "Arsenal's squad celebrate on the podium under a shower of red and white confetti.",
    image_url: "/puzzles/arsenal/09-champions-2026-confetti.jpg",
    thumbnail_url: "/puzzles/arsenal/09-champions-2026-confetti-thumb.jpg",
    difficulty: "medium",
    featured: false,
  },
  {
    club_id: "arsenal",
    title: "Players and Fans Celebrate, 2026",
    description: "An Arsenal player shares the title celebration with fans in the crowd.",
    image_url: "/puzzles/arsenal/10-fans-players-celebration-2026.jpg",
    thumbnail_url: "/puzzles/arsenal/10-fans-players-celebration-2026-thumb.jpg",
    difficulty: "medium",
    featured: false,
  },

  // ── Barcelona ────────────────────────────────────────────────────────────
  {
    club_id: "barcelona",
    title: "La Liga Trophy Celebration, 2026",
    description: "A Barcelona player celebrates in front of the La Liga trophy after the 2025/26 title win.",
    image_url: "/puzzles/barcelona/05-la-liga-trophy-2026.jpg",
    thumbnail_url: "/puzzles/barcelona/05-la-liga-trophy-2026-thumb.jpg",
    difficulty: "easy",
    featured: true,
  },
  {
    club_id: "barcelona",
    title: "Celebrating with the Trophy, 2026",
    description: "A Barcelona player lifts a trophy in celebration with teammates.",
    image_url: "/puzzles/barcelona/06-player-trophy-celebration-2026.jpg",
    thumbnail_url: "/puzzles/barcelona/06-player-trophy-celebration-2026-thumb.jpg",
    difficulty: "medium",
    featured: false,
  },
  {
    club_id: "barcelona",
    title: "Squad and Club Executives Celebrate, 2026",
    description: "Barcelona's players and club executives pose together with the title trophy.",
    image_url: "/puzzles/barcelona/07-club-executives-celebration-2026.jpg",
    thumbnail_url: "/puzzles/barcelona/07-club-executives-celebration-2026-thumb.jpg",
    difficulty: "medium",
    featured: false,
  },
  {
    club_id: "barcelona",
    title: "Trophy Lift Under the Lights, 2026",
    description: "Barcelona's squad lift the trophy together under the stadium floodlights.",
    image_url: "/puzzles/barcelona/08-night-trophy-lift-2026.jpg",
    thumbnail_url: "/puzzles/barcelona/08-night-trophy-lift-2026-thumb.jpg",
    difficulty: "medium",
    featured: false,
  },
  {
    club_id: "barcelona",
    title: "Pitch-Side Celebration, 2026",
    description: "Barcelona players celebrate together on the pitch after the final whistle.",
    image_url: "/puzzles/barcelona/09-pitch-side-celebration-2026.jpg",
    thumbnail_url: "/puzzles/barcelona/09-pitch-side-celebration-2026-thumb.jpg",
    difficulty: "medium",
    featured: false,
  },
  {
    club_id: "barcelona",
    title: "Raphinha Celebrates with a Teammate",
    description: "Raphinha shares an embrace with a teammate during the title celebrations.",
    image_url: "/puzzles/barcelona/10-raphinha-teammate-hug-2026.jpg",
    thumbnail_url: "/puzzles/barcelona/10-raphinha-teammate-hug-2026-thumb.jpg",
    difficulty: "medium",
    featured: false,
  },
  {
    club_id: "barcelona",
    title: "Team Huddle Celebration, 2026",
    description: "Barcelona's squad huddle together in celebration after winning the league.",
    image_url: "/puzzles/barcelona/11-team-huddle-celebration-2026.jpg",
    thumbnail_url: "/puzzles/barcelona/11-team-huddle-celebration-2026-thumb.jpg",
    difficulty: "medium",
    featured: false,
  },

  // ── Bayern Munich ────────────────────────────────────────────────────────
  {
    club_id: "bayern",
    title: "Deutscher Meister, 2026",
    description: "Bayern Munich celebrate with the Meisterschale under the 'Deutscher Fussballmeister 2026' banner.",
    image_url: "/puzzles/bayern/05-meisterschale-celebration-2026.jpg",
    thumbnail_url: "/puzzles/bayern/05-meisterschale-celebration-2026-thumb.jpg",
    difficulty: "easy",
    featured: true,
  },
  {
    club_id: "bayern",
    title: "Lifting the Meisterschale, 2026",
    description: "A Bayern Munich player lifts the Meisterschale high above the celebrating squad.",
    image_url: "/puzzles/bayern/06-meisterschale-lift-close-up-2026.jpg",
    thumbnail_url: "/puzzles/bayern/06-meisterschale-lift-close-up-2026-thumb.jpg",
    difficulty: "medium",
    featured: false,
  },
  {
    club_id: "bayern",
    title: "Teammates Share the Meisterschale, 2026",
    description: "Bayern Munich players share a moment with the Meisterschale after the title win.",
    image_url: "/puzzles/bayern/07-teammates-meisterschale-2026.jpg",
    thumbnail_url: "/puzzles/bayern/07-teammates-meisterschale-2026-thumb.jpg",
    difficulty: "medium",
    featured: false,
  },
  {
    club_id: "bayern",
    title: "Harry Kane's Paulaner Celebration",
    description: "Harry Kane celebrates Bayern's title with a giant stein of Paulaner beer.",
    image_url: "/puzzles/bayern/08-kane-paulaner-celebration-2026.jpg",
    thumbnail_url: "/puzzles/bayern/08-kane-paulaner-celebration-2026-thumb.jpg",
    difficulty: "medium",
    featured: false,
  },
  {
    club_id: "bayern",
    title: "Manuel Neuer Lifts the Meisterschale",
    description: "Manuel Neuer raises the Meisterschale amid a shower of confetti.",
    image_url: "/puzzles/bayern/09-neuer-meisterschale-2026.jpg",
    thumbnail_url: "/puzzles/bayern/09-neuer-meisterschale-2026-thumb.jpg",
    difficulty: "medium",
    featured: false,
  },
  {
    club_id: "bayern",
    title: "Bayern Players Celebrate, 2026",
    description: "Bayern Munich players celebrate together on the pitch with the Meisterschale.",
    image_url: "/puzzles/bayern/10-players-celebration-2026.jpg",
    thumbnail_url: "/puzzles/bayern/10-players-celebration-2026-thumb.jpg",
    difficulty: "medium",
    featured: false,
  },

  // ── Inter Milan ──────────────────────────────────────────────────────────
  {
    club_id: "inter",
    title: "Campioni d'Italia — Scudetto 21, 2026",
    description: "Inter Milan players celebrate their 21st Serie A title with the 'Campioni d'Italia' shield.",
    image_url: "/puzzles/inter/06-scudetto-21-campioni-2026.jpg",
    thumbnail_url: "/puzzles/inter/06-scudetto-21-campioni-2026-thumb.jpg",
    difficulty: "medium",
    featured: false,
  },

  // ── PSG ──────────────────────────────────────────────────────────────────
  {
    club_id: "psg",
    title: "Ligue 1 Champions, 2026",
    description: "PSG's squad celebrate winning the 2025/26 Ligue 1 title.",
    image_url: "/puzzles/psg/04-ligue-1-champions-2026.jpg",
    thumbnail_url: "/puzzles/psg/04-ligue-1-champions-2026-thumb.jpg",
    difficulty: "easy",
    featured: true,
  },
  {
    club_id: "psg",
    title: "Champions League Trophies, 2026",
    description: "PSG players celebrate with the Champions League trophy amid red flares.",
    image_url: "/puzzles/psg/05-ucl-trophies-celebration-2026.jpg",
    thumbnail_url: "/puzzles/psg/05-ucl-trophies-celebration-2026-thumb.jpg",
    difficulty: "medium",
    featured: false,
  },
  {
    club_id: "psg",
    title: "Champions League Trophy Under Gold Confetti",
    description: "A PSG player raises the Champions League trophy under a shower of gold confetti.",
    image_url: "/puzzles/psg/06-ucl-trophy-confetti-2026.jpg",
    thumbnail_url: "/puzzles/psg/06-ucl-trophy-confetti-2026-thumb.jpg",
    difficulty: "medium",
    featured: false,
  },
  {
    club_id: "psg",
    title: "Luis Enrique Lifted Aloft, 2026",
    description: "PSG manager Luis Enrique is carried by his players under the Champions League arch.",
    image_url: "/puzzles/psg/07-luis-enrique-ucl-celebration-2026.jpg",
    thumbnail_url: "/puzzles/psg/07-luis-enrique-ucl-celebration-2026-thumb.jpg",
    difficulty: "medium",
    featured: false,
  },

  // ── Spain (World Cup) ────────────────────────────────────────────────────
  {
    club_id: "spain",
    title: "Lamine Yamal Celebrates, 2026",
    description: "Lamine Yamal celebrates during Spain's World Cup 2026 run.",
    image_url: "/puzzles/spain/02-yamal-celebration-2026.jpg",
    thumbnail_url: "/puzzles/spain/02-yamal-celebration-2026-thumb.jpg",
    difficulty: "easy",
    featured: true,
  },
  {
    club_id: "spain",
    title: "Kissing the World Cup Trophy",
    description: "A Spain player kisses the World Cup trophy after the final.",
    image_url: "/puzzles/spain/03-trophy-kiss-2026.jpg",
    thumbnail_url: "/puzzles/spain/03-trophy-kiss-2026-thumb.jpg",
    difficulty: "medium",
    featured: false,
  },
  {
    club_id: "spain",
    title: "World Cup Final Action",
    description: "Spain in action during the 2026 World Cup final against Argentina.",
    image_url: "/puzzles/spain/04-world-cup-final-action-2026.jpg",
    thumbnail_url: "/puzzles/spain/04-world-cup-final-action-2026-thumb.jpg",
    difficulty: "medium",
    featured: false,
  },
  {
    club_id: "spain",
    title: "Captain's Celebration, 2026",
    description: "Spain's captain celebrates as World Cup champions.",
    image_url: "/puzzles/spain/05-captain-celebration-2026.jpg",
    thumbnail_url: "/puzzles/spain/05-captain-celebration-2026-thumb.jpg",
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
