/* eslint-disable react/no-unescaped-entities */
"use client";

import { Mail } from "lucide-react";
import Nav from "@/components/Nav";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-text-primary">
      <Nav countries={[]} onCountrySelect={() => {}} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">

        {/* Header */}
        <div className="mb-12 border-b-2 border-[#2a2a2a] pb-8">
          <p className="text-xs font-bold text-accent uppercase tracking-widest mb-3">About</p>
          <h1 className="font-heading text-4xl sm:text-5xl font-extrabold uppercase tracking-tight mb-3">
            What is Origio?
          </h1>
          <p className="text-text-muted text-sm font-medium leading-relaxed max-w-xl">
            A relocation research tool built for people who want real data before making a real move.
          </p>
        </div>

        {/* Story */}
        <section className="mb-12">
          <h2 className="font-heading text-lg font-extrabold text-text-primary uppercase tracking-tight mb-5 border-l-2 border-accent pl-3">The story</h2>
          <div className="space-y-4 text-text-muted text-sm leading-relaxed border-2 border-[#2a2a2a] p-6">
            <p>
              Origio was built by Shlok Mestry after spending weeks manually researching countries to move to and realising there was no single place that had all the information needed to make a proper decision.
            </p>
            <p>
              The core feature is the interactive 3D globe ~ click any country to instantly see how it stacks up across every dimension that matters. No more bouncing between Numbeo, Expatistan, and government visa websites trying to piece together a picture.
            </p>
            <p>
              If  you&apos;re not sure where to start, the Find My Country quiz asks 8 questions about your priorities, job, passport, and budget then scores all 25 countries and gives you a personalised ranked list.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="mb-12">
          <h2 className="font-heading text-lg font-extrabold text-text-primary uppercase tracking-tight mb-5 border-l-2 border-accent pl-3">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-0 border-2 border-[#2a2a2a]">
            {[
              { step: "01", title: "Explore the Globe", desc: "Click any country pin to see salaries, costs, visa routes, and quality of life scores instantly." },
              { step: "02", title: "Find My Country", desc: "Answer 8 questions about your role, passport, and priorities to get a personalised country ranking." },
              { step: "03", title: "Go deeper", desc: "Compare countries side by side, check your take-home pay, and read role-specific relocation guides." },
            ].map((item, i) => (
              <div key={item.step} className={`p-6 ${i < 2 ? "border-b-2 sm:border-b-0 sm:border-r-2 border-[#2a2a2a]" : ""}`}>
                <p className="font-heading text-4xl font-extrabold text-accent/30 mb-3">{item.step}</p>
                <p className="font-heading font-bold text-text-primary text-sm uppercase tracking-tight mb-2">{item.title}</p>
                <p className="text-text-muted text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Data sources */}
        <section className="mb-12">
          <h2 className="font-heading text-lg font-extrabold text-text-primary uppercase tracking-tight mb-5 border-l-2 border-accent pl-3">Where does the data come from?</h2>
          <div className="space-y-4 text-text-muted text-sm leading-relaxed border-2 border-[#2a2a2a] p-6">
            <p>
              All data is manually researched and verified from primary sources. Salary figures come from national labour statistics, recruitment platform reports, and industry salary surveys. Cost of living data draws from Numbeo, Expatistan, and government statistical offices.
            </p>
            <p>
              Data is reviewed and updated regularly. Each country page shows the last verified date so you always know how recent the information is.
            </p>
            <div className="border-l-2 border-accent pl-4 text-xs text-text-muted mt-4">
              All salary figures are in local currency unless otherwise stated. Origio is not financial or legal advice always verify with official sources before making decisions.
            </div>
          </div>
        </section>

       
        {/* CTA */}
        <div className="border-2 border-accent p-8 text-center" style={{ boxShadow: "6px 6px 0 #00ffd5" }}>
          <h3 className="font-heading text-xl font-extrabold text-text-primary uppercase tracking-tight mb-2">Ready to find your country?</h3>
          <p className="text-text-muted text-sm mb-6 max-w-sm mx-auto">Start with the globe or answer 8 questions to get your personalised ranking.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/wizard" className="cta-button px-6 py-3 text-sm font-bold uppercase tracking-wide inline-flex items-center justify-center">
              Find My Country
            </Link>
            <Link href="/" className="ghost-button px-6 py-3 text-sm font-bold uppercase tracking-wide inline-flex items-center justify-center">
              Explore the Globe
            </Link>
          </div>
        </div>

      <Footer />
      </main>
    </div>
  );
}