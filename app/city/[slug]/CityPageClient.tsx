"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CityFull } from "./page";

interface Props {
  city: CityFull;
}

const MODES = [
  "night", "predawn", "dawn", "morning", "day",
  "golden", "dusk", "twilight", "night",
];

const CLIMATE_DATA = [
  { month: "JAN", high: 15, rain: 11 },
  { month: "FEB", high: 16, rain: 9 },
  { month: "MAR", high: 18, rain: 8 },
  { month: "APR", high: 21, rain: 7 },
  { month: "MAY", high: 25, rain: 3 },
  { month: "JUN", high: 29, rain: 2 },
  { month: "JUL", high: 28, rain: 1 },
  { month: "AUG", high: 28, rain: 1 },
  { month: "SEP", high: 26, rain: 3 },
  { month: "OCT", high: 21, rain: 6 },
  { month: "NOV", high: 18, rain: 9 },
  { month: "DEC", high: 16, rain: 11 },
];

const getCurrencySymbol = (currency: string) => {
  const map: Record<string, string> = {
    EUR: "€", GBP: "£", USD: "$", JPY: "¥",
    SGD: "$", AUD: "$", CAD: "$", AED: "د.إ",
  };
  return map[currency] ?? currency;
};

const fmt = (n: number | null, fallback = "—") =>
  n != null ? n.toLocaleString() : fallback;

const score = (n: number | null) =>
  n != null ? n.toFixed(1) : "—";

export default function CityPageClient({ city }: Props) {
  const [currentMode, setCurrentMode] = useState("night");
  const d = city.city_data?.[0] ?? null;
  const sym = getCurrencySymbol(city.currency);

  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const progress = total > 0 ? window.scrollY / total : 0;

      const modeIndex = Math.min(
        Math.floor(progress * MODES.length),
        MODES.length - 1
      );
      setCurrentMode(MODES[modeIndex]);

      // Move sun dot
      const sun = document.querySelector<HTMLElement>(".skyrail-sun");
      if (sun) sun.style.left = `${progress * 100}%`;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.className = `mode-${currentMode}`;
    return () => { document.body.className = ""; };
  }, [currentMode]);

  const monthlyTotal = d
    ? (d.cost_rent_outside ?? 0) +
      (d.cost_utilities_monthly ?? 0) +
      (d.cost_groceries_monthly ?? 0) +
      (d.cost_transport_monthly ?? 0) +
      (d.cost_coworking_monthly ?? 0) +
      (d.cost_gym_monthly ?? 0)
    : null;

  const takeHome = d?.salary_software_engineer && d?.income_tax_rate_mid
    ? Math.round((d.salary_software_engineer * (1 - d.income_tax_rate_mid)) / 12)
    : null;

  return (
    <div className="city-page">
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --amber: #f0b07a; --terra: #d97a4e; --rose: #f87171;
          --night: #04060e; --predawn: #1a1530; --dawn: #2d1a1a;
          --day: #f1ebdc; --golden: #e8c997; --dusk: #8c4a2f; --twilight: #1f1830;
          --bg: var(--night);
          --ink: #f0ece2;
          --dim: rgba(240,236,226,0.42);
          --dimmer: rgba(240,236,226,0.16);
          --rule: rgba(240,236,226,0.1);
          --accent: var(--amber);
          --sun: #f0b07a;
        }

        body.mode-night    { --bg:var(--night);    --ink:#f0ece2; --accent:#f0b07a; --sun:#f0b07a; --dim:rgba(240,236,226,0.42); --dimmer:rgba(240,236,226,0.16); --rule:rgba(240,236,226,0.1); }
        body.mode-predawn  { --bg:var(--predawn);  --ink:#e8e0d0; --accent:#f87171; --sun:#fda4af; --dim:rgba(232,224,208,0.45); --dimmer:rgba(232,224,208,0.18); --rule:rgba(232,224,208,0.12); }
        body.mode-dawn     { --bg:var(--dawn);     --ink:#f4e4cf; --accent:#d97a4e; --sun:#f0b07a; --dim:rgba(244,228,207,0.50); --dimmer:rgba(244,228,207,0.20); --rule:rgba(244,228,207,0.14); }
        body.mode-morning  { --bg:#d4b58a;         --ink:#1a1410; --accent:#8c3a1e; --sun:#f0b07a; --dim:rgba(26,20,16,0.55);    --dimmer:rgba(26,20,16,0.22);    --rule:rgba(26,20,16,0.15); }
        body.mode-day      { --bg:var(--day);      --ink:#16140d; --accent:#9a3a16; --sun:#e87a3a; --dim:rgba(22,20,13,0.58);    --dimmer:rgba(22,20,13,0.22);    --rule:rgba(22,20,13,0.13); }
        body.mode-golden   { --bg:var(--golden);   --ink:#1a1208; --accent:#8c2d12; --sun:#d44a1e; --dim:rgba(26,18,8,0.60);     --dimmer:rgba(26,18,8,0.22);     --rule:rgba(26,18,8,0.15); }
        body.mode-dusk     { --bg:var(--dusk);     --ink:#fae8d0; --accent:#fae0a0; --sun:#fad48a; --dim:rgba(250,232,208,0.62); --dimmer:rgba(250,232,208,0.24); --rule:rgba(250,232,208,0.16); }
        body.mode-twilight { --bg:var(--twilight); --ink:#e8d8e8; --accent:#c8a8c8; --sun:#a890c0; --dim:rgba(232,216,232,0.48); --dimmer:rgba(232,216,232,0.20); --rule:rgba(232,216,232,0.14); }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: var(--bg); color: var(--ink);
          min-height: 100vh; overflow-x: hidden;
          transition: background 1.6s cubic-bezier(.4,0,.2,1), color 1s ease;
        }
        * { transition: color 1s ease, border-color 1s ease, background-color 1s ease; }

        /* NAV */
        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          background: color-mix(in srgb, var(--bg) 88%, transparent);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid var(--rule);
          height: 52px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 36px;
        }
        .nav-logo {
          text-decoration: none; color: var(--ink);
          font-size: 10px; font-weight: 800;
          letter-spacing: 0.16em; text-transform: uppercase;
        }
        .nav-center {
          font-size: 8.5px; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--ink); display: flex; align-items: center; gap: 10px;
        }
        .nav-crumb { color: var(--dimmer); }

        /* SUN RAIL */
        .skyrail {
          position: fixed; top: 80px; left: 36px; right: 36px;
          height: 36px; z-index: 50; pointer-events: none;
        }
        .skyrail-line {
          position: absolute; top: 50%; left: 0; right: 0;
          height: 1px; background: var(--rule);
        }
        .skyrail-sun {
          position: absolute; top: 50%; left: 0%;
          transform: translate(-50%, -50%);
          width: 22px; height: 22px; border-radius: 50%;
          background: var(--sun);
          box-shadow: 0 0 22px var(--sun), 0 0 4px var(--sun);
          transition: background 1s, box-shadow 1s, left 0.15s linear;
        }
        body.mode-night .skyrail-sun,
        body.mode-twilight .skyrail-sun,
        body.mode-predawn .skyrail-sun {
          background: #d8d4cc;
          box-shadow: inset -6px -3px 0 0 rgba(0,0,0,0.35), 0 0 14px rgba(216,212,204,0.4);
        }
        .skyrail-mark {
          position: absolute; top: 50%; transform: translate(-50%, -50%);
          width: 1px; height: 6px; background: var(--dimmer);
        }
        .skyrail-lbl {
          position: absolute; top: calc(50% + 10px); transform: translateX(-50%);
          font-size: 7px; font-weight: 700; letter-spacing: 0.16em;
          color: var(--dimmer);
        }

        /* LAYOUT */
        .page { max-width: 1280px; margin: 0 auto; padding: 0 36px; }

        .scene {
          display: grid;
          grid-template-columns: 88px 1fr 280px;
          gap: 56px;
          padding: 120px 0 100px;
          min-height: 90vh;
          align-items: start;
        }

        .scene-time {
          position: sticky; top: 150px;
          font-size: 9px; font-weight: 700; letter-spacing: 0.2em;
          color: var(--accent); text-transform: uppercase;
          writing-mode: vertical-rl; transform: rotate(180deg);
          align-self: start;
        }
        .scene-time .hr {
          font-family: 'DM Serif Display', Georgia, serif;
          font-style: italic; font-size: 22px;
          letter-spacing: 0; text-transform: none;
          color: var(--ink); margin-bottom: 14px; display: block;
        }
        .scene-time .rule {
          width: 1px; height: 60px; background: var(--accent);
          opacity: 0.6; margin: 12px 0 14px 50%;
          transform: translateX(-50%);
          writing-mode: horizontal-tb; display: block;
        }

        .scene-story { max-width: 640px; }

        .scene-margin { position: relative; padding-top: 6px; }
        .sticky-margin > .margin-stack { position: sticky; top: 150px; }

        /* TYPOGRAPHY */
        .scene-meta {
          font-size: 9px; font-weight: 700; letter-spacing: 0.26em;
          text-transform: uppercase; color: var(--accent);
          margin-bottom: 26px;
          display: flex; align-items: center; gap: 12px;
        }
        .scene-meta::before {
          content: ''; display: block;
          width: 24px; height: 1px;
          background: var(--accent); opacity: 0.6;
        }

        .scene-head {
          font-family: 'DM Serif Display', Georgia, serif;
          font-weight: 400; font-style: normal;
          font-size: clamp(34px, 4vw, 60px);
          line-height: 0.98; letter-spacing: -0.022em;
          color: var(--ink); margin-bottom: 28px;
        }
        .scene-head .it { font-style: italic; }
        .scene-head .ac { color: var(--accent); }

        .scene-prose {
          font-size: 17px; line-height: 1.7;
          color: var(--ink); opacity: 0.86; font-weight: 300;
        }
        .scene-prose p { margin-bottom: 22px; }
        .scene-prose p:last-child { margin-bottom: 0; }

        .pull { color: var(--accent); font-weight: 600; }

        /* MARGIN DATA */
        .marg {
          padding-bottom: 24px;
          border-bottom: 1px solid var(--rule);
          margin-bottom: 24px;
        }
        .marg:last-child { border-bottom: none; padding-bottom: 0; margin-bottom: 0; }

        .marg-lbl {
          font-size: 8px; font-weight: 700; letter-spacing: 0.16em;
          text-transform: uppercase; color: var(--dimmer); margin-bottom: 8px;
        }
        .marg-val {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 26px; color: var(--ink);
          line-height: 1; margin-bottom: 6px;
        }
        .marg-val .unit {
          font-family: inherit; font-size: 12px; font-weight: 600;
          color: var(--dim); margin-left: 4px;
          font-family: -apple-system, sans-serif;
        }
        .marg-sub { font-size: 13px; line-height: 1.5; color: var(--dim); font-weight: 300; }

        /* CLIMATE GRID */
        .climate-row {
          display: grid; grid-template-columns: repeat(12,1fr);
          gap: 6px; margin: 32px 0;
        }
        .climate-cell { display: flex; flex-direction: column; align-items: center; text-align: center; }
        .cc-mth { font-size: 7px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--dimmer); margin-bottom: 8px; }
        .cc-high { font-family: 'DM Serif Display', Georgia, serif; font-size: 14px; color: var(--ink); margin-bottom: 4px; }
        .cc-rain { font-size: 10px; font-weight: 700; color: var(--dim); }
        .cc-summer .cc-high { color: var(--accent); }

        /* DOSSIER */
        .dossier { padding: 160px 0 80px; border-top: 1px solid var(--rule); }
        .dossier-head { max-width: 640px; margin-bottom: 80px; }
        .dossier-title {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: clamp(36px, 4.2vw, 64px);
          color: var(--ink); line-height: 0.98; margin-bottom: 18px;
        }
        .dossier-intro { font-size: 15px; line-height: 1.6; color: var(--dim); }
        .df-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 32px;
        }
        .df-cell { padding-bottom: 24px; border-bottom: 1px solid var(--rule); }
        .df-lbl { font-size: 8px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: var(--dimmer); margin-bottom: 8px; }
        .df-val { font-family: 'DM Serif Display', Georgia, serif; font-size: 22px; color: var(--ink); line-height: 1; margin-bottom: 6px; }
        .df-val .unit { font-family: -apple-system, sans-serif; font-size: 12px; font-weight: 600; color: var(--dim); margin-left: 4px; }
        .df-val.ac { color: var(--accent); }
        .df-sub { font-size: 13px; color: var(--dim); line-height: 1.5; }

        /* CTA */
        .cta {
          text-align: center; padding: 100px 0 120px;
          border-top: 1px solid var(--rule);
        }
        .cta p { font-size: 16px; color: var(--dim); margin-bottom: 28px; font-weight: 300; }
        .cta-btn {
          display: inline-block; padding: 12px 28px;
          background: var(--accent); color: var(--bg);
          font-weight: 700; font-size: 12px;
          letter-spacing: 0.08em; text-transform: uppercase;
          text-decoration: none; border: 0;
          transition: all 0.2s;
        }
        .cta-btn:hover { box-shadow: 0 8px 24px rgba(0,255,213,0.25); }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .scene { grid-template-columns: 1fr; gap: 32px; }
          .scene-time {
            position: relative; top: auto;
            writing-mode: horizontal-tb; transform: none;
            display: flex; align-items: center; gap: 16px; margin-bottom: 16px;
          }
          .scene-time .hr { margin-bottom: 0; font-size: 18px; }
          .scene-time .rule { display: none; }
          .sticky-margin > .margin-stack { position: relative; top: auto; }
          nav { padding: 0 16px; }
          .page { padding: 0 16px; }
          .skyrail { left: 16px; right: 16px; }
        }
      `}</style>

      {/* NAV */}
      <nav>
        <Link href="/" className="nav-logo">ORIGIO</Link>
        <div className="nav-center">
          <a href="/cities" style={{ textDecoration: "none", color: "var(--dimmer)" }}>CITIES</a>
          <span className="nav-crumb">·</span>
          <span>{city.name.toUpperCase()}</span>
        </div>
        <div />
      </nav>

      {/* SUN RAIL */}
      <div className="skyrail">
        <div className="skyrail-line" />
        <div className="skyrail-sun" />
        {[0, 6, 12, 18, 24].map((h) => (
          <div key={h}>
            <div className="skyrail-mark" style={{ left: `${(h / 24) * 100}%` }} />
            <div className="skyrail-lbl" style={{ left: `${(h / 24) * 100}%` }}>
              {String(h).padStart(2, "0")}
            </div>
          </div>
        ))}
      </div>

      <div className="page">

        {/* SCENE 0 — OPENER */}
        <section className="scene" style={{ paddingTop: 160 }}>
          <div className="scene-time">
            <span className="hr">00:00</span>
            Filed
            <span className="rule" />
          </div>
          <div className="scene-story">
            <p className="scene-meta">Origio Dispatch · Public</p>
            <h1 className="scene-head">{city.name}.</h1>
            <p style={{ fontSize: 16, color: "var(--dim)", marginBottom: 20 }}>
              {city.flag_emoji} {city.country_name}
            </p>
            <p style={{ fontSize: 16, color: "var(--dim)", lineHeight: 1.7, fontWeight: 300 }}>
              A 24-hour field dispatch — what {city.name} costs, what it pays, and what it
              feels like to wake up here.
            </p>
          </div>
          <div className="scene-margin sticky-margin">
            <div className="margin-stack">
              {d?.move_score != null && (
                <div className="marg">
                  <p className="marg-lbl">Move Score</p>
                  <p className="marg-val">{d.move_score}<span className="unit">/10</span></p>
                  <p className="marg-sub">Cost, salary, visa, quality of life — combined.</p>
                </div>
              )}
              {city.population && (
                <div className="marg">
                  <p className="marg-lbl">Population</p>
                  <p className="marg-val" style={{ fontSize: 18 }}>{city.population}</p>
                  <p className="marg-sub">{city.timezone} · {city.language}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SCENE 1 — WAKE / RENT */}
        <section className="scene">
          <div className="scene-time">
            <span className="hr">06:48</span>
            Wake · rent
            <span className="rule" />
          </div>
          <div className="scene-story">
            <p className="scene-meta">Scene 01 · Morning · First Light</p>
            <h2 className="scene-head">
              She wakes. The apartment costs{" "}
              <span className="ac">{sym}{fmt(d?.cost_rent_city_centre)}</span>
              {" "}a month.
            </h2>
            <div className="scene-prose">
              <p>
                A one-bedroom in {city.name}, close to the centre:{" "}
                <span className="pull">{sym}{fmt(d?.cost_rent_city_centre)} / month</span>.
                The same apartment in New York would run{" "}
                <span className="pull">$4,150</span>. In Notting Hill,{" "}
                <span className="pull">£3,800</span>. In Marvila,{" "}
                <span className="pull">€950</span>.
              </p>
              <p>
                Outside the centre — twenty-five minutes on transit:{" "}
                <span className="pull">{sym}{fmt(d?.cost_rent_outside)} / month</span>.
                Utilities on top of that: <span className="pull">{sym}{fmt(d?.cost_utilities_monthly)}</span>.
              </p>
            </div>
          </div>
          <div className="scene-margin sticky-margin">
            <div className="margin-stack">
              <div className="marg">
                <p className="marg-lbl">Rent · 1BR centre</p>
                <p className="marg-val">{sym}{fmt(d?.cost_rent_city_centre)}<span className="unit">/mo</span></p>
                <p className="marg-sub">Within 15 min of city centre</p>
              </div>
              <div className="marg">
                <p className="marg-lbl">Rent · outside</p>
                <p className="marg-val">{sym}{fmt(d?.cost_rent_outside)}<span className="unit">/mo</span></p>
                <p className="marg-sub">25–35 min transit to centre</p>
              </div>
              <div className="marg">
                <p className="marg-lbl">Utilities</p>
                <p className="marg-val">{sym}{fmt(d?.cost_utilities_monthly)}<span className="unit">/mo</span></p>
                <p className="marg-sub">Power, water, internet — 1BR</p>
              </div>
            </div>
          </div>
        </section>

        {/* SCENE 2 — COMMUTE */}
        <section className="scene">
          <div className="scene-time">
            <span className="hr">08:30</span>
            Commute
            <span className="rule" />
          </div>
          <div className="scene-story">
            <p className="scene-meta">Scene 02 · Transit · On Foot</p>
            <h2 className="scene-head">
              Monthly pass: <span className="ac">{sym}{fmt(d?.cost_transport_monthly)}</span>.
              The rest <span className="it">on foot</span>.
            </h2>
            <div className="scene-prose">
              <p>
                Unlimited metro, bus, tram — <span className="pull">{sym}{fmt(d?.cost_transport_monthly)} / month</span>.
                Walkability score: <span className="pull">{score(d?.score_walkability)} / 10</span>.
                Most errands reachable on foot. Safety:{" "}
                <span className="pull">{score(d?.score_safety)} / 10</span>.
              </p>
            </div>
          </div>
          <div className="scene-margin sticky-margin">
            <div className="margin-stack">
              <div className="marg">
                <p className="marg-lbl">Transit · monthly</p>
                <p className="marg-val">{sym}{fmt(d?.cost_transport_monthly)}<span className="unit">/mo</span></p>
                <p className="marg-sub">Unlimited metro + bus + tram</p>
              </div>
              <div className="marg">
                <p className="marg-lbl">Walkability</p>
                <p className="marg-val">{score(d?.score_walkability)}<span className="unit">/10</span></p>
              </div>
              <div className="marg">
                <p className="marg-lbl">Safety</p>
                <p className="marg-val">{score(d?.score_safety)}<span className="unit">/10</span></p>
                <p className="marg-sub">Low violent crime. Petty theft in tourist zones.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SCENE 3 — WORK */}
        <section className="scene">
          <div className="scene-time">
            <span className="hr">11:00</span>
            Work
            <span className="rule" />
          </div>
          <div className="scene-story">
            <p className="scene-meta">Scene 03 · Salary · Tax</p>
            <h2 className="scene-head">
              A software engineer earns{" "}
              <span className="ac">{sym}{fmt(d?.salary_software_engineer)}</span> gross.
            </h2>
            <div className="scene-prose">
              <p>
                After {d?.income_tax_rate_mid != null ? `${(d.income_tax_rate_mid * 100).toFixed(0)}%` : "—"} income tax
                {d?.local_tax_note ? ` (plus ${d.local_tax_note})` : ""}, the take-home is{" "}
                <span className="pull">{sym}{fmt(takeHome)} / month</span>.
              </p>
              <p>
                Purchasing power here is typically 30–45% higher than Northern Europe or North America
                because cost of living is lower than the salary gap suggests.
              </p>
              {d?.visa_notes && <p>{d.visa_notes}</p>}
            </div>
          </div>
          <div className="scene-margin sticky-margin">
            <div className="margin-stack">
              <div className="marg">
                <p className="marg-lbl">Software engineer · gross</p>
                <p className="marg-val">{sym}{fmt(d?.salary_software_engineer)}<span className="unit">/yr</span></p>
              </div>
              <div className="marg">
                <p className="marg-lbl">Income tax</p>
                <p className="marg-val">
                  {d?.income_tax_rate_mid != null ? `${(d.income_tax_rate_mid * 100).toFixed(0)}` : "—"}
                  <span className="unit">%</span>
                </p>
                <p className="marg-sub">{d?.local_tax_note ?? "Standard progressive rate"}</p>
              </div>
              <div className="marg">
                <p className="marg-lbl">Take-home · monthly</p>
                <p className="marg-val">{sym}{fmt(takeHome)}<span className="unit">avg</span></p>
                <p className="marg-sub">After tax · before rent</p>
              </div>
            </div>
          </div>
        </section>

        {/* SCENE 4 — LUNCH */}
        <section className="scene">
          <div className="scene-time">
            <span className="hr">13:15</span>
            Lunch
            <span className="rule" />
          </div>
          <div className="scene-story">
            <p className="scene-meta">Scene 04 · Food · Day-to-day</p>
            <h2 className="scene-head">
              Groceries: <span className="ac">{sym}{fmt(d?.cost_groceries_monthly)} / month</span>.
              Eating out <span className="it">when the mood takes</span>.
            </h2>
            <div className="scene-prose">
              <p>
                Groceries for one, cooking most nights:{" "}
                <span className="pull">{sym}{fmt(d?.cost_groceries_monthly)} / month</span>.
                A restaurant meal for two, mid-range:{" "}
                <span className="pull">{sym}{fmt(d?.cost_eating_out)}</span>.
              </p>
              <p>
                Healthcare: public and free for residents.
                Internet speed score: <span className="pull">{score(d?.score_internet_speed)} / 10</span>.
              </p>
            </div>
          </div>
          <div className="scene-margin sticky-margin">
            <div className="margin-stack">
              <div className="marg">
                <p className="marg-lbl">Groceries · monthly</p>
                <p className="marg-val">{sym}{fmt(d?.cost_groceries_monthly)}<span className="unit">/mo</span></p>
                <p className="marg-sub">Single, cooking most nights</p>
              </div>
              <div className="marg">
                <p className="marg-lbl">Dinner for two</p>
                <p className="marg-val">{sym}{fmt(d?.cost_eating_out)}<span className="unit">avg</span></p>
                <p className="marg-sub">Mid-range, with wine</p>
              </div>
              <div className="marg">
                <p className="marg-lbl">Internet</p>
                <p className="marg-val">{score(d?.score_internet_speed)}<span className="unit">/10</span></p>
                <p className="marg-sub">Fibre widely available</p>
              </div>
            </div>
          </div>
        </section>

        {/* SCENE 5 — NEIGHBOURHOODS */}
        {d?.neighbourhoods && d.neighbourhoods.length > 0 && (
          <section className="scene">
            <div className="scene-time">
              <span className="hr">17:45</span>
              Quarters
              <span className="rule" />
            </div>
            <div className="scene-story">
              <p className="scene-meta">Scene 05 · Neighbourhoods</p>
              <h2 className="scene-head">Six quarters, six <span className="it">completely different</span> cities.</h2>
              <div className="scene-prose" style={{ marginTop: 32 }}>
                {d.neighbourhoods.map((nh, i) => (
                  <div key={i} style={{ marginBottom: 28, paddingBottom: 28, borderBottom: "1px solid var(--rule)" }}>
                    <p style={{ fontWeight: 700, fontSize: 16, color: "var(--accent)", marginBottom: 6 }}>
                      {nh.name}
                    </p>
                    <p style={{ fontSize: 14, color: "var(--dim)", marginBottom: 8 }}>{nh.vibe}</p>
                    <p style={{ fontSize: 14, color: "var(--dim)" }}>
                      1BR rent: <strong style={{ color: "var(--ink)" }}>{sym}{nh.avgRent}</strong>
                      {" · "}Good for: {nh.goodFor.join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="scene-margin sticky-margin">
              <div className="margin-stack">
                <div className="marg">
                  <p className="marg-lbl">Expat-friendly</p>
                  <p className="marg-val">{score(d?.score_expat_friendliness)}<span className="unit">/10</span></p>
                </div>
                <div className="marg">
                  <p className="marg-lbl">Nightlife</p>
                  <p className="marg-val">{score(d?.score_nightlife)}<span className="unit">/10</span></p>
                </div>
                <div className="marg">
                  <p className="marg-lbl">Quality of life</p>
                  <p className="marg-val">{score(d?.score_quality_of_life)}<span className="unit">/10</span></p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SCENE 6 — CLIMATE */}
        <section className="scene">
          <div className="scene-time">
            <span className="hr">19:42</span>
            Sunset
            <span className="rule" />
          </div>
          <div className="scene-story">
            <p className="scene-meta">Scene 06 · Climate · The Year</p>
            <h2 className="scene-head">
              {d?.climate_rainy_days_per_year} rainy days.
              Summers at <span className="ac">{d?.climate_summer_avg_c ?? "—"}°C</span>.
            </h2>
            <div className="scene-prose">
              <p>{d?.climate_description}</p>
            </div>
            <div className="climate-row">
              {CLIMATE_DATA.map((cell) => (
                <div
                  key={cell.month}
                  className={`climate-cell${cell.month === "JUN" || cell.month === "JUL" || cell.month === "AUG" ? " cc-summer" : ""}`}
                >
                  <p className="cc-mth">{cell.month}</p>
                  <p className="cc-high">{cell.high}°</p>
                  <p className="cc-rain">{cell.rain}d</p>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13, opacity: 0.6, marginTop: 16 }}>
              Top: avg daily high °C. Bottom: rainy days that month.
            </p>
          </div>
          <div className="scene-margin sticky-margin">
            <div className="margin-stack">
              <div className="marg">
                <p className="marg-lbl">Summer high</p>
                <p className="marg-val">{d?.climate_summer_avg_c ?? "—"}°C</p>
              </div>
              <div className="marg">
                <p className="marg-lbl">Winter high</p>
                <p className="marg-val">{d?.climate_winter_avg_c ?? "—"}°C</p>
              </div>
              <div className="marg">
                <p className="marg-lbl">Rain days / year</p>
                <p className="marg-val">{d?.climate_rainy_days_per_year ?? "—"}<span className="unit">days</span></p>
              </div>
            </div>
          </div>
        </section>

        {/* SCENE 7 — EVENING */}
        <section className="scene">
          <div className="scene-time">
            <span className="hr">21:30</span>
            Evening
            <span className="rule" />
          </div>
          <div className="scene-story">
            <p className="scene-meta">Scene 07 · After Hours</p>
            <h2 className="scene-head">Dinner late. A bar, <span className="it">if the night insists</span>.</h2>
            <div className="scene-prose">
              <p>
                Coworking desk: <span className="pull">{sym}{fmt(d?.cost_coworking_monthly)} / month</span>.
                Gym membership: <span className="pull">{sym}{fmt(d?.cost_gym_monthly)} / month</span>.
              </p>
            </div>
          </div>
          <div className="scene-margin sticky-margin">
            <div className="margin-stack">
              <div className="marg">
                <p className="marg-lbl">Coworking</p>
                <p className="marg-val">{sym}{fmt(d?.cost_coworking_monthly)}<span className="unit">/mo</span></p>
                <p className="marg-sub">Hot desk · standard</p>
              </div>
              <div className="marg">
                <p className="marg-lbl">Gym</p>
                <p className="marg-val">{sym}{fmt(d?.cost_gym_monthly)}<span className="unit">/mo</span></p>
                <p className="marg-sub">Standard chain membership</p>
              </div>
            </div>
          </div>
        </section>

        {/* SCENE 8 — VISA / NIGHT */}
        {d?.visa_notes && (
          <section className="scene">
            <div className="scene-time">
              <span className="hr">23:30</span>
              Visa · path
              <span className="rule" />
            </div>
            <div className="scene-story">
              <p className="scene-meta">Scene 08 · Paperwork · The Path</p>
              <h2 className="scene-head">
                The paperwork is <span className="it">annoying but manageable</span>.
              </h2>
              <div className="scene-prose">
                <p>{d.visa_notes}</p>
                {d.visa_official_url && (
                  <p style={{ marginTop: 20 }}>
                    <a
                      href={d.visa_official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "var(--accent)", textDecoration: "underline" }}
                    >
                      Official visa information →
                    </a>
                  </p>
                )}
              </div>
            </div>
            <div className="scene-margin sticky-margin">
              <div className="margin-stack">
                <div className="marg">
                  <p className="marg-lbl">Healthcare</p>
                  <p className="marg-val">{score(d?.score_healthcare)}<span className="unit">/10</span></p>
                  <p className="marg-sub">Public for residents</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* DOSSIER */}
        <section className="dossier">
          <div className="dossier-head">
            <h2 className="dossier-title">The <span style={{ fontStyle: "italic" }}>dossier.</span></h2>
            <p className="dossier-intro">
              Every number in this dispatch, in one place.
              {d?.last_verified && ` Verified ${new Date(d.last_verified).toLocaleDateString("en-US", { year: "numeric", month: "long" })}.`}
              {d?.data_sources && ` Sources: ${d.data_sources}.`}
            </p>
          </div>

          <div className="df-grid">
            {[
              { label: "Rent · 1BR centre", val: d?.cost_rent_city_centre, unit: "/mo", accent: true },
              { label: "Rent · 1BR outside", val: d?.cost_rent_outside, unit: "/mo" },
              { label: "Utilities", val: d?.cost_utilities_monthly, unit: "/mo" },
              { label: "Groceries", val: d?.cost_groceries_monthly, unit: "/mo" },
              { label: "Transit", val: d?.cost_transport_monthly, unit: "/mo" },
              { label: "Coworking", val: d?.cost_coworking_monthly, unit: "/mo" },
              { label: "Gym", val: d?.cost_gym_monthly, unit: "/mo" },
              { label: "Est. total · single", val: monthlyTotal, unit: "/mo", accent: true },
              { label: "Software engineer", val: d?.salary_software_engineer, unit: "/yr" },
              { label: "Income tax", val: d?.income_tax_rate_mid != null ? `${(d.income_tax_rate_mid * 100).toFixed(0)}%` : null, unit: "", raw: true },
              { label: "Move score", val: d?.move_score, unit: "/10", accent: true },
              { label: "Safety", val: d?.score_safety, unit: "/10", decimal: true },
              { label: "Walkability", val: d?.score_walkability, unit: "/10", decimal: true },
              { label: "Quality of life", val: d?.score_quality_of_life, unit: "/10", decimal: true },
              { label: "Healthcare", val: d?.score_healthcare, unit: "/10", decimal: true },
              { label: "Expat-friendly", val: d?.score_expat_friendliness, unit: "/10", decimal: true },
            ].map(({ label, val, unit, accent, raw, decimal }) => (
              <div key={label} className="df-cell">
                <p className="df-lbl">{label}</p>
                <p className={`df-val${accent ? " ac" : ""}`}>
                  {raw
                    ? val ?? "—"
                    : val != null
                      ? decimal
                        ? `${(val as number).toFixed(1)}`
                        : typeof val === "number"
                          ? `${sym}${val.toLocaleString()}`
                          : val
                      : "—"}
                  {val != null && !raw && <span className="unit">{unit}</span>}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="cta">
          <p>
            Compare {city.name} to your shortlist, or find where matches your situation best.
          </p>
          <a href="/wizard" className="cta-btn">Start the wizard →</a>
        </section>

      </div>
    </div>
  );
}