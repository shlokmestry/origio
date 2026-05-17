/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next'
import Link from 'next/link'
import Footer from '@/components/Footer'
import Nav from '@/components/Nav'

export const metadata: Metadata = {
  title: 'Terms of Service — Origio',
  description: 'Terms and conditions for using Origio.',
}

const LAST_UPDATED = '19 April 2026'

const SECTIONS = [
  {
    n: '1',
    title: 'Who these terms apply to',
    body: 'These Terms of Service govern your use of Origio (findorigio.com), operated by Shlok Mestry, Ireland. By using Origio you agree to these terms. If you disagree, do not use the service.',
  },
  {
    n: '2',
    title: 'What Origio is',
    body: 'Origio is a relocation research tool that provides informational data on salaries, cost of living, visa routes, and quality of life across 25 countries. It is designed to help you research and explore options — it is not financial, legal, or immigration advice.\n\nWe do our best to keep data accurate and up to date, but we make no guarantees about the completeness, accuracy, or timeliness of any information. Always verify critical information with official government sources before making any relocation decision.',
  },
  {
    n: '3',
    title: 'Your account',
    body: 'You are responsible for keeping your account credentials secure. You must not share your account or allow others to use it. You must be at least 16 years old to create an account.\n\nWe reserve the right to suspend or terminate accounts that violate these terms or misuse the service.',
  },
  {
    n: '4',
    title: 'Pro subscription',
    body: 'Origio Pro is a one-time payment that grants lifetime access to Pro features. There is no recurring charge. The features included in Pro are described on the pricing page and may expand over time — we will not remove core features from Pro after purchase.\n\nRefunds are considered on a case-by-case basis. If you have a problem with your purchase, contact us at hello@findorigio.com.',
    hasEmail: true,
  },
  {
    n: '5',
    title: 'Acceptable use',
    body: 'You agree not to:',
    list: [
      'Scrape, copy, or reproduce Origio data for commercial purposes without permission',
      'Attempt to reverse engineer, hack, or disrupt the service',
      'Use automated tools to access the service at scale',
      'Create fake accounts or misrepresent your identity',
      'Use the service for any unlawful purpose',
    ],
  },
  {
    n: '6',
    title: 'Intellectual property',
    body: 'The Origio name, design, code, and content are owned by Shlok Mestry. The underlying data (salary figures, cost of living indices, visa information) is sourced from publicly available sources and does not constitute proprietary data.\n\nYou may not reproduce, distribute, or create derivative works from Origio without written permission.',
  },
  {
    n: '7',
    title: 'Disclaimer of warranties',
    body: 'Origio is provided "as is" without warranties of any kind. We do not guarantee that the service will be available at all times, error-free, or that the information is accurate or complete. Use of Origio is at your own risk.',
  },
  {
    n: '8',
    title: 'Limitation of liability',
    body: 'To the maximum extent permitted by Irish and EU law, Origio and Shlok Mestry shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service or reliance on information provided. Our total liability for any claim shall not exceed the amount you paid us in the 12 months prior to the claim.',
  },
  {
    n: '9',
    title: 'Governing law',
    body: 'These terms are governed by the laws of Ireland. Any disputes shall be subject to the exclusive jurisdiction of the Irish courts, without prejudice to your rights as an EU consumer.',
  },
  {
    n: '10',
    title: 'Changes to these terms',
    body: 'We may update these terms from time to time. For material changes we will notify users by email. Continued use of Origio after changes constitutes acceptance of the updated terms.',
  },
  {
    n: '11',
    title: 'Contact',
    body: 'Questions about these terms: hello@findorigio.com',
    hasEmail: true,
    emailOnly: true,
  },
]

const S = {
  bg: '#0a0a0a',
  card: '#111',
  border: '#2a2a2a',
  borderSub: '#1a1a1a',
  dim: 'rgba(240,240,232,0.45)',
  dimmer: 'rgba(240,240,232,0.28)',
  accent: '#00ffd5',
  text: '#f0f0e8',
  serif: "var(--font-heading, 'DM Serif Display', Georgia, serif)",
  sans: "'Inter', sans-serif",
}

export default function TermsPage() {
  return (
    <main style={{ minHeight: '100vh', background: S.bg, color: S.text, fontFamily: S.sans }}>
      <Nav countries={[]} onCountrySelect={() => {}} />

      <div style={{ maxWidth: 720, margin: '0 auto', padding: 'clamp(100px,10vw,120px) clamp(20px,4vw,40px) 80px' }}>

        {/* ── HEADER ── */}
        <div style={{ marginBottom: 64, paddingBottom: 48, borderBottom: `1px solid ${S.border}` }}>
          <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: S.dim, marginBottom: 16 }}>
            Legal
          </p>
          <h1 style={{ fontFamily: S.serif, fontSize: 'clamp(44px,6vw,68px)', fontWeight: 400, color: S.text, lineHeight: 1, margin: '0 0 14px' }}>
            Terms of Service
          </h1>
          <p style={{ fontSize: 12, color: S.dimmer, fontWeight: 600, letterSpacing: '0.04em' }}>Last updated: {LAST_UPDATED}</p>
        </div>

        {/* ── SECTIONS ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
          {SECTIONS.map((sec) => (
            <section key={sec.n}>
              {/* Section heading */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: S.accent, flexShrink: 0 }}>
                  {sec.n}.
                </span>
                <h2 style={{ fontFamily: S.serif, fontSize: 'clamp(20px,2.8vw,26px)', fontWeight: 400, color: S.text, margin: 0 }}>
                  {sec.title}
                </h2>
              </div>

              {/* Body text — split on \n\n for paragraphs */}
              {sec.body && sec.body.split('\n\n').map((para, i) => {
                // Replace email inline
                if (sec.hasEmail && para.includes('hello@findorigio.com')) {
                  const parts = para.split('hello@findorigio.com')
                  return (
                    <p key={i} style={{ fontSize: 15, color: S.dim, lineHeight: 1.8, margin: '0 0 12px' }}>
                      {parts[0]}
                      <a href="mailto:hello@findorigio.com" style={{ color: S.text, textDecoration: 'underline', textUnderlineOffset: 3 }}>
                        hello@findorigio.com
                      </a>
                      {parts[1]}
                    </p>
                  )
                }
                return (
                  <p key={i} style={{ fontSize: 15, color: S.dim, lineHeight: 1.8, margin: '0 0 12px' }}>
                    {para}
                  </p>
                )
              })}

              {/* List items */}
              {sec.list && (
                <div style={{ border: `1px solid ${S.border}`, overflow: 'hidden', marginTop: 12, boxShadow: '3px 3px 0 #1a1a1a' }}>
                  {sec.list.map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: 14, padding: '13px 20px', alignItems: 'flex-start',
                      background: S.card,
                      borderBottom: i < sec.list!.length - 1 ? `1px solid ${S.borderSub}` : 'none',
                    }}>
                      <span style={{ width: 4, height: 4, background: S.accent, flexShrink: 0, marginTop: 9 }} />
                      <p style={{ fontSize: 14, color: S.dim, lineHeight: 1.7, margin: 0 }}>{item}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}

          {/* Footer nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, paddingTop: 32, borderTop: `1px solid ${S.border}` }}>
            <span style={{ fontSize: 11, color: S.dimmer, fontWeight: 500 }}>Also useful:</span>
            <Link href="/privacy" style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: S.dim, textDecoration: 'none' }}>Privacy Policy</Link>
            <Link href="/contact" style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: S.dim, textDecoration: 'none' }}>Contact</Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}