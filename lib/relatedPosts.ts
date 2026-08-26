import { createClient } from "@supabase/supabase-js";

export type RelatedPost = { slug: string; title: string; category: string };
export type RelatedPlace = { type: "city" | "country"; slug: string; name: string };

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Blog posts whose title mentions this place — used on city/country pages.
export async function getRelatedPostsForPlace(name: string, limit = 3): Promise<RelatedPost[]> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("blog_posts")
    .select("slug, title, category")
    .eq("published", true);
  if (!data) return [];
  const needle = name.toLowerCase();
  return (data as RelatedPost[])
    .filter((p) => p.title.toLowerCase().includes(needle))
    .slice(0, limit);
}

// Cities/countries mentioned in a blog post's title — used on blog post pages.
export async function getRelatedPlacesForPost(title: string, limit = 4): Promise<RelatedPlace[]> {
  const supabase = getSupabase();
  const lower = title.toLowerCase();

  const [{ data: cities }, { data: countries }] = await Promise.all([
    supabase.from("cities").select("slug, name"),
    supabase.from("countries").select("slug, name"),
  ]);

  const cityMatches: RelatedPlace[] = (cities ?? [])
    .filter((c) => lower.includes(c.name.toLowerCase()))
    .map((c) => ({ type: "city" as const, slug: c.slug, name: c.name }));

  const countryMatches: RelatedPlace[] = (countries ?? [])
    .filter((c) => lower.includes(c.name.toLowerCase()))
    .map((c) => ({ type: "country" as const, slug: c.slug, name: c.name }));

  return [...cityMatches, ...countryMatches].slice(0, limit);
}
