import type { Metadata } from "next";
import Link from "next/link";
import { Globe2, ArrowLeft, ArrowRight } from "lucide-react";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Relocation Blog — Origio",
  description: "Salary guides, visa tips, and cost of living comparisons for people moving abroad.",
  alternates: { canonical: "https://findorigio.com/blog" },
  openGraph: {
    title: "Relocation Blog — Origio",
    description: "Salary guides, visa tips, and cost of living comparisons for people moving abroad.",
    url: "https://findorigio.com/blog",
    siteName: "Origio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Relocation Blog — Origio",
    description: "Salary guides, visa tips, and cost of living comparisons for people moving abroad.",
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen bg-bg-primary">
      <nav className="sticky top-0 z-50 glass-panel border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Globe2 className="w-5 h-5 text-accent" />
            <span className="font-heading text-lg font-extrabold text-text-primary">Origio</span>
          </Link>
          <Link href="/" className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Globe
          </Link>
        </div>
      </nav>

      <section className="max-w-5xl mx-auto px-4 py-12 md:py-16">
        <div className="max-w-2xl mb-12">
          <p className="text-sm text-accent font-semibold mb-3 uppercase tracking-wider">Relocation blog</p>
          <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-text-primary mb-4">
            Guides & Articles
          </h1>
          <p className="text-text-muted text-base md:text-lg leading-7">
            Salary breakdowns, visa walkthroughs, and cost of living comparisons to help you move with confidence.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="glass-panel rounded-2xl p-10 border border-border text-center">
            <p className="text-text-muted text-sm">No articles yet — check back soon.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="glass-panel rounded-2xl p-6 border border-border hover:border-accent/30 transition-all group flex flex-col justify-between"
              >
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-3">{post.date}</p>
                  <h2 className="font-heading text-lg font-bold text-text-primary mb-2 group-hover:text-accent transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-text-muted text-sm leading-relaxed">{post.description}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-accent font-medium mt-4">
                  Read article <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 glass-panel rounded-2xl p-8 border border-accent/20 text-center">
          <h3 className="font-heading text-xl font-bold text-text-primary mb-2">
            Not sure which country fits you?
          </h3>
          <p className="text-text-muted text-sm mb-6 max-w-sm mx-auto">
            Answer 8 quick questions and get a personalised ranking based on your salary, visa, and lifestyle priorities.
          </p>
          <Link href="/wizard" className="cta-button px-6 py-3 rounded-xl text-sm inline-flex items-center gap-2">
            Find My Country
          </Link>
        </div>
      </section>
    </main>
  );
}