import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest): Promise<Response> {
  const limited = await rateLimit(req, { name: "get-results", maxRequests: 20, windowSeconds: 60 });
  if (limited) return limited;

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = authHeader.replace("Bearer ", "");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_pro")
    .eq("id", user.id)
    .single();

  if (!profile?.is_pro) {
    return NextResponse.json({ error: "Pro required" }, { status: 403 });
  }

  const { data: result } = await supabase
    .from("wizard_results")
    .select("top_countries")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!result?.top_countries?.length) {
    return NextResponse.json({ error: "No results found" }, { status: 404 });
  }

  return NextResponse.json({ matches: result.top_countries });
}
