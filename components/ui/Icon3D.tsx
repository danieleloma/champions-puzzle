import { cn } from "@/lib/utils";
import type { ImgHTMLAttributes } from "react";

// ── Figma node 8:44 — 3D icon library ────────────────────────────────────────
//
//  21 3D-rendered PNG icons at 480×480px source resolution.
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
  flag:               "/icons/3d/flag.png",
  stadium:            "/icons/3d/stadium.png",
  board:              "/icons/3d/board.png",
  "goal-post":        "/icons/3d/goal-post.png",
  cup:                "/icons/3d/cup.png",
  jersey:             "/icons/3d/jersey.png",
  boot:               "/icons/3d/boot.png",
  scarf:              "/icons/3d/scarf.png",
  "leg-pad":          "/icons/3d/leg-pad.png",
  "captain-band":     "/icons/3d/captain-band.png",
  ball:               "/icons/3d/ball.png",
  "yellow-card":      "/icons/3d/yellow-card.png",
  "var-monitor":      "/icons/3d/var-monitor.png",
  "substitute-board": "/icons/3d/substitute-board.png",
  gloves:             "/icons/3d/gloves.png",
  "red-card":         "/icons/3d/red-card.png",
  stopwatch:          "/icons/3d/stopwatch.png",
  whistle:            "/icons/3d/whistle.png",
  medal:              "/icons/3d/medal.png",
  arsenal:            "/icons/3d/arsenal.png",
  barcelona:          "/icons/3d/barcelona.png",
  inter:              "/icons/3d/inter.png",
  bayern:             "/icons/3d/bayern.png",
  psg:                "/icons/3d/psg.png",
  spain:              "/icons/3d/spain.png",
};

export interface Icon3DProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "width" | "height"> {
  name: Icon3DName;
  /** Rendered square size in px (source is 480×480) */
  size?: number;
}

export function Icon3D({ name, size = 120, className, alt = "", loading = "lazy", ...props }: Icon3DProps) {
  return (
    <img
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
