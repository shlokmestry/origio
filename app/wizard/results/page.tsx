// app/wizard/results/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Globe, Lock, Sparkles, X } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { CountryMatch, WizardAnswers, TO_USD, getPassportStrength, PASSPORT_TIER_LABEL, resolveEffectivePassports, scoreCountriesForWizard } from "@/lib/wizard";
import { JOB_ROLES, CountryWithData } from "@/types";
import { getVisaLabel } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

// ── Design tokens ──────────────────────────────────────────────────────────
const SERIF = "'Cabinet Grotesk', sans-serif";
const SANS  = "'Satoshi', system-ui, sans-serif";
const MONO  = "'Cabinet Grotesk', 'Satoshi', sans-serif";
const BG    = "#0e0d0c";
const FG    = "#f0f0e8";
const MINT  = "#00ffd5";
const DIM   = "#888880";
const LINE  = "#1f1f1f";
const PANEL = "#0f0f0f";

// ── Constants ──────────────────────────────────────────────────────────────
const LOADING_STEPS = [
  "Crunching salary data...",
  "Checking visa routes...",
  "Weighing your priorities...",
  "Ranking 25 countries...",
  "Almost done...",
];
const RANK_COLORS = [MINT, "#facc15", "#a78bfa"];

// ── Helpers ────────────────────────────────────────────────────────────────
function matchPercentColor(pct: number): string {
  if (pct >= 90) return "#4ade80";
  if (pct >= 75) return "#facc15";
  return DIM;
}

function scoreColor(v: number): string {
  if (v >= 7) return MINT;
  if (v >= 5) return "#facc15";
  return "#ef4444";
}

function getCurrencySymbol(currency: string): string {
  const s: Record<string, string> = {
    USD: "$", EUR: "€", GBP: "£", AUD: "A$", CAD: "C$",
    NZD: "NZ$", CHF: "CHF ", SGD: "S$", AED: "AED ",
    NOK: "kr ", SEK: "kr ", JPY: "¥", INR: "₹", BRL: "R$",
    MYR: "RM ", DKK: "kr ",
  };
  return s[currency] ?? currency + " ";
}

function toUSD(amount: number, currency: string): number {
  return amount * (TO_USD[currency] ?? 1);
}

function normalise(value: number, min: number, max: number): number {
  return Math.max(0, Math.min(10, ((value - min) / (max - min)) * 10));
}

function computeScoreBreakdown(country: CountryWithData, answers: Partial<WizardAnswers>, jobRoleDef: typeof JOB_ROLES[0] | undefined) {
  const data = country.data;
  const rentUSD = toUSD(data.costRentCityCentre, country.currency);
  const salaryRaw = jobRoleDef ? data[jobRoleDef.salaryKey] as number : data.salarySoftwareEngineer;
  const salaryUSD = toUSD(salaryRaw, country.currency);
  return {
    salary:        { label: "Salary",          value: normalise(salaryUSD, 25000, 200000), desc: `${getCurrencySymbol(country.currency)}${salaryRaw.toLocaleString()}/yr` },
    affordability: { label: "Affordability",   value: 10 - normalise(rentUSD, 300, 4000),  desc: `${getCurrencySymbol(country.currency)}${data.costRentCityCentre.toLocaleString()}/mo rent` },
    tax:           { label: "Tax efficiency",  value: 10 - normalise(data.incomeTaxRateMid, 0, 55), desc: `${data.incomeTaxRateMid}% income tax` },
    safety:        { label: "Safety",          value: data.scoreSafety,                    desc: `${data.scoreSafety}/10 safety score` },
    quality:       { label: "Quality of life", value: data.scoreQualityOfLife,             desc: `${data.scoreQualityOfLife}/10 QoL score` },
    visa:          { label: "Visa access",     value: 10 - data.visaDifficulty * 2,        desc: getVisaLabel(data.visaDifficulty) + " visa process" },
  };
}

function generateSummary(match: CountryMatch, answers: Partial<WizardAnswers>, scores: ReturnType<typeof computeScoreBreakdown>, rank: number): string {
  const name = match.country.name;
  const entries = Object.entries(scores).sort((a, b) => b[1].value - a[1].value);
  const top2 = entries.slice(0, 2).map(([, v]) => v.label.toLowerCase());
  const bottom1 = entries[entries.length - 1];
  const rankWord = rank === 1 ? "your top match" : rank === 2 ? "your second match" : `#${rank}`;
  let summary = `${name} is ${rankWord} because it scores strongly on ${top2[0]} and ${top2[1]} for your profile.`;
  if (bottom1[1].value < 4) summary += ` The main trade-off is ${bottom1[1].label.toLowerCase()} — ${bottom1[1].desc}.`;
  if (answers.moveReason === "retire") summary += ` Strong fit for retirement given its cost and tax profile.`;
  else if (answers.moveReason === "remote") summary += ` Internet speeds and nomad visa availability make it a solid remote work base.`;
  return summary;
}

function computeExcluded(matchSlugs: string[], answers: Partial<WizardAnswers>): { name: string; reason: string }[] {
  const dealBreakers = answers.dealBreakers ?? [];
  const excluded: { name: string; reason: string }[] = [];
  const REASON_MAP: Record<string, string> = {
    lowtax: "high income tax", lowcost: "high cost of living",
    europe: "not in Europe", english: "not English-speaking",
    warm: "cold climate", lowcrime: "crime rate too high",
    nomadvisa: "no digital nomad visa", healthcare: "weak public healthcare",
  };
  const SLUG_TO_NAME: Record<string, string> = {
    "australia": "Australia", "canada": "Canada", "norway": "Norway",
    "singapore": "Singapore", "switzerland": "Switzerland", "new-zealand": "New Zealand",
    "sweden": "Sweden", "germany": "Germany", "ireland": "Ireland",
    "united-kingdom": "United Kingdom", "netherlands": "Netherlands",
    "france": "France", "finland": "Finland", "belgium": "Belgium",
    "denmark": "Denmark", "austria": "Austria", "italy": "Italy",
    "usa": "USA", "japan": "Japan", "india": "India",
    "uae": "UAE", "brazil": "Brazil", "malaysia": "Malaysia",
    "portugal": "Portugal", "spain": "Spain", "poland": "Poland",
  };
  const current = (answers.currentCountry ?? answers.passport)?.toLowerCase().trim();
  if (current && SLUG_TO_NAME[current] && !matchSlugs.includes(current)) {
    excluded.push({ name: SLUG_TO_NAME[current], reason: "your current country" });
  }
  dealBreakers.forEach((db) => {
    if (db === "none") return;
    const reason = REASON_MAP[db] ?? db;
    if (db === "lowtax") {
      ["australia","canada","norway","sweden","germany","ireland","united-kingdom","netherlands","france","finland","belgium","denmark","austria","italy","new-zealand"]
        .filter(s => !matchSlugs.includes(s) && SLUG_TO_NAME[s]).slice(0, 3)
        .forEach(s => excluded.push({ name: SLUG_TO_NAME[s], reason }));
    }
    if (db === "lowcost") {
      ["singapore","switzerland","norway","australia","new-zealand","ireland","united-kingdom","usa","canada"]
        .filter(s => !matchSlugs.includes(s) && SLUG_TO_NAME[s]).slice(0, 3)
        .forEach(s => excluded.push({ name: SLUG_TO_NAME[s], reason }));
    }
    if (db === "europe") {
      ["australia","canada","usa","uae","singapore","japan","india","brazil","malaysia"]
        .filter(s => !matchSlugs.includes(s) && SLUG_TO_NAME[s]).slice(0, 3)
        .forEach(s => excluded.push({ name: SLUG_TO_NAME[s], reason }));
    }
  });
  const seen = new Set<string>();
  return excluded.filter(e => { if (seen.has(e.name)) return false; seen.add(e.name); return true; });
}

// ── Score bar ──────────────────────────────────────────────────────────────
function ScoreBar({ label, value, desc }: { label: string; value: number; desc: string }) {
  const pct = (value / 10) * 100;
  const color = scoreColor(value);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: DIM }}>{label}</span>
        <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color }}>{value.toFixed(1)}/10</span>
      </div>
      <div style={{ height: 2, background: "#111", width: "100%" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, transition: "width 0.7s ease" }} />
      </div>
      <p style={{ fontFamily: MONO, fontSize: 9, color: "#333", marginTop: 2 }}>{desc}</p>
    </div>
  );
}

// ── Why toggle ─────────────────────────────────────────────────────────────
function WhyToggle({ match, answers, jobRoleDef, rank }: {
  match: CountryMatch; answers: Partial<WizardAnswers>; jobRoleDef: typeof JOB_ROLES[0] | undefined; rank: number;
}) {
  const [open, setOpen] = useState(false);
  const scores = computeScoreBreakdown(match.country, answers, jobRoleDef);
  const summary = generateSummary(match, answers, scores, rank);
  return (
    <div style={{ marginTop: 12 }}>
      <button onClick={e => { e.preventDefault(); setOpen(!open); }} style={{
        background: "none", border: "none", cursor: "pointer",
        fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase",
        color: "#444", display: "flex", alignItems: "center", gap: 4, transition: "color 0.15s",
      }}
        onMouseEnter={e => (e.currentTarget.style.color = DIM)}
        onMouseLeave={e => (e.currentTarget.style.color = "#444")}>
        Why this match? {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      {open && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${LINE}` }}>
          <p style={{ fontFamily: SANS, fontSize: 11, color: DIM, lineHeight: 1.65, marginBottom: 14 }}>{summary}</p>
          {Object.values(scores).map(s => <ScoreBar key={s.label} label={s.label} value={s.value} desc={s.desc} />)}
        </div>
      )}
    </div>
  );
}

// ── Take-home card ─────────────────────────────────────────────────────────
function TakeHomeCard({ match, jobRoleDef, isPro }: {
  match: CountryMatch; jobRoleDef: typeof JOB_ROLES[0] | undefined; isPro: boolean;
}) {
  if (!jobRoleDef) return null;
  const cs = getCurrencySymbol(match.country.currency);
  const gross = match.country.data[jobRoleDef.salaryKey] as number;
  const taxRate = match.country.data.incomeTaxRateMid / 100;
  const taxAmount = Math.round(gross * taxRate);
  const netAnnual = gross - taxAmount;
  const netMonthly = Math.round(netAnnual / 12);
  const rent = match.country.data.costRentCityCentre;
  const groceries = match.country.data.costGroceriesMonthly;
  const transport = match.country.data.costTransportMonthly;
  const totalCosts = rent + groceries + transport;
  const disposable = netMonthly - totalCosts;

  const rowStyle = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px", borderBottom: `1px solid ${LINE}` };
  const labelStyle = { fontFamily: MONO, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: DIM };
  const valStyle = { fontFamily: SERIF, fontSize: 16, color: FG };

  return (
    <div style={{ border: `1px solid #2a2a2a`, background: PANEL, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderBottom: `1px solid ${LINE}`, background: BG }}>
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: DIM }}>
          Estimated take-home · {jobRoleDef.label} · {match.country.name}
        </span>
        <span style={{ fontFamily: MONO, fontSize: 10, color: "#444", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Take-home · {match.country.data.incomeTaxRateMid}%
        </span>
      </div>
      <div style={{ padding: "16px 18px 0" }}>
        <p style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: DIM, marginBottom: 6 }}>
          In {match.country.name}
        </p>
        <h3 style={{ fontFamily: SERIF, fontSize: 26, fontWeight: 400, letterSpacing: "-0.01em", color: FG, margin: 0 }}>
          In <em style={{ color: MINT, fontStyle: "normal" }}>{match.country.name}</em>
        </h3>
      </div>
      <div style={{ padding: "8px 0" }}>
        <div style={rowStyle}>
          <span style={labelStyle}>Gross salary</span>
          <span style={valStyle}>{cs}{gross.toLocaleString()}/yr</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Income tax ({match.country.data.incomeTaxRateMid}%)</span>
          <span style={{ ...valStyle, color: "#ef4444" }}>−{cs}{taxAmount.toLocaleString()}</span>
        </div>
        <div style={{ height: 1, background: "#2a2a2a", margin: "2px 0" }} />
        <div style={rowStyle}>
          <span style={{ ...labelStyle, color: FG }}>Net annual</span>
          <span style={{ fontFamily: SERIF, fontSize: 20, color: MINT }}>{cs}{netAnnual.toLocaleString()}/yr</span>
        </div>
        <div style={{ ...rowStyle, borderBottom: "none" }}>
          <span style={{ ...labelStyle, color: FG }}>Net monthly</span>
          <span style={{ fontFamily: SERIF, fontSize: 20, color: MINT }}>{cs}{netMonthly.toLocaleString()}/mo</span>
        </div>
        <div style={{ position: "relative" }}>
          <div style={{ filter: isPro ? "none" : "blur(4px)", opacity: isPro ? 1 : 0.15, pointerEvents: isPro ? "auto" : "none", userSelect: isPro ? "auto" : "none" }}>
            <div style={rowStyle}>
              <span style={labelStyle}>Rent + food + transport</span>
              <span style={{ ...valStyle, color: "#ef4444" }}>−{cs}{totalCosts.toLocaleString()}/mo</span>
            </div>
            <div style={{ ...rowStyle, borderBottom: "none" }}>
              <span style={{ ...labelStyle, color: FG }}>Disposable / mo</span>
              <span style={{ fontFamily: SERIF, fontSize: 22, color: disposable > 0 ? "#4ade80" : "#ef4444" }}>{cs}{disposable.toLocaleString()}</span>
            </div>
          </div>
          {!isPro && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px", background: "rgba(10,10,10,0.5)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Lock size={12} style={{ color: DIM }} />
                <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: DIM }}>Full breakdown</span>
              </div>
              <Link href="/pro" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: MINT, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                Pro →
              </Link>
            </div>
          )}
        </div>
      </div>
      <div style={{ padding: "10px 18px", borderTop: `1px solid ${LINE}` }}>
        <p style={{ fontFamily: MONO, fontSize: 9, color: "#333", lineHeight: 1.6, margin: 0 }}>
          * Estimate based on mid-bracket income tax rate. Social security, local taxes, and deductions vary. Verify with official sources before relocating.
        </p>
      </div>
    </div>
  );
}

// ── Session expired screen ─────────────────────────────────────────────────
function SessionExpired() {
  const router = useRouter();
  return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28, padding: "0 24px", textAlign: "center" }}>
      <span style={{ fontSize: 48 }}>🌍</span>
      <div>
        <h2 style={{ fontFamily: SERIF, fontSize: "clamp(28px,5vw,42px)", fontWeight: 400, color: FG, margin: "0 0 12px", letterSpacing: "-0.02em" }}>
          Your session <em style={{ color: MINT, fontStyle: "normal" }}>expired</em>
        </h2>
        <p style={{ fontFamily: SANS, fontSize: 14, color: DIM, lineHeight: 1.7, maxWidth: 340, margin: "0 auto" }}>
          We couldn't find your results — this usually happens after a page refresh or opening from a new tab. Retake the quiz to see your matches again (takes 2 minutes).
        </p>
      </div>
      <button
        onClick={() => router.push("/wizard")}
        style={{
          fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase",
          padding: "13px 28px", background: MINT, color: BG, border: "none",
          borderRadius: 0, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8,
          boxShadow: "0 4px 20px rgba(0,255,213,0.25)",
        }}>
        Retake quiz →
      </button>
    </div>
  );
}

// ── Save results banner — only shown to logged-out users ───────────────────
function SaveResultsBanner() {
  const [signingIn, setSigningIn] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/wizard/results` },
      });
    } catch {
      setSigningIn(false);
    }
  };

  if (dismissed) return null;

  return (
    <div
      className="save-banner"
      style={{
        background: "#0d0d0d",
        borderBottom: `1px solid #2a2a2a`,
        padding: "13px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 15 }}>💾</span>
        <span style={{ fontFamily: SANS, fontSize: 13, color: FG, fontWeight: 600 }}>
          Save your ranking
        </span>
        <span style={{ fontFamily: SANS, fontSize: 13, color: DIM }}>
          — sign in so you can come back to your results anytime
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          onClick={handleGoogleSignIn}
          disabled={signingIn}
          style={{
            fontFamily: SANS, fontSize: 13, fontWeight: 600,
            padding: "8px 16px",
            background: FG, color: "#111",
            border: "none", cursor: signingIn ? "not-allowed" : "pointer",
            display: "inline-flex", alignItems: "center", gap: 8,
            opacity: signingIn ? 0.7 : 1,
            transition: "opacity 0.15s",
            flexShrink: 0,
          }}
        >
          {/* Google G SVG */}
          <svg width="14" height="14" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          {signingIn ? "Signing in…" : "Sign in with Google"}
        </button>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#333", padding: "8px", display: "flex", alignItems: "center",
            transition: "color 0.15s", flexShrink: 0,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = DIM)}
          onMouseLeave={e => (e.currentTarget.style.color = "#333")}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

// ── Country role label ─────────────────────────────────────────────────────
function getCountryRoleLabel(m: CountryMatch, jobRoleDef: typeof JOB_ROLES[0] | undefined, allMatches: CountryMatch[]): string {
  const d = m.country.data;
  const salary = jobRoleDef ? d[jobRoleDef.salaryKey] as number : 0;
  const salaryUSD = salary * (TO_USD[m.country.currency] ?? 1);
  const topSalaryUSD = allMatches.slice(0, 5).reduce((max, x) => {
    const s = jobRoleDef ? x.country.data[jobRoleDef.salaryKey] as number : 0;
    return Math.max(max, s * (TO_USD[x.country.currency] ?? 1));
  }, 0);
  if (salaryUSD >= topSalaryUSD * 0.97) return "Best salary";
  if (d.visaDifficulty <= 1) return "Fastest visa";
  if (d.incomeTaxRateMid <= 12) return "Low tax";
  if (d.costRentCityCentre <= 800) return "Lowest cost";
  if (d.scoreSafety >= 8.5) return "Safest";
  if (d.scoreQualityOfLife >= 8.5) return "Best QoL";
  if (m.country.language === "English") return "English-speaking";
  return "";
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function WizardResultsPage() {
  const router = useRouter();
  const [matches, setMatches]         = useState<CountryMatch[]>([]);
  const [answers, setAnswers]         = useState<Partial<WizardAnswers>>({});
  const [isLoading, setIsLoading]     = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [revealed, setRevealed]       = useState(false);
  const [user, setUser]               = useState<User | null>(null);
  const [isPro, setIsPro]             = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

  // Auth — also listens for post-OAuth redirect sign-in
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data } = await supabase.from("profiles").select("is_pro").eq("id", session.user.id).single();
        setIsPro(data?.is_pro ?? false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
        const { data } = await supabase.from("profiles").select("is_pro").eq("id", session.user.id).single();
        setIsPro(data?.is_pro ?? false);
        // auto-save fires via the save useEffect below once user state updates
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function load() {
      const raw        = sessionStorage.getItem("wizardMatches");
      const answersRaw = sessionStorage.getItem("wizardAnswers");

      if (raw) {
        try {
          setMatches(JSON.parse(raw));
          if (answersRaw) setAnswers(JSON.parse(answersRaw));
        } catch {
          setSessionExpired(true);
          setIsLoading(false);
          return;
        }
      } else {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: result } = await supabase
              .from("wizard_results")
              .select("answers, top_countries")
              .eq("user_id", session.user.id)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();

            if (result?.top_countries && result.top_countries.length > 0) {
              if (result.answers) setAnswers(result.answers);
              setSessionExpired(true);
              setIsLoading(false);
              return;
            }
          }
        } catch (err) {
          console.error("Supabase fallback failed:", err);
        }

        setSessionExpired(true);
        setIsLoading(false);
        return;
      }

      let progress = 0, stepIndex = 0;
      const interval = setInterval(() => {
        progress += 2;
        setLoadingProgress(progress);
        if (progress % 20 === 0 && stepIndex < LOADING_STEPS.length - 1) { stepIndex++; setLoadingStep(stepIndex); }
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => { setIsLoading(false); setTimeout(() => setRevealed(true), 100); }, 400);
        }
      }, 30);
      return () => clearInterval(interval);
    }

    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save whenever user becomes available (including post-OAuth redirect)
  useEffect(() => {
    if (!isLoading && matches.length > 0 && user) {
      const save = async () => {
        try {
          const topCountries = matches.slice(0, 25).map(m => ({
            slug: m.country.slug, name: m.country.name,
            flagEmoji: m.country.flagEmoji, matchPercent: m.matchPercent, reasons: m.reasons,
          }));
          await supabase.from("wizard_results").insert({ user_id: user.id, top_countries: topCountries, answers, created_at: new Date().toISOString() });
          // Fire email — no await, don't block UI
          fetch('/api/send-results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              top3: topCountries.slice(0, 3),
            }),
          }).catch(() => {})
        } catch (err) { console.error("Failed to save:", err); }
      };
      save();
    }
  }, [isLoading, matches, user, answers]);

  const handleViewOnGlobe = () => {
    sessionStorage.setItem("highlightedCountries", JSON.stringify(matches.slice(0, 3).map(m => m.country.slug)));
    sessionStorage.setItem("wizardMatches", JSON.stringify(matches));
    router.push("/");
  };

  const handleReportCheckout = async () => {
    setReportLoading(true);
    try {
      const body: Record<string, string> = {};
      if (user?.email) body.email = user.email;
      const res = await fetch("/api/checkout-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (data.url) { window.location.href = data.url; return; }
      console.error("[checkout-report]", data.error ?? res.status);
    } catch (e) { console.error("[checkout-report]", e); }
    setReportLoading(false);
  };

  // ── Loading screen ─────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 36, padding: "0 24px" }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: MINT, boxShadow: `0 0 16px ${MINT}`, animation: "pulse 1.2s ease-in-out infinite" }} />
        <style>{`@keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.6);opacity:0.5}}`}</style>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: MINT, marginBottom: 12 }}>◆ Computing</p>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(28px,5vw,48px)", fontWeight: 400, letterSpacing: "-0.02em", color: FG, margin: 0 }}>
            Finding your <em style={{ color: MINT, fontStyle: "normal" }}>country…</em>
          </h2>
        </div>
        <div style={{ width: "100%", maxWidth: 320 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <p key={loadingStep} style={{ fontFamily: SANS, fontSize: 13, color: DIM, margin: 0 }}>{LOADING_STEPS[loadingStep]}</p>
            <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", color: MINT }}>{loadingProgress}%</span>
          </div>
          <div style={{ height: 1, background: LINE, width: "100%" }}>
            <div style={{ height: "100%", background: MINT, width: `${loadingProgress}%`, transition: "width 0.1s linear", boxShadow: `0 0 8px ${MINT}` }} />
          </div>
        </div>
      </div>
    );
  }

  if (sessionExpired) return <SessionExpired />;
  if (matches.length === 0) return <SessionExpired />;

  const jobRoleDef      = JOB_ROLES.find(r => r.key === answers.jobRole);
  const visibleMatches  = isPro ? matches.slice(0, 25) : matches.slice(0, 8);
  const lockedCount     = 25 - visibleMatches.length;
  const compareHref     = matches.length >= 3 ? `/compare?a=${matches[0].country.slug}&b=${matches[1].country.slug}&c=${matches[2].country.slug}` : "/compare";
  const matchSlugs      = matches.map(m => m.country.slug);
  const excludedCountries = matches.length > 0 ? computeExcluded(matchSlugs, answers) : [];

  // Passport power derived values
  const { primary: effectivePrimary, secondary: effectiveSecondary } = resolveEffectivePassports(
    (answers.passport ?? "").toLowerCase(),
    (answers.secondPassport ?? "").toLowerCase() || undefined,
  );
  const passportTier    = Math.min(getPassportStrength(effectivePrimary), effectiveSecondary ? getPassportStrength(effectiveSecondary) : 4) as 1|2|3|4;
  const rawPrimaryTier  = getPassportStrength((answers.passport ?? "").toLowerCase());
  const tierUpgraded    = !!effectiveSecondary && passportTier < rawPrimaryTier;
  const hasDualPassport = !!(answers.secondPassport);
  const EU_PASSPORT_SLUGS = new Set(["ireland","germany","france","netherlands","spain","portugal","sweden","norway","switzerland","austria","belgium","denmark","finland","italy","poland","romania"]);
  const EU_COUNTRY_SLUGS  = new Set(["germany","netherlands","portugal","spain","ireland","france","italy","united-kingdom","sweden","switzerland","norway","austria","finland","belgium","denmark","poland"]);
  // Which passport drives a given country's visa advantage
  function passportDrivingVisa(countrySlug: string): string | null {
    if (!hasDualPassport) return null;
    const p1IsEU = EU_PASSPORT_SLUGS.has(effectivePrimary);
    const p2IsEU = effectiveSecondary ? EU_PASSPORT_SLUGS.has(effectiveSecondary) : false;
    if (EU_COUNTRY_SLUGS.has(countrySlug) && !p1IsEU && p2IsEU) return effectiveSecondary ?? null;
    if (EU_COUNTRY_SLUGS.has(countrySlug) && p1IsEU) return effectivePrimary;
    const t1 = getPassportStrength(effectivePrimary);
    const t2 = effectiveSecondary ? getPassportStrength(effectiveSecondary) : 4;
    if (t2 < t1) return effectiveSecondary ?? null; // second is stronger
    return null; // primary drives it — no need to call it out
  }

  // Delta: where would top match rank without the second passport?
  const passportDelta = (() => {
    if (!hasDualPassport || !answers.secondPassport) return null;
    try {
      const countriesRaw = sessionStorage.getItem("wizardCountries");
      if (!countriesRaw) return null;
      const countries = JSON.parse(countriesRaw);
      const withoutSecond = scoreCountriesForWizard(countries, { ...answers, secondPassport: undefined } as WizardAnswers);
      const topSlug = matches[0]?.country.slug;
      const rankWithout = withoutSecond.findIndex(m => m.country.slug === topSlug) + 1;
      return rankWithout > 1 ? rankWithout : null;
    } catch { return null; }
  })();

  const top       = matches[0];
  const pctColor  = matchPercentColor(top.matchPercent);
  const cs        = getCurrencySymbol(top.country.currency);
  const topSalary = jobRoleDef ? top.country.data[jobRoleDef.salaryKey] as number : null;

  return (
    <div style={{
      minHeight: "100vh", background: BG, color: FG, fontFamily: SANS,
      opacity: revealed ? 1 : 0,
      transform: revealed ? "translateY(0)" : "translateY(16px)",
      transition: "opacity 0.5s ease, transform 0.5s ease",
    }}>
      <style>{`
        @media (max-width: 700px) {
          .res-hero    { grid-template-columns: 1fr !important; }
          .res-podium  { grid-template-columns: 1fr !important; }
          .res-stats4  { grid-template-columns: 1fr 1fr !important; }
          .res-row     { grid-template-columns: 28px 24px 1fr 44px !important; gap: 8px !important; }
          .res-row-bar { display: none !important; }
          .res-nav     { padding: 12px 18px !important; }
          .res-outer   { padding: 0 16px !important; }
          .save-banner { padding: 12px 16px !important; flex-direction: column !important; align-items: flex-start !important; }
        }
      `}</style>

      {/* ── Nav ───────────────────────────────────────────────────────────── */}
      <Nav countries={[]} onCountrySelect={() => {}} />

      {/* ── Save results banner — only for logged-out users ────────────────── */}
      {!user && <SaveResultsBanner />}

      <div className="res-outer" style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px 0", position: "relative", zIndex: 1 }}>

        {/* ── HERO ────────────────────────────────────────────────────────── */}
        <section className="res-hero" style={{ padding: "56px 0 48px", borderBottom: `1px solid ${LINE}`, display: "grid", gridTemplateColumns: "1fr 320px", gap: "48px 52px", alignItems: "start" }}>
          <div>
            <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: DIM, marginBottom: hasDualPassport ? 14 : 28, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: MINT }}>●</span> Top match{jobRoleDef ? ` · ${jobRoleDef.label}` : ""}
            </p>
            {hasDualPassport && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "7px 14px", border: `1px solid rgba(0,255,213,0.2)`, marginBottom: 28, flexWrap: "wrap" }}>
                <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: MINT }}>Passport power</span>
                <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: MINT }}>TIER {passportTier}</span>
                <span style={{ width: 1, height: 12, background: "rgba(0,255,213,0.2)" }} />
                <span style={{ fontFamily: MONO, fontSize: 10, color: DIM }}>{PASSPORT_TIER_LABEL[passportTier].split("—")[1]?.trim()}</span>
                {tierUpgraded && <span style={{ fontFamily: MONO, fontSize: 10, color: MINT }}>↑ from Tier {rawPrimaryTier}</span>}
                {passportDelta && (
                  <>
                    <span style={{ width: 1, height: 12, background: "rgba(0,255,213,0.2)" }} />
                    <span style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,200,50,0.8)" }}>
                      Without second passport: #{passportDelta}
                    </span>
                  </>
                )}
              </div>
            )}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 16 }}>
              <span style={{ fontSize: 64, lineHeight: 1, flexShrink: 0 }}>{top.country.flagEmoji}</span>
              <h1 style={{ fontFamily: SERIF, fontSize: "clamp(48px,7vw,84px)", fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 0.92, margin: 0, color: FG }}>
                {top.country.name}
              </h1>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 16 }}>
              <span style={{ fontFamily: SERIF, fontSize: 48, color: pctColor }}>{top.matchPercent}%</span>
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: DIM }}>match for your profile</span>
            </div>
            <p style={{ fontFamily: SANS, fontSize: 15, color: "rgba(240,240,232,0.7)", lineHeight: 1.7, marginBottom: 24, maxWidth: 480 }}>
              {(() => {
                const scores = computeScoreBreakdown(top.country, answers, jobRoleDef);
                return generateSummary(top, answers, scores, 1);
              })()}
            </p>
            {topSalary && (
              <div className="res-stats4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: LINE, marginBottom: 24 }}>
                {[
                  { label: "Salary", value: `${cs}${topSalary.toLocaleString()}` },
                  { label: "Tax", value: `${top.country.data.incomeTaxRateMid}%` },
                  { label: "Rent / mo", value: `${cs}${top.country.data.costRentCityCentre.toLocaleString()}` },
                  { label: "Visa", value: getVisaLabel(top.country.data.visaDifficulty) },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: BG, padding: "14px 16px" }}>
                    <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: DIM, marginBottom: 6 }}>{label}</div>
                    <div style={{ fontFamily: SERIF, fontSize: 20, color: FG }}>{value}</div>
                  </div>
                ))}
              </div>
            )}
            {top.reasons.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 28 }}>
                {top.reasons.map(r => (
                  <span key={r} style={{
                    fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase",
                    padding: "6px 10px", borderLeft: `2px solid ${MINT}`,
                    background: "rgba(0,255,213,0.04)", color: MINT,
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <span style={{ color: MINT, fontSize: 8 }}>✦</span> {r}
                  </span>
                ))}
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <Link href={`/country/${top.country.slug}/personalised`} style={{
                fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase",
                padding: "13px 28px", background: MINT, color: BG, textDecoration: "none",
                display: "inline-flex", alignItems: "center", gap: 8,
                boxShadow: `3px 3px 0 #00aa90`, transition: "transform .1s, box-shadow .1s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translate(-1px,-1px)"; e.currentTarget.style.boxShadow = "4px 4px 0 #00aa90"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "3px 3px 0 #00aa90"; }}>
                View full report <ArrowRight size={14} />
              </Link>
              <button onClick={handleViewOnGlobe} style={{
                fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase",
                background: "none", border: "none", color: DIM, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6, padding: 0,
                borderBottom: `1px solid #2a2a2a`, paddingBottom: 2, transition: "color .1s, border-color .1s",
              }}
                onMouseEnter={e => { e.currentTarget.style.color = FG; e.currentTarget.style.borderColor = "#555"; }}
                onMouseLeave={e => { e.currentTarget.style.color = DIM; e.currentTarget.style.borderColor = "#2a2a2a"; }}>
                <Globe size={12} /> See on globe
              </button>
              <Link href="/salary-calculator" style={{
                fontFamily: MONO, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
                color: DIM, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4,
                borderBottom: '1px solid #2a2a2a', paddingBottom: 1, transition: 'color .12s',
              }}
                onMouseEnter={e => (e.currentTarget.style.color = FG)}
                onMouseLeave={e => (e.currentTarget.style.color = DIM)}>
                Calculate exact take-home →
              </Link>
            </div>
          </div>
          <div style={{ position: "sticky", top: 80 }}>
            <TakeHomeCard match={top} jobRoleDef={jobRoleDef} isPro={isPro} />
          </div>
        </section>

        {/* ── PODIUM ──────────────────────────────────────────────────────── */}
        <section style={{ padding: "52px 0", borderBottom: `1px solid ${LINE}` }}>
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: DIM, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>◆ Podium</p>
            <h2 style={{ fontFamily: SERIF, fontSize: "clamp(32px,5vw,52px)", fontWeight: 400, letterSpacing: "-0.01em", margin: 0, color: FG }}>
              Your <em style={{ fontStyle: "normal" }}>top three</em>
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 1, background: LINE }}>
            {/* #1 — dominant */}
            <div style={{ background: BG, padding: "28px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <span style={{ fontFamily: MONO, fontSize: 10, color: DIM }}>01</span>
                <span style={{ fontSize: 40 }}>{matches[0].country.flagEmoji}</span>
                <div>
                  <div style={{ fontFamily: SERIF, fontSize: 28, color: FG, marginBottom: 4 }}>{matches[0].country.name}</div>
                  {(() => { const driver = passportDrivingVisa(matches[0].country.slug); return driver ? (
                    <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: MINT, marginBottom: 4, opacity: 0.8 }}>✦ visa via {driver} passport</div>
                  ) : null; })()}
                  <div style={{ fontFamily: MONO, fontSize: 10, color: DIM, letterSpacing: "0.14em" }}>
                    {jobRoleDef ? `${getCurrencySymbol(matches[0].country.currency)}${(matches[0].country.data[jobRoleDef.salaryKey] as number).toLocaleString()}/yr · ${getVisaLabel(matches[0].country.data.visaDifficulty)} visa` : ""}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                <span style={{ fontFamily: SERIF, fontSize: 40, color: matchPercentColor(matches[0].matchPercent) }}>{matches[0].matchPercent}%</span>
                <Link href={`/country/${matches[0].country.slug}/personalised`} style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: MINT, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                  Report →
                </Link>
              </div>
            </div>
            {/* #2 and #3 — quieter */}
            <div className="res-podium" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: LINE }}>
              {matches.slice(1, 3).map((m, i) => {
                const salary = jobRoleDef ? m.country.data[jobRoleDef.salaryKey] as number : null;
                const mcs = getCurrencySymbol(m.country.currency);
                return (
                  <div key={m.country.slug} style={{ background: BG, padding: "20px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <span style={{ fontFamily: MONO, fontSize: 10, color: DIM }}>{String(i + 2).padStart(2, "0")}</span>
                      <span style={{ fontFamily: SERIF, fontSize: 18, color: matchPercentColor(m.matchPercent) }}>{m.matchPercent}%</span>
                    </div>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{m.country.flagEmoji}</div>
                    <div style={{ fontFamily: SERIF, fontSize: 18, color: FG, marginBottom: 6 }}>{m.country.name}</div>
                    {(() => { const driver = passportDrivingVisa(m.country.slug); return driver ? (
                      <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: MINT, marginBottom: 6, opacity: 0.8 }}>✦ visa via {driver} passport</div>
                    ) : null; })()}
                    {salary && <div style={{ fontFamily: MONO, fontSize: 10, color: DIM, letterSpacing: "0.1em" }}>{mcs}{salary.toLocaleString()}/yr · {getVisaLabel(m.country.data.visaDifficulty)} visa</div>}
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${LINE}` }}>
                      <Link href={`/country/${m.country.slug}/personalised`} style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: DIM, textDecoration: "none", display: "flex", alignItems: "center", gap: 4, transition: "color .12s" }}
                        onMouseEnter={e => (e.currentTarget.style.color = FG)}
                        onMouseLeave={e => (e.currentTarget.style.color = DIM)}>
                        Report →
                      </Link>
                    </div>
                    <WhyToggle match={m} answers={answers} jobRoleDef={jobRoleDef} rank={i + 2} />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── AT A GLANCE ─────────────────────────────────────────────────── */}
        <section style={{ padding: "52px 0", borderBottom: `1px solid ${LINE}` }}>
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: DIM, marginBottom: 10 }}>Analysis</p>
            <h2 style={{ fontFamily: SERIF, fontSize: "clamp(32px,5vw,52px)", fontWeight: 400, letterSpacing: "-0.01em", margin: 0, color: FG }}>
              What your results say
            </h2>
          </div>
          {(() => {
            const topReasons = top.reasons.slice(0, 2);
            const reasonsText = topReasons.length > 0 ? topReasons.join(" and ") : "your stated priorities";
            const strongestText = `${top.country.flagEmoji} ${top.country.name} leads because it scores highest on ${reasonsText}.`;
            const topScores = computeScoreBreakdown(top.country, answers, jobRoleDef);
            const bottomMetric = Object.values(topScores).sort((a, b) => a.value - b.value)[0];
            const tradeoffText = `The trade-off: ${bottomMetric.label} is lower than your other matches. ${bottomMetric.desc}.`;
            return (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 1, background: LINE }}>
                <div style={{ background: BG, padding: "24px 28px" }}>
                  <p style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: DIM, marginBottom: 12 }}>Strongest signal</p>
                  <p style={{ fontFamily: SANS, fontSize: 15, color: FG, lineHeight: 1.6, margin: 0 }}>{strongestText}</p>
                </div>
                <div style={{ background: BG, padding: "24px 28px", borderLeft: `1px solid ${LINE}` }}>
                  <p style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: DIM, marginBottom: 12 }}>Main trade-off</p>
                  <p style={{ fontFamily: SANS, fontSize: 15, color: "rgba(240,240,232,0.6)", lineHeight: 1.6, margin: 0 }}>{tradeoffText}</p>
                </div>
              </div>
            );
          })()}
        </section>

        {/* ── FULL RANKING ────────────────────────────────────────────────── */}
        <section style={{ padding: "52px 0 80px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28 }}>
            <div>
              <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: DIM, marginBottom: 10 }}>◆ The ranking</p>
              <h2 style={{ fontFamily: SERIF, fontSize: "clamp(32px,5vw,52px)", fontWeight: 400, letterSpacing: "-0.01em", margin: 0, color: FG }}>
                All <em style={{ fontStyle: "normal" }}>twenty-five</em>
              </h2>
            </div>
            <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: DIM }}>
              {visibleMatches.length} of 25 visible
            </span>
          </div>
          <div style={{ borderTop: `1px solid ${LINE}` }}>
            {visibleMatches.map((m, i) => {
              const mcs    = getCurrencySymbol(m.country.currency);
              const salary = jobRoleDef ? m.country.data[jobRoleDef.salaryKey] as number : null;
              const isTop3 = i < 3;
              return (
                <div key={m.country.slug} style={isTop3 ? { borderLeft: `2px solid ${RANK_COLORS[i]}` } : {}}>
                  <Link href={`/country/${m.country.slug}/personalised`}
                    style={{
                      display: "grid", gridTemplateColumns: "36px 28px 1fr 140px 52px",
                      alignItems: "center", gap: 14, padding: "14px 10px",
                      borderBottom: `1px solid #0f0f0f`, textDecoration: "none",
                      transition: "background 0.12s",
                    }}
                    className="res-row"
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.015)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, textAlign: "right", color: isTop3 ? RANK_COLORS[i] : "#2a2a2a" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span style={{ fontSize: 20 }}>{m.country.flagEmoji}</span>
                    <div>
                      <div style={{ fontFamily: SERIF, fontSize: 15, color: FG, marginBottom: 2 }}>{m.country.name}</div>
                      {(() => {
                        const label = getCountryRoleLabel(m, jobRoleDef, matches);
                        return label ? (
                          <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "#3a3a3a", marginTop: 2, display: "block" }}>
                            {label}
                          </span>
                        ) : null;
                      })()}
                      {salary && (
                        <div style={{ fontFamily: MONO, fontSize: 10, color: "#333", letterSpacing: "0.08em" }}>
                          {mcs}{salary.toLocaleString()}/yr · {getVisaLabel(m.country.data.visaDifficulty)} visa · {mcs}{m.country.data.costRentCityCentre.toLocaleString()}/mo
                        </div>
                      )}
                    </div>
                    <div className="res-row-bar" style={{ height: 2, background: "#111", width: "100%", position: "relative" }}>
                      <div style={{
                        position: "absolute", top: 0, left: 0,
                        height: "100%", width: `${m.matchPercent}%`,
                        background: matchPercentColor(m.matchPercent),
                        boxShadow: m.matchPercent >= 90 ? `0 0 8px ${MINT}` : "none",
                      }} />
                    </div>
                    <span style={{ fontFamily: SERIF, fontSize: 15, textAlign: "right", color: matchPercentColor(m.matchPercent) }}>
                      {m.matchPercent}%
                    </span>
                  </Link>
                </div>
              );
            })}
          </div>
          {!isPro && lockedCount > 0 && (
            <div>
              {/* 3 locked rows inline */}
              {[4, 5, 6].map((n) => (
                <div key={n} style={{
                  display: "grid", gridTemplateColumns: "36px 28px 1fr 140px 52px",
                  alignItems: "center", gap: 14, padding: "14px 10px",
                  borderBottom: `1px solid #0d0d0d`,
                  opacity: 0.3, userSelect: "none", pointerEvents: "none",
                }} className="res-row">
                  <span style={{ fontFamily: MONO, fontSize: 11, textAlign: "right", color: "#2a2a2a" }}>{String(n).padStart(2, "0")}</span>
                  <Lock size={12} style={{ color: "#2a2a2a" }} />
                  <div>
                    <div style={{ height: 8, width: 80 + n * 10, background: "#1a1a1a", marginBottom: 5 }} />
                    <div style={{ height: 6, width: 50, background: "#111" }} />
                  </div>
                  <div style={{ height: 1, background: "#111", width: "100%" }} />
                  <div style={{ height: 8, width: 28, background: "#1a1a1a" }} />
                </div>
              ))}
              {/* Inline upgrade strip */}
              <div style={{
                borderTop: `1px solid ${MINT}`, borderBottom: `1px solid #1a1a1a`,
                padding: "20px 10px",
                display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
              }}>
                <div>
                  <p style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: DIM, marginBottom: 4 }}>
                    <Lock size={10} style={{ display: "inline", marginRight: 6 }} />{lockedCount} countries locked
                  </p>
                  <p style={{ fontFamily: SANS, fontSize: 14, color: FG, margin: 0 }}>
                    Salary calc · Visa checklist · 3-country compare
                  </p>
                </div>
                <Link href="/pro" style={{
                  fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
                  padding: "11px 24px", background: MINT, color: BG, textDecoration: "none",
                  display: "inline-flex", alignItems: "center", gap: 8,
                  boxShadow: "3px 3px 0 #00aa90", transition: "transform .1s, box-shadow .1s", flexShrink: 0,
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translate(-1px,-1px)"; e.currentTarget.style.boxShadow = "4px 4px 0 #00aa90"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "3px 3px 0 #00aa90"; }}>
                  Unlock all 25 — €4.99 <ArrowRight size={13} />
                </Link>
              </div>
              {/* Download report option */}
              <div style={{ padding: "12px 10px", borderBottom: `1px solid #0d0d0d` }}>
                <button onClick={handleReportCheckout} disabled={reportLoading} style={{
                  fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase",
                  color: "#444", background: "none", border: "none", cursor: reportLoading ? "default" : "pointer",
                  display: "flex", alignItems: "center", gap: 6, padding: 0, transition: "color .12s",
                }}
                  onMouseEnter={e => { if (!reportLoading) (e.currentTarget as HTMLElement).style.color = DIM; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#444"; }}>
                  ↓ {reportLoading ? "Redirecting…" : "Top 5 report only · €4.99"}
                </button>
              </div>
            </div>
          )}
          {isPro && matches.length >= 3 && (
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${LINE}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <p style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: DIM, margin: 0 }}>All 25 countries ranked for you</p>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <button onClick={handleReportCheckout} disabled={reportLoading} style={{
                  fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase",
                  color: DIM, background: "none", border: "none", borderBottom: "1px solid #2a2a2a",
                  paddingBottom: 1, cursor: reportLoading ? "default" : "pointer",
                  display: "flex", alignItems: "center", gap: 5, transition: "color .12s, border-color .12s",
                }}
                  onMouseEnter={e => { if (!reportLoading) { (e.currentTarget as HTMLElement).style.color = FG; (e.currentTarget as HTMLElement).style.borderColor = "#555"; } }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = DIM; (e.currentTarget as HTMLElement).style.borderColor = "#2a2a2a"; }}>
                  ↓ Download report · €4.99
                </button>
                <Link href={compareHref} style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: DIM, textDecoration: "none", display: "flex", alignItems: "center", gap: 6, transition: "color 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = MINT)}
                  onMouseLeave={e => (e.currentTarget.style.color = DIM)}>
                  Compare top 3 <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* ── FILTERED OUT ────────────────────────────────────────────────── */}
        {excludedCountries.length > 0 && (
          <section style={{ padding: "52px 0", borderTop: `1px solid ${LINE}` }}>
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: DIM, marginBottom: 10 }}>◆ Edge cases</p>
              <h2 style={{ fontFamily: SERIF, fontSize: "clamp(32px,5vw,52px)", fontWeight: 400, letterSpacing: "-0.01em", margin: 0, color: FG }}>
                Filtered <em style={{ fontStyle: "normal" }}>out</em>
              </h2>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 1, background: LINE }}>
              {excludedCountries.slice(0, 6).map(c => (
                <div key={c.name} style={{ background: BG, padding: "18px 20px", display: "flex", alignItems: "flex-start", gap: 10, minWidth: 220, flex: "1 1 220px" }}>
                  <X size={14} style={{ color: "#ef4444", flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <div style={{ fontFamily: SERIF, fontSize: 15, color: FG, marginBottom: 3 }}>{c.name}</div>
                    <div style={{ fontFamily: MONO, fontSize: 10, color: DIM, letterSpacing: "0.12em" }}>— {c.reason}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}