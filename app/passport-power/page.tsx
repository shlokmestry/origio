import type { Metadata } from "next";
import PassportPowerClient from "./PassportPowerClient";
import { ALL_PASSPORTS } from "./data";

export const metadata: Metadata = {
  title: "Global Passport Index — Origio",
  description:
    "Compare reported passport access across 199 passports. Static snapshot; check official entry rules before travel.",
  alternates: {
    canonical: "https://findorigio.com/passport-power",
  },
  openGraph: {
    title: "Global Passport Index — Origio",
    description:
      "Compare reported passport access across 199 passports. Static snapshot; check official entry rules before travel.",
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
      "Compare reported passport access across 199 passports. Static snapshot; check official entry rules before travel.",
    images: ["https://findorigio.com/passport-power/opengraph-image"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Global Passport Index — Origio Passport Power",
  "description": "199 passports ranked by reported access. Static snapshot; verify final entry rules with official sources.",
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
        Not all passports are equal. Global Passport Index — 199 passports ranked by reported access.
      </h1>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PassportPowerClient />
    </>
  );
}
