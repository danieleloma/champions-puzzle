import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Lazily initialized to avoid build-time errors when env vars aren't present
let _browserClient: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseClient() {
  if (!_browserClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    _browserClient = createClient<Database>(url, key, {
      auth: { persistSession: false },
    });
  }
  return _browserClient;
}

export function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient<Database>(url, serviceKey, {
    auth: { persistSession: false },
  });
}
