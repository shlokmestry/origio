import type { Metadata } from 'next'
import Link from 'next/link'
import { Globe2, ArrowLeft, Mail, MessageSquare, AlertCircle, Lightbulb, Database } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact ~ Origio',
  description: 'Get in touch with the Origio team for data corrections, payment issues, feature requests, or anything else.',
}

const TOPICS = [
  {
    icon: AlertCircle,
    title: 'Payment issue',
    description: 'Charge problem, receipt needed, or refund request.',
  },
  {
    icon: Database,
    title: 'Data correction',
    description: 'Something looks wrong ~ salary, visa, cost of living.',
  },
  {
    icon: Lightbulb,
    title: 'Feature request',
    description: 'Something you wish Origio had.',
  },
  {
    icon: MessageSquare,
    title: 'Anything else',
    description: 'General feedback, questions, or just saying hello.',
  },
]

export default function ContactPage() {
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
          <p className="text-sm text-accent font-semibold uppercase tracking-wider mb-3">Contact</p>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-text-primary mb-4">
            Get in touch
          </h1>
          <p className="text-text-muted text-lg leading-relaxed">
            Origio is a solo project. Every message goes directly to me ~ Shlok. I read and respond to everything.
          </p>
        </div>

        {/* Email card */}
        <section className="mb-12">
          <a
            href="mailto:hello@findorigio.com"
            className="glass-panel rounded-2xl p-7 border border-border flex items-center gap-5 hover:border-accent/30 transition-all group"
            style={{ textDecoration: 'none' }}
          >
            <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/15 transition-colors">
              <Mail className="w-6 h-6 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Email</p>
              <p className="font-heading text-lg font-bold text-text-primary group-hover:text-accent transition-colors">
                hello@findorigio.com
              </p>
              <p className="text-sm text-text-muted mt-1">Typical response within 24–48 hours</p>
            </div>
            <ArrowLeft className="w-4 h-4 text-text-muted rotate-180 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </a>
        </section>

        {/* What to include */}
        <section className="mb-12">
          <h2 className="font-heading text-2xl font-bold text-text-primary mb-6">What can I help with?</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {TOPICS.map(({ icon: Icon, title, description }) => (
              <a
                key={title}
                href={`mailto:hello@findorigio.com?subject=${encodeURIComponent(title)}`}
                className="glass-panel rounded-2xl p-5 border border-border hover:border-accent/30 transition-all group"
                style={{ textDecoration: 'none' }}
              >
                <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-4 group-hover:bg-accent/15 transition-colors">
                  <Icon className="w-4 h-4 text-accent" />
                </div>
                <p className="font-heading font-bold text-sm text-text-primary mb-1">{title}</p>
                <p className="text-xs text-text-muted leading-relaxed">{description}</p>
              </a>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section className="mb-12">
          <h2 className="font-heading text-2xl font-bold text-text-primary mb-4">Tips for faster replies</h2>
          <div className="glass-panel rounded-2xl p-6 border border-border space-y-3">
            {[
              { label: 'Payment issues', tip: 'Include the email address you used to sign up and the approximate date of purchase.' },
              { label: 'Data corrections', tip: 'Share a source link ~ government stat, official report, or reputable salary survey.' },
              { label: 'Feature requests', tip: 'Describe the problem you are trying to solve, not just the solution. Helps me understand context.' },
            ].map(({ label, tip }) => (
              <div key={label} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                <span className="text-xs font-bold text-accent uppercase tracking-wider pt-0.5 w-28 flex-shrink-0">{label}</span>
                <p className="text-sm text-text-muted leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer links */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-text-muted pt-4 border-t border-border">
          <span>Also useful:</span>
          <Link href="/faq" className="hover:text-accent transition-colors">FAQ</Link>
          <Link href="/about" className="hover:text-accent transition-colors">About Origio</Link>
        </div>

      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-4">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-accent" />
            <span className="font-heading text-sm font-bold text-text-primary">Origio</span>
            <span className="text-text-muted text-xs ml-2">© 2026</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-text-muted">
            <Link href="/about" className="hover:text-text-primary transition-colors">About</Link>
            <Link href="/faq" className="hover:text-text-primary transition-colors">FAQ</Link>
            <Link href="/contact" className="hover:text-text-primary transition-colors text-accent">Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}