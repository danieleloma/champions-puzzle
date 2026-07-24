# Performance notes

## Static asset pipeline

`public/icons/3d/*.webp`, `public/clubs/*.webp`, `public/puzzles/**/*.jpg`, and
`public/splash/bg-clouds.webp` are all served with a one-year immutable
`Cache-Control` header (`next.config.ts` → `headers()`), same as `/_next/static`'s
content-hashed files.

**These filenames must be treated as immutable once deployed.** If an asset's
content needs to change, generate it under a **new filename** (bump a suffix,
e.g. `spain-v2.webp`) and update the references — don't overwrite an existing
file in place. Editing in place under aggressive caching means anyone who
already loaded the old version keeps seeing it in their browser cache for up
to a year.

## 2026-07-24 image optimization pass

Found via a live network-weight audit (`/club/spain` was 5.3MB / ~6s to
network-idle; ~92% of that was four 3D icon files alone):

- **`public/icons/3d/*`** — source PNGs were 1600–2048px despite only ever
  being rendered at ≤365px on screen (nothing in the codebase displays them
  above 480px). Resized to fit within 480×480 and re-encoded as WebP:
  **30.1MB → 0.64MB** combined (a ~47x reduction). No visual change.
- **`public/clubs/*`** — pre-composited club card PNGs (392×520,
  photographic content) re-encoded as WebP: **1.36MB → 136KB**.
- **`public/splash/`** — `flag.png`, `gloves.png`, `jersey.png`, `medal.png`,
  `scoreboard.png`, `stadium.png`, `whistle.png` (~9MB total) were confirmed
  unreferenced anywhere in the app and deleted. `bg-clouds.png` (the one file
  actually used, as a blurred full-bleed background) was re-encoded as WebP:
  **1.9MB → 69KB**.
- All raw `<img>` tags across the app were migrated to `next/image` (was
  previously 100% raw `<img>`, flagged by lint the whole project but never
  addressed) — restores automatic responsive `sizes`, real viewport-based
  lazy loading, and protects against a future oversized source image
  silently repeating this problem.
- Added the immutable caching above for `/icons`, `/clubs`, `/puzzles`,
  `/splash` — previously served `max-age=0, must-revalidate` (default
  Vercel behavior for unhashed `/public` files), so even repeat visits
  re-validated every image with the origin.

- `posthog-js` (~222KB) in `app/providers.tsx` was switched from a static
  top-level import to a dynamic `import()` inside the existing `useEffect`,
  so it now code-splits into its own chunk that's only fetched after mount
  (verified: with a PostHog key present, `posthog-js` lands in a standalone
  chunk absent from the initial page bundle) instead of shipping on every
  page load regardless of whether analytics is even configured.
- `@sentry/nextjs` in `instrumentation-client.ts` was deliberately **left
  alone** — that file is Next.js's official client-instrumentation hook
  (also wires up `onRouterTransitionStart`), loaded early by design so error
  tracking captures issues from first paint. Deferring it would mean losing
  early-load error coverage and risks breaking the framework-mandated
  export shape, for a feature (error monitoring) where "early" is often the
  point. Still ~236KB on every page when `NEXT_PUBLIC_SENTRY_DSN` is set —
  a legitimate remaining cost, just not one worth trading away error
  visibility for.
