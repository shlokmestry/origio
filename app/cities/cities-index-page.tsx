import { createClient } from "@supabase/supabase-js";
import { Metadata } from "next";
import CitiesIndexClient from "./CitiesIndexClient";
import type { CityListItem } from "./CitiesIndexClient";

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
        cost_rent_city_centre
      )
    `
    )
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching cities:", error);
    return [];
  }

  return (data ?? []) as CityListItem[];
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