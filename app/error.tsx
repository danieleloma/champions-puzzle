"use client";

import { useEffect } from "react";
import { reportError } from "@/instrumentation-client";

// Catches any render error thrown by a page/component under the root
// layout — without this, an uncaught error (e.g. a localStorage access
// throwing in a restrictive browser environment) white-screens the whole
// app with only Next's generic, unstyled fallback. See also
// app/global-error.tsx for the (rarer) case where the root layout itself
// fails.
export default function Error({
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
        color: "#fff",
        background: "#0f0f10",
      }}
    >
      <p className="font-sans" style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>
        Something went wrong.
      </p>
      <p className="font-sans" style={{ fontSize: 14, color: "#929498", margin: 0, maxWidth: 320 }}>
        Please try again. If this keeps happening, check that your browser allows
        this site to store data (private browsing / tracking protection can block it).
      </p>
      <button
        onClick={() => reset()}
        className="font-sans"
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
  );
}
