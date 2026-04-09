"use client";

import { Globe2, ArrowLeft } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <nav className="sticky top-0 z-50 glass-panel">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Globe2 className="w-5 h-5 text-accent" />
            <span className="font-heading text-lg font-extrabold">Origio</span>
          </a>
          <a href="/" className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Globe
          </a>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="space-y-16">

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/20 bg-accent/5 text-accent text-xs font-medium">
              The story behind Origio
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Built out of frustration.<br />
              <span className="gradient-text">Designed to save you weeks.</span>
            </h1>
          </div>

          <div className="prose prose-invert max-w-none space-y-6 text-text-muted text-lg leading-relaxed">
            <p>
              Hi, I am Shlok Mestry and I built Origio because I was exactly where you might be right now.
            </p>
            <p>
              A while back, I started seriously researching moving to another country. What followed was weeks of browser tabs. Dozens of Reddit threads. Salary surveys from three different sources that all contradicted each other. Visa guides that were two years out of date. Cost of living calculators that showed prices in currencies I had to manually convert. Safety scores buried in PDFs.
            </p>
            <p>
              I never found one place that could tell me: given my job, my budget, and where I am from which country actually makes sense for me?
            </p>
            <p>
              So I built it.
            </p>
            <p>
              Origio pulls together real salary data across 20 job roles, cost of living, visa difficulty, quality of life, safety and tax rates for 25 countries — and makes it personal. Tell us what you do, what you earn, what matters to you, and we will show you where you belong.
            </p>
            <p>
              No sponsored results. No affiliate links pushing you toward specific countries. Just data, honestly presented.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { number: "25", label: "Countries covered" },
              { number: "20", label: "Job roles tracked" },
              { number: "100+", label: "Data points per country" },
            ].map((stat) => (
              <div key={stat.label} className="p-6 rounded-2xl bg-bg-surface border border-border text-center">
                <p className="font-heading text-4xl font-extrabold text-accent mb-2">{stat.number}</p>
                <p className="text-sm text-text-muted">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="p-8 rounded-2xl bg-bg-surface border border-border space-y-4">
            <h2 className="font-heading text-xl font-bold">How the data works</h2>
            <div className="space-y-3 text-text-muted text-sm leading-relaxed">
              <p>Salary data is sourced from government labour statistics, industry salary surveys and verified job postings. All figures represent gross annual salary in local currency for mid-level professionals with 3-7 years of experience.</p>
              <p>Cost of living figures are based on aggregated data from public databases and verified periodically. Quality of life, safety and healthcare scores are derived from internationally recognised indices.</p>
              <p>Visa difficulty ratings reflect the general ease of obtaining a work visa for a skilled professional they are indicative, not legal advice. Always verify with official immigration sources before making any decisions.</p>
              <p className="text-xs text-text-muted/70">Data last verified: March 2025. We update regularly but encourage you to cross-reference with official sources for critical decisions.</p>
            </div>
          </div>

          <div className="text-center space-y-6">
            <h2 className="font-heading text-2xl font-bold">Ready to find where you belong?</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/wizard" className="cta-button px-8 py-4 rounded-2xl text-base font-medium inline-flex items-center gap-2">
                Take the quiz
              </a>
              <a href="/" className="px-8 py-4 rounded-2xl text-base border border-border hover:border-accent/30 text-text-muted hover:text-text-primary transition-colors">
                Explore the globe
              </a>
            </div>
          </div>

        </div>
      </main>

      <footer className="border-t border-border mt-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-accent" />
            <span className="font-heading text-sm font-bold">Origio</span>
          </div>
          <p className="text-xs text-text-muted">Built by Shlok Mestry</p>
        </div>
      </footer>
    </div>
  );
}
