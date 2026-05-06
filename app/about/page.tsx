/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useRef, useState } from "react";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import Link from "next/link";

// ─── Hooks ─────────────────────────────────────────────────────────────────

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── How It Works SVG diagram (matches screenshot) ────────────────────────

function HowItWorksScribble() {
  return (
    <svg viewBox="0 0 800 600" className="w-full h-auto" aria-hidden style={{ maxWidth: 700, margin: "0 auto", display: "block" }}>
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#00ffd5" />
        </marker>
      </defs>

      {/* Step 01 */}
      <circle cx="200" cy="200" r="90" fill="none" stroke="#f0f0e8" strokeWidth="1.5" />
      <text x="200" y="192" textAnchor="middle" fill="#f0f0e8" style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 400 }}>01</text>
      <text x="200" y="218" textAnchor="middle" fill="rgba(240,240,232,0.7)" style={{ fontFamily: "sans-serif", fontSize: 13 }}>answer 8 questions</text>

      {/* Step 02 */}
      <circle cx="600" cy="200" r="90" fill="none" stroke="#f0f0e8" strokeWidth="1.5" />
      <text x="600" y="192" textAnchor="middle" fill="#f0f0e8" style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 400 }}>02</text>
      <text x="600" y="218" textAnchor="middle" fill="rgba(240,240,232,0.7)" style={{ fontFamily: "sans-serif", fontSize: 13 }}>get your top countries</text>

      {/* Step 03 — cyan */}
      <circle cx="400" cy="460" r="96" fill="none" stroke="#00ffd5" strokeWidth="1.5" />
      <text x="400" y="452" textAnchor="middle" fill="#00ffd5" style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 400 }}>03</text>
      <text x="400" y="478" textAnchor="middle" fill="#00ffd5" style={{ fontFamily: "sans-serif", fontSize: 13 }}>dive into the data</text>

      {/* 01 → 02 */}
      <path d="M 292 188 C 360 148, 450 142, 508 182" fill="none" stroke="#00ffd5" strokeWidth="1.5" strokeDasharray="4 7" strokeLinecap="round" markerEnd="url(#arrow)" />

      {/* 02 → 03 */}
      <path d="M 660 278 C 700 360, 610 440, 502 458" fill="none" stroke="#00ffd5" strokeWidth="1.5" strokeDasharray="4 7" strokeLinecap="round" markerEnd="url(#arrow)" />

      {/* 03 → 01 */}
      <path d="M 308 462 C 228 448, 160 380, 162 296" fill="none" stroke="#00ffd5" strokeWidth="1.5" strokeDasharray="4 7" strokeLinecap="round" markerEnd="url(#arrow)" />
    </svg>
  );
}

// ─── Grain overlay ────────────────────────────────────────────────────────

function GrainOverlay() {
  return (
    <svg aria-hidden style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 9999, opacity: 0.022 }}>
      <filter id="grain-about">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain-about)" />
    </svg>
  );
}

// ─── Scroll-fade wrapper ───────────────────────────────────────────────────

function FadeIn({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView(0.08);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div style={{ background: "#0a0a0a", color: "#f0f0e8", minHeight: "100vh" }}>
      <GrainOverlay />
      <Nav countries={[]} onCountrySelect={() => {}} />

      <main>

        {/* ── HERO — full-bleed image, rounded inset, giant headline ── */}
        <section style={{ position: "relative", width: "100%", minHeight: "100vh", padding: "80px 24px 24px" }}>
          {/* Inset image container */}
          <div style={{
            position: "absolute",
            inset: "80px 24px 24px 24px",
            overflow: "hidden",
            borderRadius: "16px",
            background: "#0a0a0a",
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/girlstanding.jpg"
              alt=""
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
                transform: "scale(0.97)",
                transformOrigin: "center",
                borderRadius: "12px",
                filter: "saturate(0.85) brightness(0.7)",
              }}
            />
            {/* Gradient overlay */}
            <div style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, rgba(10,10,10,0.2) 0%, rgba(10,10,10,0.05) 40%, rgba(10,10,10,0.75) 100%)",
            }} />
          </div>

          {/* Headline centered over image */}
          <div style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "calc(100vh - 80px)",
            padding: "0 24px",
          }}>
            <h1 style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontWeight: 400,
              fontSize: "clamp(48px, 9vw, 128px)",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              color: "#ffffff",
              textAlign: "center",
              maxWidth: "16ch",
              textShadow: "0 4px 48px rgba(0,0,0,0.5)",
              margin: 0,
            }}>
              what the fuck is{" "}
              <em style={{ color: "#00ffd5", fontStyle: "italic" }}>origio</em>?
            </h1>
          </div>

          {/* Scroll cue */}
          <div style={{
            position: "absolute",
            left: "50%",
            bottom: 52,
            transform: "translateX(-50%)",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            color: "rgba(240,240,232,0.5)",
          }}>
            <span style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase" }}>scroll</span>
            <div style={{ width: 1, height: 36, background: "linear-gradient(180deg, rgba(240,240,232,0.5), transparent)" }} />
          </div>
        </section>

        {/* ── STORY ── */}
        <section style={{ position: "relative", padding: "96px 24px", background: "#0a0a0a" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <FadeIn>
              <span style={{
                fontFamily: "monospace",
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#00ffd5",
                borderBottom: "2px solid #00ffd5",
                paddingBottom: 4,
                display: "inline-block",
                marginBottom: 32,
              }}>
                the story
              </span>
            </FadeIn>

            <FadeIn delay={80}>
              <p style={{
                fontFamily: "Georgia, serif",
                fontSize: "clamp(20px, 2.8vw, 30px)",
                lineHeight: 1.55,
                color: "#f0f0e8",
                fontWeight: 400,
                margin: "0 0 32px",
              }}>
                Origio was built by{" "}
                <em style={{ color: "#00ffd5", fontStyle: "italic" }}>Shlok Mestry</em>{" "}
                after spending weeks manually researching countries to move to and
                realising there was no single place that had all the information needed
                to make a proper decision.
              </p>
            </FadeIn>

            <FadeIn delay={160}>
              <p style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: 17,
                lineHeight: 1.75,
                color: "rgba(240,240,232,0.72)",
                margin: "0 0 24px",
              }}>
                The core feature is the interactive <strong style={{ color: "#f0f0e8" }}>3D globe</strong> — click any country to instantly see how it stacks up across
                every dimension that matters. No more bouncing between Numbeo,
                Expatistan, and government visa websites trying to piece together a picture.
              </p>
            </FadeIn>

            <FadeIn delay={240}>
              <p style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: 17,
                lineHeight: 1.75,
                color: "rgba(240,240,232,0.72)",
                margin: 0,
              }}>
                If you're not sure where to start, the{" "}
                <strong style={{ color: "#f0f0e8" }}>Find My Country</strong> quiz asks 8
                questions about your priorities, job, passport, and budget — then
                scores all 25 countries and gives you a personalised ranked list.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section style={{
          position: "relative",
          padding: "96px 24px",
          borderTop: "1px solid #1a1a1a",
          background: "#0a0a0a",
        }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            {/* Heading row */}
            <FadeIn>
              <div style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 16,
                marginBottom: 72,
              }}>
                <h2 style={{
                  fontFamily: "Georgia, serif",
                  fontSize: "clamp(40px, 6vw, 88px)",
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                  color: "#f0f0e8",
                  fontWeight: 400,
                  margin: 0,
                }}>
                  how does this <em style={{ color: "#00ffd5", fontStyle: "italic" }}>work</em>?
                </h2>
                <span style={{
                  fontFamily: "monospace",
                  fontSize: 11,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "rgba(240,240,232,0.4)",
                }}>
                  three steps · two minutes
                </span>
              </div>
            </FadeIn>

            <FadeIn delay={100}>
              <HowItWorksScribble />
            </FadeIn>

            <FadeIn delay={200}>
              <div style={{ marginTop: 64, textAlign: "center" }}>
                <Link
                  href="/"
                  style={{
                    fontFamily: "system-ui, sans-serif",
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#f0f0e8",
                    textDecoration: "none",
                    letterSpacing: "0.04em",
                    borderBottom: "1px solid rgba(240,240,232,0.3)",
                    paddingBottom: 2,
                    transition: "color 0.2s, border-color 0.2s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#00ffd5"; (e.currentTarget as HTMLElement).style.borderColor = "#00ffd5"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#f0f0e8"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(240,240,232,0.3)"; }}
                >
                  try the globe →
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ── DATA — full-bleed library image ── */}
        <section style={{ position: "relative", width: "100%", minHeight: "100vh", padding: "24px" }}>
          {/* Inset image */}
          <div style={{
            position: "absolute",
            inset: "24px",
            overflow: "hidden",
            borderRadius: "16px",
            background: "#0a0a0a",
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/library.jpg"
              alt=""
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
                transform: "scale(0.97)",
                transformOrigin: "center",
                borderRadius: "12px",
                filter: "saturate(0.7) brightness(0.45)",
              }}
            />
            <div style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, rgba(10,10,10,0.45) 0%, rgba(10,10,10,0.35) 50%, rgba(10,10,10,0.8) 100%)",
            }} />
          </div>

          {/* Content over image */}
          <div style={{
            position: "relative",
            zIndex: 10,
            maxWidth: 720,
            margin: "0 auto",
            padding: "96px 24px",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 24,
          }}>
            <FadeIn>
              <span style={{
                fontFamily: "monospace",
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#00ffd5",
                borderBottom: "2px solid #00ffd5",
                paddingBottom: 4,
                display: "inline-block",
              }}>
                the data
              </span>
            </FadeIn>

            <FadeIn delay={80}>
              <h2 style={{
                fontFamily: "Georgia, serif",
                fontSize: "clamp(36px, 5vw, 68px)",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                color: "#f0f0e8",
                fontWeight: 400,
                margin: 0,
              }}>
                where does the <em style={{ color: "#00ffd5", fontStyle: "italic" }}>data</em> come from?
              </h2>
            </FadeIn>

            <FadeIn delay={160}>
              <p style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: 17,
                lineHeight: 1.75,
                color: "rgba(240,240,232,0.82)",
                margin: 0,
              }}>
                All data is <strong style={{ color: "#f0f0e8" }}>manually researched and verified</strong> from primary
                sources. Salary figures come from national labour statistics, recruitment platform reports, and industry
                salary surveys. Cost of living data draws from Numbeo, Expatistan, and government statistical offices.
              </p>
            </FadeIn>

            <FadeIn delay={240}>
              <p style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: 17,
                lineHeight: 1.75,
                color: "rgba(240,240,232,0.82)",
                margin: 0,
              }}>
                Data is reviewed and updated regularly. Each country page shows the{" "}
                <strong style={{ color: "#f0f0e8" }}>last verified date</strong> so you always know how recent the
                information is.
              </p>
            </FadeIn>

            <FadeIn delay={320}>
              <p style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: 13,
                lineHeight: 1.7,
                color: "rgba(240,240,232,0.45)",
                borderLeft: "2px solid rgba(240,240,232,0.15)",
                paddingLeft: 16,
                margin: 0,
              }}>
                All salary figures are in local currency unless otherwise stated. Origio is not financial or legal advice
                — always verify with official sources before making decisions.
              </p>
            </FadeIn>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}