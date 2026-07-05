import { Metadata } from "next";
import { redirect } from "next/navigation";
import { ALL_PASSPORTS } from "../data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const passport = ALL_PASSPORTS.find(p => p.slug === slug);
  if (!passport) return {};

  const worldPop = 8000;
  const share = (passport.population / worldPop) * 100;
  let rarityLabel = share < 0.1 ? "Ultra Rare" : share < 0.5 ? "Rare" : share < 2 ? "Uncommon" : share < 8 ? "Common" : "Very Common";
  const holders = passport.population >= 1000
    ? `${(passport.population / 1000).toFixed(1)}B`
    : passport.population >= 1
    ? `${passport.population.toFixed(1)}M`
    : `${(passport.population * 1000).toFixed(0)}K`;

  const title = `${passport.name} Passport — Rank #${passport.rank} | Passport Power`;
  const description = `${passport.name} passport scores ${passport.score}/192 reported destinations. ${rarityLabel} — ${holders} holders worldwide. Check official entry rules before travel.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://findorigio.com/passport-power/${slug}`,
      siteName: "Origio",
      images: [
        {
          url: `https://findorigio.com/passport-power/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${passport.name} Passport Power Card`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`https://findorigio.com/passport-power/${slug}/opengraph-image`],
    },
  };
}

export default async function PassportSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/passport-power?passport=${slug}`);
}
