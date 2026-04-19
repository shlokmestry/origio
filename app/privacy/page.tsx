/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next'
import Link from 'next/link'
import { Globe2, ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy — Origio',
  description: 'How Origio collects, uses, and protects your personal data.',
}

const LAST_UPDATED = '19 April 2026'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-bg-primary">
      <nav className="sticky top-0 z-50 glass-panel border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Globe2 className="w-5 h-5 text-accent" />
            <span className="font-heading text-lg font-extrabold text-text-primary">Origio</span>
          </Link>
          <Link href="/" className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Globe
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <div className="mb-12">
          <p className="text-sm text-accent font-semibold uppercase tracking-wider mb-3">Legal</p>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-text-primary mb-4">Privacy Policy</h1>
          <p className="text-text-muted">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-10 text-text-muted leading-relaxed">

          <section>
            <h2 className="font-heading text-xl font-bold text-text-primary mb-3">Who we are</h2>
            <p>Origio is a relocation research tool operated by Shlok Mestry, based in Ireland. We help people compare salaries, visas, cost of living and quality of life across 25 countries.</p>
            <p className="mt-3">Contact: <a href="mailto:helloorigio@protonmail.com" className="text-accent hover:underline">helloorigio@protonmail.com</a></p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-text-primary mb-3">What data we collect</h2>
            <div className="space-y-4">
              <div className="glass-panel rounded-xl p-5 border border-border">
                <p className="font-semibold text-text-primary mb-2">Account data</p>
                <p>When you create an account: your email address, name (optional), and password (hashed — we never see the plaintext). If you sign in with Google, we receive your name and email from Google.</p>
              </div>
              <div className="glass-panel rounded-xl p-5 border border-border">
                <p className="font-semibold text-text-primary mb-2">Profile data</p>
                <p>Information you choose to provide: passport country, job title. This is used to personalise your country recommendations.</p>
              </div>
              <div className="glass-panel rounded-xl p-5 border border-border">
                <p className="font-semibold text-text-primary mb-2">Usage data</p>
                <p>Quiz answers and results (stored to show your history), saved countries, and pages you visit. We use Google Analytics (GA4) to understand how the site is used — this data is anonymised and aggregated.</p>
              </div>
              <div className="glass-panel rounded-xl p-5 border border-border">
                <p className="font-semibold text-text-primary mb-2">Payment data</p>
                <p>If you upgrade to Pro, payments are processed by Stripe. We receive confirmation that payment was made but never see your card details. Stripe stores payment data under their own privacy policy.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-text-primary mb-3">Why we collect it</h2>
            <div className="space-y-2">
              {[
                ['Provide the service', 'To show you personalised country rankings, save your results, and maintain your account.'],
                ['Process payments', 'To verify Pro upgrades and prevent fraud.'],
                ['Improve the product', 'Aggregated analytics help us understand which features are useful and where users get stuck.'],
                ['Communicate with you', 'To send transactional emails (account confirmation, payment receipt). We do not send marketing emails without your explicit consent.'],
              ].map(([title, desc]) => (
                <div key={title} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                  <span className="text-xs font-bold text-accent uppercase tracking-wider pt-0.5 w-36 flex-shrink-0">{title}</span>
                  <p className="text-sm">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-text-primary mb-3">Legal basis (GDPR)</h2>
            <p>We process your data under the following legal bases:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li><strong className="text-text-primary">Contract</strong> — processing necessary to provide the service you signed up for</li>
              <li><strong className="text-text-primary">Legitimate interests</strong> — analytics to improve the product</li>
              <li><strong className="text-text-primary">Legal obligation</strong> — keeping records for tax and legal compliance</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-text-primary mb-3">Who we share data with</h2>
            <div className="space-y-2">
              {[
                ['Supabase', 'Our database and authentication provider. Data stored in EU region.'],
                ['Stripe', 'Payment processing. PCI-DSS compliant.'],
                ['Google Analytics', 'Anonymised usage analytics.'],
                ['Resend', 'Transactional email delivery.'],
                ['Vercel', 'Hosting and infrastructure.'],
              ].map(([name, desc]) => (
                <div key={name} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                  <span className="text-sm font-semibold text-text-primary w-32 flex-shrink-0">{name}</span>
                  <p className="text-sm">{desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-4">We do not sell your data to third parties. Ever.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-text-primary mb-3">Cookies</h2>
            <p>We use one cookie: your authentication session, set by Supabase. This is strictly necessary for the site to function and does not require consent under GDPR. We do not use advertising or tracking cookies.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-text-primary mb-3">How long we keep your data</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>Account data — until you delete your account</li>
              <li>Quiz results and saved countries — until you delete your account</li>
              <li>Payment records — 7 years (legal requirement)</li>
              <li>Analytics data — 26 months (Google Analytics default)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-text-primary mb-3">Your rights under GDPR</h2>
            <p>As an EU resident you have the right to:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li><strong className="text-text-primary">Access</strong> — request a copy of your data</li>
              <li><strong className="text-text-primary">Rectification</strong> — correct inaccurate data</li>
              <li><strong className="text-text-primary">Erasure</strong> — delete your account and all associated data</li>
              <li><strong className="text-text-primary">Portability</strong> — receive your data in a machine-readable format</li>
              <li><strong className="text-text-primary">Objection</strong> — object to processing based on legitimate interests</li>
            </ul>
            <p className="mt-4">To exercise any of these rights, email <a href="mailto:helloorigio@protonmail.com" className="text-accent hover:underline">helloorigio@protonmail.com</a>. You can also delete your account directly from your profile settings — this immediately removes all your personal data.</p>
            <p className="mt-3">You have the right to lodge a complaint with the Data Protection Commission (Ireland) at <a href="https://www.dataprotection.ie" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">dataprotection.ie</a>.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-text-primary mb-3">Security</h2>
            <p>We use industry-standard security practices: HTTPS everywhere, hashed passwords, JWT-based authentication, and strict Content Security Policy headers. No system is perfectly secure — if you discover a vulnerability please email us responsibly.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-text-primary mb-3">Changes to this policy</h2>
            <p>We will update this page if our data practices change and notify users by email for material changes. The date at the top of this page always reflects the last update.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-text-primary mb-3">Contact</h2>
            <p>Questions about this policy: <a href="mailto:helloorigio@protonmail.com" className="text-accent hover:underline">helloorigio@protonmail.com</a></p>
          </section>

        </div>
      </div>

      <footer className="border-t border-border mt-4">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-accent" />
            <span className="font-heading text-sm font-bold text-text-primary">Origio</span>
            <span className="text-text-muted text-xs ml-2">© 2026</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-text-muted">
            <Link href="/terms" className="hover:text-text-primary transition-colors">Terms</Link>
            <Link href="/privacy" className="text-accent">Privacy</Link>
            <Link href="/contact" className="hover:text-text-primary transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}