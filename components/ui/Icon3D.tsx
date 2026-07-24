import { cn } from "@/lib/utils";
import Image, { type ImageProps } from "next/image";

// ── Figma node 8:44 — 3D icon library ────────────────────────────────────────
//
//  25 3D-rendered WebP icons, resized to fit within 480×480px and re-encoded
//  from their original multi-megabyte PNG sources (some as large as 2048px)
//  down to ~15-60KB each — see PERFORMANCE.md.
//  Stored in /public/icons/3d/ — filenames match the Figma property names
//  (spaces replaced with hyphens, "goal post" → "goal-post").
//
//  Usage:
//    <Icon3D name="ball" size={80} />
//    <Icon3D name="arsenal" size={120} className="rotate-[-15deg]" />
// ─────────────────────────────────────────────────────────────────────────────

export type Icon3DName =
  | "flag"
  | "stadium"
  | "board"
  | "goal-post"
  | "cup"
  | "jersey"
  | "boot"
  | "scarf"
  | "leg-pad"
  | "captain-band"
  | "ball"
  | "yellow-card"
  | "var-monitor"
  | "substitute-board"
  | "gloves"
  | "red-card"
  | "stopwatch"
  | "whistle"
  | "medal"
  | "arsenal"
  | "barcelona"
  | "inter"
  | "bayern"
  | "psg"
  | "spain";

const SRC: Record<Icon3DName, string> = {
  flag:               "/icons/3d/flag.webp",
  stadium:            "/icons/3d/stadium.webp",
  board:              "/icons/3d/board.webp",
  "goal-post":        "/icons/3d/goal-post.webp",
  cup:                "/icons/3d/cup.webp",
  jersey:             "/icons/3d/jersey.webp",
  boot:               "/icons/3d/boot.webp",
  scarf:              "/icons/3d/scarf.webp",
  "leg-pad":          "/icons/3d/leg-pad.webp",
  "captain-band":     "/icons/3d/captain-band.webp",
  ball:               "/icons/3d/ball.webp",
  "yellow-card":      "/icons/3d/yellow-card.webp",
  "var-monitor":      "/icons/3d/var-monitor.webp",
  "substitute-board": "/icons/3d/substitute-board.webp",
  gloves:             "/icons/3d/gloves.webp",
  "red-card":         "/icons/3d/red-card.webp",
  stopwatch:          "/icons/3d/stopwatch.webp",
  whistle:            "/icons/3d/whistle.webp",
  medal:              "/icons/3d/medal.webp",
  arsenal:            "/icons/3d/arsenal.webp",
  barcelona:          "/icons/3d/barcelona.webp",
  inter:              "/icons/3d/inter.webp",
  bayern:             "/icons/3d/bayern.webp",
  psg:                "/icons/3d/psg.webp",
  spain:              "/icons/3d/spain.webp",
};

export interface Icon3DProps
  extends Omit<ImageProps, "src" | "width" | "height" | "alt"> {
  name: Icon3DName;
  /** Rendered square size in px (source fits within 480×480) */
  size?: number;
  alt?: string;
}

export function Icon3D({ name, size = 120, className, alt = "", loading = "lazy", ...props }: Icon3DProps) {
  return (
    <Image
      src={SRC[name]}
      alt={alt}
      width={size}
      height={size}
      loading={loading}
      className={cn("object-contain pointer-events-none select-none", className)}
      style={{ width: size, height: size }}
      {...props}
    />
  );
}
