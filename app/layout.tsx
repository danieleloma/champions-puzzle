import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const boldonse = localFont({
  src: "./fonts/Boldonse-Regular.woff2",
  variable: "--font-boldonse",
  display: "swap",
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: "Arsenal Puzzle — Champions 2025–26",
  description:
    "Solve jigsaw puzzles from Arsenal's Premier League title celebration. Compete globally, share your victories.",
  keywords: ["Arsenal", "Premier League", "Jigsaw", "Puzzle", "Champions", "2026"],
  openGraph: {
    title: "Arsenal Puzzle — Champions 2025–26",
    description: "Can you beat my time? Play the Arsenal celebration puzzle!",
    type: "website",
    // Image comes from app/opengraph-image.tsx (Next's file-convention,
    // generated at build/request time) — no static asset to go stale/404.
  },
  twitter: {
    card: "summary_large_image",
    title: "Arsenal Puzzle — Champions 2025–26",
    description: "Can you beat my time? Play the Arsenal celebration puzzle!",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#EF0107",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${boldonse.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
