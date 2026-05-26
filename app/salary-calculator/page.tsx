"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { Lock, Sparkles, Zap } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

// ─── Constants ────────────────────────────────────────────────────────────────
const FREE_SALARY_CAP = 60000;
const FREE_COUNTRY_LIMIT = 2;

// ─── Tax Data ─────────────────────────────────────────────────────────────────
const TAX_DATA = {
  UK: { currency:"GBP", symbol:"£",  personalAllowance:12570, bands:[{min:0,max:12570,rate:0},{min:12570,max:50270,rate:.20},{min:50270,max:125140,rate:.40},{min:125140,max:Infinity,rate:.45}], ni:{threshold:12570,upperLimit:50270,lowerRate:.08,upperRate:.02}, label:"🇬🇧 UK" },
  US: { currency:"USD", symbol:"$",  standardDeduction:14600, bands:[{min:0,max:11925,rate:.10},{min:11925,max:48475,rate:.12},{min:48475,max:103350,rate:.22},{min:103350,max:197300,rate:.24},{min:197300,max:250525,rate:.32},{min:250525,max:626350,rate:.35},{min:626350,max:Infinity,rate:.37}], fica:{socialSecurityRate:.062,socialSecurityCap:168600,medicareRate:.0145,additionalMedicareRate:.009,additionalMedicareThreshold:200000}, label:"🇺🇸 US" },
  CA: { currency:"CAD", symbol:"CA$", personalAmount:15705, bands:[{min:0,max:57375,rate:.145},{min:57375,max:114750,rate:.205},{min:114750,max:158519,rate:.26},{min:158519,max:220000,rate:.29},{min:220000,max:Infinity,rate:.33}], provincialRate:.11, cpp:{exemption:3500,ceiling:68500,rate:.0595}, label:"🇨🇦 Canada" },
  AU: { currency:"AUD", symbol:"A$", bands:[{min:0,max:18200,rate:0},{min:18200,max:45000,rate:.19},{min:45000,max:120000,rate:.325},{min:120000,max:180000,rate:.37},{min:180000,max:Infinity,rate:.45}], medicare:.02, medicareThreshold:26000, label:"🇦🇺 Australia" },
  DE: { currency:"EUR", symbol:"€",  bands:[{min:0,max:11604,rate:0},{min:11604,max:66761,rate:.14},{min:66761,max:277826,rate:.42},{min:277826,max:Infinity,rate:.45}], socialSecurity:{health:.0735,pension:.093,unemployment:.013,nursing:.017}, solidaritySurcharge:.055, label:"🇩🇪 Germany" },
  IE: { currency:"EUR", symbol:"€",  bands:[{min:0,max:42000,rate:.20},{min:42000,max:Infinity,rate:.40}], usc:[{min:0,max:12012,rate:.005},{min:12012,max:25760,rate:.02},{min:25760,max:70044,rate:.04},{min:70044,max:Infinity,rate:.08}], prsi:.04, taxCredit:3550, label:"🇮🇪 Ireland" },
  NL: { currency:"EUR", symbol:"€",  bands:[{min:0,max:75518,rate:.3693},{min:75518,max:Infinity,rate:.495}], generalCredit:3070, label:"🇳🇱 Netherlands" },
  SG: { currency:"SGD", symbol:"S$", bands:[{min:0,max:20000,rate:0},{min:20000,max:30000,rate:.02},{min:30000,max:40000,rate:.035},{min:40000,max:80000,rate:.07},{min:80000,max:120000,rate:.115},{min:120000,max:160000,rate:.15},{min:160000,max:200000,rate:.18},{min:200000,max:240000,rate:.19},{min:240000,max:280000,rate:.195},{min:280000,max:320000,rate:.20},{min:320000,max:Infinity,rate:.22}], cpf:.20, label:"🇸🇬 Singapore" },
  AE: { currency:"AED", symbol:"AED", bands:[], label:"🇦🇪 UAE" },
  PT: { currency:"EUR", symbol:"€",  bands:[{min:0,max:7703,rate:.1325},{min:7703,max:11623,rate:.18},{min:11623,max:16472,rate:.23},{min:16472,max:21321,rate:.26},{min:21321,max:27146,rate:.3275},{min:27146,max:39791,rate:.37},{min:39791,max:51997,rate:.435},{min:51997,max:81199,rate:.45},{min:81199,max:Infinity,rate:.48}], socialSecurity:.11, label:"🇵🇹 Portugal" },
};

const ALL_COUNTRY_KEYS = Object.keys(TAX_DATA) as (keyof typeof TAX_DATA)[];
const FREE_COUNTRIES = ALL_COUNTRY_KEYS.slice(0, FREE_COUNTRY_LIMIT);

// ─── Role salary data (median gross, local currency, 2025 market rates) ──────
// Sources: Glassdoor, Levels.fyi, national labour stats, LinkedIn Salary
const ROLE_SALARIES: Record<string, Record<string, number>> = {
  "Software Engineer":        { UK:75000,  US:130000, CA:110000, AU:120000, DE:72000,  IE:80000,  NL:75000,  SG:95000,  AE:280000, PT:35000  },
  "Product Manager":          { UK:85000,  US:145000, CA:120000, AU:130000, DE:80000,  IE:90000,  NL:85000,  SG:110000, AE:320000, PT:40000  },
  "UX/UI Designer":           { UK:55000,  US:95000,  CA:85000,  AU:90000,  DE:58000,  IE:60000,  NL:60000,  SG:72000,  AE:200000, PT:28000  },
  "Data Scientist":           { UK:70000,  US:125000, CA:105000, AU:110000, DE:70000,  IE:75000,  NL:72000,  SG:90000,  AE:260000, PT:32000  },
  "DevOps Engineer":          { UK:72000,  US:128000, CA:108000, AU:115000, DE:74000,  IE:78000,  NL:76000,  SG:92000,  AE:270000, PT:33000  },
  "Marketing Manager":        { UK:52000,  US:85000,  CA:75000,  AU:85000,  DE:55000,  IE:58000,  NL:58000,  SG:75000,  AE:200000, PT:25000  },
  "Financial Analyst":        { UK:58000,  US:90000,  CA:78000,  AU:88000,  DE:60000,  IE:62000,  NL:62000,  SG:78000,  AE:220000, PT:26000  },
  "Cybersecurity Analyst":    { UK:68000,  US:115000, CA:95000,  AU:105000, DE:68000,  IE:72000,  NL:70000,  SG:85000,  AE:250000, PT:30000  },
  "Sales Manager":            { UK:65000,  US:110000, CA:90000,  AU:100000, DE:65000,  IE:68000,  NL:65000,  SG:85000,  AE:240000, PT:28000  },
  "HR Manager":               { UK:50000,  US:80000,  CA:72000,  AU:80000,  DE:52000,  IE:55000,  NL:55000,  SG:70000,  AE:190000, PT:24000  },
  "AI / ML Engineer":         { UK:90000,  US:185000, CA:150000, AU:155000, DE:95000,  IE:100000, NL:92000,  SG:150000, AE:350000, PT:42000  },
  "Cloud Architect":          { UK:85000,  US:170000, CA:140000, AU:148000, DE:90000,  IE:95000,  NL:88000,  SG:135000, AE:325000, PT:38000  },
  "Dentist":                  { UK:82000,  US:180000, CA:165000, AU:175000, DE:80000,  IE:100000, NL:100000, SG:160000, AE:330000, PT:40000  },
  "Physiotherapist":          { UK:43000,  US:82000,  CA:85000,  AU:90000,  DE:47000,  IE:52000,  NL:52000,  SG:68000,  AE:160000, PT:24000  },
  "Psychologist":             { UK:46000,  US:95000,  CA:85000,  AU:95000,  DE:52000,  IE:57000,  NL:56000,  SG:70000,  AE:185000, PT:28000  },
  "Renewable Energy Engineer":{ UK:68000,  US:112000, CA:108000, AU:122000, DE:73000,  IE:67000,  NL:72000,  SG:92000,  AE:255000, PT:37000  },
  "Pilot":                    { UK:90000,  US:170000, CA:145000, AU:150000, DE:95000,  IE:85000,  NL:100000, SG:165000, AE:450000, PT:65000  },
  "Graphic Designer":         { UK:41000,  US:72000,  CA:63000,  AU:70000,  DE:46000,  IE:45000,  NL:49000,  SG:56000,  AE:128000, PT:21000  },
  "Biomedical Engineer":      { UK:55000,  US:112000, CA:98000,  AU:105000, DE:68000,  IE:68000,  NL:67000,  SG:90000,  AE:215000, PT:30000  },
  "Supply Chain Manager":     { UK:64000,  US:110000, CA:110000, AU:118000, DE:80000,  IE:80000,  NL:80000,  SG:102000, AE:260000, PT:38000  },
  "Custom":                   { UK:50000,  US:80000,  CA:70000,  AU:80000,  DE:50000,  IE:55000,  NL:55000,  SG:70000,  AE:180000, PT:25000  },
};

function getSalaryForRole(role: string, country: string): number {
  return ROLE_SALARIES[role]?.[country] ?? 50000;
}

const ROLES = Object.keys(ROLE_SALARIES);
const GUIDES = [{ label:"Software Engineers", slug:"software-engineers" },{ label:"Product Managers", slug:"product-managers" },{ label:"Designers", slug:"designers" }];

// ─── Tax Calculators ──────────────────────────────────────────────────────────
function calcBanded(gross: number, bands:{min:number;max:number;rate:number}[]) {
  let tax = 0;
  for (const b of bands) { if (gross<=b.min) break; tax += (Math.min(gross,b.max)-b.min)*b.rate; }
  return tax;
}
function calcUK(g:number){const d=TAX_DATA.UK;let pa=d.personalAllowance;if(g>100000)pa=Math.max(0,pa-(g-100000)/2);const taxable=Math.max(0,g-pa);const it=calcBanded(taxable,[{min:0,max:37700,rate:.20},{min:37700,max:112570,rate:.40},{min:112570,max:Infinity,rate:.45}]);const ni=Math.max(0,Math.min(g,d.ni.upperLimit)-d.ni.threshold)*d.ni.lowerRate+Math.max(0,g-d.ni.upperLimit)*d.ni.upperRate;const total=it+ni;return{items:[{label:"Income Tax",v:it},{label:"National Insurance",v:ni}],total,net:g-total,rate:total/g}}
function calcUS(g:number){const d=TAX_DATA.US;const it=calcBanded(Math.max(0,g-d.standardDeduction),d.bands);const ss=Math.min(g,d.fica.socialSecurityCap)*d.fica.socialSecurityRate;const med=g*d.fica.medicareRate+Math.max(0,g-d.fica.additionalMedicareThreshold)*d.fica.additionalMedicareRate;const state=g*.05;const total=it+ss+med+state;return{items:[{label:"Federal Income Tax",v:it},{label:"Social Security",v:ss},{label:"Medicare",v:med},{label:"State Tax (avg)",v:state}],total,net:g-total,rate:total/g}}
function calcCA(g:number){const d=TAX_DATA.CA;const fed=calcBanded(Math.max(0,g-d.personalAmount),d.bands);const prov=g*d.provincialRate;const cpp=Math.max(0,Math.min(g,d.cpp.ceiling)-d.cpp.exemption)*d.cpp.rate;const ei=Math.min(g,63200)*.0166;const total=fed+prov+cpp+ei;return{items:[{label:"Federal Tax",v:fed},{label:"Provincial Tax",v:prov},{label:"CPP",v:cpp},{label:"EI",v:ei}],total,net:g-total,rate:total/g}}
function calcAU(g:number){const d=TAX_DATA.AU;const raw=calcBanded(g,d.bands);const lito=g<=37500?700:g<=45000?700-(g-37500)*.05:g<=66667?325-(g-45000)*.015:0;const it=Math.max(0,raw-lito);const med=g>d.medicareThreshold?g*d.medicare:0;const total=it+med;return{items:[{label:"Income Tax",v:it},{label:"Medicare Levy",v:med}],total,net:g-total,rate:total/g}}
function calcDE(g:number){const d=TAX_DATA.DE;let it=0;if(g<=11604)it=0;else if(g<=17006){const y=(g-11604)/10000;it=(979.18*y+1400)*y}else if(g<=66761){const z=(g-17005)/10000;it=(192.59*z+2397)*z+966}else if(g<=277826)it=.42*g-10602;else it=.45*g-18936;const sol=g>18130?it*d.solidaritySurcharge:0;const ss=(d.socialSecurity.health+d.socialSecurity.pension+d.socialSecurity.unemployment+d.socialSecurity.nursing)*g;const total=it+sol+ss;return{items:[{label:"Income Tax",v:it},{label:"Solidarity Surcharge",v:sol},{label:"Social Insurance",v:ss}],total,net:g-total,rate:total/g}}
function calcIE(g:number){const d=TAX_DATA.IE;const it=Math.max(0,calcBanded(g,d.bands)-d.taxCredit);const usc=calcBanded(g,d.usc);const prsi=g*d.prsi;const total=it+usc+prsi;return{items:[{label:"Income Tax",v:it},{label:"USC",v:usc},{label:"PRSI",v:prsi}],total,net:g-total,rate:total/g}}
function calcNL(g:number){const d=TAX_DATA.NL;const it=Math.max(0,calcBanded(g,d.bands)-d.generalCredit);return{items:[{label:"Income Tax",v:it}],total:it,net:g-it,rate:it/g}}
function calcSG(g:number){const d=TAX_DATA.SG;const it=calcBanded(g,d.bands);const cpf=Math.min(g*d.cpf,37740);const total=it+cpf;return{items:[{label:"Income Tax",v:it},{label:"CPF",v:cpf}],total,net:g-total,rate:total/g}}
function calcAE(g:number){return{items:[{label:"Income Tax",v:0}],total:0,net:g,rate:0}}
function calcPT(g:number){const d=TAX_DATA.PT;const it=calcBanded(g,d.bands);const ss=g*d.socialSecurity;const total=it+ss;return{items:[{label:"Income Tax",v:it},{label:"Social Security",v:ss}],total,net:g-total,rate:total/g}}

function calcCountry(c:keyof typeof TAX_DATA,g:number){
  switch(c){case"UK":return calcUK(g);case"US":return calcUS(g);case"CA":return calcCA(g);case"AU":return calcAU(g);case"DE":return calcDE(g);case"IE":return calcIE(g);case"NL":return calcNL(g);case"SG":return calcSG(g);case"AE":return calcAE(g);case"PT":return calcPT(g);}
}

// ─── Country fun facts (dark humour, rotating) ───────────────────────────────
const COUNTRY_FACTS: Record<string, string[]> = {
  UK:  [
    "Gross: £75k. Net: approximately a Zone 2 flat share and one Pret a day.",
    "The NHS is free. Your therapy for checking your payslip is not.",
    "You earn in pounds. You spend in pounds. You cry in pounds.",
    "Fun fact: your landlord earns more from your rent than you do from your job.",
  ],
  US:  [
    "Land of the free. Healthcare bill not included.",
    "Your 401k is fine. Your soul is not.",
    "Three jobs, one apartment, infinite ambition. The American Dream™.",
    "State tax varies by state. Your mental state also varies.",
  ],
  CA:  [
    "Universal healthcare included. Universal housing affordability: not so much.",
    "CPP means the government is 'saving' money for you. You're welcome.",
    "Toronto rent: $3,200/mo. Toronto salary: generous. Toronto math: broken.",
    "Canada is basically America but polite about taking your money.",
  ],
  AU:  [
    "Everything wants to kill you. Your tax rate is merely trying.",
    "Superannuation: a retirement fund you can't touch. Classic.",
    "Sydney rent ate my avocado toast money. And my rent money.",
    "The sun is free. Everything else in Sydney is not.",
  ],
  DE:  [
    "My German colleagues don't know what I earn. This is law apparently.",
    "Solidarity surcharge: paying extra for reunification. Still.",
    "The paperwork to move here costs more stress than the income tax.",
    "You get paid on time. The trains do not arrive on time. Balance.",
  ],
  IE:  [
    "Low corporate tax. High everything-else tax. Make it make sense.",
    "USC stands for Universal Social Charge. Universal meaning: everyone hurts.",
    "Dublin rent went up again while you were reading this.",
    "The craic is free. Rent in Dublin is absolutely not.",
  ],
  NL:  [
    "Paid 49% tax. Used the remaining €800 to buy a bike. Bike was stolen.",
    "The Dutch call it 'solidarity'. Your accountant calls it 'painful'.",
    "Stroopwafel costs €0.80. Your effective tax rate costs your will to live.",
    "Box 1, Box 2, Box 3. None of them contain money after taxes.",
  ],
  SG:  [
    "Great take-home. Spent it all on hawker food and avoiding the June heat.",
    "CPF: the government holds your money so you don't spend it. Rude but fair.",
    "Lowest tax in Asia. Highest rent in Asia. Net effect: same as everywhere.",
    "Singapore is clean, safe, efficient. Your bank account disagrees.",
  ],
  AE:  [
    "Zero income tax. Spent the difference on AC bills and existential dread.",
    "No tax. No rain. No seasons. Just sun, sand, and a lot of supercars.",
    "Technically your take-home is your gross. Read that again slowly.",
    "You win at tax. You lose at knowing what month it is due to the heat.",
  ],
  PT:  [
    "Moved to Lisbon. Lisbon got expensive. Moved to Porto. Porto got expensive. Now in the Alentejo.",
    "NHR tax regime: for the first 10 years, Portugal is very generous. After that: good luck.",
    "The pastéis de nata are worth the salary cut. I'm not joking.",
    "Great quality of life. Shame the salary reflects the cost of living from 2015.",
  ],
};

function getRandomFact(country: string): string {
  const facts = COUNTRY_FACTS[country] ?? ["Numbers go in. Numbers come out. That's tax."];
  return facts[Math.floor(Math.random() * facts.length)];
}

// ─── Pain meter label ─────────────────────────────────────────────────────────
function painLabel(rate: number): { label: string; color: string } {
  if (rate === 0)   return { label: "zero. you lucky bastard", color: "#00ffd5" };
  if (rate < 0.10)  return { label: "basically free money", color: "#00ffd5" };
  if (rate < 0.18)  return { label: "bearable", color: "#34d399" };
  if (rate < 0.25)  return { label: "annoying but fine", color: "#a3e635" };
  if (rate < 0.32)  return { label: "this is getting silly", color: "#fbbf24" };
  if (rate < 0.40)  return { label: "genuinely painful", color: "#f97316" };
  if (rate < 0.48)  return { label: "highway robbery", color: "#ef4444" };
  return { label: "CRIMINAL", color: "#dc2626" };
}

// ─── Reverse calc: gross needed to take home target ───────────────────────────
function reverseCalc(country: keyof typeof TAX_DATA, targetNet: number): number {
  let lo = targetNet, hi = targetNet * 3;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const res = calcCountry(country, mid);
    if (!res) break;
    if (res.net < targetNet) lo = mid; else hi = mid;
  }
  return Math.round((lo + hi) / 2);
}

// ─── Receipt row component ────────────────────────────────────────────────────
function ReceiptRow({ label, value, dim, red, bold }: { label: string; value: string; dim?: boolean; red?: boolean; bold?: boolean }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "baseline",
      padding: "5px 0", gap: 8,
    }}>
      <span style={{
        fontFamily: "Satoshi, sans-serif", fontSize: 12,
        color: dim ? "rgba(240,240,232,0.28)" : "rgba(240,240,232,0.65)",
        letterSpacing: "0.04em", textTransform: "uppercase",
        fontWeight: bold ? 700 : 400,
      }}>{label}</span>
      <span style={{
        fontFamily: "Satoshi, sans-serif", fontSize: 13,
        color: red ? "#ef4444" : bold ? "#f0f0e8" : "rgba(240,240,232,0.75)",
        fontWeight: bold ? 700 : 400, letterSpacing: "0.06em", flexShrink: 0,
      }}>{value}</span>
    </div>
  );
}

function DottedLine({ thick }: { thick?: boolean }) {
  return (
    <div style={{
      borderTop: thick ? "2px dashed rgba(240,240,232,0.2)" : "1px dashed rgba(240,240,232,0.1)",
      margin: thick ? "12px 0" : "6px 0",
    }} />
  );
}

// ─── Split-flap role picker ───────────────────────────────────────────────────
function SplitFlap({ roles, value, onChange }: { roles: string[]; value: string; onChange: (r: string) => void }) {
  const [flipping, setFlipping] = useState(false);
  const [flipDir, setFlipDir] = useState<"up"|"down">("up");
  const idx = roles.indexOf(value);

  const go = (dir: "up"|"down") => {
    if (flipping) return;
    setFlipDir(dir);
    setFlipping(true);
    setTimeout(() => {
      const next = dir === "up"
        ? roles[(idx + 1) % roles.length]
        : roles[(idx - 1 + roles.length) % roles.length];
      onChange(next);
      setFlipping(false);
    }, 180);
  };

  return (
    <div>
      <p style={{ fontFamily:"Satoshi, sans-serif", fontSize:10, letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(240,240,232,0.35)", marginBottom:12 }}>
        Job Role
      </p>
      <div style={{ display:"flex", alignItems:"center", gap:0 }}>
        {/* Down arrow */}
        <button onClick={() => go("down")} style={{
          fontFamily:"Satoshi, sans-serif", fontSize:18, color:"rgba(240,240,232,0.4)",
          background:"#0f0f0f", border:"2px solid #2a2a2a", borderRight:"none",
          width:40, height:52, cursor:"pointer", display:"flex",
          alignItems:"center", justifyContent:"center",
          transition:"color 0.1s, background 0.1s",
          flexShrink: 0,
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color="#f0f0e8"; (e.currentTarget as HTMLElement).style.background="#1a1a1a"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color="rgba(240,240,232,0.4)"; (e.currentTarget as HTMLElement).style.background="#0f0f0f"; }}
        >‹</button>

        {/* The flap display */}
        <div style={{
          flex:1, height:52, background:"#0f0f0f",
          border:"2px solid #2a2a2a",
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center",
          overflow:"hidden", position:"relative",
          perspective:"400px",
        }}>
          {/* Top half separator line — the "fold" */}
          <div style={{
            position:"absolute", top:"50%", left:0, right:0,
            height:"1px", background:"rgba(0,0,0,0.6)", zIndex:2,
          }} />

          {/* Role text */}
          <div style={{
            fontFamily:"Satoshi, sans-serif", fontSize:13, fontWeight:700,
            letterSpacing:"0.14em", textTransform:"uppercase",
            color:"#f0f0e8",
            transform: flipping
              ? flipDir === "up" ? "translateY(-4px) scaleY(0.85)" : "translateY(4px) scaleY(0.85)"
              : "translateY(0) scaleY(1)",
            opacity: flipping ? 0.4 : 1,
            transition:"transform 0.18s ease, opacity 0.18s ease",
            userSelect:"none",
            textAlign:"center",
            padding:"0 16px",
            width:"100%",
          }}>
            {value}
          </div>

          {/* Index indicator */}
          <div style={{
            position:"absolute", bottom:3, right:8,
            fontFamily:"Satoshi, sans-serif", fontSize:8,
            color:"rgba(240,240,232,0.18)", letterSpacing:"0.1em",
          }}>
            {String(idx + 1).padStart(2,"0")}/{String(roles.length).padStart(2,"0")}
          </div>
        </div>

        {/* Up arrow */}
        <button onClick={() => go("up")} style={{
          fontFamily:"Satoshi, sans-serif", fontSize:18, color:"rgba(240,240,232,0.4)",
          background:"#0f0f0f", border:"2px solid #2a2a2a", borderLeft:"none",
          width:40, height:52, cursor:"pointer", display:"flex",
          alignItems:"center", justifyContent:"center",
          transition:"color 0.1s, background 0.1s",
          flexShrink: 0,
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color="#f0f0e8"; (e.currentTarget as HTMLElement).style.background="#1a1a1a"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color="rgba(240,240,232,0.4)"; (e.currentTarget as HTMLElement).style.background="#0f0f0f"; }}
        >›</button>
      </div>

      {/* Role pills for direct jump */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:8 }}>
        {roles.filter(r => r !== "Custom").map((r) => (
          <button key={r} onClick={() => onChange(r)} style={{
            fontFamily:"Satoshi, sans-serif", fontSize:9, letterSpacing:"0.1em",
            textTransform:"uppercase", padding:"3px 8px",
            border:"1px solid",
            borderColor: value===r ? "#00ffd5" : "#1a1a1a",
            background: value===r ? "rgba(0,255,213,0.06)" : "transparent",
            color: value===r ? "#00ffd5" : "rgba(240,240,232,0.25)",
            cursor:"pointer", transition:"all 0.1s",
          }}>
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SalaryCalculator() {
  const [country, setCountry] = useState<keyof typeof TAX_DATA>("UK");
  const [role, setRole] = useState("Software Engineer");
  const initSalary = getSalaryForRole("Software Engineer", "UK");
  const [salary, setSalary] = useState(initSalary);
  const [inputVal, setInputVal] = useState(new Intl.NumberFormat("en").format(initSalary));
  const [userEditedSalary, setUserEditedSalary] = useState(false); // track if user manually typed
  const [isPro, setIsPro] = useState(false);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [mode, setMode] = useState<"forward" | "reverse">("forward");
  const [targetNet, setTargetNet] = useState(40000);
  const [targetNetInput, setTargetNetInput] = useState("40,000");
  const [printed, setPrinted] = useState(false);
  const [prevCountry, setPrevCountry] = useState<keyof typeof TAX_DATA>("UK");
  const [slideDir, setSlideDir] = useState<"left"|"right">("right");
  const [currentFact, setCurrentFact] = useState(() => getRandomFact("UK"));

  const fetchPro = useCallback(async (userId: string) => {
    const { data } = await supabase.from("profiles").select("is_pro").eq("id", userId).single();
    setIsPro(data?.is_pro ?? false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) await fetchPro(session.user.id);
      setAuthLoaded(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_e, session) => {
      if (session?.user) await fetchPro(session.user.id);
      else setIsPro(false);
    });
    return () => subscription.unsubscribe();
  }, [fetchPro]);

  // Trigger print animation on salary/country change
  useEffect(() => {
    setPrinted(false);
    const t = setTimeout(() => setPrinted(true), 80);
    return () => clearTimeout(t);
  }, [salary, country, mode, targetNet]);

  const handleCountryChange = (c: keyof typeof TAX_DATA) => {
    const keys = ALL_COUNTRY_KEYS;
    setSlideDir(keys.indexOf(c) > keys.indexOf(country) ? "left" : "right");
    setPrevCountry(country);
    setCountry(c);
    setCurrentFact(getRandomFact(c));
    if (role !== "Custom") {
      const newSalary = getSalaryForRole(role, c);
      setSalary(newSalary);
      setInputVal(new Intl.NumberFormat("en").format(newSalary));
      setUserEditedSalary(false);
    }
  };

  const handleRoleChange = (r: string) => {
    setRole(r);
    if (r !== "Custom") {
      const newSalary = getSalaryForRole(r, country);
      setSalary(newSalary);
      setInputVal(new Intl.NumberFormat("en").format(newSalary));
      setUserEditedSalary(false);
    }
  };

  const availableCountries = isPro ? ALL_COUNTRY_KEYS : FREE_COUNTRIES;
  const effectiveSalary = !isPro && salary > FREE_SALARY_CAP ? FREE_SALARY_CAP : salary;
  const sym = TAX_DATA[country].symbol;
  const fmt = (n: number) => new Intl.NumberFormat("en", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(n));

  const result = useMemo(() => calcCountry(country, effectiveSalary), [country, effectiveSalary]);
  const pain = result ? painLabel(result.rate) : { label: "", color: "#00ffd5" };
  const salaryCapped = !isPro && salary > FREE_SALARY_CAP;

  const grossNeeded = useMemo(() => {
    if (mode !== "reverse") return 0;
    return reverseCalc(country, targetNet);
  }, [country, targetNet, mode]);

  const reverseResult = useMemo(() => {
    if (mode !== "reverse") return null;
    return calcCountry(country, grossNeeded);
  }, [country, grossNeeded, mode]);

  const handleSalaryInput = (val: string) => {
    const clean = val.replace(/[^0-9]/g, "");
    const num = parseInt(clean, 10) || 0;
    setInputVal(new Intl.NumberFormat("en").format(num));
    setSalary(num);
    setUserEditedSalary(true);
  };

  const handleTargetInput = (val: string) => {
    const clean = val.replace(/[^0-9]/g, "");
    const num = parseInt(clean, 10) || 0;
    setTargetNetInput(new Intl.NumberFormat("en").format(num));
    setTargetNet(num);
  };

  const displayResult = mode === "reverse" ? reverseResult : result;
  const displayGross = mode === "reverse" ? grossNeeded : effectiveSalary;

  const now = new Date();
  const receiptDate = now.toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }).toUpperCase();
  const receiptTime = now.toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit" });
  const receiptNo = `ORG-${Math.abs(effectiveSalary * 7 % 9999).toString().padStart(4,"0")}`;


  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">

      <Nav countries={[]} onCountrySelect={() => {}} />

      <main className="flex-1">
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px 80px" }}>

          {/* ── PAGE HEADER ── */}
          <div style={{ marginBottom: 40 }}>
            <p style={{ fontFamily:"Satoshi, sans-serif", fontSize:10, letterSpacing:"0.22em", textTransform:"uppercase", color:"#00ffd5", marginBottom:10 }}>
              Take-Home Calculator
            </p>
            <h1 style={{ fontFamily:"Cabinet Grotesk, sans-serif", fontWeight:400, fontSize:"clamp(28px, 5vw, 46px)", lineHeight:1.05, letterSpacing:"-0.02em", color:"#f0f0e8", margin:"0 0 10px" }}>
              what will you <em style={{ color:"#00ffd5", fontStyle:"normal" }}>actually</em> earn?
            </h1>
            <p style={{ fontFamily:"system-ui, sans-serif", fontSize:14, color:"rgba(240,240,232,0.42)", margin:0 }}>
              Net salary after tax and deductions. 2025/26 rates.
            </p>
          </div>

          {/* ── 2-COL LAYOUT ── */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:40, alignItems:"start" }} className="calc-grid">

            {/* ══ LEFT: INPUTS ══ */}
            <div style={{ display:"flex", flexDirection:"column", gap:0 }}>

              {/* Mode toggle */}
              <div style={{ display:"flex", gap:0, marginBottom:28, border:"2px solid #2a2a2a", width:"fit-content" }}>
                {(["forward","reverse"] as const).map((m) => (
                  <button key={m} onClick={() => setMode(m)} style={{
                    fontFamily:"Satoshi, sans-serif", fontSize:11, letterSpacing:"0.14em", textTransform:"uppercase",
                    padding:"8px 20px", background: mode===m ? "#f0f0e8" : "transparent",
                    color: mode===m ? "#0a0a0a" : "rgba(240,240,232,0.4)",
                    border:"none", cursor:"pointer", transition:"all 0.15s", fontWeight: mode===m ? 700 : 400,
                  }}>
                    {m === "forward" ? "Gross → Net" : "Net → Gross"}
                  </button>
                ))}
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

                {/* Country */}
                <div>
                  <p style={{ fontFamily:"Satoshi, sans-serif", fontSize:10, letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(240,240,232,0.35)", marginBottom:12 }}>
                    Country {!isPro && <span style={{ color:"#00ffd5" }}>{FREE_COUNTRY_LIMIT} free</span>}
                  </p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {ALL_COUNTRY_KEYS.map((c) => {
                      const locked = !isPro && !FREE_COUNTRIES.includes(c);
                      const active = country === c;
                      return (
                        <button key={c} onClick={() => !locked && handleCountryChange(c)}
                          title={locked ? "Pro only" : TAX_DATA[c].label}
                          style={{
                            fontFamily:"Satoshi, sans-serif", fontSize:13, padding:"8px 14px", border:"2px solid",
                            borderColor: locked ? "#1a1a1a" : active ? "#00ffd5" : "#2a2a2a",
                            background: active ? "rgba(0,255,213,0.08)" : "transparent",
                            color: locked ? "#2a2a2a" : active ? "#00ffd5" : "rgba(240,240,232,0.55)",
                            cursor: locked ? "not-allowed" : "pointer",
                            boxShadow: active ? "2px 2px 0 #00ffd5" : "none",
                            transition:"all 0.12s", position:"relative",
                          }}>
                          {TAX_DATA[c].label.split(" ")[0]} {c}
                          {locked && <Lock style={{ width:8, height:8, position:"absolute", top:3, right:3, color:"#333" }} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Role split-flap */}
                <SplitFlap roles={ROLES} value={role} onChange={handleRoleChange} />

                {/* Salary / target */}
                {mode === "forward" ? (
                  <div>
                    <p style={{ fontFamily:"Satoshi, sans-serif", fontSize:10, letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(240,240,232,0.35)", marginBottom:8 }}>
                      Gross Annual Salary {!isPro && <span style={{ color:"rgba(240,240,232,0.28)" }}>— capped at {sym}{fmt(FREE_SALARY_CAP)} free</span>}
                    </p>
                    <div style={{ position:"relative" }}>
                      <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontFamily:"Satoshi, sans-serif", fontSize:14, color:"rgba(240,240,232,0.35)" }}>{sym}</span>
                      <input type="text" value={inputVal} onChange={(e) => handleSalaryInput(e.target.value)}
                        style={{ width:"100%", background:"#0f0f0f", border:"2px solid #2a2a2a", padding:"12px 14px 12px 32px", fontFamily:"Satoshi, sans-serif", fontSize:18, color:"#f0f0e8", outline:"none", boxSizing:"border-box" }}
                        onFocus={e => e.currentTarget.style.borderColor="#00ffd5"}
                        onBlur={e => e.currentTarget.style.borderColor="#2a2a2a"}
                      />
                    </div>
                    {!userEditedSalary && role !== "Custom" && (
                      <p style={{ fontFamily:"Satoshi, sans-serif", fontSize:10, color:"rgba(0,255,213,0.45)", marginTop:6, letterSpacing:"0.06em" }}>
                        ↑ median market rate for {role} in {TAX_DATA[country].label.split(" ").slice(1).join(" ")} — edit to customise
                      </p>
                    )}
                    {salaryCapped && (
                      <div style={{ marginTop:8, padding:"8px 12px", border:"1px solid rgba(0,255,213,0.25)", background:"rgba(0,255,213,0.04)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <span style={{ fontFamily:"Satoshi, sans-serif", fontSize:10, color:"#00ffd5" }}>Showing {sym}{fmt(FREE_SALARY_CAP)} — Pro removes cap</span>
                        <Link href="/pro" style={{ fontFamily:"Satoshi, sans-serif", fontSize:10, color:"#00ffd5", textDecoration:"underline" }}>Upgrade →</Link>
                      </div>
                    )}
                    <div style={{ display:"flex", gap:6, marginTop:10, flexWrap:"wrap" }}>
                      {(isPro ? [30000,50000,75000,100000,150000] : [20000,35000,50000,60000]).map((v) => (
                        <button key={v} onClick={() => { setSalary(v); setInputVal(new Intl.NumberFormat("en").format(v)); setUserEditedSalary(true); }}
                          style={{ fontFamily:"Satoshi, sans-serif", fontSize:11, padding:"5px 10px", border:"1px solid", borderColor: salary===v ? "#00ffd5" : "#2a2a2a", background: salary===v ? "rgba(0,255,213,0.08)" : "transparent", color: salary===v ? "#00ffd5" : "rgba(240,240,232,0.4)", cursor:"pointer" }}>
                          {sym}{new Intl.NumberFormat("en",{notation:"compact"}).format(v)}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontFamily:"Satoshi, sans-serif", fontSize:10, letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(240,240,232,0.35)", marginBottom:8 }}>
                      Target Take-Home (annual net)
                    </p>
                    <div style={{ position:"relative" }}>
                      <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontFamily:"Satoshi, sans-serif", fontSize:14, color:"rgba(240,240,232,0.35)" }}>{sym}</span>
                      <input type="text" value={targetNetInput} onChange={(e) => handleTargetInput(e.target.value)}
                        style={{ width:"100%", background:"#0f0f0f", border:"2px solid #2a2a2a", padding:"12px 14px 12px 32px", fontFamily:"Satoshi, sans-serif", fontSize:18, color:"#f0f0e8", outline:"none", boxSizing:"border-box" }}
                        onFocus={e => e.currentTarget.style.borderColor="#00ffd5"}
                        onBlur={e => e.currentTarget.style.borderColor="#2a2a2a"}
                      />
                    </div>
                    <p style={{ fontFamily:"Satoshi, sans-serif", fontSize:11, color:"rgba(240,240,232,0.3)", marginTop:8 }}>
                      → you need to earn <strong style={{ color:"#f0f0e8" }}>{sym}{fmt(grossNeeded)}</strong> gross to take home {sym}{fmt(targetNet)}
                    </p>
                  </div>
                )}
              </div>

              {/* ── FIELD REPORT / FUN FACT ── */}
              <div style={{ marginTop:28, padding:"18px 20px", border:"1px solid #1a1a1a", background:"rgba(255,255,255,0.01)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                  <span style={{ fontFamily:"Satoshi, sans-serif", fontSize:9, letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(240,240,232,0.2)" }}>FIELD REPORT</span>
                  <span style={{ fontFamily:"Satoshi, sans-serif", fontSize:9, color:"rgba(240,240,232,0.1)" }}>·</span>
                  <span style={{ fontFamily:"Satoshi, sans-serif", fontSize:9, color:pain.color, letterSpacing:"0.1em" }}>{TAX_DATA[country].label}</span>
                </div>
                <p style={{ fontFamily:"Cabinet Grotesk, sans-serif", fontSize:14, lineHeight:1.65, color:"rgba(240,240,232,0.52)", margin:"0 0 14px", fontStyle:"normal" }}>
                  "{currentFact}"
                </p>
                <button onClick={() => setCurrentFact(getRandomFact(country))}
                  style={{ fontFamily:"Satoshi, sans-serif", fontSize:9, letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(240,240,232,0.22)", background:"none", border:"1px solid #1a1a1a", padding:"4px 10px", cursor:"pointer" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color="#f0f0e8"; (e.currentTarget as HTMLElement).style.borderColor="#2a2a2a"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color="rgba(240,240,232,0.22)"; (e.currentTarget as HTMLElement).style.borderColor="#1a1a1a"; }}
                >
                  another one →
                </button>
              </div>

              {/* Pro strip */}
              {!isPro && authLoaded && (
                <div style={{ marginTop:16, border:"2px solid rgba(0,255,213,0.22)", padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap", boxShadow:"3px 3px 0 rgba(0,255,213,0.08)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <Zap style={{ width:14, height:14, color:"#00ffd5", flexShrink:0 }} />
                    <div>
                      <p style={{ fontFamily:"Satoshi, sans-serif", fontSize:10, fontWeight:700, color:"#f0f0e8", textTransform:"uppercase", letterSpacing:"0.1em", margin:0 }}>Pro unlocks everything</p>
                      <p style={{ fontFamily:"Satoshi, sans-serif", fontSize:9, color:"rgba(240,240,232,0.32)", margin:"2px 0 0" }}>All {ALL_COUNTRY_KEYS.length} countries · any salary · full breakdown</p>
                    </div>
                  </div>
                  <Link href="/pro" style={{ padding:"8px 14px", background:"#00ffd5", color:"#0a0a0a", fontFamily:"Satoshi, sans-serif", fontSize:10, fontWeight:700, textDecoration:"none", textTransform:"uppercase", letterSpacing:"0.12em", flexShrink:0 }}>
                    €4.99 →
                  </Link>
                </div>
              )}

              {/* Guides */}
              <div style={{ marginTop:16, border:"1px solid #1a1a1a", padding:"16px 18px" }}>
                <p style={{ fontFamily:"Satoshi, sans-serif", fontSize:9, letterSpacing:"0.2em", textTransform:"uppercase", color:"rgba(240,240,232,0.18)", marginBottom:6 }}>Also explore</p>
                <h2 style={{ fontFamily:"Cabinet Grotesk, sans-serif", fontSize:16, fontWeight:400, color:"#f0f0e8", margin:"0 0 10px" }}>Best countries by role</h2>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {GUIDES.map((g) => (
                    <Link key={g.slug} href={`/best-countries-for/${g.slug}`}
                      style={{ fontFamily:"Satoshi, sans-serif", fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", padding:"5px 12px", border:"1px solid #2a2a2a", color:"rgba(240,240,232,0.42)", textDecoration:"none" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor="#f0f0e8"; (e.currentTarget as HTMLElement).style.color="#f0f0e8"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor="#2a2a2a"; (e.currentTarget as HTMLElement).style.color="rgba(240,240,232,0.42)"; }}
                    >{g.label}</Link>
                  ))}
                </div>
              </div>

            </div>

            {/* ══ RIGHT: RECEIPT (sticky) ══ */}
            <div style={{ position:"sticky", top:80 }}>
              {displayResult && displayGross > 0 ? (
                <div style={{
                  background:"#0a0a0a", border:"1px solid #2a2a2a",
                  opacity: printed ? 1 : 0,
                  transform: printed ? "translateY(0)" : "translateY(8px)",
                  transition:"opacity 0.35s ease, transform 0.35s ease",
                }}>
                  {/* Perforated top */}
                  <div style={{ height:12, backgroundImage:"radial-gradient(circle, #1a1a1a 3px, transparent 3px)", backgroundSize:"14px 14px", backgroundPosition:"0 6px", borderBottom:"1px solid #1a1a1a" }} />

                  <div style={{ padding:"24px 28px 20px" }}>
                    {/* Header */}
                    <div style={{ textAlign:"center", marginBottom:16 }}>
                      <div style={{ fontFamily:"Satoshi, sans-serif", fontSize:16, fontWeight:700, letterSpacing:"0.3em", color:"#f0f0e8" }}>ORIGIO</div>
                      <div style={{ fontFamily:"Satoshi, sans-serif", fontSize:8, letterSpacing:"0.18em", color:"rgba(240,240,232,0.28)", textTransform:"uppercase", marginTop:2 }}>SALARY STATEMENT · EMPLOYEE COPY</div>
                      <DottedLine thick />
                      <div style={{ display:"flex", justifyContent:"space-between", fontFamily:"Satoshi, sans-serif", fontSize:9, color:"rgba(240,240,232,0.28)", letterSpacing:"0.05em" }}>
                        <span>DATE: {receiptDate}</span>
                        <span>TIME: {receiptTime}</span>
                        <span>REF: {receiptNo}</span>
                      </div>
                      <DottedLine />
                      <div style={{ display:"flex", justifyContent:"space-between", fontFamily:"Satoshi, sans-serif", fontSize:9, color:"rgba(240,240,232,0.28)", letterSpacing:"0.05em", marginTop:3 }}>
                        <span>COUNTRY: {TAX_DATA[country].label}</span>
                        <span>ROLE: {role.toUpperCase().slice(0,14)}</span>
                      </div>
                    </div>

                    <DottedLine thick />
                    <ReceiptRow label={mode==="reverse" ? "GROSS NEEDED" : "GROSS SALARY"} value={`${sym}${fmt(displayGross)}`} bold />
                    <DottedLine />

                    <div style={{ fontFamily:"Satoshi, sans-serif", fontSize:8, letterSpacing:"0.18em", color:"rgba(240,240,232,0.2)", marginBottom:3, textTransform:"uppercase" }}>Deductions</div>
                    {isPro ? (
                      displayResult.items.filter(i => i.v > 0).map((item) => (
                        <ReceiptRow key={item.label} label={item.label} value={`-${sym}${fmt(item.v)}`} red />
                      ))
                    ) : (
                      <>
                        <ReceiptRow label="Income Tax" value={`-${sym}????`} red dim />
                        <ReceiptRow label="Other Deductions" value={`-${sym}????`} red dim />
                        <div style={{ padding:"6px 10px", border:"1px dashed rgba(0,255,213,0.18)", margin:"6px 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                          <span style={{ fontFamily:"Satoshi, sans-serif", fontSize:9, color:"#00ffd5" }}>🔒 PRO — full breakdown</span>
                          <Link href="/pro" style={{ fontFamily:"Satoshi, sans-serif", fontSize:9, color:"#00ffd5", textDecoration:"underline" }}>€4.99</Link>
                        </div>
                      </>
                    )}

                    <DottedLine thick />
                    <ReceiptRow label={mode==="reverse" ? "TARGET NET / YR" : "NET TAKE-HOME / YR"} value={`${sym}${fmt(displayResult.net)}`} bold />
                    <ReceiptRow label={mode==="reverse" ? "TARGET NET / MO" : "NET TAKE-HOME / MO"} value={`${sym}${fmt(displayResult.net/12)}`} bold />
                    <ReceiptRow label={mode==="reverse" ? "TARGET NET / WK" : "NET TAKE-HOME / WK"} value={`${sym}${fmt(displayResult.net/52)}`} dim />
                    <DottedLine thick />
                    <ReceiptRow label="EFFECTIVE TAX RATE" value={`${(displayResult.rate*100).toFixed(1)}%`} bold />

                    {/* Pain meter */}
                    <div style={{ marginTop:14 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                        <span style={{ fontFamily:"Satoshi, sans-serif", fontSize:8, letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(240,240,232,0.2)" }}>PAIN LEVEL</span>
                        <span style={{ fontFamily:"Satoshi, sans-serif", fontSize:10, color:pain.color, letterSpacing:"0.06em", textTransform:"uppercase" }}>{pain.label}</span>
                      </div>
                      <div style={{ height:5, background:"#111", border:"1px solid #1a1a1a", overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${displayResult.rate*100}%`, background:`linear-gradient(90deg, #00ffd5, ${pain.color})`, transition:"width 0.6s cubic-bezier(0.16,1,0.3,1)" }} />
                      </div>
                      <div style={{ display:"flex", justifyContent:"space-between", fontFamily:"Satoshi, sans-serif", fontSize:7, color:"rgba(240,240,232,0.16)", marginTop:2, letterSpacing:"0.06em" }}>
                        <span>ZERO TAX</span>
                        <span>CRIMINAL</span>
                      </div>
                    </div>

                    {/* Dubai quip — appears when tax rate is painful */}
                    {displayResult.rate > 0.28 && country !== "AE" && (
                      <div style={{ marginTop:10, fontFamily:"Satoshi, sans-serif", fontSize:9, color:"rgba(240,240,232,0.26)", letterSpacing:"0.06em", textAlign:"center", fontStyle:"normal" }}>
                        you could live in Dubai instead. just saying.
                      </div>
                    )}

                    {/* Split bar pro only */}
                    {isPro && (
                      <div style={{ marginTop:12 }}>
                        <div style={{ height:3, display:"flex", overflow:"hidden" }}>
                          <div style={{ background:"#00ffd5", width:`${(1-displayResult.rate)*100}%`, transition:"width 0.6s ease" }} />
                          <div style={{ background:"rgba(239,68,68,0.5)", width:`${displayResult.rate*100}%`, transition:"width 0.6s ease" }} />
                        </div>
                        <div style={{ display:"flex", justifyContent:"space-between", fontFamily:"Satoshi, sans-serif", fontSize:8, color:"rgba(240,240,232,0.22)", marginTop:2 }}>
                          <span>YOURS {(100-displayResult.rate*100).toFixed(1)}%</span>
                          <span>THEIRS {(displayResult.rate*100).toFixed(1)}%</span>
                        </div>
                      </div>
                    )}

                    <DottedLine thick />
                    <div style={{ textAlign:"center", fontFamily:"Satoshi, sans-serif", fontSize:8, color:"rgba(240,240,232,0.16)", letterSpacing:"0.06em", lineHeight:1.8 }}>
                      <div>ESTIMATES ONLY · {now.getFullYear()} TAX RATES APPLIED</div>
                      {country === "AE" && <div>UAE HAS ZERO INCOME TAX · YOU WIN</div>}
                      {country === "US" && <div>INCLUDES ~5% AVG STATE TAX</div>}
                      <div style={{ marginTop:3 }}>FINDORIGIO.COM</div>
                      <div style={{ marginTop:3, letterSpacing:"0.4em", fontSize:10, color:"rgba(240,240,232,0.07)" }}>|||||||||||||||||||||||||||||||||||||||</div>
                    </div>
                  </div>

                  {/* Perforated bottom */}
                  <div style={{ height:12, backgroundImage:"radial-gradient(circle, #1a1a1a 3px, transparent 3px)", backgroundSize:"14px 14px", backgroundPosition:"0 6px", borderTop:"1px solid #1a1a1a" }} />
                </div>
              ) : (
                <div style={{ border:"1px dashed #1a1a1a", padding:"60px 24px", textAlign:"center" }}>
                  <p style={{ fontFamily:"Satoshi, sans-serif", fontSize:10, color:"rgba(240,240,232,0.15)", letterSpacing:"0.14em", margin:0 }}>RECEIPT APPEARS HERE</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .calc-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <Footer />
    </div>
  );
}