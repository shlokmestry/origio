import type { Metadata } from 'next'
import Link from 'next/link'
import { Globe2, ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About — Origio',
  description: 'Origio helps people find the best country to live and work in based on salary, visa routes, cost of living, and quality of life.',
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-bg-primary">
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass-panel border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
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

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">

        {/* Header */}
        <div className="mb-14">
          <p className="text-sm text-accent font-semibold uppercase tracking-wider mb-3">About Origio</p>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-text-primary mb-4">
            Find where you belong
          </h1>
          <p className="text-text-muted text-lg leading-relaxed">
            Origio helps people figure out which country is actually right for them — based on real data, not gut feeling.
          </p>
        </div>

        {/* What is Origio */}
        <section className="mb-12">
          <h2 className="font-heading text-2xl font-bold text-text-primary mb-4">What is Origio?</h2>
          <div className="space-y-4 text-text-muted leading-relaxed">
            <p>
              Origio is a relocation research tool. It covers 25 countries across Europe, Asia, and beyond — with real salary data for 20 job roles, cost of living breakdowns, visa difficulty ratings, safety scores, healthcare quality, tax rates, and more.
            </p>
            <p>
              The core feature is the interactive 3D globe — click any country to instantly see how it stacks up across every dimension that matters. No more bouncing between Numbeo, Expatistan, and government visa websites trying to piece together a picture.
            </p>
            <p>
              If you are not sure where to start, the Find My Country quiz asks you 8 questions about your priorities, job, passport, and budget — then scores all 25 countries and gives you a personalised ranked list.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="mb-12">
          <h2 className="font-heading text-2xl font-bold text-text-primary mb-6">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { step: '01', title: 'Explore the Globe', desc: 'Click any country pin to see salaries, costs, visa routes, and quality of life scores instantly.' },
              { step: '02', title: 'Find My Country', desc: 'Answer 8 questions about your role, passport, and priorities to get a personalised country ranking.' },
              { step: '03', title: 'Go deeper', desc: 'Compare countries side by side, check your take-home pay, and read role-specific relocation guides.' },
            ].map(item => (
              <div key={item.step} className="glass-panel rounded-2xl p-5 border border-border">
                <p className="font-heading text-3xl font-extrabold text-accent/30 mb-3">{item.step}</p>
                <p className="font-heading font-bold text-text-primary text-sm mb-2">{item.title}</p>
                <p className="text-text-muted text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Data sources */}
        <section className="mb-12">
          <h2 className="font-heading text-2xl font-bold text-text-primary mb-4">Where does the data come from?</h2>
          <div className="space-y-4 text-text-muted leading-relaxed">
            <p>
              All data is manually researched and verified from primary sources. Salary figures come from national labour statistics, recruitment platform reports, and industry salary surveys. Cost of living data draws from Numbeo, Expatistan, and government statistical offices. Visa difficulty ratings reflect real processing complexity, required documentation, and approval rates based on official government immigration guidance.
            </p>
            <p>
              Data is reviewed and updated regularly. Each country page shows the last verified date so you always know how recent the information is.
            </p>
            <p className="text-xs text-text-muted border-l-2 border-accent/30 pl-4">
              All salary figures are in local currency unless otherwise stated. Move scores are calculated from a weighted combination of salary potential, affordability, quality of life, safety, visa accessibility, and tax efficiency.
            </p>
          </div>
        </section>

        {/* Who built this */}
        <section className="mb-12">
          <h2 className="font-heading text-2xl font-bold text-text-primary mb-4">Who built this?</h2>
          <div className="glass-panel rounded-2xl p-6 border border-border flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-xl flex-shrink-0">
              👋
            </div>
            <div className="space-y-2 text-text-muted text-sm leading-relaxed">
              <p>
                Hi, I am Shlok — a solo developer who built Origio because I kept running into the same problem: wanting to move abroad but having no single place to compare countries properly.
              </p>
              <p>
                Every relocation decision involves dozens of variables — salary, tax, visa difficulty, cost of living, healthcare, safety, language. I wanted a tool that pulled all of that together in one place and made it easy to explore. So I built it.
              </p>
              <p>
                Origio is a solo project. If you find a data error, have a suggestion, or just want to say hello —{' '}
                <Link href="/contact" className="text-accent hover:underline">get in touch</Link>.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="glass-panel rounded-2xl p-8 border border-accent/20 text-center">
          <h3 className="font-heading text-xl font-bold text-text-primary mb-2">Ready to find your country?</h3>
          <p className="text-text-muted text-sm mb-6 max-w-sm mx-auto">
            Start with the globe or answer 8 questions to get your personalised ranking.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/wizard" className="cta-button px-6 py-3 rounded-xl text-sm inline-flex items-center justify-center gap-2">
              Find My Country
            </Link>
            <Link href="/" className="px-6 py-3 rounded-xl text-sm border border-border text-text-muted hover:text-text-primary transition-colors inline-flex items-center justify-center gap-2">
              <Globe2 className="w-4 h-4" />
              Explore the Globe
            </Link>
          </div>
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
            <Link href="/faq" className="hover:text-text-primary transition-colors">FAQ</Link>
            <Link href="/about" className="hover:text-text-primary transition-colors">About</Link>
            <Link href="/contact" className="hover:text-text-primary transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}