import { Metadata } from "next";
import ComparePageClient from "./ComparePageClient";

export const metadata: Metadata = {
  title: "Compare Countries — Origio",
  description:
    "Compare salaries, cost of living, visa difficulty, and quality of life between two countries side by side.",
  openGraph: {
    title: "Compare Countries — Origio",
    description:
      "Compare salaries, cost of living, visa difficulty, and quality of life between two countries side by side.",
    type: "website",
  },
};

export default function ComparePage() {
  return <ComparePageClient />;
}