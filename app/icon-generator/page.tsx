"use client";

import { useState, useCallback } from "react";

// ─── Icon data ────────────────────────────────────────────────────────────────

const SOCCER_ICONS = [
  {
    label: "Soccer Ball",
    iconName: "classic black-and-white soccer ball",
    primaryColor: "white",
    accentColor: "matte black panels with chrome valve detail",
  },
  {
    label: "Football Boot / Cleat",
    iconName: "football cleat boot with studs",
    primaryColor: "neon yellow-green",
    accentColor: "electric blue sole and laces",
  },
  {
    label: "Champions Trophy",
    iconName: "football champions cup trophy",
    primaryColor: "shiny gold",
    accentColor: "deep purple base with gold handles",
  },
  {
    label: "Football Jersey",
    iconName: "football jersey shirt",
    primaryColor: "vivid red",
    accentColor: "gold trim collar and cuffs",
  },
  {
    label: "Red Card",
    iconName: "referee red card held up",
    primaryColor: "vivid red",
    accentColor: "orange-gold glowing edge",
  },
  {
    label: "Yellow Card",
    iconName: "referee yellow card held up",
    primaryColor: "bright yellow",
    accentColor: "warm amber glowing edge",
  },
  {
    label: "Goalkeeper Gloves",
    iconName: "goalkeeper gloves pair",
    primaryColor: "lime green",
    accentColor: "hot pink logo detail and finger spines",
  },
  {
    label: "Referee Whistle",
    iconName: "referee sports whistle",
    primaryColor: "chrome silver",
    accentColor: "cobalt blue ring and lanyard",
  },
  {
    label: "Football Goal",
    iconName: "football goal with net",
    primaryColor: "white chrome posts and crossbar",
    accentColor: "teal-blue glowing net",
  },
  {
    label: "Gold Medal",
    iconName: "sports gold medal with ribbon",
    primaryColor: "shiny gold",
    accentColor: "royal blue ribbon with gold stripe",
  },
  {
    label: "Stadium",
    iconName: "football stadium arena",
    primaryColor: "royal blue",
    accentColor: "purple gradient roof with glowing pitch",
  },
  {
    label: "Corner Flag",
    iconName: "football corner flag on post",
    primaryColor: "vivid red",
    accentColor: "white pole with neon green base",
  },
  {
    label: "Stopwatch / Timer",
    iconName: "sports stopwatch timer",
    primaryColor: "chrome silver",
    accentColor: "neon orange dial and button",
  },
  {
    label: "Tactics Board",
    iconName: "football tactics clipboard coaching board",
    primaryColor: "emerald green pitch surface",
    accentColor: "white lines with black clipboard frame",
  },
  {
    label: "Captain's Armband",
    iconName: "football captain armband with C initial",
    primaryColor: "shiny gold",
    accentColor: "black velvet band with red stitching",
  },
  {
    label: "Shin Guards",
    iconName: "football shin guards pair",
    primaryColor: "neon yellow",
    accentColor: "carbon black frame with blue strap",
  },
  {
    label: "VAR Monitor",
    iconName: "VAR video assistant referee monitor screen",
    primaryColor: "sleek black",
    accentColor: "electric blue glowing screen with football play overlay",
  },
  {
    label: "Scoreboard",
    iconName: "retro football scoreboard sign",
    primaryColor: "deep navy blue",
    accentColor: "gold LED score digits with red border",
  },
  {
    label: "Football Scarf",
    iconName: "football supporter scarf",
    primaryColor: "vivid red",
    accentColor: "white and gold stripes",
  },
  {
    label: "Net / Goal Net",
    iconName: "football goal net close-up",
    primaryColor: "white",
    accentColor: "cyan blue glow with subtle shadow",
  },
  {
    label: "Premier League Emblem",
    iconName: "Premier League shield badge emblem with a rearing lion holding a trophy",
    primaryColor: "royal purple",
    accentColor: "sky blue and gold lion detail",
  },
  {
    label: "La Liga Emblem",
    iconName: "La Liga shield badge emblem with bold geometric crest shape",
    primaryColor: "vivid orange",
    accentColor: "deep purple outline with gold trim",
  },
  {
    label: "Bundesliga Emblem",
    iconName: "Bundesliga shield badge emblem with bold geometric crest",
    primaryColor: "vivid red",
    accentColor: "jet black outline with white highlights",
  },
  {
    label: "Serie A Emblem",
    iconName: "Serie A shield badge emblem with a stylised A letterform inside a crest",
    primaryColor: "deep navy blue",
    accentColor: "gold star detail and black outlined shield",
  },
  {
    label: "Ligue 1 Emblem",
    iconName: "Ligue 1 shield badge emblem with bold crest shape",
    primaryColor: "vivid red",
    accentColor: "white and royal blue French tricolor accents",
  },
  {
    label: "Spain Emblem",
    iconName: "Spain national football team shield crest emblem topped with a royal crown",
    primaryColor: "vivid red and golden yellow",
    accentColor: "royal navy blue crown detail with gold trim border",
  },
  {
    label: "Arsenal Crest",
    iconName: "Arsenal FC shield crest with a bold cannon on the front",
    primaryColor: "vivid red",
    accentColor: "white and gold trim detail",
  },
  {
    label: "Barcelona Crest",
    iconName: "FC Barcelona shield crest with vertical blue and red stripes and a golden cross",
    primaryColor: "deep royal blue",
    accentColor: "vivid red stripes and gold cross with maroon border",
  },
  {
    label: "Inter Milan Crest",
    iconName: "Inter Milan circular crest badge with INTER lettering and blue and black stripes",
    primaryColor: "deep navy blue",
    accentColor: "jet black stripes with gold outlined border",
  },
  {
    label: "Bayern Munich Crest",
    iconName: "Bayern Munich circular crest badge with blue and white Bavarian diamond pattern in the center",
    primaryColor: "vivid red",
    accentColor: "royal blue and white Bavarian diamonds with gold ring border",
  },
  {
    label: "Paris Saint-Germain Crest",
    iconName: "Paris Saint-Germain shield crest with an Eiffel Tower motif in the center",
    primaryColor: "deep navy blue",
    accentColor: "vivid red and white with gold Eiffel Tower detail",
  },
];

// ─── Font style options ───────────────────────────────────────────────────────

const FONT_STYLES = [
  {
    label: "Boldonse",
    description: "Boldonse display typeface — ultra-heavy weight, extra-bold condensed uppercase letterforms, extremely thick uniform strokes with subtly rounded terminals, tight letter-spacing, high x-height, strong geometric construction, imposing championship-poster character",
  },
  {
    label: "Bold Sans-Serif",
    description: "bold geometric sans-serif typeface, tight letter-spacing, strong vertical strokes",
  },
  {
    label: "All-Caps Block",
    description: "heavy uppercase block letter typeface, condensed, slab-like strokes",
  },
  {
    label: "Rounded Bubble",
    description: "rounded bubble letter typeface, extra-wide strokes, cartoon-friendly",
  },
  {
    label: "Serif / Elegant",
    description: "classic high-contrast serif typeface, thin-to-thick stroke variation",
  },
  {
    label: "Script / Cursive",
    description: "flowing connected script cursive typeface, dynamic angled baseline",
  },
];

// ─── Prompt templates ─────────────────────────────────────────────────────────

const ICON_PROMPT = (iconName: string, primaryColor: string, accentColor: string) =>
  `A single 3D rendered ${iconName} icon, hyper-realistic glossy plastic material, inflated bubbly toy aesthetic, vibrant saturated ${primaryColor} with ${accentColor} highlights, subsurface scattering, ultra-smooth rounded edges, plump and puffy form language, studio three-point lighting with strong specular highlights and soft rim light, floating centered on a pure black background, no shadow, no drop shadow, plain flat background, slight 3/4 front-facing perspective, ultra-detailed CGI render, Blender/Cinema4D quality, 4K, no text, no UI, isolated icon`;

const TEXT_PROMPT = (
  text: string,
  fontDesc: string,
  primaryColor: string,
  accentColor: string
) =>
  `The word "${text}" rendered as puffy inflated 3D lettering, ${fontDesc}, hyper-realistic glossy plastic material, balloon-like letterforms with ultra-smooth rounded inflated edges and plump swollen strokes, vibrant saturated ${primaryColor} letters with ${accentColor} highlights, subsurface scattering, studio three-point lighting with strong specular highlights and soft rim light, floating centered on a pure black background, no shadow, no drop shadow, plain flat background, front-facing perspective, ultra-detailed CGI render, Blender/Cinema4D quality, 4K, isolated lettering`;

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = "icons" | "text";

export default function IconGeneratorPage() {
  const [tab, setTab] = useState<Tab>("icons");

  // Icon state
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [iconPrimary, setIconPrimary] = useState(SOCCER_ICONS[0].primaryColor);
  const [iconAccent, setIconAccent] = useState(SOCCER_ICONS[0].accentColor);
  const [iconName, setIconName] = useState(SOCCER_ICONS[0].iconName);

  // Text state
  const [textValue, setTextValue] = useState("CHAMPIONS PUZZLE");
  const [fontIndex, setFontIndex] = useState(0); // 0 = Boldonse
  const [textPrimary, setTextPrimary] = useState("vivid red");
  const [textAccent, setTextAccent] = useState("white gloss with gold edge highlight");

  const [copied, setCopied] = useState(false);

  const handleIconChange = useCallback((index: number) => {
    setSelectedIndex(index);
    setIconName(SOCCER_ICONS[index].iconName);
    setIconPrimary(SOCCER_ICONS[index].primaryColor);
    setIconAccent(SOCCER_ICONS[index].accentColor);
  }, []);

  const prompt =
    tab === "icons"
      ? ICON_PROMPT(iconName, iconPrimary, iconAccent)
      : TEXT_PROMPT(
          textValue || "text",
          FONT_STYLES[fontIndex].description,
          textPrimary,
          textAccent
        );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#0D0D0D] text-white px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-[#9C824A] font-semibold">
            Seedream × Magnific
          </p>
          <h1 className="text-3xl font-bold tracking-tight">
            Prompt Generator
          </h1>
          <p className="text-sm text-white/40">
            Build prompts for 3D puffy icons and text.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 bg-[#1a1a1a] p-1 rounded-xl w-fit">
          {(["icons", "text"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold tracking-wide transition-all duration-150 capitalize ${
                tab === t
                  ? "bg-[#EF0107] text-white"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {t === "icons" ? "Icons" : "Text"}
            </button>
          ))}
        </div>

        {/* ── ICONS TAB ── */}
        {tab === "icons" && (
          <>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/40 font-semibold">
                Icon
              </label>
              <div className="relative">
                <select
                  value={selectedIndex}
                  onChange={(e) => handleIconChange(Number(e.target.value))}
                  className="w-full appearance-none bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#EF0107] transition-colors cursor-pointer pr-10"
                >
                  {SOCCER_ICONS.map((icon, i) => (
                    <option key={i} value={i}>
                      {icon.label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-xs">
                  ▼
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/40 font-semibold">
                  Primary Color
                </label>
                <input
                  type="text"
                  value={iconPrimary}
                  onChange={(e) => setIconPrimary(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#EF0107] transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/40 font-semibold">
                  Accent Color
                </label>
                <input
                  type="text"
                  value={iconAccent}
                  onChange={(e) => setIconAccent(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#EF0107] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/40 font-semibold">
                Icon Description{" "}
                <span className="normal-case text-white/25">(optional override)</span>
              </label>
              <input
                type="text"
                value={iconName}
                onChange={(e) => setIconName(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#EF0107] transition-colors"
              />
            </div>
          </>
        )}

        {/* ── TEXT TAB ── */}
        {tab === "text" && (
          <>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/40 font-semibold">
                Text
              </label>
              <input
                type="text"
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                placeholder="e.g. Arsenal, La Liga, GOAT…"
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#EF0107] transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/40 font-semibold">
                Font Style
              </label>
              <div className="relative">
                <select
                  value={fontIndex}
                  onChange={(e) => setFontIndex(Number(e.target.value))}
                  className="w-full appearance-none bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#EF0107] transition-colors cursor-pointer pr-10"
                >
                  {FONT_STYLES.map((f, i) => (
                    <option key={i} value={i}>
                      {f.label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-xs">
                  ▼
                </span>
              </div>
              <p className="text-xs text-white/30 px-1 leading-relaxed">
                {FONT_STYLES[fontIndex].description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/40 font-semibold">
                  Letter Color
                </label>
                <input
                  type="text"
                  value={textPrimary}
                  onChange={(e) => setTextPrimary(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#EF0107] transition-colors"
                  placeholder="e.g. vivid red"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/40 font-semibold">
                  Highlight / Gloss
                </label>
                <input
                  type="text"
                  value={textAccent}
                  onChange={(e) => setTextAccent(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#EF0107] transition-colors"
                  placeholder="e.g. white gloss with gold edge"
                />
              </div>
            </div>
          </>
        )}

        {/* Generated Prompt */}
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-white/40 font-semibold">
            Generated Prompt
          </label>
          <div className="bg-[#141414] border border-white/10 rounded-xl p-4">
            <p className="text-sm text-white/80 leading-relaxed select-all">
              {prompt}
            </p>
          </div>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className={`w-full py-4 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200 ${
            copied
              ? "bg-green-600 text-white scale-[0.99]"
              : "bg-[#EF0107] hover:bg-[#B80106] active:scale-[0.99] text-white"
          }`}
        >
          {copied ? "Copied!" : "Copy Prompt"}
        </button>

        {/* Tip */}
        <p className="text-xs text-white/25 text-center leading-relaxed">
          Tip: lock the seed after your first result and regenerate other icons
          with the same seed to keep lighting consistent across the set.
        </p>
      </div>
    </main>
  );
}
