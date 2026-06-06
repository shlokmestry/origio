/* eslint-disable react/no-unescaped-entities */
'use client'
import Link from 'next/link'
import Footer from '@/components/Footer'
import Nav from '@/components/Nav'

const LAST_UPDATED = '19 April 2026'

const S = {
  bg: '#0a0a0a',
  card: '#111',
  border: '#2a2a2a',
  borderSub: '#1a1a1a',
  dim: 'rgba(240,240,232,0.45)',
  dimmer: 'rgba(240,240,232,0.28)',
  accent: '#00ffd5',
  text: '#f0f0e8',
  serif: "var(--font-heading, 'Cabinet Grotesk', sans-serif)",
  sans: "'Satoshi', sans-serif",
}

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p style={{ fontSize: 12, color: S.dimmer, fontWeight: 600, letterSpacing: '0.04em' }}>Last updated: {LAST_UPDATED}</p>
        </div>

        {/* ── CONTENT ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>

          {/* Who we are */}
          <section>
            <h2 style={{ fontFamily: S.serif, fontSize: 'clamp(22px,3vw,28px)', fontWeight: 400, color: S.text, margin: '0 0 16px' }}>Who we are</h2>
            <p style={{ fontSize: 15, color: S.dim, lineHeight: 1.8, margin: '0 0 12px' }}>
              Origio is a relocation research tool operated by Shlok Mestry, based in Ireland. We help people compare salaries, visas, cost of living and quality of life across 45 countries.
            </p>
            <p style={{ fontSize: 15, color: S.dim, lineHeight: 1.8, margin: 0 }}>
              Contact:{' '}
              <a href="mailto:hello@findorigio.com" style={{ color: S.text, textDecoration: 'underline', textUnderlineOffset: 3 }}>
                hello@findorigio.com
              </a>
            </p>
          </section>

          {/* What data we collect */}
          <section>
            <h2 style={{ fontFamily: S.serif, fontSize: 'clamp(22px,3vw,28px)', fontWeight: 400, color: S.text, margin: '0 0 20px' }}>What data we collect</h2>
            <div style={{ border: `1px solid ${S.border}`, overflow: 'hidden', boxShadow: '3px 3px 0 #1a1a1a' }}>
              {[
                { title: 'Account data', body: 'When you create an account: your email address, name (optional), and password (hashed — we never see the plaintext). If you sign in with Google, we receive your name and email from Google.' },
                { title: 'Profile data', body: 'Information you choose to provide: passport country, job title. This is used to personalise your country recommendations.' },
                { title: 'Usage data', body: 'Quiz answers and results (stored to show your history), saved countries, and pages you visit. We use Google Analytics (GA4) to understand how the site is used — this data is anonymised and aggregated.' },
                { title: 'Payment data', body: 'If you upgrade to Pro, payments are processed by Stripe. We receive confirmation that payment was made but never see your card details. Stripe stores payment data under their own privacy policy.' },
              ].map(({ title, body }, i, arr) => (
                <div key={title} style={{
                  background: S.card,
                  padding: '18px 20px',
                  borderBottom: i < arr.length - 1 ? `1px solid ${S.borderSub}` : 'none',
                }}>
                  <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: S.text, marginBottom: 8 }}>{title}</p>
                  <p style={{ fontSize: 14, color: S.dim, lineHeight: 1.75, margin: 0 }}>{body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Why we collect it */}
          <section>
            <h2 style={{ fontFamily: S.serif, fontSize: 'clamp(22px,3vw,28px)', fontWeight: 400, color: S.text, margin: '0 0 20px' }}>Why we collect it</h2>
            <div style={{ border: `1px solid ${S.border}`, overflow: 'hidden', boxShadow: '3px 3px 0 #1a1a1a' }}>
              {[
                ['Provide the service', 'To show you personalised country rankings, save your results, and maintain your account.'],
                ['Process payments', 'To verify Pro upgrades and prevent fraud.'],
                ['Improve the product', 'Aggregated analytics help us understand which features are useful and where users get stuck.'],
                ['Communicate with you', 'To send transactional emails (account confirmation, payment receipt). We do not send marketing emails without your explicit consent.'],
              ].map(([title, desc], i, arr) => (
                <div key={title} style={{
                  display: 'flex', gap: 20, padding: '16px 20px', alignItems: 'flex-start',
                  background: S.card,
                  borderBottom: i < arr.length - 1 ? `1px solid ${S.borderSub}` : 'none',
                }}>
                  <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: S.accent, paddingTop: 3, flexShrink: 0, width: 130 }}>{title}</span>
                  <p style={{ fontSize: 14, color: S.dim, lineHeight: 1.7, margin: 0 }}>{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Legal basis */}
          <section>
            <h2 style={{ fontFamily: S.serif, fontSize: 'clamp(22px,3vw,28px)', fontWeight: 400, color: S.text, margin: '0 0 16px' }}>Legal basis (GDPR)</h2>
            <p style={{ fontSize: 15, color: S.dim, lineHeight: 1.8, marginBottom: 16 }}>We process your data under the following legal bases:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['Contract', 'Processing necessary to provide the service you signed up for.'],
                ['Legitimate interests', 'Analytics to improve the product.'],
                ['Legal obligation', 'Keeping records for tax and legal compliance.'],
              ].map(([term, desc]) => (
                <div key={term} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ width: 4, height: 4, background: S.accent, flexShrink: 0, marginTop: 9 }} />
                  <p style={{ fontSize: 14, color: S.dim, lineHeight: 1.7, margin: 0 }}>
                    <span style={{ color: S.text, fontWeight: 700 }}>{term}</span> — {desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Who we share with */}
          <section>
            <h2 style={{ fontFamily: S.serif, fontSize: 'clamp(22px,3vw,28px)', fontWeight: 400, color: S.text, margin: '0 0 20px' }}>Who we share data with</h2>
            <div style={{ border: `1px solid ${S.border}`, overflow: 'hidden', marginBottom: 16, boxShadow: '3px 3px 0 #1a1a1a' }}>
              {[
                ['Supabase', 'Database and authentication provider. Data stored in EU region.'],
                ['Stripe', 'Payment processing. PCI-DSS compliant.'],
                ['Google Analytics', 'Anonymised usage analytics.'],
                ['Resend', 'Transactional email delivery.'],
                ['Vercel', 'Hosting and infrastructure.'],
              ].map(([name, desc], i, arr) => (
                <div key={name} style={{
                  display: 'flex', gap: 20, padding: '14px 20px', alignItems: 'flex-start',
                  background: S.card,
                  borderBottom: i < arr.length - 1 ? `1px solid ${S.borderSub}` : 'none',
                }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: S.text, flexShrink: 0, width: 130 }}>{name}</span>
                  <p style={{ fontSize: 14, color: S.dim, lineHeight: 1.65, margin: 0 }}>{desc}</p>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 14, color: S.dim, lineHeight: 1.8, margin: 0 }}>
              We do not sell your data to third parties. <strong style={{ color: S.text }}>Ever.</strong>
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 style={{ fontFamily: S.serif, fontSize: 'clamp(22px,3vw,28px)', fontWeight: 400, color: S.text, margin: '0 0 16px' }}>Cookies</h2>
            <p style={{ fontSize: 15, color: S.dim, lineHeight: 1.8, margin: 0 }}>
              We use one cookie: your authentication session, set by Supabase. This is strictly necessary for the site to function and does not require consent under GDPR. We do not use advertising or tracking cookies.
            </p>
          </section>

          {/* Retention */}
          <section>
            <h2 style={{ fontFamily: S.serif, fontSize: 'clamp(22px,3vw,28px)', fontWeight: 400, color: S.text, margin: '0 0 16px' }}>How long we keep your data</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                'Account data — until you delete your account',
                'Quiz results and saved countries — until you delete your account',
                'Payment records — 7 years (legal requirement)',
                'Analytics data — 26 months (Google Analytics default)',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ width: 4, height: 4, background: S.dimmer, flexShrink: 0, marginTop: 9 }} />
                  <p style={{ fontSize: 14, color: S.dim, lineHeight: 1.7, margin: 0 }}>{item}</p>
                </div>
              ))}
            </div>
          </section>

          {/* GDPR rights */}
          <section>
            <h2 style={{ fontFamily: S.serif, fontSize: 'clamp(22px,3vw,28px)', fontWeight: 400, color: S.text, margin: '0 0 16px' }}>Your rights under GDPR</h2>
            <p style={{ fontSize: 15, color: S.dim, lineHeight: 1.8, marginBottom: 16 }}>As an EU resident you have the right to:</p>
            <div style={{ border: `1px solid ${S.border}`, overflow: 'hidden', marginBottom: 20, boxShadow: '3px 3px 0 #1a1a1a' }}>
              {[
                ['Access', 'Request a copy of your data.'],
                ['Rectification', 'Correct inaccurate data.'],
                ['Erasure', 'Delete your account and all associated data.'],
                ['Portability', 'Receive your data in a machine-readable format.'],
                ['Objection', 'Object to processing based on legitimate interests.'],
              ].map(([term, desc], i, arr) => (
                <div key={term} style={{
                  display: 'flex', gap: 20, padding: '13px 20px', alignItems: 'flex-start',
                  background: S.card,
                  borderBottom: i < arr.length - 1 ? `1px solid ${S.borderSub}` : 'none',
                }}>
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: S.accent, flexShrink: 0, width: 100, paddingTop: 2 }}>{term}</span>
                  <p style={{ fontSize: 14, color: S.dim, lineHeight: 1.65, margin: 0 }}>{desc}</p>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 15, color: S.dim, lineHeight: 1.8, margin: '0 0 12px' }}>
              To exercise any of these rights, email{' '}
              <a href="mailto:hello@findorigio.com" style={{ color: S.text, textDecoration: 'underline', textUnderlineOffset: 3 }}>hello@findorigio.com</a>.
              You can also delete your account directly from your profile settings.
            </p>
            <p style={{ fontSize: 15, color: S.dim, lineHeight: 1.8, margin: 0 }}>
              You have the right to lodge a complaint with the Data Protection Commission (Ireland) at{' '}
              <a href="https://www.dataprotection.ie" target="_blank" rel="noopener noreferrer" style={{ color: S.text, textDecoration: 'underline', textUnderlineOffset: 3 }}>dataprotection.ie</a>.
            </p>
          </section>

          {/* Security */}
          <section>
            <h2 style={{ fontFamily: S.serif, fontSize: 'clamp(22px,3vw,28px)', fontWeight: 400, color: S.text, margin: '0 0 16px' }}>Security</h2>
            <p style={{ fontSize: 15, color: S.dim, lineHeight: 1.8, margin: 0 }}>
              We use industry-standard security practices: HTTPS everywhere, hashed passwords, JWT-based authentication, and strict Content Security Policy headers. No system is perfectly secure — if you discover a vulnerability please email us responsibly.
            </p>
          </section>

          {/* Changes */}
          <section>
            <h2 style={{ fontFamily: S.serif, fontSize: 'clamp(22px,3vw,28px)', fontWeight: 400, color: S.text, margin: '0 0 16px' }}>Changes to this policy</h2>
            <p style={{ fontSize: 15, color: S.dim, lineHeight: 1.8, margin: 0 }}>
              We will update this page if our data practices change and notify users by email for material changes. The date at the top of this page always reflects the last update.
            </p>
          </section>

          {/* Contact */}
          <section style={{ paddingBottom: 8 }}>
            <h2 style={{ fontFamily: S.serif, fontSize: 'clamp(22px,3vw,28px)', fontWeight: 400, color: S.text, margin: '0 0 16px' }}>Contact</h2>
            <p style={{ fontSize: 15, color: S.dim, lineHeight: 1.8, margin: 0 }}>
              Questions about this policy:{' '}
              <a href="mailto:hello@findorigio.com" style={{ color: S.text, textDecoration: 'underline', textUnderlineOffset: 3 }}>hello@findorigio.com</a>
            </p>
          </section>

          {/* Footer nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, paddingTop: 32, borderTop: `1px solid ${S.border}` }}>
            <span style={{ fontSize: 11, color: S.dimmer, fontWeight: 500 }}>Also useful:</span>
            <Link href="/terms" style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: S.dim, textDecoration: 'none' }}>Terms</Link>
            <Link href="/contact" style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: S.dim, textDecoration: 'none' }}>Contact</Link>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  )
}