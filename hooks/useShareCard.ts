"use client";

import { useCallback, useRef } from "react";

const SHARE_FILENAME = "champions-puzzle-score.png";

export function useShareCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const blobRef = useRef<Blob | null>(null);

  // Captured once per completion and cached — the underlying card content
  // never changes after mount, so repeat share-button clicks reuse the same
  // capture instead of re-rendering to canvas each time.
  const captureCard = useCallback(async (): Promise<Blob | null> => {
    if (blobRef.current) return blobRef.current;
    if (!cardRef.current) return null;
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(cardRef.current, { useCORS: true, scale: 2 });
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    blobRef.current = blob;
    return blob;
  }, []);

  // Returns whether the native share sheet actually opened with the image
  // attached — false means the caller should fall back to its own behavior
  // (e.g. a plain clipboard copy), since not every browser/device supports
  // navigator.share, and some support it without file attachments.
  const shareToNative = useCallback(async (text: string, url: string): Promise<boolean> => {
    const blob = await captureCard();
    if (!blob) return false;
    const file = new File([blob], SHARE_FILENAME, { type: "image/png" });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ text, url, files: [file] });
      return true;
    }
    return false;
  }, [captureCard]);

  const downloadCard = useCallback(async () => {
    const blob = await captureCard();
    if (!blob) return;
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = SHARE_FILENAME;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  }, [captureCard]);

  return { cardRef, captureCard, shareToNative, downloadCard };
}
