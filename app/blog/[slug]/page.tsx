import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Globe2, ArrowLeft, Calendar, Tag, Clock } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; 

export const revalidate = 3600;

type Props = {
  params: Promise<{ slug: string }>;
};

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
    .select("slug, title, category, published_at")
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

const CATEGORY_COLORS: Record<string, string> = {
  "Salary Guides": "text-green-400",
  "Visa Guides": "text-blue-400",
  "City Comparisons": "text-purple-400",
};

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(slug, post.category);
  const readingTime = getReadingTime(post.content_md);

  return (
    <main className="min-h-screen bg-bg-primary">
      {/* JSON-LD Article schema */}
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
            publisher: {
              "@type": "Organization",
              name: "Origio",
              url: "https://findorigio.com",
            },
            mainEntityOfPage: `https://findorigio.com/blog/${slug}`,
          }),
        }}
      />

      <nav className="sticky top-0 z-50 glass-panel border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Globe2 className="w-5 h-5 text-accent" />
            <span className="font-heading text-lg font-extrabold text-text-primary">Origio</span>
          </Link>
          <Link href="/blog" className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            All Articles
          </Link>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-4 py-12">
        <header className="mb-10">
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <span className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider ${CATEGORY_COLORS[post.category] ?? "text-accent"}`}>
              <Tag className="w-3 h-3" />
              {post.category}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-text-muted">
              <Calendar className="w-3 h-3" />
              {new Date(post.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-text-muted">
              <Clock className="w-3 h-3" />
              {readingTime} min read
            </span>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-text-primary mb-4">
            {post.title}
          </h1>
          <p className="text-text-muted text-lg">{post.description}</p>
          <div className="mt-6 h-px bg-border" />
        </header>

        {/* Markdown content */}
        <div className="prose prose-invert max-w-none
          prose-headings:font-heading prose-headings:font-bold prose-headings:text-text-primary prose-headings:tracking-tight
          prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
          prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
          prose-p:text-text-muted prose-p:leading-7 prose-p:mb-4
          prose-strong:text-text-primary prose-strong:font-semibold
          prose-ul:text-text-muted prose-ul:space-y-2
          prose-ol:text-text-muted prose-ol:space-y-2
          prose-li:leading-7
          prose-a:text-accent prose-a:no-underline hover:prose-a:underline
          prose-table:text-sm prose-table:border-collapse
          prose-th:text-text-primary prose-th:font-semibold prose-th:border prose-th:border-border prose-th:px-4 prose-th:py-2 prose-th:text-left
          prose-td:text-text-muted prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-2
          prose-blockquote:border-l-accent prose-blockquote:text-text-muted
          prose-code:text-accent prose-code:bg-bg-secondary prose-code:px-1 prose-code:py-0.5 prose-code:text-sm
        ">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content_md}</ReactMarkdown>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="mt-16">
            <p className="text-xs text-text-muted uppercase tracking-wider font-semibold mb-4">Related Articles</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="glass-panel p-5 border border-border hover:border-accent/30 transition-all group"
                >
                  <span className={`text-xs font-semibold uppercase tracking-wider ${CATEGORY_COLORS[r.category] ?? "text-accent"}`}>
                    {r.category}
                  </span>
                  <p className="font-heading text-sm font-bold text-text-primary mt-2 group-hover:text-accent transition-colors leading-snug">
                    {r.title}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <footer className="mt-16 pt-8 border-t border-border">
          {/* CTA */}
          <div className="glass-panel p-8 border border-accent/20 text-center mb-8">
            <h3 className="font-heading text-xl font-bold text-text-primary mb-2">
              Find your perfect country
            </h3>
            <p className="text-text-muted text-sm mb-6 max-w-sm mx-auto">
              Answer 8 quick questions and get a personalised ranking based on your salary, visa, and lifestyle priorities.
            </p>
            <Link href="/wizard" className="cta-button px-6 py-3 text-sm inline-flex items-center gap-2">
              Find My Country
            </Link>
          </div>
          <Link href="/blog" className="text-accent hover:underline text-sm">
            ← Back to all articles
          </Link>
        </footer>
      </article>
    </main>
  );
}