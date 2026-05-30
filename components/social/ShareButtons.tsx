"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface ShareButtonsProps {
  text: string;
  url: string;
}

const SHARE_DESTINATIONS = [
  {
    key: "copy",
    label: "Copy Link",
    icon: "🔗",
    action: async (text: string, url: string) => {
      await navigator.clipboard.writeText(`${text}\n${url}`);
    },
  },
  {
    key: "x",
    label: "X",
    icon: "𝕏",
    action: (_: string, url: string, text: string) => {
      window.open(
        `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
        "_blank"
      );
    },
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    icon: "💬",
    action: (_: string, url: string, text: string) => {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,
        "_blank"
      );
    },
  },
  {
    key: "native",
    label: "Share",
    icon: "📤",
    action: async (text: string, url: string) => {
      if (navigator.share) {
        await navigator.share({ title: "Arsenal Puzzle", text, url });
      }
    },
    mobileOnly: true,
  },
];

export function ShareButtons({ text, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const destinations = SHARE_DESTINATIONS.filter(
    (d) => !d.mobileOnly || (typeof navigator !== "undefined" && "share" in navigator)
  );

  async function handleShare(key: string, action: Function) {
    await action(text, url, text);
    if (key === "copy") {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="flex gap-2">
      {destinations.map((dest) => (
        <button
          key={dest.key}
          onClick={() => handleShare(dest.key, dest.action)}
          className={cn(
            "flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-medium transition-colors",
            dest.key === "copy" && copied
              ? "bg-green-500/20 text-green-400"
              : "bg-white/5 text-white/60 hover:bg-white/10"
          )}
        >
          <span className="text-base">{dest.icon}</span>
          <span>{dest.key === "copy" && copied ? "Copied!" : dest.label}</span>
        </button>
      ))}
    </div>
  );
}
