// Warms the browser's HTTP cache for a full-resolution image ahead of
// navigation (e.g. on card hover/touchstart), so the destination page's
// <img>/background-image paints instantly instead of starting a cold fetch.
const preloaded = new Set<string>();

export function preloadImage(src: string) {
  if (!src || typeof window === "undefined" || preloaded.has(src)) return;
  preloaded.add(src);
  const img = new window.Image();
  img.src = src;
}
