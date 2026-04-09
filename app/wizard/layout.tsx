import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find My Country — Personalised Relocation Quiz",
  description: "Answer 8 quick questions and we'll match you with the best countries to move to based on your job, salary, visa and lifestyle preferences.",
};

export default function WizardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
