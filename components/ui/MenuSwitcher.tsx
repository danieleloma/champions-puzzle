"use client";

import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

// ── Figma node 32:1127 "menu-switcher" ──────────────────────────────────────
//
//  ┌─────────────────────────────────────────────────┐
//  │  [ All Time ]   Today   This Week               │   ← outer track #252627
//  └─────────────────────────────────────────────────┘
//
//  Track:       bg #252627  rounded-[32px]  p-4px  w-full
//  Active tab:  bg white    rounded-[32px]  py-8px px-8px  text #0d0d0d
//  Inactive tab: no bg                      py-8px px-8px  text #a7a9ad
//  Text:        Geist Medium 15px / lh 1.4 / tracking -0.45px
// ────────────────────────────────────────────────────────────────────────────

export interface MenuSwitcherTab<T extends string = string> {
  value: T;
  label: string;
}

export interface MenuSwitcherProps<T extends string = string>
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  tabs: MenuSwitcherTab<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function MenuSwitcher<T extends string = string>({
  tabs,
  value,
  onChange,
  className,
  ...props
}: MenuSwitcherProps<T>) {
  return (
    <div
      className={cn(
        // Outer track — Figma: bg #252627, rounded-32px, p-4px
        "flex items-center p-1 rounded-[32px] bg-[#252627] w-full",
        className,
      )}
      role="tablist"
      {...props}
    >
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cn(
              // Equal-width tabs, pill shape, py-8px px-8px
              "flex-1 flex items-center justify-center py-2 px-2 rounded-[32px]",
              // Text — Geist Medium 15px / lh 1.4 / tracking -0.45px
              "font-sans font-medium text-[15px] leading-[1.4] tracking-[-0.45px]",
              "whitespace-nowrap transition-colors",
              active
                ? "bg-white text-[#0d0d0d]"
                : "bg-transparent text-[#a7a9ad]",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
