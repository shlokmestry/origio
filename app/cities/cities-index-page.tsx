import { createClient } from "@supabase/supabase-js";
import { Metadata } from "next";
import CitiesIndexClient from "./CitiesIndexClient";
import type { CityItem as CityListItem } from "./CitiesIndexClient";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);


async function getCities(): Promise<CityListItem[]> {
  const { data, error } = await supabase
    .from("cities")
    .select(
      `
      id,
      slug,
      name,
      country_name,
      flag_emoji,
      continent,
      currency,
      monument_image_url,
      tagline,
      city_data (
        move_score,
        cost_rent_city_centre,
        score_safety,
        score_internet_speed,
        climate_summer_avg_c,
        climate_winter_avg_c
      )
    `
    )
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching cities:", error);
    return [];
  }

  return (data ?? []).map((row: Record<string, unknown>) => {
    const cd = (row.city_data as Record<string, unknown>[] | null)?.[0] ?? null;
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      countryName: row.country_name,
      flagEmoji: row.flag_emoji,
      continent: row.continent,
      currency: row.currency,
      monumentImageUrl: row.monument_image_url,
      tagline: row.tagline,
      data: cd
        ? {
            moveScore: cd.move_score,
            costRentCityCentre: cd.cost_rent_city_centre,
            scoreSafety: cd.score_safety,
            scoreInternetSpeed: cd.score_internet_speed,
            climateSummerAvgC: cd.climate_summer_avg_c,
            climateWinterAvgC: cd.climate_winter_avg_c,
          }
        : null,
    } as unknown as CityListItem;
  });
}

export const metadata: Metadata = {
  title: "Cities — Find Your Perfect Relocation · Origio",
  description:
    "Explore the world's best cities for relocation. Cost of living, salaries, neighbourhoods, and visa difficulty — all verified and personalized.",
  openGraph: {
    title: "Explore Cities — Origio",
    description:
      "Find your next city with accurate data on cost, salary, and quality of life.",
    images: [
      {
        url: "/og-cities.png",
        width: 1200,
        height: 630,
        alt: "Origio Cities",
      },
    ],
  },
};

export const revalidate = 3600;

export default async function CitiesIndexPage() {
  const cities = await getCities();
  return <CitiesIndexClient cities={cities} />;
}