import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

const SERIF = "'Georgia', 'DM Serif Display', serif";
const SANS  = "'Satoshi', 'system-ui', sans-serif";
const MONO  = "'Cabinet Grotesk', 'monospace'";

const CATEGORY_COLORS: Record<string, string> = {
  "Insights":         "#a78bfa",
  "Salary Guides":    "#34d399",
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

      {/* ── NAV ── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(10,10,10,0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #1a1a1a",
      }}>
        <div style={{
          maxWidth: 800, margin: "0 auto",
          padding: "0 24px", height: 64,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <Link href="/" style={{
            fontFamily: SERIF, fontSize: 20, color: "#f0f0e8",
            textDecoration: "none", fontWeight: 400,
          }}>
            Origio
          </Link>
          <Link href="/blog" style={{
            display: "flex", alignItems: "center", gap: 6,
            fontFamily: SANS, fontSize: 13, color: "rgba(240,240,232,0.5)",
            textDecoration: "none", transition: "color 0.15s",
          }}
            className="back-link"
          >
            <ArrowLeft size={14} />
            All Articles
          </Link>
        </div>
      </nav>

      {/* ── HERO / HEADER ── */}
      <header style={{ maxWidth: 800, margin: "0 auto", padding: "64px 24px 48px" }}>

        {/* Meta row */}
        <div style={{
          display: "flex", alignItems: "center", gap: 16,
          flexWrap: "wrap", marginBottom: 28,
        }}>
          <span style={{
            fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em",
            textTransform: "uppercase", color: color,
            border: `1px solid ${color}55`,
            borderRadius: 999, padding: "4px 12px",
          }}>
            {post.category}
          </span>
          <span style={{ fontFamily: SANS, fontSize: 13, color: "rgba(240,240,232,0.4)" }}>
            {new Date(post.published_at).toLocaleDateString("en-GB", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </span>
          <span style={{ fontFamily: SANS, fontSize: 13, color: "rgba(240,240,232,0.4)" }}>
            {readingTime} min read
          </span>
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: SERIF,
          fontWeight: 400,
          fontSize: "clamp(32px, 5vw, 56px)",
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          color: "#f0f0e8",
          margin: "0 0 24px",
        }}>
          {post.title}
        </h1>

        {/* Description */}
        <p style={{
          fontFamily: SANS, fontSize: 19, lineHeight: 1.65,
          color: "rgba(240,240,232,0.58)", margin: "0 0 36px",
        }}>
          {post.description}
        </p>

        {/* Author row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "linear-gradient(135deg, #00ffd5, #0a7a6a)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: SANS, fontSize: 13, fontWeight: 600, color: "#0a0a0a", flexShrink: 0,
          }}>S</div>
          <div>
            <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 500, color: "#f0f0e8" }}>
              Shlok Mestry
            </div>
            <div style={{ fontFamily: SANS, fontSize: 12, color: "rgba(240,240,232,0.38)" }}>
              Origio
            </div>
          </div>
        </div>

        {/* Cover image */}
        {post.cover_image_url && (
          <div style={{
            width: "100%", aspectRatio: "16/9",
            borderRadius: 16, overflow: "hidden",
            background: "#1a1a1a", marginBottom: 8,
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.cover_image_url}
              alt={post.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: "#1a1a1a", margin: "40px 0 0" }} />
      </header>

      {/* ── ARTICLE BODY ── */}
      <article style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px 96px" }}>
        <div className="blog-prose">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content_md}</ReactMarkdown>
        </div>

        {/* ── RELATED POSTS ── */}
        {related.length > 0 && (
          <div style={{ marginTop: 80 }}>
            <p style={{
              fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em",
              textTransform: "uppercase", color: "rgba(240,240,232,0.35)",
              marginBottom: 20,
            }}>
              Related Articles
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
              className="related-grid"
            >
              {related.map((r) => {
                const rc = categoryColor(r.category);
                return (
                  <Link
                    key={r.slug}
                    href={`/blog/${r.slug}`}
                    style={{
                      textDecoration: "none",
                      display: "flex", flexDirection: "column",
                      border: "1px solid #1a1a1a",
                      borderRadius: 12, overflow: "hidden",
                      transition: "border-color 0.2s",
                    }}
                    className="related-card"
                  >
                    {r.cover_image_url && (
                      <div style={{ aspectRatio: "16/9", background: "#1a1a1a" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={r.cover_image_url} alt={r.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      </div>
                    )}
                    <div style={{ padding: "16px 18px" }}>
                      <span style={{
                        fontFamily: MONO, fontSize: 10, letterSpacing: "0.18em",
                        textTransform: "uppercase", color: rc, display: "block", marginBottom: 8,
                      }}>
                        {r.category}
                      </span>
                      <p style={{
                        fontFamily: SERIF, fontSize: 16, lineHeight: 1.3,
                        color: "#f0f0e8", margin: 0,
                      }}
                        className="related-title"
                      >
                        {r.title}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ── BOTTOM CTA ── */}
        <div style={{
          marginTop: 80,
          borderRadius: 24,
          border: "1px solid #1f1f1f",
          background: "radial-gradient(120% 120% at 50% 0%, rgba(0,255,213,0.07) 0%, rgba(10,10,10,0) 60%)",
          padding: "64px 32px",
          textAlign: "center",
        }}>
          <h3 style={{
            fontFamily: SERIF, fontWeight: 400,
            fontSize: "clamp(26px, 3.5vw, 40px)",
            lineHeight: 1.1, letterSpacing: "-0.02em",
            color: "#f0f0e8", margin: "0 0 14px",
          }}>
            Find your perfect{" "}
            <em style={{ color: "#00ffd5", fontStyle: "italic" }}>country</em>
          </h3>
          <p style={{
            fontFamily: SANS, fontSize: 15, lineHeight: 1.6,
            color: "rgba(240,240,232,0.52)", margin: "0 auto 32px", maxWidth: 400,
          }}>
            Answer 8 quick questions and get a personalised ranking based on your salary, visa, and lifestyle priorities.
          </p>
          <Link href="/wizard" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            fontFamily: SANS, fontSize: 14, fontWeight: 600,
            color: "#0a0a0a", background: "#00ffd5",
            borderRadius: 999, padding: "13px 26px",
            textDecoration: "none", letterSpacing: "0.01em",
          }}>
            Find My Country →
          </Link>
        </div>

        {/* Back link */}
        <div style={{ marginTop: 40, textAlign: "center" }}>
          <Link href="/blog" style={{
            fontFamily: SANS, fontSize: 13,
            color: "rgba(240,240,232,0.38)", textDecoration: "none",
            letterSpacing: "0.02em", transition: "color 0.15s",
          }}
            className="back-link"
          >
            ← Back to all articles
          </Link>
        </div>
      </article>

      {/* ── PROSE + HOVER STYLES ── */}
      <style>{`
        .back-link:hover { color: #f0f0e8 !important; }
        .related-card:hover { border-color: #2a2a2a !important; }
        .related-card:hover .related-title { color: #00ffd5 !important; }
        @media (max-width: 600px) {
          .related-grid { grid-template-columns: 1fr !important; }
        }

        /* ── Prose styles ── */
        .blog-prose { font-family: ${SANS}; }

        .blog-prose p {
          font-size: 17px;
          line-height: 1.8;
          color: rgba(240,240,232,0.75);
          margin: 0 0 24px;
        }
        .blog-prose h2 {
          font-family: ${SERIF};
          font-size: clamp(22px, 3vw, 30px);
          font-weight: 400;
          line-height: 1.2;
          letter-spacing: -0.015em;
          color: #f0f0e8;
          margin: 56px 0 20px;
          padding-top: 8px;
        }
        .blog-prose h3 {
          font-family: ${SERIF};
          font-size: clamp(18px, 2.5vw, 22px);
          font-weight: 400;
          line-height: 1.25;
          color: #f0f0e8;
          margin: 40px 0 16px;
        }
        .blog-prose h4 {
          font-family: ${MONO};
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(240,240,232,0.5);
          margin: 32px 0 12px;
        }
        .blog-prose strong {
          color: #f0f0e8;
          font-weight: 600;
        }
        .blog-prose em {
          color: rgba(240,240,232,0.85);
          font-style: italic;
        }
        .blog-prose a {
          color: #00ffd5;
          text-decoration: none;
          border-bottom: 1px solid rgba(0,255,213,0.3);
          transition: border-color 0.15s;
        }
        .blog-prose a:hover { border-color: #00ffd5; }

        .blog-prose ul, .blog-prose ol {
          margin: 0 0 24px 0;
          padding-left: 24px;
          color: rgba(240,240,232,0.72);
          font-size: 16px;
          line-height: 1.75;
        }
        .blog-prose li { margin-bottom: 8px; }
        .blog-prose li::marker { color: #00ffd5; }

        .blog-prose blockquote {
          border-left: 3px solid #00ffd5;
          margin: 32px 0;
          padding: 4px 0 4px 24px;
          color: rgba(240,240,232,0.6);
          font-style: italic;
          font-size: 18px;
          line-height: 1.7;
        }

        .blog-prose code {
          font-family: 'Fira Code', 'Courier New', monospace;
          font-size: 13px;
          background: #111;
          color: #00ffd5;
          padding: 2px 7px;
          border-radius: 4px;
          border: 1px solid #1a1a1a;
        }
        .blog-prose pre {
          background: #0f0f0f;
          border: 1px solid #1a1a1a;
          border-radius: 10px;
          padding: 20px 24px;
          overflow-x: auto;
          margin: 0 0 28px;
        }
        .blog-prose pre code {
          background: none;
          border: none;
          padding: 0;
          font-size: 13px;
          color: rgba(240,240,232,0.8);
        }

        /* Tables */
        .blog-prose table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
          margin: 0 0 32px;
        }
        .blog-prose th {
          font-family: ${MONO};
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(240,240,232,0.45);
          font-weight: 600;
          text-align: left;
          padding: 10px 14px;
          border-bottom: 1px solid #1a1a1a;
        }
        .blog-prose td {
          padding: 12px 14px;
          color: rgba(240,240,232,0.72);
          border-bottom: 1px solid #111;
          font-size: 14px;
          line-height: 1.5;
        }
        .blog-prose tr:last-child td { border-bottom: none; }
        .blog-prose tr:hover td { background: rgba(255,255,255,0.02); }

        /* Horizontal rule */
        .blog-prose hr {
          border: none;
          border-top: 1px solid #1a1a1a;
          margin: 48px 0;
        }
      `}</style>
    </main>
  );
}