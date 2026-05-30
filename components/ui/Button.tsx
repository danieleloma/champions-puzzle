"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// ── Variants from Figma node 27:1415 ────────────────────────────────────────
// Black   → primary CTA        bg #000000  text #ffffff
// White   → secondary/light    bg #f4f4f4  text #0d0d0d
// Variant4→ ghost (dark bg)    bg #252627  text #ffffff
// Variant3→ muted (dark bg)    bg #252627  text #929498
// ────────────────────────────────────────────────────────────────────────────

export type ButtonVariant = "primary" | "secondary" | "ghost" | "muted";

const variantClasses: Record<ButtonVariant, string> = {
  primary:   "bg-black text-white",
  secondary: "bg-[#f4f4f4] text-[#0d0d0d]",
  ghost:     "bg-[#252627] text-white",
  muted:     "bg-[#252627] text-[#929498]",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  /** Stretch to fill the parent container (default: true) */
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      fullWidth = true,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        // Shape & spacing — exact Figma values: px-20px py-24px rounded-1000px
        "flex items-center justify-center px-5 py-6 rounded-[1000px]",
        // Typography — type-label = Boldonse 16px / lh 22px / tracking -0.43px
        "type-label whitespace-nowrap",
        // Interaction
        "transition-[opacity,transform] active:scale-[0.97]",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
        // Width
        fullWidth ? "w-full" : "w-auto",
        // Variant colours
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
);

Button.displayName = "Button";
