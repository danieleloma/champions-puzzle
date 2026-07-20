import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

// ── Figma node 28:1578 ──────────────────────────────────────────────────────
// Four variants (left → right in preview):
//
//  "user-info"  avatar circle + username (white) + XP (yellow)    bg #252627
//  "badge"      shield + label + shield  (white text/icon)         bg #252627
//  "badge" sel  shield + label + shield  (dark text/icon)          bg #fafafa
//  "featured"   medal icon + label       (white text)              gold→red gradient
//
// Shared:  h-32px  rounded-[32px]  Geist Medium 14px / lh 20px
// ────────────────────────────────────────────────────────────────────────────

// ── Inline SVGs (paths exported directly from Figma) ────────────────────────

/** Shield outline — stroke inherits from `currentColor` */
const ShieldIcon = ({ dark = false }: { dark?: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 12 14.6667"
    fill="none"
    aria-hidden
    className={dark ? "text-[#3a3b3e]" : "text-white"}
    style={{ flexShrink: 0 }}
  >
    <path
      d="M6 14C6 14 11.3333 11.3333 11.3333 7.33333V2.66667L6 0.666667L0.666667 2.66667V7.33333C0.666667 11.3333 6 14 6 14Z"
      stroke="currentColor"
      strokeWidth="1.33333"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Medal / ranked badge icon — always white, used in the "featured" variant */
const MedalIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 10.6642 13.8699"
    fill="none"
    aria-hidden
    style={{ flexShrink: 0 }}
  >
    {/* star centre */}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4.2468 7.07637C4.59447 8.11938 6.06977 8.11938 6.41744 7.07637C6.49363 6.84782 6.67298 6.66847 6.90154 6.59228C7.94454 6.24461 7.94454 4.76931 6.90154 4.42164C6.67298 4.34545 6.49363 4.1661 6.41744 3.93754C6.06977 2.89454 4.59447 2.89454 4.2468 3.93754C4.17061 4.1661 3.99127 4.34545 3.76271 4.42164C2.7197 4.76931 2.7197 6.24461 3.76271 6.59228C3.99127 6.66847 4.17061 6.84782 4.2468 7.07637ZM5.33212 6.25848C5.1503 5.94774 4.89134 5.68878 4.5806 5.50696C4.89134 5.32513 5.1503 5.06617 5.33212 4.75544C5.51395 5.06617 5.77291 5.32513 6.08364 5.50696C5.77291 5.68878 5.51395 5.94774 5.33212 6.25848Z"
      fill="white"
    />
    {/* outer badge body + pendant */}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2.66545 10.2468C1.99278 10.0412 1.45935 9.47361 1.33007 8.7366C1.29846 8.55642 1.18548 8.40091 1.02389 8.31517C0.106003 7.82817 -0.260247 6.70097 0.196081 5.76745C0.276418 5.60311 0.276418 5.41089 0.196081 5.24654C-0.260247 4.31303 0.106004 3.18583 1.02389 2.69882C1.18548 2.61309 1.29846 2.45758 1.33007 2.2774C1.5096 1.25395 2.46845 0.557296 3.49729 0.702819C3.67842 0.728438 3.86123 0.669039 3.99271 0.541849C4.73952 -0.180616 5.92473 -0.180616 6.67154 0.541849C6.80301 0.669039 6.98583 0.728438 7.16695 0.702819C8.19579 0.557296 9.15465 1.25395 9.33417 2.2774C9.36578 2.45758 9.47876 2.61309 9.64036 2.69882C10.5582 3.18583 10.9245 4.31303 10.4682 5.24654C10.3878 5.41089 10.3878 5.60311 10.4682 5.76745C10.9245 6.70097 10.5582 7.82817 9.64036 8.31517C9.47876 8.40091 9.36578 8.55642 9.33417 8.7366C9.20489 9.47361 8.67146 10.0412 7.99879 10.2468V12.4419C7.99879 13.834 6.20799 14.4004 5.40739 13.2616C5.37075 13.2094 5.29349 13.2094 5.25685 13.2616C4.45626 14.4004 2.66545 13.834 2.66545 12.4419V10.2468ZM5.74448 9.51385C5.51456 9.73627 5.14968 9.73627 4.91977 9.51385C4.49271 9.10071 3.89889 8.90777 3.31056 8.99098C2.99382 9.03579 2.69862 8.82131 2.64335 8.50623C2.54069 7.92098 2.17369 7.41585 1.64881 7.13736C1.36622 6.98743 1.25347 6.6404 1.39396 6.35301C1.6549 5.81919 1.6549 5.19481 1.39396 4.66099C1.25347 4.37359 1.36622 4.02657 1.64881 3.87664C2.17369 3.59815 2.54069 3.09302 2.64335 2.50777C2.69862 2.19268 2.99382 1.97821 3.31056 2.02301C3.89889 2.10623 4.49271 1.91329 4.91977 1.50015C5.14968 1.27773 5.51456 1.27773 5.74448 1.50015C6.17154 1.91329 6.76535 2.10623 7.35369 2.02301C7.67043 1.97821 7.96562 2.19268 8.02089 2.50777C8.12355 3.09302 8.49055 3.59815 9.01544 3.87664C9.29802 4.02657 9.41077 4.37359 9.27029 4.66099C9.00934 5.19481 9.00934 5.81919 9.27029 6.35301C9.41077 6.6404 9.29802 6.98743 9.01544 7.13736C8.49055 7.41585 8.12355 7.92098 8.02089 8.50623C7.96562 8.82131 7.67043 9.03579 7.35369 8.99098C6.76535 8.90777 6.17154 9.10071 5.74448 9.51385ZM3.99879 12.4419C3.99879 12.4778 4.00825 12.4913 4.01321 12.4977C4.02143 12.5082 4.03788 12.5216 4.06305 12.5296C4.08822 12.5376 4.1094 12.536 4.12218 12.5321C4.1299 12.5298 4.14542 12.5241 4.16607 12.4948C4.73373 11.6873 5.93052 11.6873 6.49818 12.4948C6.51882 12.5241 6.53434 12.5298 6.54206 12.5321C6.55484 12.536 6.57603 12.5376 6.6012 12.5296C6.62637 12.5216 6.64281 12.5082 6.65103 12.4977C6.65599 12.4913 6.66546 12.4778 6.66546 12.4419V10.5857L6.22655 10.8051C5.66349 11.0867 5.00075 11.0867 4.43769 10.8051L3.99879 10.5857V12.4419Z"
      fill="white"
    />
  </svg>
);

// ── Component ────────────────────────────────────────────────────────────────

export type BadgeVariant = "user-info" | "badge" | "featured";

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;

  // "user-info" props
  username?: string;
  /** Hex colour for the avatar circle background */
  avatarColor?: string;
  xp?: number;
  showXp?: boolean;

  // "badge" props
  label?: string;
  /** Light bg + dark icons/text (active filter state) */
  selected?: boolean;
  iconLeft?: boolean;
  iconRight?: boolean;
}

export function Badge({
  variant = "badge",
  // user-info
  username = "Username",
  avatarColor = "#5559ff",
  xp = 0,
  showXp = true,
  // badge
  label = "Title",
  selected = false,
  iconLeft = true,
  iconRight = true,
  className,
  ...props
}: BadgeProps) {
  const avatarInitial = username[0]?.toUpperCase() ?? "?";

  // ── user-info ──────────────────────────────────────────────────────────────
  if (variant === "user-info") {
    return (
      <div
        className={cn(
          "inline-flex items-center h-8 gap-1.5 pl-1.5 pr-2 rounded-[32px]",
          "bg-[#252627]",
          className,
        )}
        {...props}
      >
        {/* Avatar circle */}
        <div
          className="flex-shrink-0 flex items-center justify-center size-5 rounded-full"
          style={{ backgroundColor: avatarColor }}
        >
          {/* Inter Medium 13px / lh 1.45 / tracking -0.5px — Figma Caption/Caption 1 */}
          <span className="font-sans font-medium text-[13px] leading-[1.45] tracking-[-0.5px] text-white">
            {avatarInitial}
          </span>
        </div>

        {/* Username + XP — username collapses away on mobile, leaving just
            the avatar initial + XP (matches the md: 768px isMobile breakpoint
            used everywhere else in this app). */}
        <div className="flex items-center gap-1 whitespace-nowrap">
          {/* Geist Medium 14px / lh 20px */}
          <span className="hidden md:inline font-sans font-medium text-sm leading-5 text-white">
            {username}
          </span>
          {/* Geist Mono Medium 14px / lh 20px — XP in yellow */}
          {showXp && (
            <span className="font-mono font-medium text-sm leading-5 text-[#ffd324]">
              {xp}XP
            </span>
          )}
        </div>
      </div>
    );
  }

  // ── featured (gradient) ────────────────────────────────────────────────────
  if (variant === "featured") {
    return (
      <div
        className={cn(
          "inline-flex items-center h-8 gap-1.5 pl-2.5 pr-3 rounded-[32px] overflow-hidden",
          className,
        )}
        style={{ background: "linear-gradient(125.28deg, #feb200 0%, #f81c20 100%)" }}
        {...props}
      >
        <MedalIcon />
        {/* Geist Medium 14px / lh 20px */}
        <span className="font-sans font-medium text-sm leading-5 text-white whitespace-nowrap">
          {label}
        </span>
      </div>
    );
  }

  // ── badge (default / selected) ─────────────────────────────────────────────
  return (
    <div
      className={cn(
        "inline-flex items-center h-8 gap-1.5 px-3 rounded-[32px] overflow-hidden",
        selected ? "bg-[#fafafa]" : "bg-[#252627]",
        className,
      )}
      {...props}
    >
      {iconLeft && <ShieldIcon dark={selected} />}
      {/* Geist Mono Medium 14px / lh 20px */}
      <span
        className={cn(
          "font-mono font-medium text-sm leading-5 whitespace-nowrap",
          selected ? "text-[#3a3b3e]" : "text-white",
        )}
      >
        {label}
      </span>
      {iconRight && <ShieldIcon dark={selected} />}
    </div>
  );
}
