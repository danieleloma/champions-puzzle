"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// ── Figma node 27:1570 ───────────────────────────────────────────────────────
// Input frame:  bg #161617  border 1px #252627  h-52px  px-16px py-4px  radius-64px
// Input text:   Geist Medium 16px / lh 24px / tracking 0  — placeholder #929498, filled #fff
// Helper text:  Geist Regular 14px / lh 20px / tracking 0  — color #73767b
// ────────────────────────────────────────────────────────────────────────────

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Character-count / hint shown below the field  e.g. "0/20 · Letters only" */
  helperText?: string;
  /** Replaces helperText and applies error colouring */
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ helperText, error, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5 w-full">

      {/* ── Input frame ─────────────────────────────────────────────────── */}
      <div
        className={cn(
          // Shape & spacing
          "flex items-center h-[52px] px-4 py-1 rounded-[64px] overflow-hidden",
          // Colours
          "bg-[#161617] border border-[#252627]",
          // Focus ring (not in Figma but required for a11y)
          "transition-colors focus-within:border-white/30",
          // Error state
          error && "border-arsenal-red/50 focus-within:border-arsenal-red",
        )}
      >
        <input
          ref={ref}
          className={cn(
            "flex-1 min-w-0 bg-transparent outline-none",
            // Geist Medium 16px / lh 24px / tracking 0 (exact Figma values)
            "font-sans font-medium text-base leading-6 tracking-normal",
            // Text colours: filled = white, placeholder = #929498
            "text-white placeholder:text-[#929498]",
            className,
          )}
          {...props}
        />
      </div>

      {/* ── Helper / error text ─────────────────────────────────────────── */}
      {(helperText || error) && (
        <p
          className={cn(
            // Geist Regular 14px / lh 20px  (type-body-sm with explicit leading)
            "font-sans font-normal text-sm leading-5",
            error ? "text-arsenal-red" : "text-[#73767b]",
          )}
        >
          {error ?? helperText}
        </p>
      )}

    </div>
  ),
);

Input.displayName = "Input";
