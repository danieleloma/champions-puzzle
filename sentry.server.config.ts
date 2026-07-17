import * as Sentry from "@sentry/nextjs";

// No-op until NEXT_PUBLIC_SENTRY_DSN is set — same lazy-init convention as
// lib/supabase.ts, so builds and local dev work without a Sentry account.
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
  });
}
