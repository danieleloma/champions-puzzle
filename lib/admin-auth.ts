import type { NextRequest } from "next/server";

const HEADER = "x-admin-secret";

// Fails closed in production (no secret configured => nothing is authorized),
// fails open in local dev so `npm run dev` doesn't need extra setup.
export function isAuthorizedAdmin(req: NextRequest): boolean {
  const secret = process.env.ADMIN_API_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return req.headers.get(HEADER) === secret;
}

export const ADMIN_SECRET_HEADER = HEADER;
