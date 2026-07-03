import { Metadata } from "next";
import CompareScrollReset from "./CompareScrollReset";

export const metadata: Metadata = {
  title: "Compare ~ Countries & Cities",
  description: "Compare country-level relocation tradeoffs and city-level monthly costs.",
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CompareScrollReset />
      {children}
    </>
  );
}
