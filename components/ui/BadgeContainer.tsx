"use client";

import { cn } from "@/lib/utils";
import { playClick } from "@/lib/sounds";

// ── Figma node 28:1715 "BadgeContainerState" ─────────────────────────────────
//
//  Default   — all pills: bg #252627, white text, Geist Mono Med 14/20
//  Selected  — active pill floats to the front:
//                bg #fafafa, text #3a3b3e, 16px × icon
//              then a 1px vertical divider (h-28px, #3a3b3e)
//              then remaining unselected pills
//
//  Pill:   h-32px  px-12px  rounded-32px  overflow-hidden  gap-6px
//  Gap between items: 9px
// ─────────────────────────────────────────────────────────────────────────────

export interface BadgeContainerItem {
  value: string;
  label: string;
}

export interface BadgeContainerProps {
  items: BadgeContainerItem[];
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

function Divider() {
  return (
    <div
      aria-hidden
      className="shrink-0 self-center"
      style={{ width: 1, height: 28, backgroundColor: "#3a3b3e" }}
    />
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M4.5 4.5l7 7M11.5 4.5l-7 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BadgeContainer({
  items,
  value,
  onChange,
  className,
}: BadgeContainerProps) {
  const selectedItem = items.find((i) => i.value === value);
  const unselected   = items.filter((i) => i.value !== value);

  // Selected item always renders first; divider separates it from the rest
  const ordered: Array<BadgeContainerItem & { active: boolean }> = [
    ...(selectedItem ? [{ ...selectedItem, active: true }] : []),
    ...unselected.map((i) => ({ ...i, active: false })),
  ];

  return (
    <div
      className={cn("flex items-center overflow-x-auto no-scrollbar", className)}
      style={{ gap: 9, height: 32 }}
    >
      {ordered.map((item, i) => {
        const isActive = item.active;
        const showDivider = isActive && unselected.length > 0;

        return (
          <div key={item.value} className="flex items-center shrink-0" style={{ gap: 9 }}>
            <button
              onClick={() => { playClick(); onChange?.(item.value); }}
              className={cn(
                "flex items-center justify-center gap-1.5 shrink-0 overflow-hidden",
                "h-8 px-3 rounded-[32px]",
                "font-mono font-medium text-sm leading-5 whitespace-nowrap",
                isActive
                  ? "bg-[#fafafa] text-[#3a3b3e]"
                  : "bg-[#252627] text-white",
              )}
            >
              {item.label}
              {isActive && <CloseIcon />}
            </button>

            {showDivider && <Divider />}
          </div>
        );
      })}
    </div>
  );
}
