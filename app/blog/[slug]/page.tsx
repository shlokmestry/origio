import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Footer from "@/components/Footer";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

const SERIF = "var(--font-heading, 'Cabinet Grotesk', sans-serif)";
const SANS  = "'Inter', sans-serif";
const MONO  = "'monospace'";

const CATEGORY_COLORS: Record<string, string> = {
  "Insights":         "#a78bfa",
  "Salary Guides":    "#4ade80",
  "Visa Guides":      "#60a5fa",
  "City Comparisons": "#f472b6",
};

function categoryColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? "#00ffd5";
}

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
  const supabase = getSupabase();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();
  return data;
}

async function getRelatedPosts(slug: string, category: string) {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("blog_posts")
    .select("slug, title, category, published_at, cover_image_url")
    .eq("published", true)
    .eq("category", category)
    .neq("slug", slug)
    .order("published_at", { ascending: false })
    .limit(2);
  return data ?? [];
}

export async function generateStaticParams() {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("published", true);
  return (data ?? []).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post Not Found" };
  return {
    title: `${post.title} — Origio Blog`,
    description: post.description,
    alternates: { canonical: `https://findorigio.com/blog/${slug}` },
    openGraph: {
      title: `${post.title} — Origio Blog`,
      description: post.description,
      url: `https://findorigio.com/blog/${slug}`,
      siteName: "Origio",
      type: "article",
      publishedTime: post.published_at,
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} — Origio Blog`,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(slug, post.category);
  const readingTime = getReadingTime(post.content_md);
  const color = categoryColor(post.category);

  return (
    <main style={{ background: "#0a0a0a", color: "#f0f0e8", minHeight: "100vh" }}>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.description,
            datePublished: post.published_at,
            dateModified: post.published_at,
            publisher: { "@type": "Organization", name: "Origio", url: "https://findorigio.com" },
            mainEntityOfPage: `https://findorigio.com/blog/${slug}`,
          }),
        }}
      />

      {/* ── Static blog nav — no function props, works in server components ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(10,10,10,0.88)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid #1a1a1a",
      }}>
        <div style={{
          maxWidth: 760, margin: "0 auto",
          padding: "0 24px", height: 64,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <Link href="/" style={{
            display: "flex", alignItems: "center", gap: 8,
            textDecoration: "none",
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#00ffd5", display: "inline-block" }} />
            <span style={{
              fontFamily: SERIF, fontSize: 20,
              color: "#f0f0e8", letterSpacing: "-0.02em",
            }}>
              origio<span style={{ color: "#00ffd5" }}>.</span>
            </span>
          </Link>
          <Link href="/blog" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontFamily: SANS, fontSize: 11, fontWeight: 800,
            letterSpacing: "0.12em", textTransform: "uppercase",
            color: "rgba(240,240,232,0.35)", textDecoration: "none",
          }}>
            <ArrowLeft size={12} />
            All Articles
          </Link>
        </div>
      </nav>

      {/* ── HERO / HEADER ── */}
      <header style={{ maxWidth: 760, margin: "0 auto", padding: "56px 24px 48px" }}>

        {/* Meta row */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          flexWrap: "wrap", marginBottom: 24,
        }}>
          <span style={{
            fontFamily: MONO, fontSize: 9, letterSpacing: "0.18em",
            textTransform: "uppercase", color: color,
            border: `1px solid ${color}55`,
            padding: "4px 10px",
          }}>
            {post.category}
          </span>
          <span style={{ fontFamily: SANS, fontSize: 12, color: "rgba(240,240,232,0.35)", fontWeight: 600 }}>
            {new Date(post.published_at).toLocaleDateString("en-GB", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </span>
          <span style={{ fontSize: 10, color: "rgba(240,240,232,0.25)" }}>·</span>
          <span style={{ fontFamily: SANS, fontSize: 12, color: "rgba(240,240,232,0.35)", fontWeight: 600 }}>
            {readingTime} min read
          </span>
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: SERIF, fontWeight: 400,
          fontSize: "clamp(32px, 5vw, 56px)",
          lineHeight: 1.08, letterSpacing: "-0.02em",
          color: "#f0f0e8", margin: "0 0 20px",
        }}>
          {post.title}
        </h1>

        {/* Description */}
        <p style={{
          fontFamily: SANS, fontSize: 18, lineHeight: 1.65,
          color: "rgba(240,240,232,0.5)", margin: "0 0 32px",
        }}>
          {post.description}
        </p>

        {/* Author */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
          <div style={{
            width: 34, height: 34, background: "#00ffd5",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: SANS, fontSize: 13, fontWeight: 800, color: "#0a0a0a", flexShrink: 0,
          }}>S</div>
          <div>
            <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: "#f0f0e8" }}>Shlok Mestry</div>
            <div style={{ fontFamily: SANS, fontSize: 11, color: "rgba(240,240,232,0.35)", letterSpacing: "0.04em" }}>Origio</div>
          </div>
        </div>

        {/* Cover image */}
        {post.cover_image_url && (
          <div style={{
            width: "100%", aspectRatio: "16/9", overflow: "hidden",
            background: "#1a1a1a", marginBottom: 8, border: "1px solid #2a2a2a",
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.cover_image_url} alt={post.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        )}

        <div style={{ height: 1, background: "#2a2a2a", margin: "40px 0 0" }} />
      </header>

      {/* ── ARTICLE BODY ── */}
      <article style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px 96px" }}>
        <div className="blog-prose">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content_md}</ReactMarkdown>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div style={{ marginTop: 72 }}>
            <p style={{
              fontSize: 9, fontWeight: 800, letterSpacing: "0.22em",
              textTransform: "uppercase", color: "rgba(240,240,232,0.35)", marginBottom: 20,
            }}>Related Articles</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="related-grid">
              {related.map((r) => {
                const rc = categoryColor(r.category);
                return (
                  <Link key={r.slug} href={`/blog/${r.slug}`} style={{
                    textDecoration: "none", display: "flex", flexDirection: "column",
                    border: "1px solid #2a2a2a", overflow: "hidden",
                    background: "#111", boxShadow: "3px 3px 0 #1a1a1a",
                  }} className="related-card">
                    {r.cover_image_url && (
                      <div style={{ aspectRatio: "16/9", background: "#1a1a1a" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={r.cover_image_url} alt={r.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      </div>
                    )}
                    <div style={{ padding: "16px 18px" }}>
                      <span style={{
                        fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase",
                        color: rc, display: "block", marginBottom: 8, fontWeight: 800,
                      }}>{r.category}</span>
                      <p style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.3, color: "#f0f0e8", margin: 0 }}
                        className="related-title">{r.title}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA */}
        <div style={{
          marginTop: 72, border: "1px solid #2a2a2a", background: "#111",
          padding: "56px 32px", textAlign: "center", boxShadow: "3px 3px 0 #1a1a1a",
        }}>
          <p style={{
            fontSize: 9, fontWeight: 800, letterSpacing: "0.22em",
            textTransform: "uppercase", color: "rgba(240,240,232,0.35)", marginBottom: 16,
          }}>Find your country</p>
          <h3 style={{
            fontFamily: SERIF, fontWeight: 400,
            fontSize: "clamp(26px, 3.5vw, 40px)",
            lineHeight: 1.1, letterSpacing: "-0.02em",
            color: "#f0f0e8", margin: "0 0 14px",
          }}>
            Where does your salary{" "}
            <em style={{ color: "#00ffd5", fontStyle: "italic" }}>stretch furthest?</em>
          </h3>
          <p style={{
            fontFamily: SANS, fontSize: 14, lineHeight: 1.7,
            color: "rgba(240,240,232,0.45)", margin: "0 auto 32px", maxWidth: 380,
          }}>
            Answer 8 questions and get a personalised ranking across 25 countries based on your role, passport, and priorities.
          </p>
          <Link href="/wizard" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            fontFamily: SANS, fontSize: 12, fontWeight: 800,
            letterSpacing: "0.1em", textTransform: "uppercase",
            color: "#0a0a0a", background: "#00ffd5",
            padding: "13px 28px", textDecoration: "none",
            boxShadow: "3px 3px 0 #f0f0e8",
          }}>
            Find My Country →
          </Link>
        </div>

        <div style={{ marginTop: 32, textAlign: "center" }}>
          <Link href="/blog" style={{
            fontFamily: SANS, fontSize: 11, fontWeight: 800,
            letterSpacing: "0.12em", textTransform: "uppercase",
            color: "rgba(240,240,232,0.28)", textDecoration: "none",
          }} className="back-link">
            ← All Articles
          </Link>
        </div>
      </article>

      <Footer />

      <style>{`
        .back-link:hover { color: #f0f0e8 !important; }
        .related-card:hover { border-color: #00ffd5 !important; }
        .related-card:hover .related-title { color: #00ffd5 !important; }
        @media (max-width: 600px) { .related-grid { grid-template-columns: 1fr !important; } }
        .blog-prose { font-family: ${SANS}; }
        .blog-prose p { font-size: 17px; line-height: 1.8; color: rgba(240,240,232,0.68); margin: 0 0 24px; }
        .blog-prose h2 { font-family: ${SERIF}; font-size: clamp(22px,3vw,30px); font-weight: 400; line-height: 1.2; letter-spacing: -0.015em; color: #f0f0e8; margin: 56px 0 20px; padding-top: 8px; }
        .blog-prose h3 { font-family: ${SERIF}; font-size: clamp(18px,2.5vw,22px); font-weight: 400; line-height: 1.25; color: #f0f0e8; margin: 40px 0 16px; }
        .blog-prose h4 { font-size: 9px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(240,240,232,0.4); margin: 32px 0 12px; }
        .blog-prose strong { color: #f0f0e8; font-weight: 700; }
        .blog-prose em { color: rgba(240,240,232,0.85); font-style: italic; }
        .blog-prose a { color: #00ffd5; text-decoration: none; border-bottom: 1px solid rgba(0,255,213,0.3); transition: border-color 0.15s; }
        .blog-prose a:hover { border-color: #00ffd5; }
        .blog-prose ul, .blog-prose ol { margin: 0 0 24px; padding-left: 20px; color: rgba(240,240,232,0.65); font-size: 16px; line-height: 1.8; }
        .blog-prose li { margin-bottom: 8px; }
        .blog-prose li::marker { color: #00ffd5; }
        .blog-prose blockquote { border-left: 2px solid #00ffd5; margin: 32px 0; padding: 4px 0 4px 24px; color: rgba(240,240,232,0.55); font-style: italic; font-size: 18px; line-height: 1.7; }
        .blog-prose code { font-family: 'Fira Code', monospace; font-size: 13px; background: #111; color: #00ffd5; padding: 2px 7px; border: 1px solid #2a2a2a; }
        .blog-prose pre { background: #0f0f0f; border: 1px solid #2a2a2a; padding: 20px 24px; overflow-x: auto; margin: 0 0 28px; }
        .blog-prose pre code { background: none; border: none; padding: 0; font-size: 13px; color: rgba(240,240,232,0.8); }
        .blog-prose table { width: 100%; border-collapse: collapse; font-size: 14px; margin: 0 0 32px; border: 1px solid #2a2a2a; }
        .blog-prose th { font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(240,240,232,0.4); font-weight: 800; text-align: left; padding: 10px 14px; border-bottom: 1px solid #2a2a2a; background: #111; }
        .blog-prose td { padding: 12px 14px; color: rgba(240,240,232,0.65); border-bottom: 1px solid #1a1a1a; font-size: 14px; line-height: 1.5; }
        .blog-prose tr:last-child td { border-bottom: none; }
        .blog-prose tr:hover td { background: rgba(255,255,255,0.02); }
        .blog-prose hr { border: none; border-top: 1px solid #2a2a2a; margin: 48px 0; }
      `}</style>
    </main>
  );
}