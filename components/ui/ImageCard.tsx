"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { playClick } from "@/lib/sounds";

// ── Figma node 13:201 "ImageClubContainer" ───────────────────────────────────
//
//  Three variants:
//
//  "club"   196×260px  rounded-24px
//           ├─ Red gradient bg (#ff383c → #992224) + background texture
//           ├─ Decorative 3D elements (passed as children)
//           └─ Bottom: club name (Boldonse 20px) + league (Geist Med 10/12)
//                      + PLAY button (#f4f4f4 bg, Boldonse 13px, pill)
//
//  "puzzle" 196×196px  rounded-12px  border #252627
//           ├─ Puzzle thumbnail fills card (object-cover)
//           └─ Bottom: puzzle title (Boldonse 14px, white)
//                      + "Nx×N · Tap to play" (Geist Mono Med 15px, #73767b)
//
//  Both share:
//    • bottom blur overlay  (blur-20px gradient, mix-blend-multiply)
//    • bottom info position (absolute, left-10px / left-9px, bottom-14px / bottom-13px)
// ─────────────────────────────────────────────────────────────────────────────

// ── Club card ─────────────────────────────────────────────────────────────────

export interface ClubCardProps {
  variant: "club";
  /** Club display name  e.g. "Arsenal" */
  clubName: string;
  /** League subtitle    e.g. "English Premier League" */
  league: string;
  /** Top gradient stop  default #ff383c (Arsenal red) */
  gradientFrom?: string;
  /** Bottom gradient stop  default #992224 */
  gradientTo?: string;
  /** Optional background texture image layered over the gradient */
  backgroundSrc?: string;
  /** 3D decorative elements — pass absolutely-positioned images as children */
  children?: ReactNode;
  onPlay?: () => void;
  className?: string;
}

function ClubCard({
  clubName,
  league,
  gradientFrom = "#ff383c",
  gradientTo   = "#992224",
  backgroundSrc,
  children,
  onPlay,
  className,
}: ClubCardProps) {
  return (
    <div
      className={cn(
        // Container — 196×260px, rounded-24px, overflow-hidden
        "relative w-[196px] h-[260px] rounded-[24px] overflow-hidden",
        className,
      )}
    >
      {/* ── Background: gradient + optional texture ──────────────────── */}
      <div className="absolute inset-0 rounded-[24px]">
        <div
          className="absolute inset-0 rounded-[24px]"
          style={{
            background: `linear-gradient(to bottom, ${gradientFrom} 13.134%, ${gradientTo} 77.609%)`,
          }}
        />
        {backgroundSrc && (
          <img
            src={backgroundSrc}
            alt=""
            className="absolute inset-0 w-full h-full object-cover rounded-[24px] pointer-events-none"
          />
        )}
      </div>

      {/* ── Decorative 3D elements (caller-supplied) ─────────────────── */}
      {children}

      {/* ── Bottom blur overlay ──────────────────────────────────────── */}
      {/* Figma: blur-20px, mix-blend-multiply, gradient grey→black */}
      <div
        className="absolute h-[120px] left-[-49px] right-[-52px] top-[169px] blur-[20px] mix-blend-multiply pointer-events-none"
        style={{
          background:
            "linear-gradient(180.11deg, rgb(126,126,126) 43.894%, rgb(0,0,0) 63.836%)",
        }}
      />

      {/* ── Bottom info ──────────────────────────────────────────────── */}
      <div className="absolute bottom-[14px] left-[10px] flex flex-col gap-2.5 items-start w-[113px]">
        {/* Club name — Boldonse 20px / white */}
        <div className="flex flex-col gap-0">
          <span className="font-boldonse text-[20px] leading-none text-white">
            {clubName}
          </span>
          {/* League — Geist Medium 10px / lh 12px / #dedfe0 */}
          <span className="font-sans font-medium text-[10px] leading-3 text-[#dedfe0]">
            {league}
          </span>
        </div>

        {/* PLAY button — #f4f4f4 bg, Boldonse 13px, tracking -0.23px, pill */}
        <button
          onClick={onPlay}
          className="bg-[#f4f4f4] text-black rounded-[1000px] px-[14px] py-[7px] font-boldonse text-[13px] leading-5 tracking-[-0.23px] whitespace-nowrap"
        >
          PLAY
        </button>
      </div>
    </div>
  );
}

// ── Puzzle card ───────────────────────────────────────────────────────────────

export interface PuzzleCardProps {
  variant: "puzzle";
  /** Puzzle thumbnail URL */
  src: string;
  /** Puzzle display title  e.g. "Arteta Celebration" */
  title: string;
  /** Grid dimension N — renders "N×N · Tap to play"  e.g. 3 → "3×3" */
  gridSize: number;
  /** Override the secondary line  default "Tap to play" */
  tapLabel?: string;
  onClick?: () => void;
  className?: string;
}

function PuzzleCard({
  src,
  title,
  gridSize,
  tapLabel = "Tap to play",
  onClick,
  className,
}: PuzzleCardProps) {
  return (
    <button
      type="button"
      onClick={() => { playClick(); onClick?.(); }}
      className={cn(
        // Container — 196×196px square, rounded-12px, border #252627
        "relative size-[196px] rounded-[12px] overflow-hidden",
        "border border-[#252627]",
        "text-left", // prevent inherited button centering
        !onClick && "cursor-default pointer-events-none",
        className,
      )}
    >
      {/* ── Puzzle thumbnail ─────────────────────────────────────────── */}
      <img
        src={src}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      {/* ── Bottom blur overlay ──────────────────────────────────────── */}
      <div
        className="absolute bottom-[-80px] left-[-50px] w-[297px] h-[146px] blur-[20px] mix-blend-multiply pointer-events-none"
        style={{
          background:
            "linear-gradient(180.13deg, rgb(126,126,126) 43.894%, rgb(0,0,0) 63.836%)",
        }}
      />

      {/* ── Bottom info ──────────────────────────────────────────────── */}
      <div className="absolute bottom-[13px] left-[9px] flex flex-col gap-0 items-start">
        {/* Puzzle title — Boldonse 14px / white */}
        <span className="font-boldonse text-[14px] leading-none text-white">
          {title}
        </span>

        {/* Grid spec row — Geist Mono Medium 15px / #73767b */}
        <div className="flex items-baseline font-mono font-medium text-[#73767b]">
          <span className="text-[15px] leading-none tracking-[-0.75px]">
            {gridSize}×{gridSize}
          </span>
          <span className="text-[12px] leading-none tracking-[-0.6px] mx-px">·</span>
          <span className="text-[15px] leading-none tracking-[-0.75px]">
            {tapLabel}
          </span>
        </div>
      </div>
    </button>
  );
}

// ── Unified export ────────────────────────────────────────────────────────────

export type ImageCardProps = ClubCardProps | PuzzleCardProps;

export function ImageCard(props: ImageCardProps) {
  if (props.variant === "puzzle") return <PuzzleCard {...props} />;
  return <ClubCard {...props} />;
}
