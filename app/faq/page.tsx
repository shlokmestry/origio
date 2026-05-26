/* eslint-disable react/no-unescaped-entities */
"use client";
import Footer from "@/components/Footer";
import { useState } from "react";
import Nav from "@/components/Nav";

const faqs = [
  {
    category: "About Origio",
    items: [
      { q: "What is Origio?", a: "Origio is a relocation research tool that helps you compare salaries, cost of living, visa requirements, and quality of life across 25 countries — all in one place." },
      { q: "Who built Origio?", a: "Origio was built by Shlok Mestry, after spending weeks manually researching countries to move to and realising there was no single place that had everything." },
      { q: "Which countries are covered?", a: "Australia, Austria, Belgium, Brazil, Canada, Denmark, Finland, France, Germany, India, Ireland, Italy, Japan, Malaysia, Netherlands, New Zealand, Norway, Portugal, Singapore, Spain, Sweden, Switzerland, UAE, United Kingdom, and USA." },
    ],
  },
  {
    category: "Data & Accuracy",
    items: [
      { q: "Where does the salary data come from?", a: "Salary figures are aggregated from publicly available sources including Glassdoor, LinkedIn Salary, and government labour statistics. Data was last verified in March 2025." },
      { q: "How accurate is the cost of living data?", a: "Cost of living figures are estimates based on publicly available indices and reports. They reflect average urban costs and may vary significantly by city or lifestyle." },
      { q: "How often is the data updated?", a: "We aim to review and update data every 6–12 months. Each country page shows a last verified date so you know how fresh the data is." },
      { q: "Should I make a life decision based solely on Origio?", a: "Origio is a research starting point, not financial or legal advice. We strongly recommend verifying figures with official government sources and consulting professionals before relocating." },
    ],
  },
  {
    category: "Find My Country",
    items: [
      { q: "How does Find My Country work?", a: "Find My Country asks 8 questions about your priorities, job role, budget, and preferences. Each country is scored across multiple dimensions — salary, cost of living, safety, visa ease, and more — weighted by your answers." },
      { q: "What does the job offer flow do?", a: "If you already have a job offer, Find My Country skips the priorities, city vibe, and rent budget steps since those are less relevant when you have a fixed destination in mind." },
      { q: "Why do free users only see the top 3 results?", a: "The top 3 matches are free forever. Signed-in users can see their full top 10. Upgrade to Pro for unlimited runs and deeper country reports." },
    ],
  },
  {
    category: "Account & Pro",
    items: [
      { q: "Do I need an account to use Origio?", a: "No. The globe, country pages, compare tool, and Find My Country top 3 results are all free without an account." },
      { q: "What does the Pro plan include?", a: "Pro includes unlimited Find My Country runs, full country deep-dives, side-by-side country comparison, saved country matches, visa route details, and priority updates. One-time payment of €4.99 — no subscription, ever." },
      { q: "Is this really a one-time payment?", a: "Yes. Pay €4.99 once and access Pro forever. No subscription, no hidden fees, no recurring charges." },
      { q: "What payment methods are accepted?", a: "All major credit and debit cards via Stripe. Safe and secure." },
      { q: "Can I get a refund?", a: "If you have an issue, contact us and we'll sort it out." },
    ],
  },
];

const S = {
  bg: '#050508',
  card: '#0c0c0f',
  border: 'rgba(255,255,255,0.07)',
  borderMd: 'rgba(255,255,255,0.12)',
  dim: 'rgba(255,255,255,0.38)',
  dimmer: 'rgba(255,255,255,0.2)',
  serif: "'Cabinet Grotesk', sans-serif",
  sans: "'Inter', sans-serif",
};

export default function FAQPage() {
  const [open, setOpen] = useState<string | null>(null);
  const toggle = (key: string) => setOpen(open === key ? null : key);

  return (
    <div style={{ minHeight: '100vh', background: S.bg, color: '#fff', fontFamily: S.sans }}>
      <Nav countries={[]} onCountrySelect={() => {}} />

      <main style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(100px,10vw,120px) clamp(20px,4vw,40px) 80px' }}>

        {/* ── HEADER ── */}
        <div style={{ marginBottom: 64 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: S.dim, marginBottom: 16 }}>
            Help
          </p>
          <h1 style={{ fontFamily: S.serif, fontSize: 'clamp(36px,6vw,64px)', fontWeight: 400, color: '#fff', lineHeight: 1, margin: '0 0 20px' }}>
            Frequently asked questions
          </h1>
          <p style={{ fontSize: 15, color: S.dim, lineHeight: 1.6, maxWidth: 480 }}>
            Everything you need to know about Origio, the data, and how Find My Country works.
          </p>
        </div>

        {/* ── FAQ SECTIONS ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          {faqs.map((section) => (
            <div key={section.category}>
              {/* Section label */}
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: S.dimmer, marginBottom: 12 }}>
                {section.category}
              </p>

              {/* Items card */}
              <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 14, overflow: 'hidden' }}>
                {section.items.map((item, i) => {
                  const key = section.category + item.q;
                  const isOpen = open === key;
                  return (
                    <div key={key} style={{ borderBottom: i < section.items.length - 1 ? `1px solid rgba(255,255,255,0.05)` : 'none' }}>
                      {/* Question row */}
                      <button
                        onClick={() => toggle(key)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 16,
                          padding: '20px 24px',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.025)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                      >
                        <span style={{ fontSize: 15, fontWeight: 600, color: '#fff', lineHeight: 1.4, flex: 1 }}>
                          {item.q}
                        </span>
                        {/* +/− toggle */}
                        <span style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: isOpen ? '#fff' : 'rgba(255,255,255,0.06)',
                          border: `1px solid ${isOpen ? '#fff' : S.borderMd}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, fontSize: 16, fontWeight: 400,
                          color: isOpen ? '#0a0a0a' : 'rgba(255,255,255,0.5)',
                          transition: 'background 0.15s, color 0.15s',
                          lineHeight: 1,
                        }}>
                          {isOpen ? '−' : '+'}
                        </span>
                      </button>

                      {/* Answer */}
                      {isOpen && (
                        <div style={{
                          padding: '0 24px 20px',
                          fontSize: 14,
                          color: S.dim,
                          lineHeight: 1.7,
                          borderTop: `1px solid rgba(255,255,255,0.04)`,
                          paddingTop: 16,
                        }}>
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ── CONTACT CTA ── */}
        <div style={{ marginTop: 72, background: S.card, border: `1px solid ${S.borderMd}`, borderRadius: 20, padding: 'clamp(32px,5vw,48px)', textAlign: 'center' }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: S.dim, marginBottom: 16 }}>
            Still have questions?
          </p>
          <h3 style={{ fontFamily: S.serif, fontSize: 'clamp(22px,3vw,32px)', fontWeight: 400, color: '#fff', lineHeight: 1.1, margin: '0 0 12px' }}>
            We'll get back to you.
          </h3>
          <p style={{ fontSize: 14, color: S.dim, marginBottom: 28, lineHeight: 1.6 }}>
            Email us and we'll respond within a day.
          </p>
          <a
            href="mailto:notshlokmestry@gmail.com"
            style={{
              display: 'inline-flex', alignItems: 'center',
              background: '#fff', color: '#0a0a0a',
              border: 'none', borderRadius: 100,
              padding: '13px 32px',
              fontSize: 14, fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 2px 20px rgba(255,255,255,0.12)',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#ececec'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#fff'}
          >
            Contact us
          </a>
        </div>

      </main>

      <Footer />
    </div>
  );
}