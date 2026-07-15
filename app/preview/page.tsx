"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Button, Input, Badge, BadgeContainer, InGameBadge,
  ClubCard, LeaderboardCard, DifficultyCard, MenuSwitcher,
  PuzzleTypeGrid, PuzzleGridTiles, ProgressBar, Icon3D,
  ImageCard,
} from "@/components/ui";
import type { Icon3DName } from "@/components/ui";
import type { Difficulty } from "@/types/puzzle";
import { CHAMPIONS } from "@/lib/champions-data";

// ── Shared preview helpers ────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-boldonse text-white text-base tracking-wide border-b border-[#252627] pb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      {label && <span className="font-mono text-[11px] text-[#73767b] uppercase tracking-widest">{label}</span>}
      <div className="flex flex-wrap gap-3 items-start">{children}</div>
    </div>
  );
}

// ── Screen preview card ───────────────────────────────────────────────────────

type Device = "desktop" | "mobile";

interface ScreenCardProps {
  title:  string;
  route:  string;
  device: Device;
  status?: "done" | "wip";
}

function ScreenCard({ title, route, device, status = "done" }: ScreenCardProps) {
  const isDesktop = device === "desktop";

  // Logical dimensions of the iframe viewport
  const vpW = isDesktop ? 1440 : 390;
  const vpH = isDesktop ? 900  : 844;

  // How large we actually render the frame card
  // Desktop cards use 600×375 (scale 0.417) so dark-themed pages are legible
  const cardW = isDesktop ? 600 : 180;
  const cardH = isDesktop ? 375 : 367;
  const iframeScale = cardW / vpW;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="font-sans font-medium text-sm text-white">{title}</span>
        {status === "wip" && (
          <span className="bg-[#ff6a0c] text-black font-mono text-[10px] px-1.5 py-0.5 rounded-full">
            WIP
          </span>
        )}
        <Link
          href={route}
          target="_blank"
          className="ml-auto font-mono text-[11px] text-[#73767b] hover:text-white transition-colors"
        >
          ↗ open
        </Link>
      </div>

      {/* Device frame */}
      <div
        className="relative bg-[#0d0d0d] overflow-hidden flex-shrink-0"
        style={{
          width:        cardW,
          height:       cardH,
          borderRadius: isDesktop ? 8 : 24,
          border:       "1px solid #252627",
        }}
      >
        {/* Iframe scaled down inside the card */}
        <iframe
          src={route}
          style={{
            width:           vpW,
            height:          vpH,
            transform:       `scale(${iframeScale})`,
            transformOrigin: "top left",
            border:          "none",
            pointerEvents:   "none",
          }}
          title={title}
        />
      </div>

      <span className="font-mono text-[11px] text-[#52545a]">{route}</span>
    </div>
  );
}

// ── Screens section ───────────────────────────────────────────────────────────

function ScreensSection() {
  const [firstPuzzleId, setFirstPuzzleId] = useState<string | null>(null);

  // Fetch a real puzzle ID so the Game Board iframe always loads properly
  useEffect(() => {
    fetch("/api/puzzles")
      .then((r) => r.json())
      .then((data: { puzzles: { id: string }[] }) => {
        if (data.puzzles?.[0]?.id) setFirstPuzzleId(data.puzzles[0].id);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col gap-10">

      {/* ── Entry & Onboarding flow ── */}
      <Section title="Onboarding">
        <div className="flex flex-wrap gap-8">
          <ScreenCard title="Splash / Landing"     route="/landing"    device="desktop" />
          <ScreenCard title="Create Username"      route="/onboarding" device="desktop" />
          <ScreenCard title="Choose Your Champion" route="/champions"  device="desktop" />
        </div>
      </Section>

      {/* ── Club detail + game ── */}
      <Section title="Club & Game">
        <div className="flex flex-wrap gap-8">
          <ScreenCard title="Club — Arsenal"   route="/club/arsenal"   device="desktop" />
          <ScreenCard title="Club — Barcelona" route="/club/barcelona" device="desktop" />
          <ScreenCard
            title="Game Board"
            route={firstPuzzleId ? `/play/${firstPuzzleId}` : "/play/demo"}
            device="desktop"
            status={firstPuzzleId ? "done" : "wip"}
          />
        </div>
      </Section>

      {/* ── Rankings & Utility ── */}
      <Section title="Rankings & Utility">
        <div className="flex flex-wrap gap-8">
          <ScreenCard title="Leaderboard" route="/leaderboard" device="desktop" />
          <ScreenCard title="Admin"       route="/admin"        device="desktop" status="wip" />
        </div>
      </Section>

    </div>
  );
}

// ── Components section ────────────────────────────────────────────────────────

function ComponentsSection() {
  const [switcherVal, setSwitcherVal] = useState("all-time");
  const [badgeVal, setBadgeVal]       = useState("premier-league");
  const [inputVal, setInputVal]       = useState("");
  const [hintVal]                     = useState(2);

  const difficulties: Difficulty[] = ["beginner", "easy", "medium"];

  const ALL_ICONS: Icon3DName[] = [
    "flag", "stadium", "board", "goal-post", "cup", "jersey", "boot",
    "scarf", "leg-pad", "captain-band", "ball", "yellow-card",
    "var-monitor", "substitute-board", "gloves", "red-card",
    "stopwatch", "whistle", "medal", "arsenal", "barcelona",
  ];

  return (
    <div className="flex flex-col gap-12">

      {/* ── Buttons ── */}
      <Section title="Button">
        <Row label="Variants">
          <Button fullWidth={false} variant="primary">LET'S PLAY</Button>
          <Button fullWidth={false} variant="secondary">CANCEL</Button>
          <Button fullWidth={false} variant="ghost">VIEW SCORES</Button>
          <Button fullWidth={false} variant="muted">UNAVAILABLE</Button>
        </Row>
        <Row label="Disabled">
          <Button fullWidth={false} variant="primary" disabled>LET'S PLAY</Button>
          <Button fullWidth={false} variant="secondary" disabled>CANCEL</Button>
        </Row>
        <Row label="Full width">
          <div className="w-80">
            <Button variant="primary">LET'S PLAY</Button>
          </div>
        </Row>
      </Section>

      {/* ── Input ── */}
      <Section title="Input">
        <Row label="Default">
          <div className="w-80">
            <Input
              placeholder="e.g. MajeekDaniel"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              maxLength={20}
              helperText={`${inputVal.length}/20 · Letters, numbers, underscores only`}
            />
          </div>
        </Row>
        <Row label="Error state">
          <div className="w-80">
            <Input
              placeholder="e.g. MajeekDaniel"
              defaultValue="taken_name"
              error="Username already taken. Try another."
            />
          </div>
        </Row>
      </Section>

      {/* ── Badge ── */}
      <Section title="Badge">
        <Row label="Badge — unselected / selected">
          <Badge label="Beginner" />
          <Badge label="Medium"   selected />
        </Row>
        <Row label="User info">
          <Badge variant="user-info" username="SakaSpeed"  avatarColor="#EF0107" xp={420} />
          <Badge variant="user-info" username="Gooner"     avatarColor="#063672" xp={0}   showXp={false} />
        </Row>
        <Row label="Featured">
          <Badge variant="featured" label="Ranks" />
        </Row>
      </Section>

      {/* ── Menu Switcher ── */}
      <Section title="Menu Switcher">
        <Row>
          <div className="w-80">
            <MenuSwitcher
              value={switcherVal}
              onChange={setSwitcherVal}
              tabs={[
                { value: "all-time",  label: "All Time"  },
                { value: "today",     label: "Today"     },
                { value: "this-week", label: "This Week" },
              ]}
            />
          </div>
        </Row>
      </Section>

      {/* ── Badge Container ── */}
      <Section title="Badge Container">
        <Row label="Filter row">
          <div className="w-[480px]">
            <BadgeContainer
              value={badgeVal}
              onChange={setBadgeVal}
              items={[
                { value: "premier-league", label: "Premier League" },
                { value: "la-liga",        label: "La Liga"        },
                { value: "serie-a",        label: "Serie A"        },
                { value: "bundesliga",     label: "Bundesliga"     },
                { value: "ligue-1",        label: "Ligue 1"        },
              ]}
            />
          </div>
        </Row>
      </Section>

      {/* ── Leaderboard Card ── */}
      <Section title="Leaderboard Card">
        <Row>
          <div className="w-[408px] flex flex-col gap-2">
            <LeaderboardCard rank={1} username="SakaSpeed"      difficulty="Medium"   puzzleTitle="Arteta Celebration" timeMs={47320} points={9800} />
            <LeaderboardCard rank={2} username="NorthLondon99"  difficulty="Easy"     puzzleTitle="Arteta Celebration" timeMs={62100} points={7400} />
            <LeaderboardCard rank={3} username="You"            difficulty="Beginner" puzzleTitle="Arteta Celebration" timeMs={88500} points={5200} isCurrentUser />
          </div>
        </Row>
      </Section>

      {/* ── Difficulty Card ── */}
      <Section title="Difficulty Card">
        <Row label="All difficulties">
          <div className="w-[408px] flex flex-col gap-2">
            {difficulties.map((d) => (
              <DifficultyCard key={d} difficulty={d} selected={d === "medium"} />
            ))}
          </div>
        </Row>
      </Section>

      {/* ── Puzzle Type Grid ── */}
      <Section title="Puzzle Type Grid">
        <Row label="All difficulties — 46×46px icon">
          {difficulties.map((d) => (
            <div key={d} className="flex flex-col items-center gap-1">
              <PuzzleTypeGrid difficulty={d} />
              <span className="font-mono text-[10px] text-[#52545a] capitalize">{d}</span>
            </div>
          ))}
        </Row>
      </Section>

      {/* ── Puzzle Grid Tiles ── */}
      <Section title="Puzzle Grid Tiles">
        <Row label="Placeholder (no image)">
          <PuzzleGridTiles cols={3} size={200} />
          <PuzzleGridTiles cols={4} size={200} />
          <PuzzleGridTiles cols={5} size={200} />
        </Row>
        <Row label="With image">
          <PuzzleGridTiles
            cols={3}
            size={200}
            imageUrl="https://dukcbuklbjjbcexbwgaf.supabase.co/storage/v1/object/public/puzzle-images/puzzles/1779883542723-h28fp9jfnji.avif"
          />
          <PuzzleGridTiles
            cols={4}
            size={200}
            imageUrl="https://dukcbuklbjjbcexbwgaf.supabase.co/storage/v1/object/public/puzzle-images/puzzles/1779883542723-h28fp9jfnji.avif"
          />
        </Row>
      </Section>

      {/* ── Progress Bar ── */}
      <Section title="Progress Bar">
        <Row>
          <div className="w-[408px] flex flex-col gap-4">
            <ProgressBar value={0}  total={25} />
            <ProgressBar value={8}  total={25} />
            <ProgressBar value={19} total={25} />
            <ProgressBar value={25} total={25} />
          </div>
        </Row>
      </Section>

      {/* ── In-Game Badge ── */}
      <Section title="In-Game Badge">
        <Row label="With count / icon-only / disabled">
          <InGameBadge value={hintVal} total={3} />
          <InGameBadge value={1}       total={3} showCount={false} />
          <InGameBadge value={3}       total={3} disabled />
        </Row>
      </Section>

      {/* ── Club Card ── */}
      <Section title="Club Card">
        <Row label="All 5 clubs">
          <div className="flex flex-wrap gap-4">
            {CHAMPIONS.map((c) => (
              <ClubCard
                key={c.id}
                club={c.club}
                league={c.league}
                imageSrc={c.cardImageSrc}
                skyColor={c.skyColor}
                gradFrom={c.gradFrom}
                gradTo={c.gradTo}
                badgeIcon={c.badgeIcon}
                badgeLetter={c.badgeLetter}
                floatIcons={c.floatIcons}
              />
            ))}
          </div>
        </Row>
      </Section>

      {/* ── Image Card ── */}
      <Section title="Image Card">
        <Row label="Puzzle cards">
          <ImageCard
            variant="puzzle"
            src="https://dukcbuklbjjbcexbwgaf.supabase.co/storage/v1/object/public/puzzle-images/puzzles/1779883542723-h28fp9jfnji.avif"
            title="Arteta Celebration"
            gridSize={3}
          />
          <ImageCard
            variant="puzzle"
            src="https://dukcbuklbjjbcexbwgaf.supabase.co/storage/v1/object/public/puzzle-images/puzzles/1779883542723-h28fp9jfnji.avif"
            title="Arteta Celebration"
            gridSize={5}
            tapLabel="Medium mode"
          />
        </Row>
        <Row label="Club card">
          <ImageCard
            variant="club"
            clubName="Arsenal"
            league="English Premier League"
          />
        </Row>
      </Section>

      {/* ── Icon3D ── */}
      <Section title="Icon 3D">
        <Row label="All 21 icons — 64px">
          <div className="flex flex-wrap gap-4">
            {ALL_ICONS.map((name) => (
              <div key={name} className="flex flex-col items-center gap-1">
                <div className="bg-[#161617] rounded-xl p-3 border border-[#252627]">
                  <Icon3D name={name} size={64} />
                </div>
                <span className="font-mono text-[9px] text-[#52545a]">{name}</span>
              </div>
            ))}
          </div>
        </Row>
      </Section>

    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

type PreviewTab = "screens" | "components";

export default function PreviewPage() {
  const [tab, setTab] = useState<PreviewTab>("screens");

  return (
    <div className="min-h-screen bg-[#0d0d0d]">

      {/* ── Sticky header ─────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-[#0d0d0d]/95 backdrop-blur-md border-b border-[#252627] px-6 py-4 flex items-center gap-6">
        <div>
          <span className="font-boldonse text-white text-lg">Arsenal Puzzle</span>
          <span className="font-mono text-[#52545a] text-xs ml-3">Design Preview</span>
        </div>
        <div className="ml-auto w-64">
          <MenuSwitcher
            value={tab}
            onChange={setTab}
            tabs={[
              { value: "screens",    label: "Screens"    },
              { value: "components", label: "Components" },
            ]}
          />
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className="max-w-[1340px] mx-auto px-6 py-10">
        {tab === "screens" ? <ScreensSection /> : <ComponentsSection />}
      </div>

    </div>
  );
}
