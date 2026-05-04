/* eslint-disable react/no-unescaped-entities */
"use client";

import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0f0e8]">
      <Nav countries={[]} onCountrySelect={() => {}} />

      <main className="max-w-4xl mx-auto px-6 pt-24 pb-16">

        {/* ── HEADER — left-aligned, serif + sans mix ── */}
        <div className="mb-16 pb-8 border-b border-[#1a1a1a]">
          <p className="text-[10px] font-bold text-[#888880] uppercase tracking-[0.25em] mb-6">About</p>
          <h1 style={{ lineHeight: 1, marginBottom: 20 }}>
            <span style={{
              display: "block",
              fontFamily: "DM Serif Display, Georgia, serif",
              fontSize: "clamp(40px, 6vw, 64px)",
              fontWeight: 400,
              fontStyle: "italic",
              color: "#f0f0e8",
              lineHeight: 1.05,
            }}>
              A relocation tool
            </span>
            <span className="font-heading font-extrabold uppercase tracking-tight block"
              style={{ fontSize: "clamp(40px, 6vw, 64px)", lineHeight: 0.95, color: "#00ffd5" }}>
              built on real data.
            </span>
          </h1>
          <p className="text-[#666660] text-sm leading-relaxed max-w-lg">
            Salaries, visas, cost of living, and quality of life across 25 countries — in one place.
          </p>
        </div>

        {/* ── STORY — two column on desktop ── */}
        <section className="mb-16">
          <div className="grid md:grid-cols-[180px_1fr] gap-8 items-start">
            <div>
              <h2 className="font-heading text-[10px] font-extrabold text-[#888880] uppercase tracking-[0.2em] border-l-2 border-[#00ffd5] pl-3">
                The story
              </h2>
            </div>
            <div className="space-y-4 text-[#666660] text-sm leading-relaxed">
              <p>
                Origio was built by Shlok Mestry after spending weeks manually researching countries to move to — bouncing between Numbeo, Expatistan, government visa sites, and salary surveys — and realising there was no single place that had it all.
              </p>
              <p>
                The core is an interactive 3D globe. Click any country to instantly see how it stacks up across salary, cost of living, visa difficulty, safety, and quality of life. No tab-switching, no piecing things together.
              </p>
              <p>
                If you don't know where to start, the ranking quiz asks 8 questions about your role, passport, priorities, and budget — then scores all 25 countries and returns a ranked list specific to you.
              </p>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS — numbered, not cards ── */}
        <section className="mb-16">
          <div className="grid md:grid-cols-[180px_1fr] gap-8 items-start">
            <div>
              <h2 className="font-heading text-[10px] font-extrabold text-[#888880] uppercase tracking-[0.2em] border-l-2 border-[#00ffd5] pl-3">
                How it works
              </h2>
            </div>
            <div>
              {[
                { num: "01", title: "Explore the globe", desc: "Click any country pin to see salaries, costs, visa routes, and quality of life scores." },
                { num: "02", title: "Run the ranking", desc: "8 questions about your role, passport, and priorities. Get 25 countries ranked by fit." },
                { num: "03", title: "Go deeper", desc: "Compare countries side by side, check take-home pay, read role-specific relocation data." },
              ].map((item, i, arr) => (
                <div key={item.num} className={`grid grid-cols-[48px_1fr] gap-4 py-6 ${i < arr.length - 1 ? "border-b border-[#111]" : ""}`}>
                  <span className="font-heading text-2xl font-extrabold text-[#1a1a1a]">{item.num}</span>
                  <div>
                    <p className="font-heading text-[13px] font-extrabold uppercase tracking-tight text-[#f0f0e8] mb-1">{item.title}</p>
                    <p className="text-[#666660] text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DATA SOURCES ── */}
        <section className="mb-16">
          <div className="grid md:grid-cols-[180px_1fr] gap-8 items-start">
            <div>
              <h2 className="font-heading text-[10px] font-extrabold text-[#888880] uppercase tracking-[0.2em] border-l-2 border-[#00ffd5] pl-3">
                Data sources
              </h2>
            </div>
            <div className="space-y-4 text-[#666660] text-sm leading-relaxed">
              <p>
                All data is manually researched from primary sources. Salary figures come from national labour statistics, recruitment platform reports, and industry salary surveys. Cost of living draws from Numbeo, Expatistan, and government statistical offices.
              </p>
              <p>
                Data is reviewed regularly. Each country page shows the last verified date.
              </p>
              <div className="border-l-2 border-[#2a2a2a] pl-4 text-xs text-[#444] mt-4 font-mono">
                Origio is not financial or legal advice. Always verify with official sources before relocating.
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS — horizontal data strip ── */}
        <section className="mb-16 border-t border-b border-[#1a1a1a] py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#1a1a1a]">
            {[
              { num: "25", label: "Countries" },
              { num: "20", label: "Job roles" },
              { num: "8",  label: "Quiz questions" },
              { num: "6",  label: "Data dimensions" },
            ].map(item => (
              <div key={item.label} className="bg-[#0a0a0a] px-6 py-5 text-center">
                <p className="font-heading text-3xl font-extrabold text-[#00ffd5] font-mono">{item.num}</p>
                <p className="text-[10px] font-bold text-[#888880] uppercase tracking-widest mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA — asymmetric, left text ── */}
        <div className="border border-[#2a2a2a] p-8" style={{ boxShadow: "4px 4px 0 #00ffd5" }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h3 style={{
                fontFamily: "DM Serif Display, Georgia, serif",
                fontSize: "clamp(24px, 3vw, 32px)",
                fontWeight: 400,
                fontStyle: "italic",
                color: "#f0f0e8",
                marginBottom: 6,
              }}>
                Find your country.
              </h3>
              <p className="text-[#666660] text-sm">8 questions. 25 countries ranked. Free.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <Link href="/wizard" className="cta-button px-6 py-3 text-[11px] font-bold uppercase tracking-widest inline-flex items-center justify-center">
                Run the ranking
              </Link>
              <Link href="/" className="ghost-button px-6 py-3 text-[11px] font-bold uppercase tracking-widest inline-flex items-center justify-center">
                Explore the globe
              </Link>
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}