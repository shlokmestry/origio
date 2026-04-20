import Link from "next/link";
import { Globe2, ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Career Relocation Guides — Origio",
  description: "Find the best countries to work in by job role. Salary, tax, visa and quality of life compared for software engineers, nurses, teachers and more.",
};

const GUIDES = [
  { slug: "software-engineers", title: "Software Engineers", emoji: "💻", desc: "Tech salaries, visa routes, and best cities for developers." },
  { slug: "nurses", title: "Nurses", emoji: "🏥", desc: "Healthcare pay, registration requirements, and demand by country." },
  { slug: "teachers", title: "Teachers", emoji: "🎓", desc: "International school salaries, qualifications, and lifestyle." },
  { slug: "product-managers", title: "Product Managers", emoji: "📋", desc: "PM salaries, startup ecosystems, and relocation paths." },
  { slug: "designers", title: "Designers", emoji: "🎨", desc: "UX/UI salaries, creative markets, and visa options." },
  { slug: "accountants", title: "Accountants", emoji: "📊", desc: "Finance salaries, qualification recognition, and tax rates." },
  { slug: "marketing-managers", title: "Marketing Managers", emoji: "📣", desc: "Marketing salaries, language requirements, and opportunities." },
];

function getBlogPosts() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getAllPosts } = require("@/lib/posts");
    return (getAllPosts() as { slug: string; title: string; description: string; date: string }[]).slice(0, 3);
  } catch {
    return [];
  }
}

export default function GuidesPage() {
  const recentPosts = getBlogPosts();

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

        {/* Role guides grid */}
        <div className="max-w-2xl mb-12">
          <p className="text-sm text-accent font-semibold mb-3 uppercase tracking-wider">Career relocation guides</p>
          <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-text-primary mb-4">
            Best countries by job role
          </h1>
          <p className="text-text-muted text-base md:text-lg leading-7">
            Every role has different salary expectations, visa requirements, and ideal destinations. Pick yours to see a personalised country ranking.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GUIDES.map((guide) => (
            <Link
              key={guide.slug}
              href={`/best-countries-for/${guide.slug}`}
              className="glass-panel rounded-2xl p-6 border border-border hover:border-accent/30 transition-all group"
            >
              <div className="text-3xl mb-3">{guide.emoji}</div>
              <h2 className="font-heading text-lg font-bold text-text-primary mb-1 group-hover:text-accent transition-colors">
                {guide.title}
              </h2>
              <p className="text-text-muted text-sm leading-relaxed mb-4">{guide.desc}</p>
              <div className="flex items-center gap-1 text-xs text-accent font-medium">
                View guide <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>

        {/* Blog articles section */}
        {recentPosts.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-sm text-accent font-semibold mb-1 uppercase tracking-wider">From the blog</p>
                <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-text-primary">
                  Latest articles
                </h2>
              </div>
              <Link
                href="/blog"
                className="flex items-center gap-1 text-sm text-accent font-medium hover:underline"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="glass-panel rounded-2xl p-6 border border-border hover:border-accent/30 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wider mb-3">{post.date}</p>
                    <h3 className="font-heading text-base font-bold text-text-primary mb-2 group-hover:text-accent transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-text-muted text-sm leading-relaxed">{post.description}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-accent font-medium mt-4">
                    Read article <ArrowRight className="w-3 h-3" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Wizard CTA */}
        <div className="mt-16 glass-panel rounded-2xl p-8 border border-accent/20 text-center">
          <h3 className="font-heading text-xl font-bold text-text-primary mb-2">
            Not sure which country fits you?
          </h3>
          <p className="text-text-muted text-sm mb-6 max-w-sm mx-auto">
            Answer 8 quick questions and get a personalised ranking across all 25 countries ~ based on your role, passport, and priorities.
          </p>
          <Link href="/wizard" className="cta-button px-6 py-3 rounded-xl text-sm inline-flex items-center gap-2">
            Find My Country
          </Link>
        </div>

      </section>
    </main>
  );
}