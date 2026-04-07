import { Metadata } from "next";
import countriesData from "@/lib/data/countries.json";
import { CountryWithData } from "@/types";
import CountryPageClient from "./CountryPageClient";

const allCountries = countriesData as CountryWithData[];

export async function generateStaticParams() {
  return allCountries.map((country) => ({
    slug: country.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const country = allCountries.find((c) => c.slug === params.slug);
  if (!country) {
    return { title: "Country Not Found — Origio" };
  }

  const title = "Move to " + country.name + " — Salary, Visa, Cost of Living | Origio";
  const description =
    "Everything you need to know about moving to " +
    country.name +
    ". Average dev salary: €" +
    Math.round(country.data.salarySoftwareEngineer / 1000) +
    "k. Cost of living, visa routes, quality of life score: " +
    country.data.scoreQualityOfLife +
    "/10. Move Score: " +
    country.data.moveScore +
    "/10.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default function CountryPage({
  params,
}: {
  params: { slug: string };
}) {
  const country = allCountries.find((c) => c.slug === params.slug);

  if (!country) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-4xl font-extrabold mb-4">Country Not Found</h1>
          <p className="text-text-muted mb-8">The country you are looking for does not exist.</p>
          <a href="/" className="cta-button px-6 py-3 rounded-2xl inline-block">
            Back to Globe
          </a>
        </div>
      </div>
    );
  }

  const otherCountries = allCountries.filter((c) => c.slug !== params.slug);

  return <CountryPageClient country={country} otherCountries={otherCountries} />;
}