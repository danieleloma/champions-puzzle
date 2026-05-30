"use client";

import { useCallback, useRef } from "react";

export function useShareCard() {
  const cardRef = useRef<HTMLDivElement>(null);

  const captureCard = useCallback(async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(cardRef.current, {
      useCORS: true,
      scale: 2,
      backgroundColor: "#0D0D0D",
    });
    return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  }, []);

  const shareToNative = useCallback(
    async (text: string, url: string) => {
      const blob = await captureCard();
      if (navigator.share && blob) {
        const file = new File([blob], "arsenal-puzzle.png", {
          type: "image/png",
        });
        await navigator.share({ text, url, files: [file] });
        return;
      }
      await navigator.clipboard.writeText(`${text}\n${url}`);
    },
    [captureCard]
  );

  return { cardRef, captureCard, shareToNative };
}
