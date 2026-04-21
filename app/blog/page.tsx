/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import { Globe2, ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

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

const POSTS = [
  {
    slug: "software-engineer-salary-germany",
    title: "Software Engineer Salaries in Germany: Full Breakdown 2026",
    description: "Junior to senior salary ranges, exact tax deductions, take-home pay, and whether Germany is worth it compared to the UK and Netherlands.",
    date: "2026-04-15",
    category: "Salary Guides",
  },
  {
    slug: "us-h1b-visa-guide",
    title: "H1B Visa Guide for Software Engineers 2026",
    description: "Lottery odds, full timeline, what happens if you don't get selected, and the 4 best backup routes into the US tech industry.",
    date: "2026-04-10",
    category: "Visa Guides",
  },
  {
    slug: "cost-of-living-dublin-vs-berlin",
    title: "Dublin vs Berlin: Cost of Living for Tech Workers in 2026",
    description: "Full monthly cost comparison — rent, groceries, transport, healthcare — plus which city gives you more disposable income on a tech salary.",
    date: "2026-04-08",
    category: "City Comparisons",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  "Salary Guides": "text-green-400",
  "Visa Guides": "text-blue-400",
  "City Comparisons": "text-purple-400",
};

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

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="glass-panel rounded-2xl p-6 border border-border hover:border-accent/30 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-4 mb-3">
                  <span className={`text-xs font-semibold uppercase tracking-wider ${CATEGORY_COLORS[post.category] ?? "text-accent"}`}>
                    {post.category}
                  </span>
                  <span className="text-xs text-text-muted">
                    {new Date(post.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
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

        {/* Bottom CTA */}
        <div className="glass-panel rounded-2xl p-8 border border-accent/20 text-center">
          <h3 className="font-heading text-xl font-bold text-text-primary mb-2">
            Not sure which country fits you?
          </h3>
          <p className="text-text-muted text-sm mb-6 max-w-sm mx-auto">
            Answer 8 quick questions and get a personalised ranking across all 25 countries based on your role, passport, and priorities.
          </p>
          <Link href="/wizard" className="cta-button px-6 py-3 rounded-xl text-sm inline-flex items-center gap-2">
            Find My Country
          </Link>
        </div>
      </section>
    </main>
  );
}