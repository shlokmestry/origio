// app/compare/page.tsx
import { Metadata } from "next";
import { Suspense } from "react";
import ComparePageClient from "./ComparePageClient";

export const metadata: Metadata = {
  title: "Compare Countries — Origio",
  description: "Compare salaries, cost of living, visa difficulty, and quality of life between two countries side by side.",
  openGraph: {
    title: "Compare Countries — Origio",
    description: "Compare salaries, cost of living, visa difficulty, and quality of life between two countries side by side.",
    type: "website",
  },
};

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-primary" />}>
      <ComparePageClient />
    </Suspense>
  );
}