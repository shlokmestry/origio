// components/QuizGate.tsx
"use client";

import Link from "next/link";
import { Lock, Sparkles, UserPlus } from "lucide-react";

interface QuizGateProps {
  type: "anon" | "free";
  runsUsed: number;
  maxRuns: number;
}

export default function QuizGate({ type, runsUsed, maxRuns }: QuizGateProps) {
  if (type === "anon") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
        <div className="max-w-md w-full">

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-4 h-4 bg-[#00ffd5] border-2 border-[#f0f0e8]" />
              <span className="font-heading text-lg font-extrabold uppercase tracking-tight text-[#f0f0e8]">Origio</span>
            </div>
            <div className="border-2 border-[#2a2a2a] p-6 mb-6" style={{ boxShadow: "4px 4px 0 #2a2a2a" }}>
              <div className="w-10 h-10 border-2 border-[#00ffd5] flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-5 h-5 text-[#00ffd5]" />
              </div>
              <p className="text-[10px] font-bold text-[#888880] uppercase tracking-widest mb-2">
                {runsUsed} of {maxRuns} free runs used
              </p>
              <h1 className="font-heading text-2xl font-extrabold uppercase tracking-tight text-[#f0f0e8] mb-3">
                You're out of free quiz runs
              </h1>
              <p className="text-sm text-[#888880] leading-relaxed">
                Create a free account to get {5} more runs and save your results across devices.
              </p>
            </div>
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <Link
              href="/signin"
              className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-[#00ffd5] text-[#0a0a0a] text-sm font-extrabold uppercase tracking-wide border-2 border-[#00ffd5] hover:bg-transparent hover:text-[#00ffd5] transition-colors"
              style={{ boxShadow: "3px 3px 0 #00aa90" }}
            >
              <UserPlus className="w-4 h-4" />
              Create free account
            </Link>
            <Link
              href="/signin"
              className="flex items-center justify-center w-full px-6 py-3 border-2 border-[#2a2a2a] text-sm font-bold text-[#888880] uppercase tracking-wide hover:border-[#f0f0e8] hover:text-[#f0f0e8] transition-colors"
            >
              Already have an account? Sign in
            </Link>
          </div>

          {/* What you get */}
          <div className="mt-6 border-2 border-[#1a1a1a] p-5">
            <p className="text-[10px] font-bold text-[#888880] uppercase tracking-widest mb-4">Free account includes</p>
            <ul className="space-y-2.5">
              {[
                "5 quiz runs total",
                "Top 3 country matches",
                "Save results across devices",
                "Access your matches anytime",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-[#f0f0e8] font-bold">
                  <span className="w-1.5 h-1.5 bg-[#00ffd5] flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-center text-[11px] text-[#888880] mt-4">
            Want unlimited runs?{" "}
            <Link href="/pro" className="text-[#00ffd5] font-bold hover:underline">
              Upgrade to Pro →
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Free user (signed in, hit 5 run limit)
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
      <div className="max-w-md w-full">

        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-4 h-4 bg-[#00ffd5] border-2 border-[#f0f0e8]" />
            <span className="font-heading text-lg font-extrabold uppercase tracking-tight text-[#f0f0e8]">Origio</span>
          </div>
          <div className="border-2 border-[#2a2a2a] p-6 mb-6" style={{ boxShadow: "4px 4px 0 #00ffd5" }}>
            <div className="w-10 h-10 border-2 border-[#00ffd5] flex items-center justify-center mx-auto mb-4">
              <Lock className="w-5 h-5 text-[#00ffd5]" />
            </div>
            <p className="text-[10px] font-bold text-[#888880] uppercase tracking-widest mb-2">
              {runsUsed} of {maxRuns} runs used
            </p>
            <h1 className="font-heading text-2xl font-extrabold uppercase tracking-tight text-[#f0f0e8] mb-3">
              You've used all your free runs
            </h1>
            <p className="text-sm text-[#888880] leading-relaxed">
              Upgrade to Pro for unlimited quiz runs, all 25 countries ranked, full salary breakdown, and more.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/pro"
            className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-[#00ffd5] text-[#0a0a0a] text-sm font-extrabold uppercase tracking-wide border-2 border-[#00ffd5] hover:bg-transparent hover:text-[#00ffd5] transition-colors"
            style={{ boxShadow: "3px 3px 0 #00aa90" }}
          >
            <Sparkles className="w-4 h-4" />
            Upgrade to Pro — €19.99 once
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center w-full px-6 py-3 border-2 border-[#2a2a2a] text-sm font-bold text-[#888880] uppercase tracking-wide hover:border-[#f0f0e8] hover:text-[#f0f0e8] transition-colors"
          >
            Back to globe
          </Link>
        </div>

        <div className="mt-6 border-2 border-[#1a1a1a] p-5">
          <p className="text-[10px] font-bold text-[#888880] uppercase tracking-widest mb-4">Pro includes</p>
          <ul className="space-y-2.5">
            {[
              "Unlimited quiz runs",
              "All 25 countries ranked",
              "Full salary and tax breakdown",
              "3-country comparison",
              "Complete visa checklist",
              "One-time payment, no subscription",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-[#f0f0e8] font-bold">
                <span className="w-1.5 h-1.5 bg-[#00ffd5] flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}