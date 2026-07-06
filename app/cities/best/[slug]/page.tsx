import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { mapRowToCity } from "@/lib/mappers";
import type { City } from "@/types";

export const revalidate = 3600;

const CATEGORIES = {
  "remote-work": {
    title: "Best Cities For Remote Work",
    label: "Remote Work",
    intro: "Fast internet, usable rent, expat depth and enough city life after the laptop closes.",
    test: (c: City) => (c.data?.scoreInternetSpeed ?? 0) >= 7 && (c.data?.scoreExpatFriendliness ?? 0) >= 7,
    score: (c: City) => (c.data?.scoreInternetSpeed ?? 0) * 2 + (c.data?.scoreExpatFriendliness ?? 0) + (c.data?.moveScore ?? 0),
  },
  budget: {
    title: "Best Budget Cities",
    label: "Budget",
    intro: "Lower monthly burn without dropping into weak infrastructure.",
    test: (c: City) => (c.data?.costRentCityCentre ?? 999999) <= 1200,
    score: (c: City) => (c.data?.moveScore ?? 0) * 2 - ((c.data?.costRentCityCentre ?? 0) / 250),
  },
  beach: {
    title: "Best Beach Cities",
    label: "Beach",
    intro: "Warm weather, coastal lifestyle and enough professional infrastructure to stay productive.",
    test: (c: City) => ["lisbon","porto","barcelona","malaga","valencia","split","limassol","bali","da-nang","dubai","cape-town","miami","sydney","perth","brisbane","auckland","funchal"].includes(c.slug),
    score: (c: City) => (c.data?.moveScore ?? 0) + (c.data?.scoreQualityOfLife ?? 0),
  },
  nightlife: {
    title: "Best Cities For Nightlife",
    label: "Nightlife",
    intro: "Cities with real evening energy, not just laptop cafes and pretty rent charts.",
    test: (c: City) => (c.data?.scoreNightlife ?? 0) >= 7,
    score: (c: City) => (c.data?.scoreNightlife ?? 0) * 2 + (c.data?.moveScore ?? 0),
  },
  family: {
    title: "Best Family-Friendly Cities",
    label: "Family",
    intro: "Safety, healthcare and everyday usability for people moving with more than one suitcase.",
    test: (c: City) => (c.data?.scoreSafety ?? 0) >= 7 && (c.data?.scoreHealthcare ?? 0) >= 7,
    score: (c: City) => (c.data?.scoreSafety ?? 0) + (c.data?.scoreHealthcare ?? 0) + (c.data?.moveScore ?? 0),
  },
  culture: {
    title: "Best Cities For Culture",
    label: "Culture",
    intro: "Strong cultural depth, walkable days and cities that still feel interesting after month three.",
    test: (c: City) => ["london","paris","rome","florence","berlin","vienna","prague","barcelona","madrid","athens","tokyo","kyoto","seoul","mexico-city","buenos-aires","lisbon"].includes(c.slug),
    score: (c: City) => (c.data?.scoreWalkability ?? 0) + (c.data?.scoreQualityOfLife ?? 0) + (c.data?.moveScore ?? 0),
  },
} satisfies Record<string, { title: string; label: string; intro: string; test: (c: City) => boolean; score: (c: City) => number }>;

async function getCities(): Promise<City[]> {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data, error } = await supabase.from("cities").select("*, city_data (*)").order("name", { ascending: true });
  if (error) return [];
  return (data ?? []).map(mapRowToCity) as City[];
}

export function generateStaticParams() {
  return Object.keys(CATEGORIES).map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = CATEGORIES[slug as keyof typeof CATEGORIES];
  if (!cat) return {};
  return {
    title: `${cat.title} ~ Origio`,
    description: cat.intro,
  };
}

export default async function BestCitiesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = CATEGORIES[slug as keyof typeof CATEGORIES];
  if (!cat) notFound();

  const cities = (await getCities())
    .filter(cat.test)
    .sort((a, b) => cat.score(b) - cat.score(a))
    .slice(0, 18);

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f0f0e8", paddingTop: 120 }}>
      <Nav countries={[]} />
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "48px 24px 96px" }}>
        <p style={{ fontFamily: "Satoshi, sans-serif", fontSize: 11, fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase", color: "#00ffd5" }}>
          Cities · {cat.label}
        </p>
        <h1 style={{ fontFamily: "Cabinet Grotesk, sans-serif", fontSize: "clamp(54px, 9vw, 126px)", lineHeight: 0.9, letterSpacing: "-0.055em", margin: "18px 0 24px" }}>
          {cat.title}
        </h1>
        <p style={{ maxWidth: 680, fontFamily: "Satoshi, sans-serif", fontSize: 18, lineHeight: 1.55, color: "rgba(240,240,232,0.58)", margin: 0 }}>
          {cat.intro}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 1, background: "#2a2a2a", border: "1px solid #2a2a2a", marginTop: 56 }}>
          {cities.map((city, i) => (
            <Link key={city.slug} href={`/city/${city.slug}`} style={{ minHeight: 220, padding: 24, background: "#0a0a0a", color: "#f0f0e8", textDecoration: "none", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "Satoshi, sans-serif", fontSize: 10, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(240,240,232,0.32)" }}>No {String(i + 1).padStart(2, "0")}</span>
              <div>
                <span style={{ fontSize: 22 }}>{city.flagEmoji}</span>
                <h2 style={{ fontFamily: "Cabinet Grotesk, sans-serif", fontSize: 40, lineHeight: 0.95, letterSpacing: "-0.04em", margin: "10px 0 8px" }}>{city.name}</h2>
                <p style={{ fontFamily: "Satoshi, sans-serif", fontSize: 13, color: "rgba(240,240,232,0.42)", margin: 0 }}>{city.countryName}</p>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontFamily: "Satoshi, sans-serif", fontSize: 12, color: "#00ffd5", fontWeight: 800 }}>
                <span>{city.currency}{city.data?.costRentCityCentre?.toLocaleString() ?? "—"}/mo rent</span>
                <span>{Math.round(city.data?.moveScore ?? 0)}/10</span>
              </div>
            </Link>
          ))}
        </div>

        <Link href="/cities/compare" style={{ display: "inline-flex", marginTop: 34, color: "#0a0a0a", background: "#00ffd5", padding: "14px 18px", textDecoration: "none", fontFamily: "Satoshi, sans-serif", fontSize: 12, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase" }}>
          Compare shortlist →
        </Link>
      </section>
      <Footer />
    </main>
  );
}
