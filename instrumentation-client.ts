import type * as Sentry from "@sentry/nextjs";

// No-op until NEXT_PUBLIC_SENTRY_DSN is set. The @sentry/nextjs client SDK
// itself is dynamically imported (not a static top-level `import * as
// Sentry`) so a deployment without a DSN configured never ships its ~76KB
// gzip to every page's root bundle — see sentry.server.config.ts for the
// server-side counterpart (no client-bundle concern there).
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

const sentryPromise: Promise<typeof Sentry> | null = dsn
  ? import("@sentry/nextjs").then((mod) => {
      mod.init({
        dsn,
        tracesSampleRate: 0.1,
        replaysSessionSampleRate: 0,
        replaysOnErrorSampleRate: 0,
      });
      return mod;
    })
  : null;

export function onRouterTransitionStart(...args: Parameters<typeof Sentry.captureRouterTransitionStart>) {
  sentryPromise?.then((mod) => mod.captureRouterTransitionStart(...args));
}

// Used by app/error.tsx / app/global-error.tsx to report render errors —
// same lazy-load convention, so importing this helper never pulls in the
// SDK unless Sentry is actually configured.
export function reportError(error: unknown) {
  sentryPromise?.then((mod) => mod.captureException(error));
}
