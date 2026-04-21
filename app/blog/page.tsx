import Link from "next/link";
import { Globe2, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Relocation Insights & Guides — Origio Blog",
  description: "In-depth guides on salaries, visas, cost of living, and relocation strategies for professionals moving abroad.",
};

// Hardcoded posts for now - you can make this dynamic later with MDX
const POSTS = [
  {
    slug: "software-engineer-salary-germany",
    title: "Software Engineer Salaries in Germany: Full Breakdown 2026",
    description: "Tax, take-home pay, and cost of living explained with real numbers.",
    date: "2026-04-15",
    category: "Salary Guides",
  },
  {
    slug: "us-h1b-visa-guide",
    title: "H1B Visa Guide for Software Engineers 2026",
    description: "Steps, timelines, lottery odds, and alternatives explained.",
    date: "2026-04-10",
    category: "Visa Guides",
  },
  {
    slug: "cost-of-living-dublin-vs-berlin",
    title: "Dublin vs Berlin: Cost of Living Compared",
    description: "Rent, groceries, transport, and lifestyle costs side by side.",
    date: "2026-04-08",
    category: "City Comparisons",
  },
];

export default function BlogPage() {
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
          <p className="text-sm text-accent font-semibold mb-3 uppercase tracking-wider">Relocation Insights</p>
          <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-text-primary mb-4">
            Blog
          </h1>
          <p className="text-text-muted text-base md:text-lg leading-7">
            Deep-dive guides on salaries, visas, cost of living, and relocation strategies — everything you need to move abroad with confidence.
          </p>
        </div>

        <div className="grid gap-4">
          {POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="glass-panel rounded-2xl p-6 border border-border hover:border-accent/30 transition-all group"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <span className="text-xs text-accent font-semibold uppercase tracking-wider">{post.category}</span>
                <span className="text-xs text-text-muted">{new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <h2 className="font-heading text-xl font-bold text-text-primary mb-2 group-hover:text-accent transition-colors">
                {post.title}
              </h2>
              <p className="text-text-muted text-sm leading-relaxed">{post.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}