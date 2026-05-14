import type { Metadata } from 'next'
import Footer from '@/components/Footer'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Mail, MessageSquare, AlertCircle, Lightbulb, Database } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact ~ Origio',
  description: 'Get in touch with the Origio team for data corrections, payment issues, feature requests, or anything else.',
}

const TOPICS = [
  {
    icon: AlertCircle,
    title: 'Payment issue',
    subject: 'Payment issue',
    description: 'Charge problem, receipt needed, or refund request.',
  },
  {
    icon: Database,
    title: 'Data correction',
    subject: 'Data correction',
    description: 'Something looks wrong — salary, visa, cost of living.',
  },
  {
    icon: Lightbulb,
    title: 'Feature request',
    subject: 'Feature request',
    description: 'Something you wish Origio had.',
  },
  {
    icon: MessageSquare,
    title: 'Anything else',
    subject: 'Hello',
    description: 'General feedback, questions, or just saying hello.',
  },
]

const TIPS = [
  {
    label: 'Payment issues',
    tip: 'Include the email address you used to sign up and the approximate date of purchase.',
  },
  {
    label: 'Data corrections',
    tip: 'Share a source link — government stat, official report, or reputable salary survey.',
  },
  {
    label: 'Feature requests',
    tip: 'Describe the problem you are trying to solve, not just the solution.',
  },
]

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#050508] text-white" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-[#050508]/90 backdrop-blur border-b border-white/[0.08]">
        <div className="max-w-[760px] mx-auto px-6 sm:px-10 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center hover:opacity-70 transition-opacity">
            <Image
              src="/origio_logo_dark_final.png"
              alt="Origio"
              width={96}
              height={24}
              style={{ height: 24, width: 'auto' }}
              priority
            />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Link>
        </div>
      </nav>

      <div className="max-w-[760px] mx-auto px-6 sm:px-10 py-16 sm:py-24">

        {/* ── Header ── */}
        <div className="mb-16">
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/40 mb-4">
            Contact
          </p>
          <h1
            className="text-[clamp(40px,6vw,64px)] font-normal leading-none text-white mb-5"
            style={{ fontFamily: "var(--font-heading, 'DM Serif Display', Georgia, serif)" }}
          >
            Get in touch
          </h1>
          <p className="text-[14px] font-medium text-white/40 leading-relaxed max-w-md">
            Origio is a solo project. Every message goes directly to me — Shlok.
            I read and respond to everything.
          </p>
        </div>

        {/* ── Email card ── */}
        <section className="mb-12">
          <a
            href="mailto:hello@findorigio.com"
            className="group flex items-center gap-5 bg-[#0d0d10] border border-white/[0.08] px-7 py-6 hover:border-white/20 transition-colors"
            style={{ textDecoration: 'none' }}
          >
            <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center border border-white/[0.08] bg-white/[0.04] group-hover:bg-white/[0.07] transition-colors">
              <Mail className="w-5 h-5 text-[#4de6cc]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40 mb-1">Email</p>
              <p
                className="text-[18px] font-normal text-white group-hover:text-[#4de6cc] transition-colors"
                style={{ fontFamily: "var(--font-heading, 'DM Serif Display', Georgia, serif)" }}
              >
                hello@findorigio.com
              </p>
              <p className="text-[11px] font-medium text-white/30 mt-0.5">
                Typical response within 24–48 hours
              </p>
            </div>
            <ArrowLeft className="w-3.5 h-3.5 text-white/30 rotate-180 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </a>
        </section>

        {/* ── Topics ── */}
        <section className="mb-12">
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/40 mb-5">
            What can I help with?
          </p>
          <div className="grid sm:grid-cols-2 gap-px bg-white/[0.06] border border-white/[0.06]">
            {TOPICS.map(({ icon: Icon, title, subject, description }) => (
              <a
                key={title}
                href={`mailto:hello@findorigio.com?subject=${encodeURIComponent(subject)}`}
                className="group flex flex-col gap-3 bg-[#050508] px-6 py-6 hover:bg-[#0d0d10] transition-colors"
                style={{ textDecoration: 'none' }}
              >
                <div className="w-8 h-8 flex items-center justify-center border border-white/[0.08] bg-white/[0.04] group-hover:border-[#4de6cc]/30 group-hover:bg-[#4de6cc]/[0.06] transition-colors">
                  <Icon className="w-3.5 h-3.5 text-white/40 group-hover:text-[#4de6cc] transition-colors" />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-white uppercase tracking-[0.06em] mb-1">
                    {title}
                  </p>
                  <p className="text-[11px] font-medium text-white/40 leading-relaxed">
                    {description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ── Tips ── */}
        <section className="mb-16">
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/40 mb-5">
            Tips for faster replies
          </p>
          <div className="bg-[#0d0d10] border border-white/[0.08]">
            {TIPS.map(({ label, tip }, i) => (
              <div
                key={label}
                className={`flex items-start gap-5 px-6 py-5 ${i < TIPS.length - 1 ? 'border-b border-white/[0.06]' : ''}`}
              >
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#4de6cc] pt-0.5 w-28 flex-shrink-0">
                  {label}
                </span>
                <p className="text-[12px] font-medium text-white/40 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Footer links ── */}
        <div className="flex items-center gap-5 pt-8 border-t border-white/[0.08]">
          <span className="text-[11px] text-white/30 font-medium">Also useful:</span>
          <Link
            href="/faq"
            className="text-[11px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
          >
            FAQ
          </Link>
          <Link
            href="/about"
            className="text-[11px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
          >
            About
          </Link>
        </div>

      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.08] mt-4">
        <div className="max-w-[760px] mx-auto px-6 sm:px-10 py-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/origio_logo_dark_final.png"
              alt="Origio"
              width={80}
              height={20}
              style={{ height: 20, width: 'auto' }}
            />
            <span className="text-[10px] text-white/20 font-medium">© 2026</span>
          </div>
          <div className="flex items-center gap-6">
            {[
              { href: '/about', label: 'About' },
              { href: '/faq', label: 'FAQ' },
              { href: '/contact', label: 'Contact', active: true },
            ].map(({ href, label, active }) => (
              <Link
                key={href}
                href={href}
                className="text-[10px] font-bold uppercase tracking-widest transition-colors"
                style={{ color: active ? '#4de6cc' : 'rgba(255,255,255,0.3)' }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </footer>

      <Footer />
    </main>
  )
}