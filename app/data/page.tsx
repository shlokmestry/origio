import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Data Sources ~ Origio",
  description: "How Origio estimates salaries, rent, taxes, visas, passport power, safety and quality of life.",
};

const SOURCES = [
  {
    label: "Salaries",
    status: "Estimated",
    text: "Role-level gross salary benchmarks by country and city. Used directionally, not as payroll advice.",
  },
  {
    label: "Cost of Living",
    status: "Estimated",
    text: "Rent, groceries, transit, utilities, gym and coworking are normalized into monthly local-currency costs.",
  },
  {
    label: "Tax",
    status: "Simplified",
    text: "Published brackets plus simplified mandatory deductions where available. Local/state and personal deductions vary.",
  },
  {
    label: "Visa",
    status: "Manual",
    text: "Official immigration routes and difficulty scoring. Always verify with the government source before applying.",
  },
  {
    label: "Passport Power",
    status: "Reference",
    text: "Visa-free / visa-on-arrival access grouped into country passport profiles and ranking pages.",
  },
  {
    label: "Quality Scores",
    status: "Composite",
    text: "Safety, healthcare, internet, walkability, nightlife and expat friendliness rolled into readable scores.",
  },
];

export default function DataPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f0f0e8", paddingTop: 120 }}>
      <Nav countries={[]} />
      <section style={{ maxWidth: 1120, margin: "0 auto", padding: "48px 24px 96px" }}>
        <p style={{ fontFamily: "Satoshi, sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: "#00ffd5", marginBottom: 18 }}>
          Data Method
        </p>
        <h1 style={{ fontFamily: "Cabinet Grotesk, sans-serif", fontSize: "clamp(56px, 10vw, 132px)", lineHeight: 0.9, letterSpacing: "-0.05em", margin: 0, maxWidth: 860 }}>
          What the numbers mean.
        </h1>
        <p style={{ fontFamily: "Satoshi, sans-serif", fontSize: 18, lineHeight: 1.55, color: "rgba(240,240,232,0.58)", maxWidth: 680, marginTop: 28 }}>
          Origio is a relocation research tool. Figures are built for comparison, not payroll, legal or immigration advice.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 1, border: "1px solid #2a2a2a", background: "#2a2a2a", marginTop: 56 }}>
          {SOURCES.map((s) => (
            <article key={s.label} style={{ background: "#0a0a0a", padding: 28, minHeight: 190 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "baseline", marginBottom: 28 }}>
                <h2 style={{ fontFamily: "Cabinet Grotesk, sans-serif", fontSize: 34, lineHeight: 1, margin: 0, letterSpacing: "-0.04em" }}>{s.label}</h2>
                <span style={{ fontFamily: "Satoshi, sans-serif", fontSize: 9, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "#00ffd5" }}>{s.status}</span>
              </div>
              <p style={{ fontFamily: "Satoshi, sans-serif", fontSize: 14, lineHeight: 1.6, color: "rgba(240,240,232,0.56)", margin: 0 }}>{s.text}</p>
            </article>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", borderTop: "1px solid #2a2a2a", marginTop: 48, paddingTop: 28 }}>
          <Link href="/cities/compare" style={{ color: "#0a0a0a", background: "#00ffd5", padding: "14px 18px", textDecoration: "none", fontFamily: "Satoshi, sans-serif", fontSize: 12, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Compare cities →
          </Link>
          <Link href="/compare/countries" style={{ color: "#f0f0e8", border: "1px solid #2a2a2a", padding: "14px 18px", textDecoration: "none", fontFamily: "Satoshi, sans-serif", fontSize: 12, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Compare countries →
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
