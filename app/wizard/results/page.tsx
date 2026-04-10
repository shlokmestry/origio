/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Globe2, ArrowLeft, Lock, Star, Share2, Check } from "lucide-react";
import { CountryMatch, WizardAnswers } from "@/lib/wizard";
import { JOB_ROLES } from "@/types";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const LOADING_STEPS = [
  "Analysing your priorities...",
  "Comparing 25 countries...",
  "Checking visa compatibility...",
  "Calculating salary potential...",
  "Finding your perfect match...",
];

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", AUD: "A$", CAD: "C$",
  NZD: "NZ$", CHF: "CHF ", SGD: "S$", AED: "AED ",
  NOK: "kr ", SEK: "kr ", JPY: "¥", INR: "₹", BRL: "R$",
  MYR: "RM ", DKK: "kr ",
};

function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] ?? currency + " ";
}

export default function WizardResultsPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<CountryMatch[]>([]);
  const [answers, setAnswers] = useState<Partial<WizardAnswers>>({});
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("wizardMatches");
    const answersRaw = sessionStorage.getItem("wizardAnswers");
    if (!raw) { router.push("/wizard"); return; }
    setMatches(JSON.parse(raw));
    if (answersRaw) setAnswers(JSON.parse(answersRaw));

    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)

      if (session?.user) {
        const parsedMatches: CountryMatch[] = JSON.parse(raw)
        const parsedAnswers = answersRaw ? JSON.parse(answersRaw) : {}
        const topCountries = parsedMatches.slice(0, 3).map((m) => ({
          slug: m.country.slug,
          name: m.country.name,
          flagEmoji: m.country.flagEmoji,
          matchPercent: m.matchPercent,
        }))

        const { error } = await supabase.from('wizard_results').upsert(
          {
            user_id: session.user.id,
            top_countries: topCountries,
            answers: { role: parsedAnswers.jobRole },
          },
          { onConflict: 'user_id' }
        )

        if (error) console.error('Wizard save error:', error.message)
        else console.log('✅ Wizard result saved!')
      }
    })()

    let step = 0;
    const stepInterval = setInterval(() => {
      step++;
      if (step < LOADING_STEPS.length) {
        setLoadingStep(step);
      } else {
        clearInterval(stepInterval);
      }
    }, 700);

    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 2;
      setLoadingProgress(Math.min(progress, 100));
      if (progress >= 100) {
        clearInterval(progressInterval);
        setTimeout(() => {
          setIsLoading(false);
          setTimeout(() => setRevealed(true), 100);
        }, 400);
      }
    }, 70);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [router]);

  const handleViewOnGlobe = () => {
    const topSlugs = matches.slice(0, 3).map((m) => m.country.slug);
    sessionStorage.setItem("highlightedCountries", JSON.stringify(topSlugs));
    router.push("/");
  };

  const handleShare = async () => {
    const top = matches[0];
    const second = matches[1];
    const third = matches[2];

    // ✅ Always uses whatever domain the app is running on
    const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://origio-one.vercel.app";
    const shareUrl = `${siteUrl}/wizard`;

    const shareText = `I just found my top country matches on Origio! 🌍\n\n${top.country.flagEmoji} ${top.country.name} — ${top.matchPercent}% match\n${second?.country.flagEmoji ?? ""} ${second?.country.name ?? ""} — ${second?.matchPercent ?? ""}% match\n${third?.country.flagEmoji ?? ""} ${third?.country.name ?? ""} — ${third?.matchPercent ?? ""}% match\n\nFind yours 👇\n${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `I'm ${top.matchPercent}% ${top.country.name} ${top.country.flagEmoji}`,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // user cancelled share — do nothing
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    }
  };

  const visibleMatches = user ? matches.slice(0, 10) : matches.slice(0, 3);
  const jobRoleDef = JOB_ROLES.find((r) => r.key === answers.jobRole);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm text-center space-y-8">
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-full border-2 border-accent/20 animate-ping" />
            <div className="absolute inset-2 rounded-full border-2 border-accent/40 animate-ping" style={{ animationDelay: "0.3s" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Globe2 className="w-12 h-12 text-accent animate-spin" style={{ animationDuration: "3s" }} />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="font-heading text-2xl font-extrabold text-text-primary">
              Finding your country...
            </h2>
            <p key={loadingStep} className="text-text-muted text-sm animate-fade-up">
              {LOADING_STEPS[loadingStep]}
            </p>
          </div>
          <div className="w-full h-1.5 bg-bg-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-100 ease-linear"
              style={{ width: loadingProgress + "%" }}
            />
          </div>
          <p className="text-xs text-text-muted">{loadingProgress}%</p>
        </div>
      </div>
    );
  }

  if (matches.length === 0) return null;
  const top = matches[0];

  return (
    <div
      className="min-h-screen bg-bg-primary"
      style={{
        opacity: revealed ? 1 : 0,
        transform: revealed ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}
    >
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
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/20 bg-accent/5 text-accent text-xs font-medium">
            <Star className="w-3 h-3" />
            Your top match
          </div>
          <div className="text-7xl" style={{ animation: revealed ? "bounceIn 0.8s ease 0.2s both" : "none" }}>
            {top.country.flagEmoji}
          </div>
          <h1 className="font-heading text-4xl font-extrabold">{top.country.name}</h1>
          <div className="flex items-center justify-center gap-2">
            <div className="font-heading font-extrabold text-accent" style={{ fontSize: "4rem", lineHeight: 1 }}>
              {top.matchPercent}%
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-text-primary">match</div>
              <div className="text-xs text-text-muted">for you</div>
            </div>
          </div>
          {jobRoleDef && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-elevated border border-border">
              <span className="text-sm text-text-muted">{jobRoleDef.emoji} {jobRoleDef.label} salary:</span>
              <span className="font-heading font-bold text-accent">
                {getCurrencySymbol(top.country.currency)}{Math.round((top.country.data[jobRoleDef.salaryKey] as number) / 1000)}k/yr
              </span>
            </div>
          )}
          <div className="flex flex-wrap justify-center gap-2">
            {top.reasons.map((r) => (
              <span key={r} className="px-3 py-1 text-xs rounded-full border border-accent/20 text-accent bg-accent/5">{r}</span>
            ))}
          </div>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-accent/30 bg-accent/5 text-accent text-sm font-medium hover:bg-accent/10 transition-all"
          >
            {shared ? (
              <>
                <Check className="w-4 h-4" />
                Copied to clipboard!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                Share my result
              </>
            )}
          </button>
        </div>

        <div className="space-y-4">
          <h2 className="font-heading text-xl font-bold">
            {user ? "Your top 10 matches" : "Your top 3 matches"}
          </h2>

          {visibleMatches.map((match, index) => {
            const salary = jobRoleDef ? match.country.data[jobRoleDef.salaryKey] as number : null;
            const sym = getCurrencySymbol(match.country.currency);
            return (
              <button
                key={match.country.slug}
                onClick={() => {
                  sessionStorage.setItem("highlightedCountries", JSON.stringify([match.country.slug]));
                  router.push("/");
                }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-bg-surface border border-border hover:border-accent/30 transition-all text-left"
                style={{
                  opacity: revealed ? 1 : 0,
                  transform: revealed ? "translateY(0)" : "translateY(10px)",
                  transition: `opacity 0.4s ease ${0.1 + index * 0.08}s, transform 0.4s ease ${0.1 + index * 0.08}s`,
                }}
              >
                <span className="font-heading font-bold text-text-muted w-6 text-center">{index + 1}</span>
                <span className="text-3xl">{match.country.flagEmoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-bold text-text-primary">{match.country.name}</p>
                  <p className="text-xs text-text-muted mt-0.5 truncate">{match.reasons[0]}</p>
                  {salary && jobRoleDef && (
                    <p className="text-xs text-accent mt-0.5 font-medium">
                      {jobRoleDef.emoji} {sym}{Math.round(salary / 1000)}k/yr
                    </p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-heading font-bold text-accent">{match.matchPercent}%</p>
                  <p className="text-xs text-text-muted">match</p>
                </div>
                <div className="w-12 h-1.5 bg-bg-elevated rounded-full overflow-hidden flex-shrink-0">
                  <div className="h-full bg-accent rounded-full" style={{ width: match.matchPercent + "%" }} />
                </div>
              </button>
            );
          })}

          {!user && matches.length > 3 && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bg-primary z-10 rounded-2xl" />
              <div className="p-6 rounded-2xl bg-bg-surface border border-border opacity-30 pointer-events-none">
                <div className="flex items-center gap-4">
                  <span className="font-heading font-bold text-text-muted w-6 text-center">4</span>
                  <span className="text-3xl">🌍</span>
                  <div className="flex-1"><div className="h-4 w-24 bg-bg-elevated rounded" /></div>
                </div>
              </div>
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                <div className="text-center space-y-4 p-6">
                  <Lock className="w-8 h-8 text-accent mx-auto" />
                  <p className="font-heading font-bold text-text-primary">See your full top 10</p>
                  <p className="text-sm text-text-muted">Sign in to unlock all your matches and detailed breakdowns.</p>
                  <button onClick={() => router.push("/profile")} className="cta-button px-6 py-3 rounded-xl text-sm font-medium">
                    Sign in — it's free
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-center space-y-4 pt-4">
          <button onClick={handleViewOnGlobe} className="cta-button px-8 py-4 rounded-2xl text-base font-medium w-full">
            View my matches on the Globe
          </button>
          <button onClick={() => router.push("/wizard")} className="text-sm text-text-muted hover:text-text-primary transition-colors">
            Retake the quiz
          </button>
        </div>
      </div>
    </div>
  );
}