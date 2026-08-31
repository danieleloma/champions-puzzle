"use client";

import { useEffect } from "react";
import { reportError } from "@/instrumentation-client";

// Catches any error thrown during render that no closer error boundary
// handles — including ones thrown before the app's own UI can mount (e.g.
// localStorage access throwing in Safari Lockdown Mode / strict private
// browsing). Replaces the entire root layout while active, so it defines
// its own <html>/<body> rather than relying on app/layout.tsx.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    reportError(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0f0f10" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            padding: 24,
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
            color: "#fff",
          }}
        >
          <p style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Something went wrong.</p>
          <p style={{ fontSize: 14, color: "#929498", margin: 0, maxWidth: 320 }}>
            Please try again. If this keeps happening, check that your browser allows
            this site to store data (private browsing / tracking protection can block it).
          </p>
          <button
            onClick={() => reset()}
            style={{
              marginTop: 8,
              padding: "12px 24px",
              borderRadius: 999,
              border: "none",
              background: "#fff",
              color: "#0f0f10",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
