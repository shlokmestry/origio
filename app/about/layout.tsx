import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Origio",
  description: "Origio was built by Shlok Mestry after spending weeks researching which country to move to. One place for salaries, visas, cost of living and quality of life across 25 countries.",
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
