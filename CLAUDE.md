# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start dev server (Next.js on :3000)
npm run build        # production build
npm run type-check   # tsc --noEmit
npm run lint         # next lint
```

No test suite. Verification is done by running the app with Playwright:
```bash
node /tmp/verify_arsenal.cjs   # screenshot all pages at mobile + desktop
```

Deploy to Vercel:
```bash
npx vercel --prod --yes
```

## Architecture

### User identity — no auth, device-based

Users are identified by a UUID stored in `localStorage` (`arsenal_puzzle_device_id`). There is no login. `lib/device-identity.ts` owns all localStorage reads/writes. `useDeviceIdentity` hook bootstraps the user on every page via `useUserStore.init()`, which fetches the stored user from Supabase by `device_id`.

### State — three Zustand stores

| Store | Purpose |
|---|---|
| `store/user-store.ts` | Current user, XP, avatar, `isOnboarded` flag |
| `store/game-store.ts` | Active puzzle, tile positions, timer, move count, hint state |
| `store/leaderboard-store.ts` | Active tab, cached leaderboard data |

`useTimer` hook ticks `game-store.tick()` every 100ms when the game is running.

### Puzzle engine — pure functions in `lib/puzzle-engine.ts`

Tiles are `{id, correctIndex, currentIndex, imageX, imageY, isPlaced, isLocked}`. `swapTiles` swaps `currentIndex` values and calls `checkPlacements` (sets `isPlaced = currentIndex === correctIndex`). The board renders tiles at their `currentIndex` grid position using CSS `background-position` to slice the source image.

### Page routing

```
/ → /landing → /onboarding → /champions → /club/[clubId] → /play/[puzzleId]
```

`/landing` redirects already-onboarded users to `/champions`. All pages redirect unauthenticated users who reach `/play` back to `/onboarding`.

### Layout pattern — Figma scaled frames

Desktop pages use a fixed-size Figma frame (`FRAME_W × FRAME_H`, typically 1440×1024) scaled with CSS `transform: scale(…)` to fill the viewport. Mobile pages use a 440×926 frame scaled with `mobileScale`. The `isMobile` breakpoint is `window.innerWidth < 768`.

Both `scale` and `mobileScale` are computed in a single `useEffect` + `resize` listener on every page:
```ts
setScale(Math.min(w / FRAME_W, h / FRAME_H));
setMobileScale(Math.min(w / MOBILE_W, h / MOBILE_H));
```

All icon/content positions in the JSX are Figma pixel coordinates taken directly from the design — do not adjust them without checking the Figma node.

### Fonts

- `Boldonse` — local WOFF2, CSS var `--font-boldonse` — headings, titles, buttons
- `Geist` — Google font, `--font-geist-sans` — body, labels
- `Geist Mono` — Google font, `--font-geist-mono` — timer, stats, mono values

### 3D icons

All icons live in `/public/icons/3d/` as 480×480px PNGs. The `Icon3D` component (`components/ui/Icon3D.tsx`) renders them with a typed `name` prop. Adding a new icon = add the PNG, extend the `Icon3DName` union and `SRC` map.

### Sound design

`lib/sounds.ts` synthesises all sounds with the Web Audio API — no audio files. Functions: `playClick`, `playPickUp`, `playSnap`, `playMove`, `playComplete`. All are triggered by user gestures so autoplay policy is never an issue. The shared `AudioContext` is lazily initialised and resumed on first call.

### Anti-cheat

Score submissions include a `checksum` (HMAC-like hash of the payload fields) and a `session_token` from localStorage. The server validates minimum completion times per difficulty and minimum time-per-move in `lib/anti-cheat.ts`. Invalid scores return HTTP 422.

### Supabase

Two clients in `lib/supabase.ts`:
- `getSupabaseClient()` — browser client, anon key, used for reads
- `getServiceClient()` — server-side only (API routes), service role key, bypasses RLS

All API routes use `getServiceClient()`. The Supabase client is lazily initialised to avoid build-time env var errors.

### Club / champion data

All club metadata (gradients, hero icons, card images, badge icons) lives in `lib/champions-data.ts` as a static `CHAMPIONS` array. Adding a club = add an entry there + add card image to `/public/clubs/` and any new badge/icon to `/public/icons/3d/`.

### Figma references

Each page and component has a comment at the top with the Figma node ID (e.g. `Figma node 30:1246`) and the exact pixel dimensions used. When implementing or updating UI from Figma, use `mcp__figma-remote-mcp__get_design_context` with the file key `v3IoznItETfcHsMqXcxohX`.

## Key design tokens

| Token | Value | Usage |
|---|---|---|
| `#0f0f10` | Page background | Most pages |
| `#0d0d0d` | Card / overlay background | Club page, VictoryScreen card |
| `#252627` | Surface / muted button bg | DifficultyCards, RESTART, progress track |
| `#fcff3f` | Logo yellow-green | Selected tile border, XP values, progress fill |
| `#ff6a0c` | Orange accent | Easy difficulty, selected DifficultyCard border |
| `#73767b` | Grey secondary | Body text, nav badge borders |
| `#929498` | Grey tertiary | Labels, muted values |
| `#87CEEB` | Sky blue | Landing and VictoryScreen background |

## Environment variables

Required in `.env.local` and Vercel:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_POSTHOG_KEY
NEXT_PUBLIC_POSTHOG_HOST
NEXT_PUBLIC_SENTRY_DSN
```
