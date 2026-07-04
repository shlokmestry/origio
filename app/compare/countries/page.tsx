import { Metadata } from "next";
import { Suspense } from "react";
import ComparePageClient from "../ComparePageClient";

export const metadata: Metadata = {
  title: "Compare Countries ~ Origio",
  description: "Compare country-level cost, tax, salary context and relocation tradeoffs side by side.",
  openGraph: {
    title: "Compare Countries — Origio",
    description: "Compare country-level monthly cost side by side.",
    type: "website",
  },
};

export default function CompareCountriesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-primary" />}>
      <ComparePageClient />
    </Suspense>
  );
}
