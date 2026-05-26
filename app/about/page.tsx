/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useRef, useState } from "react";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import Link from "next/link";

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

function FadeIn({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView(0.08);
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(20px)",
      transition: `opacity 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.65s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

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

function HowItWorksScribble() {
  return (
    <svg viewBox="0 0 800 620" style={{ width: "100%", height: "auto", maxWidth: 780, margin: "0 auto", display: "block" }} aria-hidden>
      <defs>
        <filter id="wobbly" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.022 0.028" numOctaves="4" seed="42" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="wobbly-sm" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.03 0.038" numOctaves="3" seed="17" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <marker id="pen-tip" viewBox="0 0 18 18" refX="12" refY="9" markerWidth="11" markerHeight="11" orient="auto">
          <path d="M 3 5 L 13 9 L 3 13" fill="none" stroke="#00ffd5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 4 6.5 L 11 9" fill="none" stroke="#00ffd5" strokeWidth="0.7" strokeLinecap="round" opacity="0.35" />
        </marker>
      </defs>
      <path filter="url(#wobbly)" d="M 222 95 C 258 82, 300 88, 322 114 C 346 142, 344 182, 328 208 C 312 234, 280 250, 248 252 C 216 254, 184 242, 164 218 C 144 194, 140 160, 156 134 C 172 108, 200 98, 222 95 Z" fill="none" stroke="#f0f0e8" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
      <path filter="url(#wobbly-sm)" d="M 228 98 C 264 86, 304 92, 326 118 C 348 146, 345 186, 328 212" fill="none" stroke="#f0f0e8" strokeWidth="0.8" strokeLinecap="round" opacity="0.15" />
      <text x="245" y="168" textAnchor="middle" fill="#f0f0e8" style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 34, fontWeight: 400 }}>01</text>
      <text x="245" y="200" textAnchor="middle" fill="rgba(240,240,232,0.52)" style={{ fontFamily: "system-ui, sans-serif", fontSize: 13 }}>answer 8 questions</text>
      <path filter="url(#wobbly)" d="M 578 94 C 614 82, 658 90, 680 118 C 702 146, 700 186, 684 212 C 668 238, 638 252, 606 252 C 574 252, 544 238, 528 212 C 512 186, 512 148, 534 120 C 552 96, 572 96, 578 94 Z" fill="none" stroke="#f0f0e8" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
      <path filter="url(#wobbly-sm)" d="M 582 97 C 618 85, 660 94, 682 122 C 704 150, 701 190, 684 216" fill="none" stroke="#f0f0e8" strokeWidth="0.8" strokeLinecap="round" opacity="0.15" />
      <text x="605" y="168" textAnchor="middle" fill="#f0f0e8" style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 34, fontWeight: 400 }}>02</text>
      <text x="605" y="200" textAnchor="middle" fill="rgba(240,240,232,0.52)" style={{ fontFamily: "system-ui, sans-serif", fontSize: 13 }}>get your top countries</text>
      <path filter="url(#wobbly)" d="M 400 378 C 440 366, 486 372, 512 400 C 538 428, 536 470, 518 498 C 500 526, 466 540, 432 540 C 398 540, 364 526, 346 498 C 328 470, 328 430, 352 402 C 370 380, 388 380, 400 378 Z" fill="none" stroke="#00ffd5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.93" />
      <path filter="url(#wobbly-sm)" d="M 406 381 C 444 370, 488 377, 514 406 C 540 434, 537 474, 518 502" fill="none" stroke="#00ffd5" strokeWidth="0.9" strokeLinecap="round" opacity="0.2" />
      <text x="428" y="455" textAnchor="middle" fill="#00ffd5" style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 34, fontWeight: 400 }}>03</text>
      <text x="428" y="488" textAnchor="middle" fill="rgba(0,255,213,0.6)" style={{ fontFamily: "system-ui, sans-serif", fontSize: 13 }}>dive into the data</text>
      <path filter="url(#wobbly-sm)" d="M 324 128 C 358 92, 444 80, 498 104 C 524 116, 538 136, 542 156" fill="none" stroke="#00ffd5" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="5.5 10" markerEnd="url(#pen-tip)" opacity="0.82" />
      <path filter="url(#wobbly-sm)" d="M 326 133 C 362 98, 448 86, 500 110" fill="none" stroke="#00ffd5" strokeWidth="0.55" strokeLinecap="round" opacity="0.18" />
      <path filter="url(#wobbly-sm)" d="M 668 250 C 706 320, 696 386, 648 422 C 616 446, 566 464, 516 474" fill="none" stroke="#00ffd5" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="5.5 10" markerEnd="url(#pen-tip)" opacity="0.82" />
      <path filter="url(#wobbly-sm)" d="M 674 254 C 712 326, 700 390, 650 427" fill="none" stroke="#00ffd5" strokeWidth="0.55" strokeLinecap="round" opacity="0.18" />
      <path filter="url(#wobbly-sm)" d="M 346 472 C 288 486, 220 464, 186 416 C 162 380, 154 334, 164 272" fill="none" stroke="#00ffd5" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="5.5 10" markerEnd="url(#pen-tip)" opacity="0.82" />
      <path filter="url(#wobbly-sm)" d="M 350 477 C 290 492, 222 470, 188 420" fill="none" stroke="#00ffd5" strokeWidth="0.55" strokeLinecap="round" opacity="0.18" />
    </svg>
  );
}

// ─── FAKE NEWSPAPER CLIPPING ──────────────────────────────────────────────
// Hand-typed headlines from "The Expat Times" — each crossed out and replaced
// with what Origio actually does. Slight rotation, coffee stain, typewriter feel.

function NewspaperSpoof() {
  const { ref, inView } = useInView(0.1);

  const headlines = [
    {
      them: "Man spends 6 hours on Numbeo, still doesn't know if he can afford rent in Berlin",
      us: "Origio shows you rent, tax, and take-home in one number",
    },
    {
      them: "Expatistan user discovers groceries don't include income tax. Film at 11.",
      us: "Salary after tax, after rent, after groceries — calculated for your job",
    },
    {
      them: "Reddit thread: 'should I move to Portugal?' — 340 opinions, zero data",
      us: "25 countries ranked by your actual priorities, not strangers' vibes",
    },
    {
      them: "Government visa website lists requirements. Does not mention 14-month wait.",
      us: "Visa difficulty scored 1–10. Real routes. Real timelines.",
    },
  ];

  return (
    <div ref={ref} style={{ position: "relative", maxWidth: 780, margin: "0 auto" }}>

      {/* Newspaper masthead */}
      <div style={{
        borderTop: "4px solid #f0f0e8",
        borderBottom: "2px solid #f0f0e8",
        padding: "10px 0 8px",
        marginBottom: 2,
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
      }}>
        <span style={{
          fontFamily: "'Cabinet Grotesk', sans-serif",
          fontSize: "clamp(22px, 4vw, 36px)",
          fontWeight: 700,
          color: "#f0f0e8",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}>
          The Expat Times
        </span>
        <span style={{
          fontFamily: "Satoshi, sans-serif",
          fontSize: 10,
          color: "rgba(240,240,232,0.3)",
          letterSpacing: "0.08em",
        }}>
          EST. EVERY TIME SOMEONE GOOGLES "BEST COUNTRY TO MOVE TO"
        </span>
      </div>

      <div
        style={{
          borderBottom: "1px solid rgba(240,240,232,0.15)",
          marginBottom: 32,
          padding: "4px 0",
          display: "flex",
          gap: 24,
          overflowX: "auto",
        }}
        className="newspaper-tags"
      >
        {["BREAKING", "SALARY NEWS", "VISA CHAOS", "COST OF LIVING SPECIAL"].map(tag => (
          <span key={tag} style={{
            fontFamily: "Satoshi, sans-serif", fontSize: 9,
            color: "rgba(240,240,232,0.25)", letterSpacing: "0.1em",
          }}>{tag}</span>
        ))}
      </div>

      {/* Headlines */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {headlines.map((h, i) => (
          <div
            key={i}
            style={{
              borderBottom: i < headlines.length - 1 ? "1px solid rgba(240,240,232,0.08)" : "none",
              padding: "28px 0",
              opacity: inView ? 1 : 0,
              transform: inView ? "translateX(0)" : "translateX(-12px)",
              transition: `opacity 0.5s ease ${i * 120}ms, transform 0.5s ease ${i * 120}ms`,
            }}
          >
            {/* Crossed-out headline */}
            <div style={{ position: "relative", marginBottom: 12 }}>
              <p style={{
                fontFamily: "'Cabinet Grotesk', sans-serif",
                fontSize: "clamp(14px, 2vw, 17px)",
                lineHeight: 1.45,
                color: "rgba(240,240,232,0.28)",
                margin: 0,
                textDecoration: "line-through",
                textDecorationColor: "rgba(255,60,60,0.6)",
                textDecorationThickness: 2,
              }}>
                {h.them}
              </p>
              {/* Scribble X mark */}
              <svg
                viewBox="0 0 24 24"
                style={{
                  position: "absolute",
                  top: -4, left: -28,
                  width: 20, height: 20,
                  opacity: inView ? 0.5 : 0,
                  transition: `opacity 0.3s ease ${i * 120 + 300}ms`,
                }}
              >
                <path d="M4 4 L20 20 M20 4 L4 20" stroke="#ff4444" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </svg>
            </div>

            {/* Origio replacement */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <span style={{
                fontFamily: "Satoshi, sans-serif", fontSize: 10,
                color: "#00ffd5", letterSpacing: "0.1em",
                textTransform: "uppercase", flexShrink: 0,
                marginTop: 3,
              }}>→ origio</span>
              <p style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: "clamp(13px, 1.8vw, 15px)",
                lineHeight: 1.5,
                color: "rgba(240,240,232,0.75)",
                margin: 0,
                fontWeight: 500,
              }}>
                {h.us}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer byline */}
      <div style={{
        borderTop: "2px solid #f0f0e8",
        paddingTop: 12,
        marginTop: 8,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <span style={{ fontFamily: "Satoshi, sans-serif", fontSize: 9, color: "rgba(240,240,232,0.2)", letterSpacing: "0.08em" }}>
          ALL STORIES BASED ON REAL SEARCHES MADE AT 2AM
        </span>
        <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 11, color: "rgba(240,240,232,0.2)", fontStyle: "normal" }}>
          findorigio.com
        </span>
      </div>
    </div>
  );
}

// ─── ALGORITHM SCRIBBLE ───────────────────────────────────────────────────
// Hand-drawn equation on paper — wobbly bezier boxes around each term,
// scratchy connecting lines, scrawled weights beside each factor.
// Matches the "how it works" scribble language already on the page.

function AlgorithmScribble() {
  const { ref, inView } = useInView(0.1);

  const factors = [
    { label: "Salary", weight: "30%", color: "#00ffd5", x: 60, y: 80 },
    { label: "Cost of Living", weight: "25%", color: "#a78bfa", x: 220, y: 80 },
    { label: "Visa Access", weight: "20%", color: "#60a5fa", x: 400, y: 80 },
    { label: "Quality of Life", weight: "15%", color: "#34d399", x: 560, y: 80 },
    { label: "Safety", weight: "10%", color: "#f472b6", x: 700, y: 80 },
  ];

  return (
    <div ref={ref}>
      {/* Label */}
      <div style={{
        fontFamily: "Satoshi, sans-serif", fontSize: 11, letterSpacing: "0.18em",
        textTransform: "uppercase", color: "rgba(240,240,232,0.3)",
        marginBottom: 32, textAlign: "center",
        opacity: inView ? 1 : 0, transition: "opacity 0.5s ease",
      }}>
        move score = weighted sum of five signals
      </div>

      <svg
        viewBox="0 0 800 280"
        style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}
        aria-hidden
      >
        <defs>
          <filter id="alg-rough" x="-6%" y="-6%" width="112%" height="112%">
            <feTurbulence type="fractalNoise" baseFrequency="0.028 0.035" numOctaves="3" seed="99" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <marker id="alg-arrow" viewBox="0 0 12 12" refX="9" refY="6" markerWidth="8" markerHeight="8" orient="auto">
            <path d="M 2 3 L 10 6 L 2 9" fill="none" stroke="#f0f0e8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
          </marker>
        </defs>

        {factors.map((f, i) => {
          const cx = f.x + 55;
          const boxW = 110;
          const boxH = 52;
          const bx = f.x;
          const by = f.y;

          return (
            <g key={f.label} style={{
              opacity: inView ? 1 : 0,
              transition: `opacity 0.55s ease ${i * 100}ms`,
            }}>
              {/* Wobbly hand-drawn box */}
              <path
                filter="url(#alg-rough)"
                d={`
                  M ${bx + 8} ${by}
                  L ${bx + boxW - 6} ${by + 2}
                  L ${bx + boxW + 2} ${by + boxH - 6}
                  L ${bx + 6} ${by + boxH + 2}
                  Z
                `}
                fill="none"
                stroke={f.color}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.7"
              />
              {/* Second ghost trace */}
              <path
                filter="url(#alg-rough)"
                d={`M ${bx + 10} ${by + 2} L ${bx + boxW - 4} ${by + 3}`}
                fill="none"
                stroke={f.color}
                strokeWidth="0.6"
                strokeLinecap="round"
                opacity="0.2"
              />

              {/* Factor label */}
              <text
                x={cx}
                y={by + 24}
                textAnchor="middle"
                fill={f.color}
                style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 13, fontWeight: 400 }}
              >
                {f.label}
              </text>

              {/* Weight scrawled below — like pencilled annotation */}
              <text
                x={cx}
                y={by + 42}
                textAnchor="middle"
                fill={f.color}
                opacity="0.55"
                style={{ fontFamily: "Satoshi, sans-serif", fontSize: 11 }}
              >
                {f.weight}
              </text>

              {/* Plus sign between boxes — except last */}
              {i < factors.length - 1 && (
                <text
                  x={bx + boxW + 18}
                  y={by + 30}
                  textAnchor="middle"
                  fill="rgba(240,240,232,0.25)"
                  style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 20 }}
                >
                  +
                </text>
              )}
            </g>
          );
        })}

        {/* Arrow pointing down to "= Move Score" */}
        <line
          x1="400" y1="145" x2="400" y2="185"
          stroke="rgba(240,240,232,0.2)"
          strokeWidth="1.5"
          strokeDasharray="4 5"
          strokeLinecap="round"
          markerEnd="url(#alg-arrow)"
          style={{ opacity: inView ? 1 : 0, transition: "opacity 0.5s ease 600ms" }}
        />

        {/* = Move Score box — wobbly, cyan */}
        <g style={{ opacity: inView ? 1 : 0, transition: "opacity 0.5s ease 700ms" }}>
          <path
            filter="url(#alg-rough)"
            d="M 302 188 L 498 190 L 500 240 L 300 238 Z"
            fill="rgba(0,255,213,0.05)"
            stroke="#00ffd5"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.8"
          />
          <text x="400" y="220" textAnchor="middle" fill="#00ffd5"
            style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: 22, fontWeight: 400 }}>
            Move Score
          </text>
        </g>

        {/* Scrawled note bottom-left */}
        <text x="24" y="268" fill="rgba(240,240,232,0.18)"
          style={{ fontFamily: "Satoshi, sans-serif", fontSize: 9, letterSpacing: "0.05em", opacity: inView ? 1 : 0, transition: "opacity 0.4s ease 900ms" }}
        >
          * weights shift based on your wizard answers
        </text>
      </svg>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div style={{ background: "#0a0a0a", color: "#f0f0e8", minHeight: "100vh" }}>
      <style>{`
        @media (max-width: 640px) {
          .about-factor-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 0 !important; }
          .about-factor-item { border-right: none !important; border-bottom: 1px solid #1a1a1a; }
          .newspaper-tags { display: none !important; }
          .newspaper-crossmark { left: -20px !important; }
          .about-howit-header { flex-direction: column !important; gap: 10px !important; }
        }
        @media (min-width: 641px) and (max-width: 900px) {
          .about-factor-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>
      <GrainOverlay />
      <Nav countries={[]} onCountrySelect={() => {}} />

      <main>

        {/* ── HERO ── */}
        <section style={{ position: "relative", width: "100%", minHeight: "100vh", padding: "80px 24px 24px" }}>
          <div style={{
            position: "absolute", inset: "80px 24px 24px 24px",
            overflow: "hidden", borderRadius: "16px", background: "#0a0a0a",
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/girlstanding.jpg" alt="" style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "center",
              transform: "scale(0.97)", transformOrigin: "center",
              borderRadius: "12px", filter: "saturate(0.85) brightness(0.7)",
            }} />
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(180deg, rgba(10,10,10,0.2) 0%, rgba(10,10,10,0.05) 40%, rgba(10,10,10,0.75) 100%)",
            }} />
          </div>
          <div style={{
            position: "relative", zIndex: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            minHeight: "calc(100vh - 80px)", padding: "0 24px",
          }}>
            <h1 style={{
              fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 400,
              fontSize: "clamp(48px, 9vw, 128px)", lineHeight: 1.05,
              letterSpacing: "-0.02em", color: "#ffffff", textAlign: "center",
              maxWidth: "16ch", textShadow: "0 4px 48px rgba(0,0,0,0.5)", margin: 0,
            }}>
              what the fuck is{" "}
              <em style={{ color: "#00ffd5", fontStyle: "normal" }}>origio</em>?
            </h1>
          </div>
          <div style={{
            position: "absolute", left: "50%", bottom: 52,
            transform: "translateX(-50%)", zIndex: 10,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            color: "rgba(240,240,232,0.5)",
          }}>
            <span style={{ fontFamily: "Satoshi, sans-serif", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase" }}>scroll</span>
            <div style={{ width: 1, height: 36, background: "linear-gradient(180deg, rgba(240,240,232,0.5), transparent)" }} />
          </div>
        </section>

        {/* ── STORY ── */}
        <section style={{ position: "relative", padding: "96px 24px", background: "#0a0a0a" }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <FadeIn>
              <span style={{
                fontFamily: "Satoshi, sans-serif", fontSize: 11, letterSpacing: "0.2em",
                textTransform: "uppercase", color: "#00ffd5",
                borderBottom: "2px solid #00ffd5", paddingBottom: 4,
                display: "inline-block", marginBottom: 32,
              }}>the story</span>
            </FadeIn>
            <FadeIn delay={80}>
              <p style={{
                fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: "clamp(20px, 2.8vw, 30px)",
                lineHeight: 1.55, color: "#f0f0e8", fontWeight: 400, margin: "0 0 32px",
              }}>
                Origio was built by{" "}
                <em style={{ color: "#00ffd5", fontStyle: "normal" }}>Shlok Mestry</em>{" "}
                after spending weeks manually researching countries to move to and
                realising there was no single place that had all the information needed
                to make a proper decision.
              </p>
            </FadeIn>
            <FadeIn delay={160}>
              <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 17, lineHeight: 1.75, color: "rgba(240,240,232,0.72)", margin: "0 0 24px" }}>
                The core feature is the interactive <strong style={{ color: "#f0f0e8" }}>3D globe</strong> — click any country to instantly see how it stacks up across every dimension that matters. No more bouncing between Numbeo, Expatistan, and government visa websites trying to piece together a picture.
              </p>
            </FadeIn>
            <FadeIn delay={240}>
              <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 17, lineHeight: 1.75, color: "rgba(240,240,232,0.72)", margin: 0 }}>
                If you're not sure where to start, the{" "}
                <strong style={{ color: "#f0f0e8" }}>Find My Country</strong> quiz asks 8 questions about your priorities, job, passport, and budget — then scores all 25 countries and gives you a personalised ranked list.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* ── NOT ANOTHER NUMBEO ── */}
        <section style={{
          position: "relative", padding: "96px 24px",
          borderTop: "1px solid #1a1a1a", background: "#0a0a0a",
        }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            <FadeIn>
              <div style={{ marginBottom: 56 }}>
                <span style={{
                  fontFamily: "Satoshi, sans-serif", fontSize: 11, letterSpacing: "0.2em",
                  textTransform: "uppercase", color: "rgba(240,240,232,0.3)",
                  display: "inline-block", marginBottom: 20,
                }}>the problem</span>
                <h2 style={{
                  fontFamily: "'Cabinet Grotesk', sans-serif",
                  fontSize: "clamp(36px, 5.5vw, 80px)",
                  lineHeight: 1.0, letterSpacing: "-0.025em",
                  color: "#f0f0e8", fontWeight: 400, margin: 0,
                }}>
                  why not just use{" "}
                  <em style={{ color: "rgba(240,240,232,0.35)", fontStyle: "normal", textDecoration: "line-through", textDecorationColor: "rgba(255,60,60,0.5)" }}>Numbeo</em>?
                </h2>
              </div>
            </FadeIn>
            <FadeIn delay={80}>
              <NewspaperSpoof />
            </FadeIn>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section style={{
          position: "relative", padding: "96px 24px",
          borderTop: "1px solid #1a1a1a", background: "#0a0a0a",
        }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <FadeIn>
              <div style={{
                display: "flex", alignItems: "baseline",
                justifyContent: "space-between", flexWrap: "wrap",
                gap: 16, marginBottom: 72,
              }}>
                <h2 style={{
                  fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: "clamp(40px, 6vw, 88px)",
                  lineHeight: 1, letterSpacing: "-0.02em",
                  color: "#f0f0e8", fontWeight: 400, margin: 0,
                }}>
                  how does this <em style={{ color: "#00ffd5", fontStyle: "normal" }}>work</em>?
                </h2>
                <span style={{
                  fontFamily: "Satoshi, sans-serif", fontSize: 11,
                  letterSpacing: "0.2em", textTransform: "uppercase",
                  color: "rgba(240,240,232,0.35)",
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
                    fontFamily: "system-ui, sans-serif", fontSize: 15, fontWeight: 600,
                    color: "#f0f0e8", textDecoration: "none", letterSpacing: "0.04em",
                    borderBottom: "1px solid rgba(240,240,232,0.3)", paddingBottom: 2,
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

        {/* ── THE ALGORITHM ── */}
        <section style={{
          position: "relative", padding: "96px 24px",
          borderTop: "1px solid #1a1a1a", background: "#0a0a0a",
        }}>
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            <FadeIn>
              <div style={{ marginBottom: 64 }}>
                <span style={{
                  fontFamily: "Satoshi, sans-serif", fontSize: 11, letterSpacing: "0.2em",
                  textTransform: "uppercase", color: "rgba(240,240,232,0.3)",
                  display: "inline-block", marginBottom: 20,
                }}>the score</span>
                <h2 style={{
                  fontFamily: "'Cabinet Grotesk', sans-serif",
                  fontSize: "clamp(36px, 5.5vw, 78px)",
                  lineHeight: 1.0, letterSpacing: "-0.025em",
                  color: "#f0f0e8", fontWeight: 400, margin: "0 0 20px",
                }}>
                  how the{" "}
                  <em style={{ color: "#00ffd5", fontStyle: "normal" }}>algorithm</em>{" "}
                  works
                </h2>
                <p style={{
                  fontFamily: "system-ui, sans-serif", fontSize: 16, lineHeight: 1.7,
                  color: "rgba(240,240,232,0.52)", maxWidth: 560, margin: 0,
                }}>
                  Every country gets a Move Score from 0–10. It's a weighted sum of five signals, each scored independently from real data. Your wizard answers shift the weights — a software engineer optimising for salary gets a different ranking than a designer who wants sun and safety.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={100}>
              <AlgorithmScribble />
            </FadeIn>

            {/* Brief factor explainers */}
            <FadeIn delay={200}>
              <div
                className="about-factor-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: 1,
                  marginTop: 56,
                  border: "1px solid #1a1a1a",
                }}
              >
                {[
                  { label: "Salary", color: "#00ffd5", desc: "Median gross for your job role in local currency, sourced from national labour stats." },
                  { label: "Cost of Living", color: "#a78bfa", desc: "Rent, groceries, transport, utilities — indexed against your salary to show real affordability." },
                  { label: "Visa Access", color: "#60a5fa", desc: "Scored by your passport, required sponsorship, processing time, and rejection risk." },
                  { label: "Quality of Life", color: "#34d399", desc: "Healthcare, internet, climate, culture — drawn from EIU, Numbeo, and WHO data." },
                  { label: "Safety", color: "#f472b6", desc: "Crime index, political stability, and expat safety reports weighted together." },
                ].map((f, i) => (
                  <div key={f.label} className="about-factor-item" style={{
                    padding: "24px 20px",
                    borderRight: i < 4 ? "1px solid #1a1a1a" : "none",
                  }}>
                    <div style={{
                      width: 6, height: 6,
                      background: f.color,
                      marginBottom: 12,
                    }} />
                    <p style={{
                      fontFamily: "Satoshi, sans-serif", fontSize: 10,
                      letterSpacing: "0.14em", textTransform: "uppercase",
                      color: f.color, margin: "0 0 8px",
                    }}>{f.label}</p>
                    <p style={{
                      fontFamily: "system-ui, sans-serif", fontSize: 13,
                      lineHeight: 1.6, color: "rgba(240,240,232,0.45)", margin: 0,
                    }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ── DATA: IMAGE ── */}
        <section style={{ position: "relative", width: "100%", minHeight: "70vh", padding: "24px 24px 0" }}>
          <div style={{
            position: "absolute", inset: "24px 24px 0 24px",
            overflow: "hidden", borderRadius: "16px 16px 0 0", background: "#0a0a0a",
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/library.jpg" alt="" style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "center 40%",
              transform: "scale(0.97)", transformOrigin: "center",
              borderRadius: "12px 12px 0 0", filter: "saturate(0.7) brightness(0.42)",
            }} />
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(180deg, rgba(10,10,10,0.35) 0%, rgba(10,10,10,0.2) 50%, rgba(10,10,10,0.95) 100%)",
            }} />
          </div>
          <div style={{
            position: "relative", zIndex: 10,
            maxWidth: 680, margin: "0 auto",
            padding: "96px 24px 80px",
            display: "flex", flexDirection: "column",
            justifyContent: "flex-end", minHeight: "70vh", gap: 20,
          }}>
            <FadeIn>
              <span style={{
                fontFamily: "Satoshi, sans-serif", fontSize: 11, letterSpacing: "0.2em",
                textTransform: "uppercase", color: "#00ffd5",
                borderBottom: "2px solid #00ffd5", paddingBottom: 4, display: "inline-block",
              }}>the data</span>
            </FadeIn>
            <FadeIn delay={80}>
              <h2 style={{
                fontFamily: "'Cabinet Grotesk', sans-serif", fontSize: "clamp(36px, 5vw, 68px)",
                lineHeight: 1.1, letterSpacing: "-0.02em",
                color: "#ffffff", fontWeight: 400, margin: 0,
                textShadow: "0 2px 24px rgba(0,0,0,0.7)",
              }}>
                where does the <em style={{ color: "#00ffd5", fontStyle: "normal" }}>data</em> come from?
              </h2>
            </FadeIn>
          </div>
        </section>

        {/* ── DATA: TEXT ── */}
        <section style={{ background: "#0a0a0a", padding: "64px 24px 96px" }}>
          <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
            <FadeIn>
              <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 17, lineHeight: 1.75, color: "rgba(240,240,232,0.75)", margin: 0 }}>
                All data is <strong style={{ color: "#f0f0e8" }}>manually researched and verified</strong> from primary sources. Salary figures come from national labour statistics, recruitment platform reports, and industry salary surveys. Cost of living data draws from Numbeo, Expatistan, and government statistical offices.
              </p>
            </FadeIn>
            <FadeIn delay={80}>
              <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 17, lineHeight: 1.75, color: "rgba(240,240,232,0.75)", margin: 0 }}>
                Data is reviewed and updated regularly. Each country page shows the{" "}
                <strong style={{ color: "#f0f0e8" }}>last verified date</strong> so you always know how recent the information is.
              </p>
            </FadeIn>
            <FadeIn delay={160}>
              <p style={{
                fontFamily: "system-ui, sans-serif", fontSize: 13, lineHeight: 1.7,
                color: "rgba(240,240,232,0.38)",
                borderLeft: "2px solid rgba(240,240,232,0.12)",
                paddingLeft: 16, margin: 0,
              }}>
                All salary figures are in local currency unless otherwise stated. Origio is not financial or legal advice — always verify with official sources before making decisions.
              </p>
            </FadeIn>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}