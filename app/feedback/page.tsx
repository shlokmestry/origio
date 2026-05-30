// app/feedback/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ComicButton from "@/components/ComicButton";

const MAX_CHARS = 300;

const S = {
  bg: '#050508',
  card: '#0c0c0f',
  border: 'rgba(255,255,255,0.07)',
  borderMd: 'rgba(255,255,255,0.12)',
  dim: 'rgba(255,255,255,0.38)',
  dimmer: 'rgba(255,255,255,0.2)',
  serif: "'Cabinet Grotesk', sans-serif",
  sans: "'Satoshi', sans-serif",
};

export default function FeedbackPage() {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const charsLeft = MAX_CHARS - message.length;
  const canSubmit = message.trim().length >= 5 && status === "idle";

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim(), email: email.trim() }),
      });
      if (res.ok) setStatus("done");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: S.bg, color: '#fff', fontFamily: S.sans, display: 'flex', flexDirection: 'column' }}>
      <Nav countries={[]} onCountrySelect={() => {}} />

      <main style={{ flex: 1, maxWidth: 600, margin: '0 auto', width: '100%', padding: 'clamp(100px,10vw,120px) clamp(20px,4vw,40px) 80px' }}>

        {status === "done" ? (
          /* ── Success state ── */
          <div style={{ textAlign: 'center', paddingTop: 40 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', boxShadow: '0 2px 20px rgba(255,255,255,0.15)' }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#0a0a0a' }}>✓</span>
            </div>
            <h1 style={{ fontFamily: S.serif, fontSize: 'clamp(32px,5vw,48px)', fontWeight: 400, color: '#fff', margin: '0 0 12px' }}>
              Got it.
            </h1>
            <p style={{ fontSize: 14, color: S.dim, marginBottom: 8, lineHeight: 1.6 }}>Your message came through.</p>
            {email && (
              <p style={{ fontSize: 14, color: S.dim, marginBottom: 36, lineHeight: 1.6 }}>
                We'll email <span style={{ color: '#fff', fontWeight: 600 }}>{email}</span> when it's live.
              </p>
            )}
            <ComicButton as="link" href="/">Back to Origio →</ComicButton>
          </div>

        ) : (
          <>
            {/* ── Header ── */}
            <div style={{ marginBottom: 48 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: S.dim, marginBottom: 16 }}>
                Shape what we build next
              </p>
              <h1 style={{ fontFamily: S.serif, fontSize: 'clamp(32px,5vw,52px)', fontWeight: 400, color: '#fff', lineHeight: 1.1, margin: '0 0 16px' }}>
                Tell us what's missing.
              </h1>
              <p style={{ fontSize: 15, color: S.dim, lineHeight: 1.7, maxWidth: 440 }}>
                37 countries, 8 quiz questions. We know it's not complete. Tell us what you want to see — countries, job roles, quiz questions, anything.
              </p>
            </div>

            {/* ── Form card ── */}
            <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 16, overflow: 'hidden' }}>

              {/* Message field */}
              <div style={{ padding: '24px 24px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: S.dim }}>
                    Your message
                  </label>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: charsLeft < 50 ? 'rgba(255,130,130,0.8)' : S.dimmer }}>
                    {charsLeft} left
                  </span>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, MAX_CHARS))}
                  placeholder="I want to see Thailand added. I'm a freelance designer moving to Southeast Asia..."
                  rows={5}
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.03)', border: `1px solid ${S.border}`,
                    borderRadius: 10, padding: '14px 16px', fontSize: 14, color: '#fff',
                    outline: 'none', resize: 'none', lineHeight: 1.65, fontFamily: S.sans,
                    boxSizing: 'border-box', transition: 'border-color 0.15s',
                  }}
                  onFocus={e => (e.target as HTMLElement).style.borderColor = S.borderMd}
                  onBlur={e => (e.target as HTMLElement).style.borderColor = S.border}
                />
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: S.border, margin: '20px 0 0' }} />

              {/* Email field */}
              <div style={{ padding: '20px 24px 0' }}>
                <label style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: S.dim, marginBottom: 10 }}>
                  Email <span style={{ color: S.dimmer, textTransform: 'none', letterSpacing: 0, fontWeight: 400, fontSize: 12 }}>— optional</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.03)', border: `1px solid ${S.border}`,
                    borderRadius: 10, padding: '12px 16px', fontSize: 14, color: '#fff',
                    outline: 'none', fontFamily: S.sans, boxSizing: 'border-box',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => (e.target as HTMLElement).style.borderColor = S.borderMd}
                  onBlur={e => (e.target as HTMLElement).style.borderColor = S.border}
                />
                <p style={{ fontSize: 12, color: S.dimmer, marginTop: 8, lineHeight: 1.5 }}>
                  We'll notify you when your requested feature goes live. No marketing, ever.
                </p>
              </div>

              {/* Submit */}
              <div style={{ padding: 24 }}>
                <ComicButton
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  style={{ width: '100%', opacity: !canSubmit ? 0.4 : 1, pointerEvents: !canSubmit ? 'none' : 'auto' }}
                >
                  {status === "sending" ? "Sending..." : "Send feedback"}
                </ComicButton>

                {status === "error" && (
                  <p style={{ fontSize: 12, color: 'rgba(255,130,130,0.8)', fontWeight: 600, textAlign: 'center', marginTop: 12 }}>
                    Something went wrong. Email us at hello@findorigio.com
                  </p>
                )}
              </div>
            </div>

          </>
        )}

      </main>

      <Footer />
    </div>
  );
}