/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useRef, useState } from "react";
import Footer from "@/components/Footer";
import Nav from "@/components/Nav";
import Link from "next/link";

// ─── Hooks ─────────────────────────────────────────────────────────────────

function useInView(threshold = 0.15) {
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

// ─── Animated heading: staggered word reveal ───────────────────────────────

function AnimatedHeading({ text, className }: { text: string; className?: string }) {
  const { ref, inView } = useInView(0.1);
  const words = text.split(" ");
  return (
    <h1
      ref={ref}
      className={className}
      style={{ overflow: "hidden" }}
      aria-label={text}
    >
      {words.map((word, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            marginRight: "0.3em",
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(18px)",
            transition: `opacity 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 80}ms, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 80}ms`,
          }}
        >
          {word}
        </span>
      ))}
    </h1>
  );
}

// ─── Animated paragraph: fade in on scroll ────────────────────────────────

function FadeParagraph({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, inView } = useInView(0.1);
  return (
    <p
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </p>
  );
}

// ─── Count-up number ──────────────────────────────────────────────────────

function CountUp({ target, inView }: { target: number; inView: boolean }) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const duration = 900;
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [inView, target]);
  return <>{String(value).padStart(2, "0")}</>;
}

// ─── Step card ────────────────────────────────────────────────────────────

function StepCard({
  step, title, desc, index, inView,
}: {
  step: string; title: string; desc: string; index: number; inView: boolean;
}) {
  return (
    <div
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.55s cubic-bezier(0.16,1,0.3,1) ${index * 120}ms, transform 0.55s cubic-bezier(0.16,1,0.3,1) ${index * 120}ms`,
      }}
      className={`p-6 ${index < 2 ? "border-b-2 sm:border-b-0 sm:border-r-2 border-[#2a2a2a]" : ""}`}
    >
      <p className="font-heading text-4xl font-extrabold text-accent/30 mb-3 data-num">
        <CountUp target={parseInt(step, 10)} inView={inView} />
      </p>
      <p className="font-heading font-bold text-text-primary text-sm uppercase tracking-tight mb-2">{title}</p>
      <p className="text-text-muted text-xs leading-relaxed">{desc}</p>
    </div>
  );
}

// ─── Grain overlay ────────────────────────────────────────────────────────

function GrainOverlay() {
  return (
    <svg
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 9999,
        opacity: 0.025,
      }}
    >
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  );
}

// ─── Scroll section wrapper ────────────────────────────────────────────────

function ScrollSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const { ref, inView } = useInView(0.1);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transition: "opacity 0.6s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {children}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────

export default function AboutPage() {
  // Steps section uses a single inView for stagger coordination
  const { ref: stepsRef, inView: stepsInView } = useInView(0.1);

  const steps = [
    { step: "01", title: "Explore the Globe", desc: "Click any country pin to see salaries, costs, visa routes, and quality of life scores instantly." },
    { step: "02", title: "Find My Country", desc: "Answer 8 questions about your role, passport, and priorities to get a personalised country ranking." },
    { step: "03", title: "Go deeper", desc: "Compare countries side by side, check your take-home pay, and read role-specific relocation guides." },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-text-primary">
      <GrainOverlay />
      <Nav countries={[]} onCountrySelect={() => {}} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">

        {/* ── Header ── */}
        <div className="mb-12 border-b-2 border-[#2a2a2a] pb-8">
          <ScrollSection>
            <p className="text-xs font-bold text-accent uppercase tracking-widest mb-3">About</p>
          </ScrollSection>
          <AnimatedHeading
            text="What is Origio?"
            className="font-heading text-4xl sm:text-5xl font-extrabold uppercase tracking-tight mb-3"
          />
          <ScrollSection>
            <p className="text-text-muted text-sm font-medium leading-relaxed max-w-xl">
              A relocation research tool built for people who want real data before making a real move.
            </p>
          </ScrollSection>
        </div>

        {/* ── Story ── */}
        <section className="mb-12">
          <ScrollSection>
            <h2 className="font-heading text-lg font-extrabold text-text-primary uppercase tracking-tight mb-5 border-l-2 border-accent pl-3">
              The story
            </h2>
          </ScrollSection>
          <div className="space-y-4 text-text-muted text-sm leading-relaxed border-2 border-[#2a2a2a] p-6">
            <FadeParagraph delay={0}>
              Origio was built by Shlok Mestry after spending weeks manually researching countries to move to and realising
              there was no single place that had all the information needed to make a proper decision.
            </FadeParagraph>
            <FadeParagraph delay={100}>
              The core feature is the interactive 3D globe ~ click any country to instantly see how it stacks up across
              every dimension that matters. No more bouncing between Numbeo, Expatistan, and government visa websites
              trying to piece together a picture.
            </FadeParagraph>
            <FadeParagraph delay={200}>
              If you&apos;re not sure where to start, the Find My Country quiz asks 8 questions about your priorities, job,
              passport, and budget then scores all 25 countries and gives you a personalised ranked list.
            </FadeParagraph>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="mb-12">
          <ScrollSection>
            <h2 className="font-heading text-lg font-extrabold text-text-primary uppercase tracking-tight mb-5 border-l-2 border-accent pl-3">
              How it works
            </h2>
          </ScrollSection>
          <div ref={stepsRef} className="grid sm:grid-cols-3 gap-0 border-2 border-[#2a2a2a]">
            {steps.map((item, i) => (
              <StepCard
                key={item.step}
                step={item.step}
                title={item.title}
                desc={item.desc}
                index={i}
                inView={stepsInView}
              />
            ))}
          </div>
        </section>

        {/* ── Data sources ── */}
        <section className="mb-12">
          <ScrollSection>
            <h2 className="font-heading text-lg font-extrabold text-text-primary uppercase tracking-tight mb-5 border-l-2 border-accent pl-3">
              Where does the data come from?
            </h2>
          </ScrollSection>
          <div className="space-y-4 text-text-muted text-sm leading-relaxed border-2 border-[#2a2a2a] p-6">
            <FadeParagraph delay={0}>
              All data is manually researched and verified from primary sources. Salary figures come from national labour
              statistics, recruitment platform reports, and industry salary surveys. Cost of living data draws from Numbeo,
              Expatistan, and government statistical offices.
            </FadeParagraph>
            <FadeParagraph delay={100}>
              Data is reviewed and updated regularly. Each country page shows the last verified date so you always know
              how recent the information is.
            </FadeParagraph>
            <ScrollSection>
              <div className="border-l-2 border-accent pl-4 text-xs text-text-muted mt-4">
                All salary figures are in local currency unless otherwise stated. Origio is not financial or legal advice —
                always verify with official sources before making decisions.
              </div>
            </ScrollSection>
          </div>
        </section>

        {/* ── CTA ── */}
        <ScrollSection>
          <div
            className="border-2 border-accent p-8 text-center"
            style={{ boxShadow: "6px 6px 0 #00ffd5" }}
          >
            <h3 className="font-heading text-xl font-extrabold text-text-primary uppercase tracking-tight mb-2">
              Ready to find your country?
            </h3>
            <p className="text-text-muted text-sm mb-6 max-w-sm mx-auto">
              Start with the globe or answer 8 questions to get your personalised ranking.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/wizard"
                className="cta-button px-6 py-3 text-sm font-bold uppercase tracking-wide inline-flex items-center justify-center"
              >
                Find My Country
              </Link>
              <Link
                href="/"
                className="ghost-button px-6 py-3 text-sm font-bold uppercase tracking-wide inline-flex items-center justify-center"
              >
                Explore the Globe
              </Link>
            </div>
          </div>
        </ScrollSection>

        <Footer />
      </main>
    </div>
  );
}