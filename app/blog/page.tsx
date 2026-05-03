import Link from "next/link";
import Footer from "@/components/Footer";
import SimpleNav from "@/components/SimpleNav";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Relocation Insights & Guides — Origio Blog",
  description: "In-depth guides on salaries, visas, cost of living, and relocation strategies for professionals moving abroad.",
  alternates: { canonical: "https://findorigio.com/blog" },
  openGraph: {
    title: "Relocation Insights & Guides — Origio Blog",
    description: "In-depth guides on salaries, visas, cost of living, and relocation strategies for professionals moving abroad.",
    url: "https://findorigio.com/blog",
    siteName: "Origio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Relocation Insights & Guides — Origio Blog",
    description: "In-depth guides on salaries, visas, cost of living, and relocation strategies for professionals moving abroad.",
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  "Salary Guides": "text-green-400",
  "Visa Guides": "text-blue-400",
  "City Comparisons": "text-purple-400",
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
    <main className="min-h-screen bg-bg-primary">
      <SimpleNav />

      <section className="max-w-5xl mx-auto px-4 py-12 md:py-16">
        {/* Header */}
        <div className="max-w-2xl mb-12">
          <p className="text-sm text-accent font-semibold mb-3 uppercase tracking-wider">Relocation Insights</p>
          <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-text-primary mb-4">
            Blog
          </h1>
          <p className="text-text-muted text-base md:text-lg leading-7">
            Data-first guides on salaries, visas, and cost of living. No fluff.
          </p>
        </div>

        {/* Featured post */}
        {featured && (
          <Link
            href={`/blog/${featured.slug}`}
            className="glass-panel p-8 border border-border hover:border-accent/30 transition-all group flex flex-col md:flex-row md:items-center gap-6 mb-8"
          >
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <span className={`text-xs font-semibold uppercase tracking-wider ${CATEGORY_COLORS[featured.category] ?? "text-accent"}`}>
                  {featured.category}
                </span>
                <span className="text-xs text-text-muted">
                  {new Date(featured.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>
                {featured.content_md && (
                  <span className="text-xs text-text-muted">
                    {getReadingTime(featured.content_md)} min read
                  </span>
                )}
                <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 font-semibold uppercase tracking-wider">
                  Latest
                </span>
              </div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-text-primary mb-3 group-hover:text-accent transition-colors">
                {featured.title}
              </h2>
              <p className="text-text-muted text-sm leading-relaxed mb-4">{featured.description}</p>
              <div className="flex items-center gap-1 text-xs text-accent font-medium">
                Read article <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </Link>
        )}

        {/* Rest of posts */}
        {rest.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
            {rest.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="glass-panel p-6 border border-border hover:border-accent/30 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <span className={`text-xs font-semibold uppercase tracking-wider ${CATEGORY_COLORS[post.category] ?? "text-accent"}`}>
                      {post.category}
                    </span>
                    <span className="text-xs text-text-muted">
                      {new Date(post.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <h2 className="font-heading text-lg font-bold text-text-primary mb-2 group-hover:text-accent transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-text-muted text-sm leading-relaxed">{post.description}</p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-1 text-xs text-accent font-medium">
                    Read article <ArrowRight className="w-3 h-3" />
                  </div>
                  {post.content_md && (
                    <span className="text-xs text-text-muted">{getReadingTime(post.content_md)} min read</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {allPosts.length === 0 && (
          <p className="text-text-muted text-sm mb-16">No posts yet. Check back soon.</p>
        )}

        {/* Bottom CTA */}
        <div className="glass-panel p-8 border border-accent/20 text-center">
          <h3 className="font-heading text-xl font-bold text-text-primary mb-2">
            Not sure which country fits you?
          </h3>
          <p className="text-text-muted text-sm mb-6 max-w-sm mx-auto">
            Answer 8 quick questions and get a personalised ranking across all 25 countries based on your role, passport, and priorities.
          </p>
          <Link href="/wizard" className="cta-button px-6 py-3 text-sm inline-flex items-center gap-2">
            Find My Country
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}