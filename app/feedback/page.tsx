// app/feedback/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const MAX_CHARS = 300;

const PROMPTS = [
  "Which country do you want to see next?",
  "What's your job role and where are you trying to move?",
  "What question do you wish the quiz asked?",
  "What's missing from the country reports?",
];

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
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0f0e8] flex flex-col">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0a] border-b-2 border-[#2a2a2a]">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-3.5 h-3.5 bg-[#00ffd5] border-2 border-[#f0f0e8]" />
            <span className="font-heading text-base font-extrabold uppercase tracking-tight">Origio</span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#888880] hover:text-[#f0f0e8] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>
        </div>
      </nav>

      <main className="flex-1 max-w-xl mx-auto px-6 py-14 w-full">

        {status === "done" ? (
          /* ── Success ── */
          <div className="text-center py-20">
            <div className="w-12 h-12 border-2 border-[#00ffd5] flex items-center justify-center mx-auto mb-6">
              <span className="text-[#00ffd5] text-xl font-extrabold">✓</span>
            </div>
            <h1 className="font-heading text-3xl font-extrabold uppercase tracking-tight mb-3">Got it.</h1>
            <p className="text-[#888880] text-sm mb-2">Your message came through.</p>
            {email && (
              <p className="text-[#888880] text-sm mb-8">
                We'll email <span className="text-[#f0f0e8] font-bold">{email}</span> when it's live.
              </p>
            )}
            <Link href="/" className="text-[11px] font-bold text-[#00ffd5] uppercase tracking-widest hover:underline">
              Back to Origio →
            </Link>
          </div>
        ) : (
          <>
            {/* ── Header ── */}
            <div className="mb-10">
              <p className="text-[10px] font-bold text-[#00ffd5] uppercase tracking-widest mb-3">Shape what we build next</p>
              <h1 className="font-heading text-4xl font-extrabold uppercase tracking-tight mb-4">
                Tell us what's missing.
              </h1>
              <p className="text-[#888880] text-sm leading-relaxed">
                25 countries, 8 quiz questions. We know it's not complete. Tell us what you want to see — countries, job roles, quiz questions, anything.
              </p>
            </div>

            {/* ── Prompt suggestions ── */}
            <div className="mb-6">
              <p className="text-[10px] font-bold text-[#888880] uppercase tracking-widest mb-3">Some things people ask about</p>
              <div className="flex flex-wrap gap-2">
                {PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setMessage(p + " ")}
                    className="text-[11px] font-bold px-3 py-1.5 border-2 border-[#2a2a2a] text-[#888880] hover:border-[#f0f0e8] hover:text-[#f0f0e8] transition-all uppercase tracking-wide"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Message ── */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-bold text-[#888880] uppercase tracking-widest">
                  Your message
                </label>
                <span className={`text-[10px] font-bold uppercase tracking-wide ${charsLeft < 50 ? "text-[#f87171]" : "text-[#888880]"}`}>
                  {charsLeft} left
                </span>
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, MAX_CHARS))}
                placeholder="I want to see Thailand added. I'm a freelance designer moving to Southeast Asia..."
                rows={5}
                className="w-full bg-[#111] border-2 border-[#2a2a2a] px-4 py-3 text-sm text-[#f0f0e8] placeholder:text-[#444] focus:outline-none focus:border-[#00ffd5] transition-colors resize-none font-mono leading-relaxed"
              />
            </div>

            {/* ── Email ── */}
            <div className="mb-8">
              <label className="block text-[10px] font-bold text-[#888880] uppercase tracking-widest mb-2">
                Email <span className="text-[#444] normal-case tracking-normal font-normal">— optional</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#111] border-2 border-[#2a2a2a] px-4 py-3 text-sm text-[#f0f0e8] placeholder:text-[#444] focus:outline-none focus:border-[#00ffd5] transition-colors"
              />
              <p className="text-[11px] text-[#888880] mt-2">
                Leave your email and we'll notify you when your requested country or feature goes live. No marketing, ever.
              </p>
            </div>

            {/* ── Submit ── */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full py-4 bg-[#00ffd5] text-[#0a0a0a] text-sm font-extrabold uppercase tracking-wide border-2 border-[#00ffd5] hover:bg-transparent hover:text-[#00ffd5] transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-[#00ffd5] disabled:hover:text-[#0a0a0a]"
              style={{ boxShadow: canSubmit ? "3px 3px 0 #00aa90" : "none" }}
            >
              {status === "sending" ? "Sending..." : "Send feedback"}
            </button>

            {status === "error" && (
              <p className="text-[11px] text-[#f87171] font-bold text-center mt-3">
                Something went wrong. Email us directly at hello@findorigio.com
              </p>
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t-2 border-[#2a2a2a]">
        <div className="max-w-4xl mx-auto px-6 py-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#00ffd5] border-2 border-[#f0f0e8]" />
            <span className="font-heading text-sm font-extrabold uppercase tracking-tight">Origio</span>
            <span className="text-[#888880] text-xs ml-2">© 2026</span>
          </div>
          <div className="flex items-center gap-5 text-xs font-bold text-[#888880] uppercase tracking-wide">
            <Link href="/about" className="hover:text-[#f0f0e8] transition-colors">About</Link>
            <Link href="/faq" className="hover:text-[#f0f0e8] transition-colors">FAQ</Link>
            <Link href="/privacy" className="hover:text-[#f0f0e8] transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}