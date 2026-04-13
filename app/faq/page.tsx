"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Globe2 } from "lucide-react";
import Nav from "@/components/Nav";

const faqs = [
  {
    category: "About Origio",
    items: [
      {
        q: "What is Origio?",
        a: "Origio is a relocation research tool that helps you compare salaries, cost of living, visa requirements, and quality of life across 25 countries — all in one place.",
      },
      {
        q: "Who built Origio?",
        a: "Origio was built by Shlok Mestry, after spending weeks manually researching countries to move to and realising there was no single place that had everything.",
      },
      {
        q: "Which countries are covered?",
        a: "Australia, Austria, Belgium, Brazil, Canada, Denmark, Finland, France, Germany, India, Ireland, Italy, Japan, Malaysia, Netherlands, New Zealand, Norway, Portugal, Singapore, Spain, Sweden, Switzerland, UAE, United Kingdom, and USA.",
      },
    ],
  },
  {
    category: "Data & Accuracy",
    items: [
      {
        q: "Where does the salary data come from?",
        a: "Salary figures are aggregated from publicly available sources including Glassdoor, LinkedIn Salary, and government labour statistics. Data was last verified in March 2025.",
      },
      {
        q: "How accurate is the cost of living data?",
        a: "Cost of living figures are estimates based on publicly available indices and reports. They reflect average urban costs and may vary significantly by city or lifestyle.",
      },
      {
        q: "How often is the data updated?",
        a: "We aim to review and update data every 6–12 months. Each country page shows a last verified date so you know how fresh the data is.",
      },
      {
        q: "Should I make a life decision based solely on Origio?",
        a: "Origio is a research starting point, not financial or legal advice. We strongly recommend verifying figures with official government sources and consulting professionals before relocating.",
      },
    ],
  },
  {
    category: "Find My Country",
    items: [
      {
        q: "How does Find My Country work?",
        a: "Find My Country asks 8 questions about your priorities, job role, budget, and preferences. Each country is scored across multiple dimensions — salary, cost of living, safety, visa ease, and more — weighted by your answers. All salaries are normalised to USD for fair comparison.",
      },
      {
        q: "What does the job offer flow do?",
        a: "If you already have a job offer, Find My Country skips the priorities, city vibe, and rent budget steps since those are less relevant when you have a fixed destination in mind.",
      },
      {
        q: "Why do free users only see the top 3 results?",
        a: "The top 3 matches are free forever. Signed-in users can see their full top 10. Upgrade to Pro for unlimited runs and deeper country reports.",
      },
    ],
  },
  {
    category: "Account & Pro",
    items: [
      {
        q: "Do I need an account to use Origio?",
        a: "No. The globe, country pages, compare tool, and Find My Country top 3 results are all free without an account. Sign in to unlock your full top 10 country matches.",
      },
      {
        q: "What does the Pro plan include?",
        a: "Pro includes unlimited Find My Country runs, full country deep-dives, side-by-side country comparison, saved country matches, visa route details, and priority updates. It is a one-time payment of €5 — no subscription, ever.",
      },
      {
        q: "Is this really a one-time payment?",
        a: "Yes. Pay €5 once and access Pro forever. No subscription, no hidden fees, no recurring charges.",
      },
      {
        q: "What payment methods are accepted?",
        a: "All major credit and debit cards via Stripe. Safe and secure.",
      },
      {
        q: "Can I get a refund?",
        a: "If you have an issue, contact us and we'll sort it out.",
      },
    ],
  },
];

export default function FAQPage() {
  const [open, setOpen] = useState<string | null>(null);
  const toggle = (key: string) => setOpen(open === key ? null : key);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <Nav countries={[]} onCountrySelect={() => {}} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="mb-10">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-3">
            Frequently Asked Questions
          </h1>
          <p className="text-text-muted text-base">
            Everything you need to know about Origio, the data, and how Find My Country works.
          </p>
        </div>

        <div className="space-y-10">
          {faqs.map((section) => (
            <div key={section.category}>
              <h2 className="font-heading text-lg font-semibold text-accent mb-4">
                {section.category}
              </h2>
              <div className="space-y-2">
                {section.items.map((item) => {
                  const key = section.category + item.q;
                  const isOpen = open === key;
                  return (
                    <div key={key} className="border border-border rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggle(key)}
                        className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-white/5 transition-colors"
                      >
                        <span>{item.q}</span>
                        {isOpen
                          ? <ChevronUp className="w-4 h-4 text-text-muted flex-shrink-0" />
                          : <ChevronDown className="w-4 h-4 text-text-muted flex-shrink-0" />
                        }
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 text-sm text-text-muted leading-relaxed">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}