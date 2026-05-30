"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  X, DollarSign, Home, Shield, Wifi, Heart, Plane,
  TrendingUp, Receipt, ChevronDown, ChevronUp, ArrowRightLeft,
} from "lucide-react";
import { CountryWithData, JobRole, JOB_ROLES } from "@/types";
import { getScoreColor, getScoreBreakdown, getVisaLabel } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { JobRoleIcon } from "@/components/JobRoleIcon";

interface CountryPanelProps {
  country: CountryWithData | null;
  onClose: () => void;
  selectedRole: JobRole;
  onRoleChange: (role: JobRole) => void;
}

function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: "$", EUR: "€", GBP: "£", AUD: "A$", CAD: "C$",
    NZD: "NZ$", CHF: "CHF ", SGD: "S$", AED: "AED ",
    NOK: "kr ", SEK: "kr ", JPY: "¥", INR: "₹", BRL: "R$",
    MYR: "RM ", DKK: "kr ",
  };
  return symbols[currency] ?? currency + " ";
}

const SCORE_ICONS: Record<string, any> = {
  Salary: DollarSign,
  Affordability: Home,
  "Quality of Life": Heart,
  Safety: Shield,
  "Visa Access": Plane,
  "Tax Efficiency": Receipt,
};

// Matches screenshot: colored bars, right-aligned scores
const SCORE_BAR_COLORS = [
  "#00ffd5", // Salary      — cyan
  "#00d97e", // Affordability — green
  "#a78bfa", // Quality of Life — purple
  "#60a5fa", // Safety — blue
  "#fbbf24", // Visa Access — amber
  "#f472b6", // Tax Efficiency — pink
];

export default function CountryPanel({ country, onClose, selectedRole, onRoleChange }: CountryPanelProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [roleDropOpen, setRoleDropOpen] = useState(false);
  const roleDropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (roleDropRef.current && !roleDropRef.current.contains(e.target as Node)) {
        setRoleDropOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (country) requestAnimationFrame(() => setIsVisible(true));
    else setIsVisible(false);
  }, [country]);

  if (!country) return null;

  const { data } = country;
  const currencySymbol = getCurrencySymbol(country.currency);
  const scoreBreakdown = getScoreBreakdown(data);
  const currentRole = JOB_ROLES.find((r) => r.key === selectedRole) ?? JOB_ROLES[0];
  const currentSalary = data[currentRole.salaryKey] as number;

  const handleClose = () => { setIsVisible(false); setTimeout(onClose, 300); };
  const handleCompare = () => router.push("/compare?a=" + country.slug);
  const handleFullReport = () => router.push("/country/" + country.slug);

  return (
    <>
      {/* Responsive styles */}
      <style>{`
        @media (max-width: 560px) {
          .cp-body-grid { grid-template-columns: 1fr !important; }
          .cp-cost-grid  { grid-template-columns: 1fr 1fr !important; }
          .cp-cta-grid   { grid-template-columns: 1fr !important; }
          .cp-modal      { max-height: calc(100vh - 64px) !important; border-radius: 16px 16px 0 0 !important; }
          .cp-wrap       { padding: 64px 0 0 !important; align-items: flex-end !important; }
        }
      `}</style>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(2px)",
          transition: "opacity 0.3s ease",
          opacity: isVisible ? 1 : 0,
          pointerEvents: isVisible ? "auto" : "none",
        }}
      />

      {/* Modal container — centered */}
      <div
        className="cp-wrap"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 51,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 1rem 1rem",
          pointerEvents: "none",
        }}
      >
        <div
          className="cp-modal"
          style={{
            pointerEvents: "auto",
            width: "100%",
            maxWidth: "clamp(300px, 95vw, 680px)",
            maxHeight: "calc(100vh - 96px)",
            overflowY: "auto",
            overscrollBehavior: "contain",
            background: "#111111",
            border: "1px solid #2a2a2a",
            boxShadow: "0 0 0 1px #1a1a1a, 8px 8px 0 #000000",
            transition: "opacity 0.3s ease, transform 0.3s ease",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "scale(1) translateY(0)" : "scale(0.97) translateY(8px)",
          }}
        >
          {/* ── HEADER ── */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px 16px",
            borderBottom: "1px solid #2a2a2a",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <span style={{ fontSize: "2rem", lineHeight: 1 }}>{country.flagEmoji}</span>
              <div>
                <h2 style={{
                  margin: 0,
                  fontFamily: "var(--font-heading, 'Cabinet Grotesk', sans-serif)",
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: "#f0f0e8",
                  textTransform: "uppercase",
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}>
                  {country.name}
                </h2>
                <p style={{
                  margin: "4px 0 0",
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "#666",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                }}>
                  {country.continent} · {country.language}
                </p>
              </div>
            </div>

            {/* Score pill */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                border: "2px solid #2a2a2a",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "#0f0f0f",
              }}>
                <span style={{
                  fontFamily: "var(--font-heading, 'Cabinet Grotesk', sans-serif)",
                  fontSize: "1.25rem",
                  fontWeight: 800,
                  color: "#f0f0e8",
                  lineHeight: 1,
                }}>
                  {data.moveScore}
                </span>
                <span style={{ fontSize: "9px", color: "#666", fontWeight: 700, marginTop: "2px" }}>/10</span>
              </div>
              <button
                onClick={handleClose}
                style={{
                  background: "none",
                  border: "1px solid #2a2a2a",
                  color: "#666",
                  cursor: "pointer",
                  padding: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "color 0.15s, border-color 0.15s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#f0f0e8"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#f0f0e8"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "#666"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#2a2a2a"; }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* ── BODY ── */}
          <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Top two-col: Move Score bar + Score Breakdown */}
            <div className="cp-body-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

              {/* Left: Move Score + Job Role + Salary */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

                {/* Move Score big */}
                <div>
                  <p style={{ margin: "0 0 6px", fontSize: "10px", fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Move Score
                  </p>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", marginBottom: "8px" }}>
                    <span style={{
                      fontFamily: "var(--font-heading, 'Cabinet Grotesk', sans-serif)",
                      fontSize: "2.5rem",
                      fontWeight: 800,
                      color: "#f0f0e8",
                      lineHeight: 1,
                    }}>
                      {data.moveScore}
                    </span>
                    <span style={{ fontSize: "12px", color: "#555", fontWeight: 700, marginBottom: "4px" }}>/10</span>
                  </div>
                  {/* Score bar */}
                  <div style={{ height: "4px", background: "#1a1a1a", width: "100%" }}>
                    <div style={{
                      height: "100%",
                      width: `${(data.moveScore / 10) * 100}%`,
                      background: "#00ffd5",
                      transition: "width 0.6s ease",
                    }} />
                  </div>
                </div>

                {/* Job role selector */}
                <div>
                  <p style={{ margin: "0 0 6px", fontSize: "10px", fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Job Role
                  </p>
                  <div ref={roleDropRef} style={{ position: "relative" }}>
                    {/* Trigger */}
                    <button
                      type="button"
                      onClick={() => setRoleDropOpen(o => !o)}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 8,
                        padding: "8px 10px", background: "#0f0f0f",
                        border: "1px solid #2a2a2a", color: "#f0f0e8",
                        fontSize: "12px", fontWeight: 600, cursor: "pointer",
                        textAlign: "left", borderRadius: 0,
                      }}
                    >
                      <JobRoleIcon roleKey={selectedRole} size={16} color="#00ffd5" />
                      <span style={{ flex: 1 }}>{currentRole.label}</span>
                      <ChevronDown size={12} style={{ color: "#555", flexShrink: 0, transform: roleDropOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
                    </button>
                    {/* Dropdown list */}
                    {roleDropOpen && (
                      <div style={{
                        position: "absolute", top: "calc(100% + 2px)", left: 0, right: 0,
                        background: "#0f0f0f", border: "1px solid #2a2a2a",
                        zIndex: 200, maxHeight: 260, overflowY: "auto",
                      }}>
                        {JOB_ROLES.map((r) => (
                          <button
                            key={r.key}
                            type="button"
                            onClick={() => { onRoleChange(r.key as JobRole); setRoleDropOpen(false); }}
                            style={{
                              width: "100%", display: "flex", alignItems: "center", gap: 10,
                              padding: "8px 12px", background: r.key === selectedRole ? "rgba(0,255,213,0.07)" : "transparent",
                              border: "none", borderBottom: "1px solid #1a1a1a",
                              color: r.key === selectedRole ? "#00ffd5" : "#f0f0e8",
                              fontSize: "12px", fontWeight: 600, cursor: "pointer",
                              textAlign: "left",
                            }}
                          >
                            <JobRoleIcon roleKey={r.key} size={15} color={r.key === selectedRole ? "#00ffd5" : "#888"} />
                            {r.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Salary */}
                <div>
                  <p style={{ margin: "0 0 4px", fontSize: "10px", fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    {currentRole.label} Salary
                  </p>
                  <p style={{
                    margin: 0,
                    fontFamily: "var(--font-heading, 'Cabinet Grotesk', sans-serif)",
                    fontSize: "1.6rem",
                    fontWeight: 800,
                    color: "#f0f0e8",
                    lineHeight: 1,
                  }}>
                    {currencySymbol}{currentSalary.toLocaleString()}
                  </p>
                  <p style={{ margin: "3px 0 0", fontSize: "10px", color: "#555", fontWeight: 600 }}>
                    per year · {country.currency}
                  </p>
                </div>
              </div>

              {/* Right: Score Breakdown */}
              <div>
                <p style={{ margin: "0 0 10px", fontSize: "10px", fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Score Breakdown
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {scoreBreakdown.map((item, i) => {
                    const barColor = SCORE_BAR_COLORS[i] ?? item.color;
                    return (
                      <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "10px", fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em", width: "90px", flexShrink: 0 }}>
                          {item.label}
                        </span>
                        <div style={{ flex: 1, height: "3px", background: "#1a1a1a" }}>
                          <div style={{
                            height: "100%",
                            width: `${(item.value / item.maxValue) * 100}%`,
                            background: barColor,
                          }} />
                        </div>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: barColor, width: "24px", textAlign: "right", flexShrink: 0 }}>
                          {Math.round(item.value * 10) / 10}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Visa */}
            <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: "16px" }}>
              <p style={{ margin: "0 0 8px", fontSize: "10px", fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Visa
              </p>
              <p style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: 700, color: "#f0f0e8" }}>
                {getVisaLabel(data.visaDifficulty)}
              </p>
              <p style={{ margin: "0 0 10px", fontSize: "12px", color: "#666", lineHeight: 1.5 }}>
                {data.visaNotes}
              </p>
              {data.visaPopularRoutes?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {data.visaPopularRoutes.map((route) => (
                    <span key={route} style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "3px 8px",
                      border: "1px solid #00ffd5",
                      color: "#00ffd5",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}>
                      {route}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Cost of Living grid — always visible, matches screenshot */}
            <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: "16px" }}>
              <p style={{ margin: "0 0 10px", fontSize: "10px", fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Cost of Living
              </p>
              <div className="cp-cost-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {[
                  { label: "Rent (1BR)", value: currencySymbol + data.costRentCityCentre.toLocaleString() + "/mo" },
                  { label: "Meal Out", value: currencySymbol + data.costEatingOut.toLocaleString() },
                  { label: "Transport", value: currencySymbol + data.costTransportMonthly.toLocaleString() + "/mo" },
                  { label: "Groceries", value: currencySymbol + data.costGroceriesMonthly.toLocaleString() + "/mo" },
                ].map((item) => (
                  <div key={item.label} style={{
                    background: "#0f0f0f",
                    border: "1px solid #1a1a1a",
                    padding: "12px 14px",
                  }}>
                    <p style={{ margin: "0 0 4px", fontSize: "9px", fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      {item.label}
                    </p>
                    <p style={{
                      margin: 0,
                      fontFamily: "var(--font-heading, 'Cabinet Grotesk', sans-serif)",
                      fontSize: "1.1rem",
                      fontWeight: 800,
                      color: "#f0f0e8",
                    }}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="cp-cta-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", borderTop: "1px solid #1a1a1a", paddingTop: "16px" }}>
              <button
                onClick={handleFullReport}
                style={{
                  padding: "14px 0",
                  background: "#f0f0e8",
                  border: "none",
                  color: "#0a0a0a",
                  fontSize: "12px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  cursor: "pointer",
                  fontFamily: "var(--font-heading, 'Cabinet Grotesk', sans-serif)",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#00ffd5")}
                onMouseLeave={e => (e.currentTarget.style.background = "#f0f0e8")}
              >
                View Country Page
              </button>
              <button
                onClick={handleCompare}
                style={{
                  padding: "14px 0",
                  background: "transparent",
                  border: "1px solid #2a2a2a",
                  color: "#f0f0e8",
                  fontSize: "12px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  cursor: "pointer",
                  fontFamily: "var(--font-heading, 'Cabinet Grotesk', sans-serif)",
                  transition: "border-color 0.15s, color 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#f0f0e8"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a2a2a"; }}
              >
                Compare Countries
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}