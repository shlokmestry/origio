import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Origio",
  description: "Origio ranks 25 countries by salary, visa difficulty, cost of living, and quality of life — specific to your job and passport. Built by Shlok Mestry.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}