// Server wrapper — exists only to statically generate puzzle shells so the
// dynamic [puzzleId] segment doesn't force a live serverless round trip on
// every /play/[id] navigation (the page itself is 100% client-rendered; data
// comes from the game store or a client-side fetch — see PlayPageClient).
// Puzzle IDs live in Supabase, not local data, so known puzzles are
// pre-rendered at build time and any puzzle added afterwards is rendered
// once on first visit and cached (ISR) rather than on every request.
import { Suspense } from "react";
import { getServiceClient } from "@/lib/supabase";
import PlayPageClient from "./PlayPageClient";

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const supabase = getServiceClient();
    const { data } = await supabase.from("puzzles").select("id").eq("active", true);
    return (data ?? []).map((p) => ({ puzzleId: p.id }));
  } catch {
    return [];
  }
}

export default function PlayPage() {
  // PlayPageClient reads useSearchParams(), which requires a Suspense
  // boundary now that this route is statically prerendered.
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-[#0f0f10]" />}>
      <PlayPageClient />
    </Suspense>
  );
}
