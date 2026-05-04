import Link from "next/link";
import Footer from "@/components/Footer";
import SimpleNav from "@/components/SimpleNav";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Relocation guides — Origio Blog",
  description: "Data-first guides on salaries, visas, and cost of living for professionals moving abroad.",
  alternates: { canonical: "https://findorigio.com/blog" },
  openGraph: {
    title: "Relocation guides — Origio Blog",
    description: "Data-first guides on salaries, visas, and cost of living for professionals moving abroad.",
    url: "https://findorigio.com/blog",
    siteName: "Origio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Relocation guides — Origio Blog",
    description: "Data-first guides on salaries, visas, and cost of living for professionals moving abroad.",
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  "Salary Guides": "#4ade80",
  "Visa Guides": "#60a5fa",
  "City Comparisons": "#a78bfa",
};

function getReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default async function BlogPage() {
  const supabase = getSupabase();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, title, description, category, published_at, content_md")
    .eq("published", true)
    .order("published_at", { ascending: false });

  const allPosts = posts ?? [];
  const featured = allPosts[0] ?? null;
  const rest = allPosts.slice(1);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#f0f0e8]">
      <SimpleNav />

      <section className="max-w-5xl mx-auto px-6 py-16 md:py-24">

        {/* ── HEADER — left-aligned, serif ── */}
        <div className="mb-16 pb-8 border-b border-[#1a1a1a]">
          <p className="text-[10px] font-bold text-[#888880] uppercase tracking-[0.25em] mb-6">Origio Blog</p>
          <h1 style={{ lineHeight: 1, marginBottom: 16 }}>
            <span style={{
              display: "block",
              fontFamily: "DM Serif Display, Georgia, serif",
              fontSize: "clamp(40px, 6vw, 64px)",
              fontWeight: 400,
              fontStyle: "italic",
              color: "#f0f0e8",
              lineHeight: 1.05,
            }}>
              Relocation,
            </span>
            <span className="font-heading font-extrabold uppercase tracking-tight block"
              style={{ fontSize: "clamp(40px, 6vw, 64px)", lineHeight: 0.95, color: "#f0f0e8" }}>
              by the numbers.
            </span>
          </h1>
          <p className="text-[#666660] text-sm mt-4 max-w-md">
            Data-first guides on salaries, visas, and cost of living. No fluff.
          </p>
        </div>

        {/* ── FEATURED POST ── */}
        {featured && (
          <Link href={`/blog/${featured.slug}`}
            className="group block mb-12 border border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors">
            <div className="grid md:grid-cols-[1fr_200px] gap-0">
              <div className="p-8 border-b md:border-b-0 md:border-r border-[#1a1a1a]">
                <div className="flex items-center gap-4 mb-5">
                  <span className="text-[10px] font-bold uppercase tracking-widest font-mono"
                    style={{ color: CATEGORY_COLORS[featured.category] ?? "#00ffd5" }}>
                    {featured.category}
                  </span>
                  <span className="text-[10px] font-mono text-[#444]">
                    {new Date(featured.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  {featured.content_md && (
                    <span className="text-[10px] font-mono text-[#444]">
                      {getReadingTime(featured.content_md)} min
                    </span>
                  )}
                </div>
                <h2 style={{
                  fontFamily: "DM Serif Display, Georgia, serif",
                  fontSize: "clamp(24px, 3vw, 36px)",
                  fontWeight: 400,
                  lineHeight: 1.1,
                  color: "#f0f0e8",
                  marginBottom: 12,
                  transition: "color 0.15s ease",
                }}>
                  {featured.title}
                </h2>
                <p className="text-[#666660] text-sm leading-relaxed">{featured.description}</p>
              </div>
              <div className="p-8 flex flex-col justify-between bg-[#0d0d0d]">
                <span className="text-[10px] font-bold text-[#444] uppercase tracking-widest border border-[#1a1a1a] px-2 py-1 self-start font-mono">Latest</span>
                <div className="flex items-center gap-2 text-[11px] font-bold text-[#888880] group-hover:text-[#00ffd5] transition-colors uppercase tracking-widest">
                  Read <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* ── REST — list layout, not cards ── */}
        {rest.length > 0 && (
          <div className="mb-16">
            <p className="text-[10px] font-bold text-[#888880] uppercase tracking-[0.2em] mb-6">All articles</p>
            <div className="border-t border-[#1a1a1a]">
              {rest.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`}
                  className="group flex items-start gap-6 py-6 border-b border-[#111] hover:bg-[#0d0d0d] transition-colors px-3 -mx-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest font-mono"
                        style={{ color: CATEGORY_COLORS[post.category] ?? "#00ffd5" }}>
                        {post.category}
                      </span>
                      <span className="text-[10px] font-mono text-[#444]">
                        {new Date(post.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      {post.content_md && (
                        <span className="text-[10px] font-mono text-[#444]">{getReadingTime(post.content_md)} min</span>
                      )}
                    </div>
                    <h2 className="font-heading text-base font-extrabold uppercase tracking-tight text-[#f0f0e8] mb-1 group-hover:text-[#00ffd5] transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-[#666660] text-xs leading-relaxed line-clamp-2">{post.description}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#333] group-hover:text-[#00ffd5] transition-colors flex-shrink-0 mt-1" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {allPosts.length === 0 && (
          <p className="text-[#666660] text-sm mb-16 font-mono">No posts yet.</p>
        )}

        {/* ── BOTTOM CTA — asymmetric ── */}
        <div className="border border-[#2a2a2a] p-8" style={{ boxShadow: "4px 4px 0 #2a2a2a" }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h3 style={{
                fontFamily: "DM Serif Display, Georgia, serif",
                fontSize: "clamp(20px, 3vw, 28px)",
                fontWeight: 400,
                fontStyle: "italic",
                color: "#f0f0e8",
                marginBottom: 6,
              }}>
                Not sure which country fits you?
              </h3>
              <p className="text-[#666660] text-sm">8 questions. 25 countries ranked. Free.</p>
            </div>
            <Link href="/wizard"
              className="cta-button px-6 py-3 text-[11px] font-bold uppercase tracking-widest inline-flex items-center justify-center flex-shrink-0">
              Run the ranking
            </Link>
          </div>
        </div>

      </section>
      <Footer />
    </main>
  );
}