import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedAdmin } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const checks = {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  const allOk = Object.values(checks).every(Boolean);

  let dbOk = false;
  let storageOk = false;
  let dbError = "";
  let storageError = "";

  if (allOk) {
    try {
      const { getServiceClient } = await import("@/lib/supabase");
      const supabase = getServiceClient();

      const { error } = await supabase.from("puzzles").select("id").limit(1);
      dbOk = !error;
      if (error) dbError = error.message;

      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      const hasBucket = buckets?.some((b) => b.name === "puzzle-images") ?? false;
      storageOk = !bucketError && hasBucket;
      if (bucketError) storageError = bucketError.message;
      else if (!hasBucket) storageError = "puzzle-images bucket not found";
    } catch (e: unknown) {
      dbError = e instanceof Error ? e.message : "Unknown error";
    }
  }

  return NextResponse.json({
    env: checks,
    db: { ok: dbOk, error: dbError || undefined },
    storage: { ok: storageOk, error: storageError || undefined },
    ready: allOk && dbOk && storageOk,
  });
}
