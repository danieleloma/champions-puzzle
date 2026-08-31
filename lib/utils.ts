import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Routes an image through Next's built-in optimizer (the same endpoint
// `<Image>` itself calls) — for spots that need a raw URL string rather
// than the `<Image>` component, e.g. a CSS `background-image` slicing a
// single source across a grid of tiles. Works for both local /public paths
// and any remote host allowed in next.config.ts's images.remotePatterns.
export function optimizedImageSrc(src: string, width: number, quality = 75): string {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}

// The puzzle board never renders larger than ~480px on screen; 1080 (a
// standard Next.js image device-size bucket) comfortably covers that at 2x
// DPR without serving the source photo's full resolution. Shared between
// PuzzleBoard (which requests it) and ClubPageClient's preloading (which
// must warm the *exact same* URL — a different width/quality is a cache
// miss, making the preload pointless work instead of a head start).
export const BOARD_IMAGE_WIDTH = 1080;
