/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next'
import Link from 'next/link'
import { Globe2, ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service — Origio',
  description: 'Terms and conditions for using Origio.',
}

const LAST_UPDATED = '19 April 2026'

export default function TermsPage() {
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
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-text-primary mb-4">Terms of Service</h1>
          <p className="text-text-muted">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="space-y-10 text-text-muted leading-relaxed">

          <section>
            <h2 className="font-heading text-xl font-bold text-text-primary mb-3">1. Who these terms apply to</h2>
            <p>These Terms of Service govern your use of Origio (findorigio.com), operated by Shlok Mestry, Ireland. By using Origio you agree to these terms. If you disagree, do not use the service.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-text-primary mb-3">2. What Origio is</h2>
            <p>Origio is a relocation research tool that provides informational data on salaries, cost of living, visa routes, and quality of life across 25 countries. It is designed to help you research and explore options — it is not financial, legal, or immigration advice.</p>
            <p className="mt-3">We do our best to keep data accurate and up to date, but we make no guarantees about the completeness, accuracy, or timeliness of any information. Always verify critical information with official government sources before making any relocation decision.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-text-primary mb-3">3. Your account</h2>
            <p>You are responsible for keeping your account credentials secure. You must not share your account or allow others to use it. You must be at least 16 years old to create an account.</p>
            <p className="mt-3">We reserve the right to suspend or terminate accounts that violate these terms or misuse the service.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-text-primary mb-3">4. Pro subscription</h2>
            <p>Origio Pro is a one-time payment that grants lifetime access to Pro features. There is no recurring charge. The features included in Pro are described on the pricing page and may expand over time — we will not remove core features from Pro after purchase.</p>
            <p className="mt-3">Refunds are considered on a case-by-case basis. If you have a problem with your purchase, contact us at <a href="mailto:hello@findorigio.com" className="text-accent hover:underline">hello@findorigio.com</a>.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-text-primary mb-3">5. Acceptable use</h2>
            <p>You agree not to:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li>Scrape, copy, or reproduce Origio data for commercial purposes without permission</li>
              <li>Attempt to reverse engineer, hack, or disrupt the service</li>
              <li>Use automated tools to access the service at scale</li>
              <li>Create fake accounts or misrepresent your identity</li>
              <li>Use the service for any unlawful purpose</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-text-primary mb-3">6. Intellectual property</h2>
            <p>The Origio name, design, code, and content are owned by Shlok Mestry. The underlying data (salary figures, cost of living indices, visa information) is sourced from publicly available sources and does not constitute proprietary data.</p>
            <p className="mt-3">You may not reproduce, distribute, or create derivative works from Origio without written permission.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-text-primary mb-3">7. Disclaimer of warranties</h2>
            <p>Origio is provided &ldquo;as is&rdquo; without warranties of any kind. We do not guarantee that the service will be available at all times, error-free, or that the information is accurate or complete. Use of Origio is at your own risk.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-text-primary mb-3">8. Limitation of liability</h2>
            <p>To the maximum extent permitted by Irish and EU law, Origio and Shlok Mestry shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service or reliance on information provided. Our total liability for any claim shall not exceed the amount you paid us in the 12 months prior to the claim.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-text-primary mb-3">9. Governing law</h2>
            <p>These terms are governed by the laws of Ireland. Any disputes shall be subject to the exclusive jurisdiction of the Irish courts, without prejudice to your rights as an EU consumer.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-text-primary mb-3">10. Changes to these terms</h2>
            <p>We may update these terms from time to time. For material changes we will notify users by email. Continued use of Origio after changes constitutes acceptance of the updated terms.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-text-primary mb-3">11. Contact</h2>
            <p>Questions about these terms: <a href="mailto:hello@findorigio.com" className="text-accent hover:underline">hello@findorigio.com</a></p>
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
            <Link href="/terms" className="text-accent">Terms</Link>
            <Link href="/privacy" className="hover:text-text-primary transition-colors">Privacy</Link>
            <Link href="/contact" className="hover:text-text-primary transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}