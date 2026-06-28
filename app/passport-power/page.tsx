import type { Metadata } from "next";
import PassportPowerClient from "./PassportPowerClient";
import { ALL_PASSPORTS } from "./data";

export const metadata: Metadata = {
  title: "Global Passport Index — Origio",
  description:
    "192 destinations or 23. One number determines where you can go, live, and build. See where your passport ranks.",
  alternates: {
    canonical: "https://findorigio.com/passport-power",
  },
  openGraph: {
    title: "Global Passport Index — Origio",
    description:
      "192 destinations or 23. One number determines where you can go, live, and build. See where your passport ranks.",
    url: "https://findorigio.com/passport-power",
    siteName: "Origio",
    type: "website",
    images: [
      {
        url: "https://findorigio.com/passport-power/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Global Passport Index — Origio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Global Passport Index — Origio",
    description:
      "192 destinations or 23. One number determines where you can go, live, and build. See where your passport ranks.",
    images: ["https://findorigio.com/passport-power/opengraph-image"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Global Passport Index — Henley 2026 Q2",
  "description": "199 passports ranked by visa-free access. Based on Henley Index 2026 Q2.",
  "url": "https://findorigio.com/passport-power",
  "numberOfItems": ALL_PASSPORTS.length,
  "itemListElement": ALL_PASSPORTS.slice(0, 20).map((p, i) => ({
    "@type": "ListItem",
    "position": i + 1,
    "name": `${p.name} Passport`,
    "url": `https://findorigio.com/passport-power/${p.slug}`,
    "description": `Rank #${p.rank} — ${p.score} destinations`,
  })),
};

export default function PassportPowerPage() {
  return (
    <>
      {/* Server-rendered h1 for SEO — visually hidden, client component renders the styled version */}
      <h1 style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}>
        Not all passports are equal. Global Passport Index — 199 countries ranked by visa-free access.
      </h1>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PassportPowerClient />
    </>
  );
}
