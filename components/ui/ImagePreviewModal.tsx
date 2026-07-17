"use client";

import { useEffect } from "react";

// ── Fullscreen puzzle image preview ──────────────────────────────────────────
// Opened by the "View" badge on a puzzle card — lets the user inspect the
// full-resolution artwork before committing to a difficulty/play session.
// Closes on backdrop click, close button, or Escape.
// ─────────────────────────────────────────────────────────────────────────────

export interface ImagePreviewModalProps {
  src: string;
  title: string;
  onClose: () => void;
}

export function ImagePreviewModal({ src, title, onClose }: ImagePreviewModalProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-6"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close preview"
        className="absolute top-5 right-5 flex items-center justify-center size-9 rounded-full bg-[#252627] text-white hover:bg-[#3a3b3e] transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      <div
        className="flex flex-col items-center gap-4 max-w-[90vw] max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={title}
          className="max-w-[90vw] max-h-[75vh] object-contain rounded-[12px]"
        />
        <span className="font-boldonse text-[16px] text-white text-center">
          {title}
        </span>
      </div>
    </div>
  );
}
