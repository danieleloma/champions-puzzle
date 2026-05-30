"use client";

import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

// ── Figma node 28:1971 "in-game-badge" ───────────────────────────────────────
//
//  Compact in-game hint control — arrow-left + optional "used/total" count.
//
//  Container:  h-32px  pl-4px pr-6px py-4px  gap-4px
//              border 1px #73767b  border-radius 4px
//  Icon:       ← arrow  20×20px  stroke #929498
//  Text:       Geist Mono Medium 14px  tracking -0.7px  color #929498
//              text-shadow 0 4px 24px black
// ─────────────────────────────────────────────────────────────────────────────

/** Arrow-left icon — inlined from Figma SVG export (viewBox 0 0 14.7619 11.4286) */
function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      className={cn("shrink-0", className)}
    >
      {/*
        Original viewBox 0 0 14.7619 11.4286, centred inside 20×20
        with ~16.67% horizontal and 25% vertical inset (from Figma layout).
        Scale factor ≈ 0.9, translated to visually centre.
      */}
      <path
        d="M15.5 10H4.5M8.5 14.5L4.5 10L8.5 5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface InGameBadgeProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Numerator — e.g. hints used */
  value: number;
  /** Denominator — e.g. total hints */
  total: number;
  /** Show the value/total counter (default true — matches Figma showText) */
  showCount?: boolean;
}

export function InGameBadge({
  value,
  total,
  showCount = true,
  className,
  ...props
}: InGameBadgeProps) {
  return (
    <button
      className={cn(
        // Container — h-32px, border 1px #73767b, radius 4px
        "flex items-center justify-center h-8",
        "border border-[#73767b] rounded-[4px]",
        "text-[#929498]",                         // icon + text inherit this
        "transition-opacity active:opacity-70",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
        className,
      )}
      style={{ paddingLeft: 4, paddingRight: 6, paddingTop: 4, paddingBottom: 4, gap: 4 }}
      {...props}
    >
      {/* Arrow-left icon — 20×20px */}
      <ArrowLeftIcon />

      {/* Count — Geist Mono Medium 14px / tracking -0.7px / #929498 */}
      {showCount && (
        <span
          className="font-mono font-medium text-sm whitespace-nowrap"
          style={{
            letterSpacing: "-0.7px",
            lineHeight:    "normal",
            textShadow:    "0px 4px 24px black",
          }}
        >
          {value}/{total}
        </span>
      )}
    </button>
  );
}
