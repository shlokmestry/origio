import type { Metadata } from 'next'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Mail, AlertCircle, Lightbulb, Database, MessageSquare, Instagram } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact — Origio',
  description: 'Get in touch with the Origio team for data corrections, payment issues, feature requests, or anything else.',
}

const TOPICS = [
  { icon: AlertCircle,   title: 'Payment issue',    subject: 'Payment issue',    description: 'Charge problem, receipt needed, or refund request.' },
  { icon: Database,      title: 'Data correction',  subject: 'Data correction',  description: 'Something looks wrong — salary, visa, cost of living.' },
  { icon: Lightbulb,     title: 'Feature request',  subject: 'Feature request',  description: 'Something you wish Origio had.' },
  { icon: MessageSquare, title: 'Anything else',    subject: 'Hello',            description: 'General feedback, questions, or just saying hello.' },
]

const TIPS = [
  { label: 'Payment issues',   tip: 'Include the email you used to sign up and the approximate date of purchase.' },
  { label: 'Data corrections', tip: 'Share a source link — government stat, official report, or reputable salary survey.' },
  { label: 'Feature requests', tip: 'Describe the problem you are trying to solve, not just the solution.' },
]

const SERIF = "var(--font-heading, 'Cabinet Grotesk', sans-serif)"
const SANS  = "'Satoshi', sans-serif"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0f0e8] flex flex-col" style={{ fontFamily: SANS }}>

      {/* ── Static nav — no function props ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(10,10,10,0.88)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid #1a1a1a',
      }}>
        <div style={{
          maxWidth: 900, margin: '0 auto',
          padding: '0 32px', height: 64,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Link href="/" style={{
            display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00ffd5', display: 'inline-block' }} />
            <span style={{ fontFamily: SERIF, fontSize: 20, color: '#f0f0e8', letterSpacing: '-0.02em' }}>
              origio<span style={{ color: '#00ffd5' }}>.</span>
            </span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {['Calculator', 'Blog', 'About'].map(label => (
              <Link key={label} href={`/${label.toLowerCase()}`} style={{
                fontFamily: SANS, fontSize: 13, fontWeight: 500,
                color: 'rgba(240,240,232,0.45)', textDecoration: 'none',
              }}>{label}</Link>
            ))}
          </div>
        </div>
      </nav>

      {/* ── PAGE HEADER ── */}
      <div className="border-b border-[#2a2a2a]">
        <div className="max-w-[900px] mx-auto px-8 pt-28 pb-12">
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#f0f0e8]/40 mb-4">Contact</p>
          <h1 className="text-[clamp(44px,5.5vw,68px)] font-normal leading-none text-[#f0f0e8] mb-5"
            style={{ fontFamily: SERIF }}>
            Get in touch
          </h1>
          <p className="text-[14px] font-medium text-[#f0f0e8]/40 leading-relaxed max-w-md">
            Origio is a solo project. Every message goes directly to me — Shlok.
            I read and respond to everything.
          </p>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="max-w-[900px] mx-auto px-8 py-14 flex-1 w-full">

        {/* Contact cards */}
        <div className="flex flex-col gap-4 mb-10">

        {/* Email card */}
        <a href="mailto:hello@findorigio.com"
          className="group flex items-center gap-5 bg-[#111] border border-[#2a2a2a] px-7 py-6 mb-10 hover:border-[#00ffd5]/40 transition-colors"
          style={{ textDecoration: 'none', boxShadow: '3px 3px 0px #1a1a1a' }}>
          <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center border border-[#2a2a2a] bg-[#00ffd5]/[0.06] group-hover:bg-[#00ffd5]/[0.1] transition-colors">
            <Mail className="w-5 h-5 text-[#00ffd5]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#f0f0e8]/40 mb-1">Direct email</p>
            <p className="text-[20px] font-normal text-[#f0f0e8] group-hover:text-[#00ffd5] transition-colors"
              style={{ fontFamily: SERIF }}>
              hello@findorigio.com
            </p>
            <p className="text-[11px] font-medium text-[#f0f0e8]/30 mt-1">Typical response within 24–48 hours</p>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#00ffd5]/0 group-hover:text-[#00ffd5] transition-colors flex-shrink-0">
            Write →
          </span>
        </a>

        {/* Instagram card */}
        <a href="https://instagram.com/findorigio" target="_blank" rel="noopener noreferrer"
          className="group flex items-center gap-5 bg-[#111] border border-[#2a2a2a] px-7 py-6 hover:border-[#00ffd5]/40 transition-colors"
          style={{ textDecoration: 'none', boxShadow: '3px 3px 0px #1a1a1a' }}>
          <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center border border-[#2a2a2a] bg-[#00ffd5]/[0.06] group-hover:bg-[#00ffd5]/[0.1] transition-colors">
            <Instagram className="w-5 h-5 text-[#00ffd5]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#f0f0e8]/40 mb-1">Instagram</p>
            <p className="text-[20px] font-normal text-[#f0f0e8] group-hover:text-[#00ffd5] transition-colors"
              style={{ fontFamily: SERIF }}>
              @findorigio
            </p>
            <p className="text-[11px] font-medium text-[#f0f0e8]/30 mt-1">Follow for country data, tips & updates</p>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#00ffd5]/0 group-hover:text-[#00ffd5] transition-colors flex-shrink-0">
            Follow →
          </span>
        </a>

        </div>{/* end contact cards */}

        {/* Topics */}
        <div className="mb-10">
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#f0f0e8]/35 mb-5">What can I help with?</p>
          <div className="border border-[#2a2a2a] overflow-hidden" style={{ boxShadow: '3px 3px 0px #1a1a1a' }}>
            {TOPICS.map(({ icon: Icon, title, subject, description }, i) => (
              <a key={title} href={`mailto:hello@findorigio.com?subject=${encodeURIComponent(subject)}`}
                style={{ textDecoration: 'none', borderBottom: i < TOPICS.length - 1 ? '1px solid #1a1a1a' : 'none', display: 'flex' }}
                className="group items-start gap-5 px-6 py-5 hover:bg-[#111] transition-colors flex">
                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center border border-[#2a2a2a] bg-[#0a0a0a] group-hover:border-[#00ffd5]/30 group-hover:bg-[#00ffd5]/[0.05] transition-colors mt-0.5">
                  <Icon className="w-3.5 h-3.5 text-[#f0f0e8]/30 group-hover:text-[#00ffd5] transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-[#f0f0e8] uppercase tracking-[0.08em] mb-1">{title}</p>
                  <p className="text-[12px] font-medium text-[#f0f0e8]/40 leading-relaxed">{description}</p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#f0f0e8]/0 group-hover:text-[#00ffd5]/60 transition-colors flex-shrink-0 pt-1">→</span>
              </a>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="mb-14">
          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#f0f0e8]/35 mb-5">Tips for faster replies</p>
          <div className="border border-[#2a2a2a] overflow-hidden bg-[#111]" style={{ boxShadow: '3px 3px 0px #1a1a1a' }}>
            {TIPS.map(({ label, tip }, i) => (
              <div key={label} className="flex items-start gap-6 px-6 py-5"
                style={{ borderBottom: i < TIPS.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#00ffd5] pt-0.5 w-32 flex-shrink-0">{label}</span>
                <p className="text-[12px] font-medium text-[#f0f0e8]/40 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer links */}
        <div className="flex items-center gap-6 pt-8 border-t border-[#2a2a2a]">
          <span className="text-[11px] text-[#f0f0e8]/25 font-medium">Also useful:</span>
          <Link href="/faq" className="text-[11px] font-bold uppercase tracking-widest text-[#f0f0e8]/40 hover:text-[#f0f0e8] transition-colors">FAQ</Link>
          <Link href="/about" className="text-[11px] font-bold uppercase tracking-widest text-[#f0f0e8]/40 hover:text-[#f0f0e8] transition-colors">About</Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}