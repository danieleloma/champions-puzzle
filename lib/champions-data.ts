import type { Icon3DName } from "@/components/ui";

// ── Shared champion club data ─────────────────────────────────────────────────
//
//  Used by:
//    /champions  — club selection cards (floatIcons)
//    /club/[id]  — club hero + ghost icons (heroIcons)

export interface FloatDef {
  name:    Icon3DName;
  right:   number;
  top:     number;
  size:    number;
  imgSize: number;
  deg:     number;
}

// Ghost icons for the /club hero — 123px, 20% opacity, inside 408×225 container
export interface HeroIconDef {
  name: Icon3DName;
  /** Left edge of the 123px container within the 408px-wide hero */
  left: number;
  top:  number;
  deg:  number;
}

export interface Champion {
  id:            string;
  club:          string;
  league:        string;
  leagueKey:     string;
  /** Hero subtitle  e.g. "PREMIER LEAGUE CHAMPIONS" */
  leagueTitle:   string;
  /** Pre-composited card image used on the /champions selection screen */
  cardImageSrc:  string;
  /** Very light colour for the sky gradient stop (fallback when no cardImageSrc) */
  skyColor:      string;
  gradFrom:      string;
  gradTo:        string;
  badgeIcon?:    Icon3DName;
  badgeLetter?:  string;
  /** Floating icons on the /champions card (fallback only) */
  floatIcons:    FloatDef[];
  /** Ghost icons behind the hero text on /club/[id] */
  heroIcons:     HeroIconDef[];
}

// Figma node 29:2549 — hero container is 408×225 px.
// Ghost icon positions: left = center_x − 61.5  (halfSize of 123px icon).
// From Figma: cx = 50%±offset → at 408px frame, 50% = 204px.
export const CHAMPIONS: Champion[] = [
  {
    id:           "arsenal",
    club:         "Arsenal",
    league:       "English Premier League",
    leagueKey:    "premier-league",
    leagueTitle:  "PREMIER LEAGUE CHAMPIONS",
    cardImageSrc: "/clubs/arsenal.png",
    skyColor:     "#ffb3b4",
    gradFrom:    "#ff383c",
    gradTo:      "#7a1a1c",
    badgeIcon:   "arsenal",
    floatIcons: [
      { name: "jersey", right: -8.07,  top:  142,    size: 102, imgSize:  75, deg:  28.72 },
      { name: "scarf",  right: -21.07, top:  -14,    size: 106, imgSize:  75, deg: -40.91 },
      { name: "flag",   right:  87.78, top:   60.49, size: 140, imgSize: 108, deg: -21.29 },
    ],
    // Positions from Figma 29:2551 ghost icons (center_x − 61.5, keep top as-is)
    heroIcons: [
      { name: "stopwatch", left: -48, top: 105,  deg:   0      }, // cx=13.12
      { name: "medal",     left: 205, top: 102,  deg: -24.51   }, // cx=267.12
      { name: "whistle",   left: 312, top:  -16, deg: -28.28   }, // cx=373.96
      { name: "scarf",     left:  64, top: 167,  deg:   0      }, // cx=125.12
    ],
  },
  {
    id:           "barcelona",
    club:         "Barcelona",
    league:       "Spanish La Liga",
    leagueKey:    "la-liga",
    leagueTitle:  "LA LIGA CHAMPIONS",
    cardImageSrc: "/clubs/barcelona.png",
    skyColor:     "#93c5fd",
    gradFrom:    "#2563eb",
    gradTo:      "#1e3a8a",
    badgeIcon:   "barcelona",
    floatIcons: [
      { name: "goal-post", right:  97.82, top:  104.91, size: 117, imgSize:  86, deg: -28.11 },
      { name: "ball",      right:  78.36, top:  -24.58, size: 125, imgSize:  89, deg: -40.91 },
      { name: "board",     right: -52.33, top:   57.4,  size: 141, imgSize: 108, deg:  22.44 },
    ],
    heroIcons: [
      { name: "ball",      left: -44, top: 108, deg:   0    },
      { name: "cup",       left: 208, top: 100, deg: -22    },
      { name: "flag",      left: 315, top: -14, deg: -30    },
      { name: "jersey",    left:  68, top: 162, deg:   0    },
    ],
  },
  {
    id:           "inter",
    club:         "Inter Milan",
    league:       "Italian Serie A",
    leagueKey:    "serie-a",
    leagueTitle:  "SERIE A CHAMPIONS",
    cardImageSrc: "/clubs/inter.png",
    skyColor:     "#bfdbfe",
    gradFrom:    "#1d4ed8",
    gradTo:      "#0c1a4e",
    badgeIcon:   "inter",
    floatIcons: [
      { name: "cup",   right:  -8, top: 138, size: 105, imgSize:  78, deg:  25 },
      { name: "scarf", right: -18, top: -12, size: 108, imgSize:  78, deg: -38 },
      { name: "medal", right:  88, top:  58, size: 135, imgSize: 104, deg: -20 },
    ],
    heroIcons: [
      { name: "scarf",    left: -46, top: 110, deg:   0   },
      { name: "cup",      left: 207, top: 103, deg: -25   },
      { name: "medal",    left: 313, top: -13, deg: -28   },
      { name: "boot",     left:  66, top: 165, deg:   0   },
    ],
  },
  {
    id:           "bayern",
    club:         "Bayern Munich",
    league:       "German Bundesliga",
    leagueKey:    "bundesliga",
    leagueTitle:  "BUNDESLIGA CHAMPIONS",
    cardImageSrc: "/clubs/bayern.png",
    skyColor:     "#fca5a5",
    gradFrom:    "#dc2626",
    gradTo:      "#7f1d1d",
    badgeIcon:   "bayern",
    floatIcons: [
      { name: "boot",         right:  -8, top: 142, size: 103, imgSize:  76, deg:  22 },
      { name: "captain-band", right: -18, top: -12, size: 107, imgSize:  76, deg: -38 },
      { name: "ball",         right:  86, top:  60, size: 136, imgSize: 105, deg: -20 },
    ],
    heroIcons: [
      { name: "captain-band", left: -45, top: 107, deg:   0   },
      { name: "ball",         left: 206, top: 101, deg: -24   },
      { name: "boot",         left: 314, top: -15, deg: -27   },
      { name: "stopwatch",    left:  65, top: 164, deg:   0   },
    ],
  },
  {
    id:           "psg",
    club:         "PSG",
    league:       "French Ligue 1",
    leagueKey:    "ligue-1",
    leagueTitle:  "LIGUE 1 CHAMPIONS",
    cardImageSrc: "/clubs/psg.png",
    skyColor:     "#93c5fd",
    gradFrom:    "#0059a1",
    gradTo:      "#00285a",
    badgeIcon:   "psg",
    floatIcons: [
      { name: "jersey",    right:  -8, top: 140, size: 104, imgSize:  77, deg:  30 },
      { name: "flag",      right: -20, top: -13, size: 107, imgSize:  77, deg: -42 },
      { name: "stopwatch", right:  89, top:  61, size: 133, imgSize: 103, deg: -22 },
    ],
    heroIcons: [
      { name: "flag",     left: -47, top: 109, deg:   0   },
      { name: "jersey",   left: 209, top: 102, deg: -23   },
      { name: "whistle",  left: 316, top: -12, deg: -29   },
      { name: "scarf",    left:  67, top: 166, deg:   0   },
    ],
  },
];

export function getChampion(id: string): Champion | undefined {
  return CHAMPIONS.find((c) => c.id === id);
}
