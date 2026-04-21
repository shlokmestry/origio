/* eslint-disable react/no-unescaped-entities */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Globe2, ArrowLeft } from "lucide-react";
import { rolePages } from "@/lib/seo-role-pages";

type Props = {
  params: Promise<{ role: string }>;
};

export async function generateStaticParams() {
  return rolePages.map((page) => ({ role: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { role } = await params;
  const page = rolePages.find((item) => item.slug === role);
  if (!page) return { title: "Page Not Found" };
  return {
    title: page.title,
    description: page.metaDescription,
    alternates: { canonical: `https://findorigio.com/best-countries-for/${page.slug}` },
    openGraph: {
      title: page.title,
      description: page.metaDescription,
      url: `https://findorigio.com/best-countries-for/${page.slug}`,
      siteName: "Origio",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.metaDescription,
    },
  };
}

export default async function RoleSeoPage({ params }: Props) {
  const { role } = await params;
  const page = rolePages.find((item) => item.slug === role);
  if (!page) notFound();

  return (
    <main className="min-h-screen bg-bg-primary">
      {/* Nav with back button */}
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
        <div className="max-w-3xl mb-10">
          <p className="text-sm text-accent font-semibold mb-3">Career relocation guide</p>
          <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-text-primary mb-4">
            {page.title}
          </h1>
          <p className="text-text-muted text-base md:text-lg leading-7">{page.intro}</p>
        </div>

        <div className="grid gap-4 md:gap-5">
          {page.countries.map((country, i) => (
            <div key={country.slug} className="glass-panel rounded-2xl p-6 border border-border hover:border-accent/20 transition-colors">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-1">Rank #{i + 1}</p>
                  <h2 className="font-heading text-xl font-bold text-text-primary mb-2">{country.name}</h2>
                  <p className="text-text-muted text-sm mb-4">{country.why}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                      { label: "Typical Salary", value: country.salary },
                      { label: "Tax", value: country.tax },
                      { label: "Visa Path", value: country.visa },
                      { label: "Language", value: country.language },
                      { label: "Quality of Life", value: country.qualityOfLife },
                    ].map((item) => (
                      <div key={item.label}>
                        <p className="text-xs text-text-muted uppercase tracking-wider mb-1">{item.label}</p>
                        <p className="text-sm font-medium text-text-primary">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <Link
                  href="/salary-calculator"
                  className="cta-button px-4 py-2 rounded-xl text-xs font-medium flex-shrink-0 flex items-center gap-1.5"
                >
                  Check take-home pay
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* FAQs */}
        {page.faqs && page.faqs.length > 0 && (
          <div className="mt-16 max-w-3xl">
            <h2 className="font-heading text-2xl font-bold text-text-primary mb-6">Common questions</h2>
            <div className="space-y-4">
              {page.faqs.map((faq) => (
                <div key={faq.question} className="glass-panel rounded-xl p-5 border border-border">
                  <p className="font-heading font-bold text-text-primary text-sm mb-2">{faq.question}</p>
                  <p className="text-text-muted text-sm leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Articles */}
<div className="mt-16 glass-panel rounded-2xl p-8 border border-border">
  <h3 className="font-heading text-xl font-bold text-text-primary mb-6">Related Articles</h3>
  <div className="grid sm:grid-cols-2 gap-4">
    <Link href="/blog/software-engineer-salary-germany" className="p-4 border border-border rounded-xl hover:border-accent/30 transition-all group">
      <p className="font-semibold text-text-primary group-hover:text-accent transition-colors text-sm">Software Engineer Salaries in Germany: Full Breakdown</p>
      <p className="text-text-muted text-xs mt-1">Tax, take-home pay, and cost of living explained.</p>
    </Link>
    <Link href="/blog/us-h1b-visa-guide" className="p-4 border border-border rounded-xl hover:border-accent/30 transition-all group">
      <p className="font-semibold text-text-primary group-hover:text-accent transition-colors text-sm">H1B Visa Guide for Software Engineers 2026</p>
      <p className="text-text-muted text-xs mt-1">Steps, timelines, and alternatives explained.</p>
    </Link>
  </div>
</div>

        {/* Bottom CTA */}
        <div className="mt-16 glass-panel rounded-2xl p-8 border border-accent/20 text-center">
          <h3 className="font-heading text-xl font-bold text-text-primary mb-2">Find your perfect country</h3>
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