import * as Sentry from "@sentry/nextjs";

// No-op until NEXT_PUBLIC_SENTRY_DSN is set — see sentry.server.config.ts.
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
  });
}
