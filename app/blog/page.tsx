import Link from "next/link";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 600;

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

// ── Category colour map ────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  "Insights":         "#a78bfa",
  "Salary Guides":    "#34d399",
  "Visa Guides":      "#60a5fa",
  "City Comparisons": "#f472b6",
};

function categoryColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? "#00ffd5";
}

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

// ── Shared token styles ────────────────────────────────────────────────────
const SERIF = "'Cabinet Grotesk', sans-serif";
const SANS  = "'Satoshi', 'system-ui', sans-serif";
const MONO  = "'Satoshi', sans-serif";

export default async function BlogPage() {
  const supabase = getSupabase();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, title, description, category, published_at, content_md, cover_image_url")
    .eq("published", true)
    .order("published_at", { ascending: false });

  const allPosts = posts ?? [];
  const featured = allPosts[0] ?? null;
  const rest     = allPosts.slice(1);

  const CATEGORIES = ["View all", "Insights", "Salary Guides", "Visa Guides", "City Comparisons"];

  return (
    <main style={{ background: "#0a0a0a", color: "#f0f0e8", minHeight: "100vh" }}>
      <Nav />

      {/* ── Page wrapper ── */}
      <div style={{ maxWidth: 1152, margin: "0 auto", padding: "clamp(96px,14vh,160px) 24px clamp(64px,10vh,128px)" }}>

        {/* ── 1. HEADER ── */}
        <div style={{ marginBottom: 80 }}>
          <h1 style={{
            fontFamily: SERIF,
            fontWeight: 400,
            fontSize: "clamp(56px, 9vw, 120px)",
            lineHeight: 1.02,
            letterSpacing: "-0.025em",
            margin: "0 0 20px",
            color: "#f0f0e8",
          }}>
            Inside Origio:{" "}
            <em style={{ color: "#00ffd5", fontStyle: "normal" }}>Blog</em>
          </h1>
          <p style={{
            fontFamily: SANS,
            fontSize: 18,
            lineHeight: 1.6,
            color: "rgba(240,240,232,0.6)",
            maxWidth: 560,
            margin: 0,
          }}>
            Our notes and our take on the things shaping how people pick where to live next.
          </p>
        </div>

        {/* ── 2. FEATURED POST ── */}
        {featured && (
          <Link
            href={`/blog/${featured.slug}`}
            style={{ textDecoration: "none", display: "block", marginBottom: 72 }}
          >
            <div style={{
              display: "grid",
              gridTemplateColumns: "7fr 5fr",
              gap: "clamp(24px, 4vw, 56px)",
              alignItems: "center",
            }}
              className="blog-featured"
            >
              {/* Image */}
              <div style={{
                aspectRatio: "16/11",
                borderRadius: 18,
                overflow: "hidden",
                background: "#1a1a1a",
              }}>
                {featured.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={featured.cover_image_url}
                    alt={featured.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.5s ease" }}
                    className="blog-cover-img"
                  />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #1a1a1a, #0f0f0f)" }} />
                )}
              </div>

              {/* Meta */}
              <div>
                {/* Category chip */}
                <span style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: categoryColor(featured.category),
                  border: `1px solid ${categoryColor(featured.category)}66`,
                  borderRadius: 999,
                  padding: "5px 14px",
                  display: "inline-block",
                  marginBottom: 20,
                }}>
                  {featured.category}
                </span>

                <h2 style={{
                  fontFamily: SERIF,
                  fontWeight: 400,
                  fontSize: "clamp(28px, 3.5vw, 46px)",
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                  color: "#f0f0e8",
                  margin: "0 0 16px",
                  transition: "color 0.2s",
                }}
                  className="blog-featured-title"
                >
                  {featured.title}
                </h2>

                <p style={{
                  fontFamily: SANS,
                  fontSize: 16,
                  lineHeight: 1.65,
                  color: "rgba(240,240,232,0.58)",
                  margin: "0 0 28px",
                }}>
                  {featured.description}
                </p>

                {/* Author row */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {/* Avatar placeholder */}
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #00ffd5, #0a7a6a)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontFamily: SANS,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#0a0a0a",
                  }}>
                    S
                  </div>
                  <div>
                    <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 500, color: "#f0f0e8" }}>
                      Shlok Mestry
                    </div>
                    <div style={{ fontFamily: SANS, fontSize: 12, color: "rgba(240,240,232,0.42)" }}>
                      {new Date(featured.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      {featured.content_md ? ` · ${getReadingTime(featured.content_md)} min read` : ""}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* ── 3. CATEGORY FILTERS ── */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 56 }}>
          {CATEGORIES.map((cat, i) => {
            const active = i === 0;
            return (
              <button
                key={cat}
                style={{
                  fontFamily: SANS,
                  fontSize: 14,
                  fontWeight: 500,
                  padding: "9px 20px",
                  borderRadius: 999,
                  border: active ? "1px solid #00ffd5" : "1px solid #2a2a2a",
                  background: active ? "rgba(0,255,213,0.08)" : "transparent",
                  color: active ? "#00ffd5" : "rgba(240,240,232,0.7)",
                  cursor: "pointer",
                  letterSpacing: "0.01em",
                  transition: "all 0.15s",
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* ── 4. POST GRID ── */}
        {rest.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 40,
            marginBottom: 128,
          }}
            className="blog-grid"
          >
            {rest.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                style={{ textDecoration: "none", display: "flex", flexDirection: "column" }}
                className="blog-card"
              >
                {/* Cover image */}
                <div style={{
                  aspectRatio: "4/3",
                  borderRadius: 14,
                  overflow: "hidden",
                  background: "#1a1a1a",
                  marginBottom: 20,
                }}>
                  {post.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.cover_image_url}
                      alt={post.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.45s ease" }}
                      className="blog-cover-img"
                    />
                  ) : (
                    <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #1a1a1a, #0f0f0f)" }} />
                  )}
                </div>

                {/* Category eyebrow */}
                <span style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: categoryColor(post.category),
                  marginBottom: 10,
                  display: "block",
                }}>
                  {post.category}
                </span>

                {/* Title */}
                <h3 style={{
                  fontFamily: SERIF,
                  fontWeight: 400,
                  fontSize: 24,
                  lineHeight: 1.18,
                  letterSpacing: "-0.015em",
                  color: "#f0f0e8",
                  margin: "0 0 10px",
                  transition: "color 0.2s",
                }}
                  className="blog-card-title"
                >
                  {post.title}
                </h3>

                {/* Description */}
                <p style={{
                  fontFamily: SANS,
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "rgba(240,240,232,0.52)",
                  margin: "0 0 16px",
                  flex: 1,
                }}>
                  {post.description}
                </p>

                {/* Footer */}
                <div style={{
                  fontFamily: SANS,
                  fontSize: 12,
                  color: "rgba(240,240,232,0.38)",
                  letterSpacing: "0.01em",
                }}>
                  {new Date(post.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  {post.content_md ? ` · ${getReadingTime(post.content_md)} min read` : ""}
                </div>
              </Link>
            ))}
          </div>
        )}

        {allPosts.length === 0 && (
          <p style={{ fontFamily: SANS, fontSize: 15, color: "rgba(240,240,232,0.45)", marginBottom: 128 }}>
            No posts yet. Check back soon.
          </p>
        )}

        {/* ── 5. BOTTOM CTA ── */}
        <div style={{
          borderRadius: 28,
          border: "1px solid #1f1f1f",
          background: "radial-gradient(120% 120% at 50% 0%, rgba(0,255,213,0.07) 0%, rgba(10,10,10,0) 60%)",
          padding: "80px 32px",
          textAlign: "center",
        }}>
          <h2 style={{
            fontFamily: SERIF,
            fontWeight: 400,
            fontSize: "clamp(30px, 4.5vw, 54px)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "#f0f0e8",
            margin: "0 0 16px",
          }}>
            Not sure which country{" "}
            <em style={{ color: "#00ffd5", fontStyle: "normal" }}>fits you</em>?
          </h2>
          <p style={{
            fontFamily: SANS,
            fontSize: 16,
            color: "rgba(240,240,232,0.55)",
            margin: "0 auto 36px",
            maxWidth: 460,
            lineHeight: 1.6,
          }}>
            Answer 8 quick questions and get a personalised ranking across all 45 countries based on your role, passport, and priorities.
          </p>
          <Link
            href="/wizard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily: SANS,
              fontSize: 15,
              fontWeight: 600,
              color: "#0a0a0a",
              background: "#00ffd5",
              borderRadius: 999,
              padding: "14px 28px",
              textDecoration: "none",
              letterSpacing: "0.01em",
              transition: "opacity 0.15s",
            }}
          >
            Find My Country <ArrowRight size={15} />
          </Link>
        </div>

      </div>

      {/* ── Hover styles injected via style tag ── */}
      <style>{`
        @media (max-width: 768px) {
          .blog-featured { grid-template-columns: 1fr !important; gap: 24px !important; }
          .blog-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
        }
        @media (max-width: 1024px) {
          .blog-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .blog-featured { margin-bottom: 40px !important; }
        }
        .blog-card:hover .blog-card-title { color: #00ffd5 !important; }
        .blog-card:hover .blog-cover-img { transform: scale(1.03); }
        .blog-featured:hover .blog-featured-title { color: #00ffd5 !important; }
        .blog-featured:hover .blog-cover-img { transform: scale(1.02); }
      `}</style>

      <Footer />
    </main>
  );
}