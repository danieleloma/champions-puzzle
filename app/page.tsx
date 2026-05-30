import { redirect } from "next/navigation";

// The Figma-designed entry point is /landing.
// All game flow runs through: /landing → /onboarding → /champions → /club/[id] → /play/[id]
export default function RootPage() {
  redirect("/landing");
}
