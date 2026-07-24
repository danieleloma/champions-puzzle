"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 2,
          },
        },
      })
  );

  // No-op until NEXT_PUBLIC_POSTHOG_KEY is set — same lazy-init convention
  // as lib/supabase.ts, so builds and local dev work without a PostHog account.
  // Dynamically imported (instead of a static top-level import) so the
  // ~228KB posthog-js bundle isn't part of the initial JS payload on every
  // page — it only loads after mount, once the app is already interactive.
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;
    import("posthog-js").then(({ default: posthog }) => {
      if (posthog.__loaded) return;
      posthog.init(key, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com",
        capture_pageview: true,
        person_profiles: "identified_only",
      });
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
