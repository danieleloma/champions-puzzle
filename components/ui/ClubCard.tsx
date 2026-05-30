"use client";

import { cn } from "@/lib/utils";
import { Icon3D } from "@/components/ui/Icon3D";
import type { Icon3DName } from "@/components/ui/Icon3D";

// ── Figma node 98:1204 "Club container" ──────────────────────────────────────
//
//  196×260px  rounded-[24px]  overflow-hidden
//
//  With imageSrc (Figma design):
//    Full-bleed PNG (392×520 @2×) covers the card.
//    Vignette, badge and floating icons are baked into the image.
//    Card info (name, league, PLAY) overlaid at absolute bottom-14 left-10.
//
//  Without imageSrc (programmatic fallback):
//    3-stop gradient (skyColor → gradFrom → gradTo) background.
//    Floating 3D icons, club badge, and vignette rendered programmatically.
//
//  Card info layout (both modes):
//    flex-col gap-16 items-start
//      Club name : Boldonse 20px  leading-normal  white
//      League    : Geist Med 13px lh-16px  #dedfe0
//    PLAY button : rounded-[1000px]  px-14 py-7  bg #f4f4f4  black
//                  Boldonse 13px  lh-20px  tracking-[-0.23px]
// ─────────────────────────────────────────────────────────────────────────────

export interface ClubFloatIcon {
  name:    Icon3DName;
  right:   number;
  top:     number;
  size:    number;
  imgSize: number;
  deg:     number;
}

export interface ClubCardProps {
  club:          string;
  league:        string;
  /** Pre-composited card image (replaces gradient + icons when provided) */
  imageSrc?:     string;
  /** Fallback gradient — top stop */
  skyColor?:     string;
  gradFrom?:     string;
  gradTo?:       string;
  badgeIcon?:    Icon3DName;
  badgeLetter?:  string;
  floatIcons?:   ClubFloatIcon[];
  onPlay?:       () => void;
  className?:    string;
}

export function ClubCard({
  club,
  league,
  imageSrc,
  skyColor  = "#444",
  gradFrom  = "#222",
  gradTo    = "#000",
  badgeIcon,
  badgeLetter,
  floatIcons = [],
  onPlay,
  className,
}: ClubCardProps) {
  return (
    <div
      className={cn(
        "relative w-[196px] h-[260px] rounded-[24px] overflow-hidden shrink-0",
        className,
      )}
    >
      {imageSrc ? (
        /* ── Figma mode: full-bleed pre-composited image ───────────── */
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageSrc}
          alt={club}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      ) : (
        /* ── Fallback: gradient + floating icons + badge ────────────── */
        <>
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, ${skyColor} 0%, ${gradFrom} 28%, ${gradTo} 100%)`,
            }}
          />

          {floatIcons.map((fi, i) => (
            <div
              key={i}
              className="absolute flex items-center justify-center pointer-events-none"
              style={{ right: fi.right, top: fi.top, width: fi.size, height: fi.size }}
            >
              <div style={{ flexShrink: 0, transform: `rotate(${fi.deg}deg)` }}>
                <Icon3D name={fi.name} size={fi.imgSize} loading="eager" />
              </div>
            </div>
          ))}

          <div className="absolute" style={{ left: 29.54, top: 27.54, width: 146, height: 146 }}>
            {badgeIcon ? (
              <Icon3D name={badgeIcon} size={146} loading="eager" />
            ) : (
              <div
                className="flex items-center justify-center size-full rounded-full"
                style={{
                  backgroundColor: "rgba(255,255,255,0.15)",
                  border:          "1px solid rgba(255,255,255,0.22)",
                  backdropFilter:  "blur(8px)",
                }}
              >
                <span className="font-boldonse text-[56px] leading-none text-white">
                  {badgeLetter}
                </span>
              </div>
            )}
          </div>

          <div
            className="absolute left-0 right-0 bottom-0 h-[130px] pointer-events-none"
            style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.78) 0%, transparent 100%)" }}
          />
        </>
      )}

      {/* ── Card info + PLAY (both modes) ───────────────────────────── */}
      <div className="absolute bottom-[14px] left-[10px] flex flex-col gap-4 items-start">
        <div>
          <p className="font-boldonse text-[20px] leading-normal text-white whitespace-nowrap m-0">
            {club}
          </p>
          <p className="font-sans font-medium text-[13px] leading-4 text-[#dedfe0] m-0">
            {league}
          </p>
        </div>

        <button
          type="button"
          onClick={onPlay}
          className="bg-[#f4f4f4] text-black rounded-[1000px] px-[14px] py-[7px] font-boldonse text-[13px] leading-5 tracking-[-0.23px] whitespace-nowrap border-none cursor-pointer"
        >
          PLAY
        </button>
      </div>
    </div>
  );
}
