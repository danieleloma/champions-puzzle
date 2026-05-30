import { cn } from "@/lib/utils";

// ── Figma node 27:1408 "ProgressBar" ─────────────────────────────────────────
//
//  Two Figma variants:
//  Default  — empty track, labels show "0% complete" / "0/N tiles"
//  Progress — yellow-green fill, same labels updated to reflect current state
//
//  Container:  flex-col  gap-10px  w-full
//  Label row:  justify-between  Geist Medium 14px / lh 20px / #73767b
//  Track:      h-12px  bg #252627  rounded-10px  overflow-hidden
//  Fill:       bg #fcff3f (logo-green)  rounded-12px  h-full  width = %
// ─────────────────────────────────────────────────────────────────────────────

export interface ProgressBarProps {
  /** Tiles placed so far */
  value: number;
  /** Total tiles in the puzzle */
  total: number;
  /** Accessible label for the progress bar (default: "Puzzle progress") */
  label?: string;
  className?: string;
}

export function ProgressBar({ value, total, label = "Puzzle progress", className }: ProgressBarProps) {
  const pct     = total > 0 ? Math.round((value / total) * 100) : 0;
  const fillPct = total > 0 ? (value / total) * 100 : 0;

  return (
    <div
      className={cn("flex flex-col items-start w-full", className)}
      style={{ gap: 10 }}
    >
      {/* ── Labels ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between w-full">
        {/* Left — "X% complete" — Geist Medium 14px / lh 20px / #73767b */}
        <span className="font-sans font-medium text-sm leading-5 text-[#73767b] whitespace-nowrap">
          {pct}% complete
        </span>
        {/* Right — "X/N tiles" */}
        <span className="font-sans font-medium text-sm leading-5 text-[#73767b] whitespace-nowrap">
          {value}/{total} tiles
        </span>
      </div>

      {/* ── Track ─────────────────────────────────────────────────────── */}
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={total}
        className="relative w-full overflow-hidden rounded-[10px] bg-[#252627]"
        style={{ height: 12 }}
      >
        {/* Fill — logo-green #fcff3f */}
        <div
          className="absolute left-0 top-0 h-full rounded-[12px] bg-[#fcff3f] transition-[width] duration-300 ease-out"
          style={{ width: `${fillPct}%` }}
        />
      </div>
    </div>
  );
}
