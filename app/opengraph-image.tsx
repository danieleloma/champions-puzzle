import { ImageResponse } from "next/og";

// Site-wide link-preview image — picked up automatically by Next's metadata
// file convention for every page under this layout that doesn't define its
// own opengraph-image. The metadata in layout.tsx previously pointed at
// /public/og-image.png, a file that was never actually added, so every
// shared link (including challenge links) had a broken og:image and chat
// apps showed no preview at all.

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f0f10",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", fontSize: 88, fontWeight: 700, color: "#ffffff", letterSpacing: -2 }}>
            CHAMPIONS PUZZLE
          </div>
          <div style={{ display: "flex", fontSize: 32, color: "#fcff3f", fontWeight: 600 }}>
            Solve iconic football moments. Compete globally.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
