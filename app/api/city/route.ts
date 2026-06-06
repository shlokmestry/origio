import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "missing slug" }, { status: 400 });

  const { data, error } = await supabase
    .from("cities")
    .select(`id, slug, name, country_slug, country_name, flag_emoji, continent, language, currency, timezone, population, tagline, city_data (*)`)
    .eq("slug", slug)
    .single();

  if (error || !data) return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json(data);
}
