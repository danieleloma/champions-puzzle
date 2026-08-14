// Server wrapper — exists only to statically generate every club's shell at
// build time (club IDs are fixed local data, not fetched). Without this the
// dynamic [clubId] segment forces Next to render on-demand per request,
// adding a live serverless round trip to every /club/[id] navigation even
// though the page itself is 100% client-rendered. See ClubPageClient.
import { CHAMPIONS } from "@/lib/champions-data";
import ClubPageClient from "./ClubPageClient";

export function generateStaticParams() {
  return CHAMPIONS.map((c) => ({ clubId: c.id }));
}

export default function ClubPage() {
  return <ClubPageClient />;
}
