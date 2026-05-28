import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Countries ~ Salaries, Costs & Visas",
  description: "Side-by-side comparison of salaries, cost of living, quality of life and visa requirements across 37 countries.",
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
