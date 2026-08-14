import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "gsap"],
  },
  // /public assets have unhashed filenames, so Vercel serves them with
  // `max-age=0, must-revalidate` by default — every page view re-checks
  // every icon/photo with the origin. These four directories (3D icons,
  // club cards, puzzle photos, splash backgrounds) are asset-pipeline
  // output that's only ever replaced by generating a new filename (see
  // PERFORMANCE.md), never edited in place, so it's safe to cache them
  // aggressively like /_next/static's content-hashed files.
  async headers() {
    return [
      {
        source: "/icons/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/clubs/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/puzzles/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/splash/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

// Only wraps the build with Sentry's plugin (source-map upload, etc.) once a
// DSN is actually configured — without it this is a no-op, same convention
// as lib/supabase.ts's lazy init, so the build never depends on a Sentry
// account existing.
export default process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      silent: true,
    })
  : nextConfig;
