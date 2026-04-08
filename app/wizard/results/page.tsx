// app/wizard/results/page.tsx
/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Globe2, ArrowLeft, Lock, Star } from "lucide-react";
import { CountryMatch } from "@/lib/wizard";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function WizardResultsPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<CountryMatch[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("wizardMatches");
    if (!raw) { router.push("/wizard"); return; }
    setMatches(JSON.parse(raw));

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, [router]);

  const handleViewOnGlobe = () => {
    const topSlugs = matches.slice(0, 3).map((m) => m.country.slug);
    sessionStorage.setItem("highlightedCountries", JSON.stringify(topSlugs));
    router.push("/");
  };

  const visibleMatches = user ? matches.slice(0, 10) : matches.slice(0, 3);

  if (matches.length === 0) return null;

  const top = matches[0];

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border">
        <button onClick={() => router.push("/wizard")} className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Retake Quiz
        </button>
        <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
  <Globe2 className="w-5 h-5 text-accent" />
  <span className="font-heading font-extrabold">Origio</span>
</a>
        <button onClick={handleViewOnGlobe} className="text-sm text-accent hover:underline">
          View on Globe
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12 space-y-10">
        {/* Hero result */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/20 bg-accent/5 text-accent text-xs font-medium">
            <Star className="w-3 h-3" />
            Your top match
          </div>
          <div className="text-7xl">{top.country.flagEmoji}</div>
          <h1 className="font-heading text-4xl font-extrabold">{top.country.name}</h1>
          <div className="flex items-center justify-center gap-2">
            <div className="text-5xl font-heading font-extrabold text-accent">{top.matchPercent}%</div>
            <div className="text-left">
              <div className="text-sm font-medium text-text-primary">match</div>
              <div className="text-xs text-text-muted">for you</div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {top.reasons.map((r) => (
              <span key={r} className="px-3 py-1 text-xs rounded-full border border-accent/20 text-accent bg-accent/5">{r}</span>
            ))}
          </div>
        </div>

        {/* All matches */}
        <div className="space-y-4">
          <h2 className="font-heading text-xl font-bold">
            {user ? "Your top 10 matches" : "Your top 3 matches"}
          </h2>

          {visibleMatches.map((match, index) => (
            <button
              key={match.country.slug}
              onClick={() => {
                sessionStorage.setItem("highlightedCountries", JSON.stringify([match.country.slug]));
                router.push("/");
              }}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-bg-surface border border-border hover:border-accent/30 transition-all text-left"
            >
              <span className="font-heading font-bold text-text-muted w-6 text-center">
                {index + 1}
              </span>
              <span className="text-3xl">{match.country.flagEmoji}</span>
              <div className="flex-1">
                <p className="font-heading font-bold text-text-primary">{match.country.name}</p>
                <p className="text-xs text-text-muted mt-0.5">{match.reasons[0]}</p>
              </div>
              <div className="text-right">
                <p className="font-heading font-bold text-accent">{match.matchPercent}%</p>
                <p className="text-xs text-text-muted">match</p>
              </div>
              {/* Match bar */}
              <div className="w-16 h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full"
                  style={{ width: match.matchPercent + "%" }}
                />
              </div>
            </button>
          ))}

          {/* Gate for non-signed-in users */}
          {!user && matches.length > 3 && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bg-primary z-10 rounded-2xl" />
              <div className="p-6 rounded-2xl bg-bg-surface border border-border opacity-30 pointer-events-none">
                <div className="flex items-center gap-4">
                  <span className="font-heading font-bold text-text-muted w-6 text-center">4</span>
                  <span className="text-3xl">🌍</span>
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-bg-elevated rounded" />
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                <div className="text-center space-y-4 p-6">
                  <Lock className="w-8 h-8 text-accent mx-auto" />
                  <p className="font-heading font-bold text-text-primary">See your full top 10</p>
                  <p className="text-sm text-text-muted">Sign in to unlock all your matches and detailed breakdowns.</p>
                  <button
                    onClick={() => router.push("/auth")}
                    className="cta-button px-6 py-3 rounded-xl text-sm font-medium"
                  >
                    Sign in — it's free
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CTA to globe */}
        <div className="text-center space-y-4 pt-4">
          <button
            onClick={handleViewOnGlobe}
            className="cta-button px-8 py-4 rounded-2xl text-base font-medium w-full"
          >
            View my matches on the Globe
          </button>
          <button
            onClick={() => router.push("/wizard")}
            className="text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            Retake the quiz
          </button>
        </div>
      </div>
    </div>
  );
}