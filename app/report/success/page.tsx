"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, CheckCircle } from "lucide-react";
import { CountryMatch, WizardAnswers, TO_USD, getPassportStrength, PASSPORT_TIER_LABEL, resolveEffectivePassports } from "@/lib/wizard";
import { JOB_ROLES } from "@/types";
import { getVisaLabel } from "@/lib/utils";

const SERIF = "'Cabinet Grotesk', sans-serif";
const SANS  = "'Satoshi', system-ui, sans-serif";
const BG    = "#0a0a0a";
const MINT  = "#00ffd5";
const DIM   = "#888880";
const LINE  = "#1f1f1f";

const TO_USD_MAP = TO_USD;

function fmt(n: number, currency: string) {
  const sym: Record<string, string> = {
    USD: "$", EUR: "€", GBP: "£", AUD: "A$", CAD: "C$",
    NZD: "NZ$", CHF: "CHF ", SGD: "S$", AED: "AED ", NOK: "kr ",
    SEK: "kr ", JPY: "¥", INR: "₹", BRL: "R$", MYR: "RM ", DKK: "kr ",
  };
  return (sym[currency] ?? currency + " ") + Math.round(n).toLocaleString();
}

function toUSD(amount: number, currency: string) {
  return amount * (TO_USD_MAP[currency] ?? 1);
}

function visa(d: number) {
  return getVisaLabel(d);
}

function ReportSuccessInner() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");

  const [verified, setVerified] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [matches, setMatches] = useState<CountryMatch[]>([]);
  const [answers, setAnswers] = useState<Partial<WizardAnswers>>({});

  // Verify payment
  useEffect(() => {
    if (!sessionId) { setError("No session found."); return; }
    fetch(`/api/verify-payment?session_id=${sessionId}`)
      .then(r => r.json())
      .then(d => {
        if (d.paid) setVerified(true);
        else setError("Payment not confirmed. Contact support.");
      })
      .catch(() => setError("Could not verify payment."));
  }, [sessionId]);

  // Load wizard results from sessionStorage
  useEffect(() => {
    try {
      const m = sessionStorage.getItem("wizardMatches");
      const a = sessionStorage.getItem("wizardAnswers");
      if (m) setMatches(JSON.parse(m).slice(0, 5));
      if (a) setAnswers(JSON.parse(a));
    } catch { /* ignore */ }
  }, []);

  const handleDownload = () => {
    // Use browser print dialog — works everywhere, user can save as PDF
    window.print();
  };

  const jobRole = JOB_ROLES.find(r => r.key === answers.jobRole);

  const passportLabel = (() => {
    if (!answers.passport) return null;
    const { primary, secondary } = resolveEffectivePassports(
      answers.passport.toLowerCase(),
      (answers.secondPassport ?? "").toLowerCase() || undefined,
    );
    const tier = Math.min(getPassportStrength(primary), secondary ? getPassportStrength(secondary) : 4) as 1|2|3|4;
    return { primary, secondary, tier, label: PASSPORT_TIER_LABEL[tier] };
  })();

  if (error) return (
    <main style={{ minHeight: "100vh", background: BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: SANS, padding: 32 }}>
      <p style={{ color: "#ef4444", fontSize: 14, marginBottom: 16 }}>{error}</p>
      <Link href="/wizard/results" style={{ color: MINT, fontSize: 13, textDecoration: "none" }}>← Back to results</Link>
    </main>
  );

  if (!verified) return (
    <main style={{ minHeight: "100vh", background: BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: SANS }}>
      <p style={{ color: DIM, fontSize: 13 }}>Confirming payment…</p>
    </main>
  );

  return (
    <main style={{ minHeight: "100vh", background: BG, fontFamily: SANS, padding: "40px 20px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <Link href="/wizard/results" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: DIM, textDecoration: "none" }}>
            <ArrowLeft size={13} /> Back to results
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#4ade80", fontWeight: 700 }}>
            <CheckCircle size={14} /> Payment confirmed
          </div>
        </div>

        {/* Download button */}
        <div style={{ marginBottom: 28, textAlign: "center" }}>
          <button onClick={handleDownload}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: MINT, color: BG, border: "none", borderRadius: 100, padding: "13px 28px", fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: "0.06em" }}>
            <Download size={14} /> Save as PDF
          </button>
          <p style={{ fontSize: 11, color: DIM, marginTop: 8 }}>Saves as an image. Use your browser's Print to save as PDF.</p>
        </div>

        {/* Report */}
        <div id="origio-report" style={{ background: "#0d0d0d", border: `1px solid ${LINE}`, borderRadius: 16, overflow: "hidden", padding: 40 }}>

          {/* Cover */}
          <div style={{ marginBottom: 36, paddingBottom: 28, borderBottom: `1px solid ${LINE}` }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: MINT, marginBottom: 12 }}>origio · personalised report</p>
            <h1 style={{ fontFamily: SERIF, fontSize: 32, color: "#f0f0e8", marginBottom: 12, lineHeight: 1.15 }}>
              Your top relocation<br />matches
            </h1>
            {passportLabel && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", background: passportLabel.tier === 1 ? "rgba(0,255,213,0.12)" : "rgba(255,255,255,0.06)", color: passportLabel.tier === 1 ? MINT : DIM, border: `1px solid ${passportLabel.tier === 1 ? "rgba(0,255,213,0.25)" : "rgba(255,255,255,0.1)"}`, borderRadius: 100, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Tier {passportLabel.tier} passport
                </span>
                {passportLabel.secondary && (
                  <span style={{ fontSize: 11, color: DIM }}>Dual passport active</span>
                )}
              </div>
            )}
            {jobRole && (
              <p style={{ fontSize: 13, color: DIM }}>{jobRole.label} · {answers.moveReason ?? "Relocation"}</p>
            )}
            <p style={{ fontSize: 11, color: "#555", marginTop: 8 }}>Generated {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>

          {/* Matches */}
          {matches.length === 0 ? (
            <p style={{ color: DIM, fontSize: 13 }}>No results found. Run the quiz first.</p>
          ) : matches.map((m, i) => {
            const d = m.country.data;
            const currency = m.country.currency;
            const salaryRaw = jobRole ? d[jobRole.salaryKey] as number : d.salarySoftwareEngineer;
            const salaryUSD = toUSD(salaryRaw, currency);
            const rentUSD   = toUSD(d.costRentCityCentre, currency);
            const rankColor = i === 0 ? MINT : i === 1 ? "#facc15" : i === 2 ? "#a78bfa" : DIM;

            return (
              <div key={m.country.slug} style={{ marginBottom: 28, paddingBottom: 28, borderBottom: i < matches.length - 1 ? `1px solid ${LINE}` : "none" }}>
                {/* Title row */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontFamily: SERIF, fontSize: 22, color: rankColor, minWidth: 28 }}>#{i + 1}</span>
                    <div>
                      <h2 style={{ fontFamily: SERIF, fontSize: 22, color: "#f0f0e8", marginBottom: 2 }}>{m.country.name}</h2>
                      <p style={{ fontSize: 11, color: DIM }}>{visa(d.visaDifficulty)}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontFamily: SERIF, fontSize: 24, color: rankColor }}>{m.matchPercent}%</p>
                    <p style={{ fontSize: 10, color: DIM, letterSpacing: "0.08em", textTransform: "uppercase" }}>match</p>
                  </div>
                </div>

                {/* Stats grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                  {[
                    { label: "Avg salary", value: fmt(salaryRaw, currency) + "/yr" },
                    { label: "City rent", value: fmt(d.costRentCityCentre, currency) + "/mo" },
                    { label: "Income tax", value: d.incomeTaxRateMid + "%" },
                    { label: "Safety", value: d.scoreSafety + "/10" },
                    { label: "Quality of life", value: d.scoreQualityOfLife + "/10" },
                    { label: "Salary (USD)", value: "$" + Math.round(salaryUSD / 1000) + "k/yr" },
                  ].map(s => (
                    <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${LINE}`, borderRadius: 8, padding: "10px 14px" }}>
                      <p style={{ fontSize: 10, color: DIM, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>{s.label}</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "#f0f0e8" }}>{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Footer */}
          <div style={{ marginTop: 16, paddingTop: 20, borderTop: `1px solid ${LINE}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: 10, color: "#333", letterSpacing: "0.1em", textTransform: "uppercase" }}>findorigio.com</p>
            <p style={{ fontSize: 10, color: "#333" }}>Data for reference only. Always verify with official sources.</p>
          </div>
        </div>

      </div>
    </main>
  );
}


export default function ReportSuccessPage() {
  return (
    <Suspense fallback={<main style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ color: "#888880", fontSize: 13, fontFamily: "sans-serif" }}>Loading…</p></main>}>
      <ReportSuccessInner />
    </Suspense>
  );
}
