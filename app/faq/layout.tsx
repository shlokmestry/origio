import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ — Origio",
  description: "Frequently asked questions about Origio — how the data works, how Find My Country scores countries, and what the Pro plan includes.",
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}