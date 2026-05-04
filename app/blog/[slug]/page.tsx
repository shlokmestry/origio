import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function getReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

async function getPost(slug: string) {
  const { data } = await getSupabase().from("blog_posts").select("*").eq("slug", slug).eq("published", true).single();
  return data;
}

async function getRelatedPosts(slug: string, category: string) {
  const { data } = await getSupabase().from("blog_posts").select("slug, title, category, published_at")
    .eq("published", true).eq("category", category).neq("slug", slug)
    .order("published_at", { ascending: false }).limit(2);
  return data ?? [];
}

export async function generateStaticParams() {
  const { data } = await getSupabase().from("blog_posts").select("slug").eq("published", true);
  return (data ?? []).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post Not Found" };
  return {
    title: `${post.title} — Origio`,
    description: post.description,
    alternates: { canonical: `https://findorigio.com/blog/${slug}` },
    openGraph: {
      title: `${post.title} — Origio`,
      description: post.description,
      url: `https://findorigio.com/blog/${slug}`,
      siteName: "Origio",
      type: "article",
      publishedTime: post.published_at,
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} — Origio`,
      description: post.description,
    },
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  "Salary Guides":    "#4ade80",
  "Visa Guides":      "#60a5fa",
  "City Comparisons": "#a78bfa",
};

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(slug, post.category);
  const readingTime = getReadingTime(post.content_md);
  const catColor = CATEGORY_COLORS[post.category] ?? "#00ffd5";

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#f0f0e8]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.description,
            datePublished: post.published_at,
            publisher: { "@type": "Organization", name: "Origio", url: "https://findorigio.com" },
            mainEntityOfPage: `https://findorigio.com/blog/${slug}`,
          }),
        }}
      />

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 border-b border-[#1a1a1a]" style={{ background: "rgba(10,10,10,0.95)", backdropFilter: "blur(8px)" }}>
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
            <div className="w-3 h-3 bg-[#00ffd5] border-2 border-[#f0f0e8]" />
            <span className="font-heading text-sm font-extrabold uppercase tracking-tight">Origio</span>
          </Link>
          <Link href="/blog" className="flex items-center gap-2 text-[11px] font-bold text-[#888880] hover:text-[#f0f0e8] transition-colors uppercase tracking-widest">
            <ArrowLeft className="w-3.5 h-3.5" /> All articles
          </Link>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-6 py-16">

        {/* ── ARTICLE HEADER ── */}
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-6 font-mono text-[10px]">
            <span style={{ color: catColor }} className="font-bold uppercase tracking-widest">{post.category}</span>
            <span className="text-[#444]">·</span>
            <span className="text-[#444]">
              {new Date(post.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </span>
            <span className="text-[#444]">·</span>
            <span className="text-[#444]">{readingTime} min read</span>
          </div>

          {/* Serif title */}
          <h1 style={{
            fontFamily: "DM Serif Display, Georgia, serif",
            fontSize: "clamp(32px, 5vw, 52px)",
            fontWeight: 400,
            lineHeight: 1.1,
            color: "#f0f0e8",
            marginBottom: 20,
          }}>
            {post.title}
          </h1>

          <p className="text-[#888880] text-base leading-relaxed max-w-xl">{post.description}</p>
          <div className="mt-8 h-px bg-[#1a1a1a]" />
        </header>

        {/* ── ARTICLE BODY ── */}
        <div className="prose prose-invert max-w-none
          prose-headings:font-heading prose-headings:font-extrabold prose-headings:text-[#f0f0e8] prose-headings:tracking-tight prose-headings:uppercase
          prose-h2:text-xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:border-l-2 prose-h2:border-[#00ffd5] prose-h2:pl-4
          prose-h3:text-base prose-h3:mt-8 prose-h3:mb-3
          prose-p:text-[#888880] prose-p:leading-7 prose-p:mb-4 prose-p:text-sm
          prose-strong:text-[#f0f0e8] prose-strong:font-bold
          prose-ul:text-[#888880] prose-ul:text-sm
          prose-ol:text-[#888880] prose-ol:text-sm
          prose-li:leading-7 prose-li:mb-1
          prose-a:text-[#00ffd5] prose-a:no-underline hover:prose-a:underline
          prose-table:text-sm prose-table:border-collapse
          prose-th:text-[#f0f0e8] prose-th:font-bold prose-th:border prose-th:border-[#2a2a2a] prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:bg-[#111] prose-th:text-xs prose-th:uppercase prose-th:tracking-widest
          prose-td:text-[#888880] prose-td:border prose-td:border-[#1a1a1a] prose-td:px-4 prose-td:py-2 prose-td:text-xs prose-td:font-mono
          prose-blockquote:border-l-[#00ffd5] prose-blockquote:text-[#888880] prose-blockquote:not-italic
          prose-code:text-[#00ffd5] prose-code:px-1 prose-code:py-0.5 prose-code:text-xs prose-code:font-mono prose-code:bg-[#111]
        ">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content_md}</ReactMarkdown>
        </div>

        {/* ── RELATED ── */}
        {related.length > 0 && (
          <div className="mt-16 pt-8 border-t border-[#1a1a1a]">
            <p className="text-[10px] font-bold text-[#888880] uppercase tracking-[0.2em] mb-6">Related articles</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {related.map((r) => (
                <Link key={r.slug} href={`/blog/${r.slug}`}
                  className="group border border-[#1a1a1a] p-5 hover:border-[#2a2a2a] transition-colors">
                  <span className="text-[10px] font-bold uppercase tracking-widest font-mono block mb-2"
                    style={{ color: CATEGORY_COLORS[r.category] ?? "#00ffd5" }}>
                    {r.category}
                  </span>
                  <p className="font-heading text-sm font-extrabold uppercase tracking-tight text-[#f0f0e8] group-hover:text-[#00ffd5] transition-colors leading-snug">
                    {r.title}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── FOOTER CTA ── */}
        <footer className="mt-16 pt-8 border-t border-[#1a1a1a]">
          <div className="border border-[#2a2a2a] p-8 mb-8" style={{ boxShadow: "4px 4px 0 #2a2a2a" }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div>
                <h3 style={{
                  fontFamily: "DM Serif Display, Georgia, serif",
                  fontSize: "clamp(20px, 3vw, 26px)",
                  fontWeight: 400,
                  fontStyle: "italic",
                  color: "#f0f0e8",
                  marginBottom: 4,
                }}>
                  Find your country.
                </h3>
                <p className="text-[#666660] text-xs">8 questions. 25 countries ranked. Free.</p>
              </div>
              <Link href="/wizard"
                className="cta-button px-6 py-3 text-[11px] font-bold uppercase tracking-widest inline-flex items-center justify-center flex-shrink-0">
                Run the ranking
              </Link>
            </div>
          </div>
          <Link href="/blog" className="text-[11px] font-bold text-[#888880] hover:text-[#00ffd5] transition-colors uppercase tracking-widest">
            ← All articles
          </Link>
        </footer>

      </article>
    </main>
  );
}