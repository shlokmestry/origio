"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Globe2, Star, Lock, Sparkles } from "lucide-react";
import { CountryMatch, WizardAnswers } from "@/lib/wizard";
import { JOB_ROLES } from "@/types";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

const LOADING_STEPS = [
  "Crunching salary data...",
  "Checking visa routes...",
  "Weighing your priorities...",
  "Ranking 25 countries...",
  "Almost done...",
];

const RANK_COLORS = ["#00ffd5", "#facc15", "#a78bfa"];

const ROLE_TO_GUIDE: Record<string, string> = {
  softwareEngineer: "software-engineers",
  productManager:   "product-managers",
  uxDesigner:       "designers",
  nurse:            "nurses",
  teacher:          "teachers",
  accountant:       "accountants",
  marketingManager: "marketing-managers",
};

export default function WizardResultsPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<CountryMatch[]>([]);
  const [answers, setAnswers] = useState<Partial<WizardAnswers>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data } = await supabase.from("profiles").select("is_pro").eq("id", session.user.id).single();
        setIsPro(data?.is_pro ?? false);
      }
    });
  }, []);

  useEffect(() => {
    const raw = sessionStorage.getItem("wizardMatches");
    const answersRaw = sessionStorage.getItem("wizardAnswers");
    if (!raw) { router.push("/wizard"); return; }
    setMatches(JSON.parse(raw));
    if (answersRaw) setAnswers(JSON.parse(answersRaw));

    let progress = 0;
    let stepIndex = 0;
    const interval = setInterval(() => {
      progress += 2;
      setLoadingProgress(progress);
      if (progress % 20 === 0 && stepIndex < LOADING_STEPS.length - 1) {
        stepIndex++;
        setLoadingStep(stepIndex);
      }
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => { setIsLoading(false); setTimeout(() => setRevealed(true), 100); }, 400);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => {
    if (!isLoading && matches.length > 0 && user) {
      const saveToSupabase = async () => {
        try {
          const topCountries = matches.slice(0, 10).map(m => ({
            slug: m.country.slug,
            name: m.country.name,
            flagEmoji: m.country.flagEmoji,
            matchPercent: m.matchPercent,
            reasons: m.reasons,
          }));

          const { data: existing } = await supabase.from('wizard_results')
            .select('id').eq('user_id', user.id).maybeSingle();

          if (existing) {
            await supabase.from('wizard_results').update({
              top_countries: topCountries,
              answers: answers,
              created_at: new Date().toISOString()
            }).eq('id', existing.id);
          } else {
            await supabase.from('wizard_results').insert({
              user_id: user.id,
              top_countries: topCountries,
              answers: answers,
              created_at: new Date().toISOString()
            });
          }
        } catch (err) {
          console.error('Failed to save wizard results:', err);
        }
      };
      saveToSupabase();
    }
  }, [isLoading, matches, user, answers]);

  const handleViewOnGlobe = () => {
    const slugs = matches.slice(0, 3).map((m) => m.country.slug);
    sessionStorage.setItem("highlightedCountries", JSON.stringify(slugs));
    sessionStorage.setItem("wizardMatches", JSON.stringify(matches));
    router.push("/");
  };

  const visibleMatches = isPro ? matches.slice(0, 25) : user ? matches.slice(0, 10) : matches.slice(0, 3);
  const jobRoleDef = JOB_ROLES.find((r) => r.key === answers.jobRole);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm text-center space-y-8">
          <div className="relative mx-auto w-20 h-20 border-2 border-[#2a2a2a] flex items-center justify-center">
            <Globe2 className="w-10 h-10 text-accent animate-spin" style={{ animationDuration: "3s" }} />
            <div className="absolute inset-0 border-2 border-accent animate-ping opacity-20" />
          </div>
          <div className="space-y-2">
            <h2 className="font-heading text-2xl font-extrabold text-text-primary uppercase tracking-tight">Finding your country...</h2>
            <p key={loadingStep} className="text-text-muted text-sm animate-fade-up font-medium">{LOADING_STEPS[loadingStep]}</p>
          </div>
          <div className="w-full h-2 bg-[#1a1a1a] border-2 border-[#2a2a2a]">
            <div className="h-full bg-accent transition-all duration-100 ease-linear" style={{ width: loadingProgress + "%" }} />
          </div>
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest">{loadingProgress}%</p>
        </div>
      </div>
    );
  }

  if (matches.length === 0) return null;
  const top = matches[0];

  const guideSlug = answers.jobRole ? ROLE_TO_GUIDE[answers.jobRole] : null;
  const guideHref = guideSlug ? `/guides/${guideSlug}` : `/country/${top.country.slug}/personalised`;
  const guideLabel = guideSlug
    ? `${jobRoleDef?.label ?? "Relocation"} Guide`
    : `${top.country.name} Report`;

  return (
    <div className="min-h-screen bg-[#0a0a0a]" style={{ opacity: revealed ? 1 : 0, transform: revealed ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.5s ease, transform 0.5s ease" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b-2 border-[#2a2a2a]">
        <button onClick={() => router.push("/wizard")} className="flex items-center gap-2 text-sm font-bold text-text-muted hover:text-text-primary transition-colors uppercase tracking-wide">
          <ArrowLeft className="w-4 h-4" /> Retake
        </button>
        <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-3 h-3 bg-accent border-2 border-text-primary" />
          <span className="font-heading font-extrabold uppercase tracking-tight">Origio</span>
        </a>
        <button onClick={handleViewOnGlobe} className="text-sm font-bold text-accent hover:opacity-80 transition-opacity uppercase tracking-wide">
          View on Globe
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">

        {/* Top match hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 border-2 border-accent text-accent text-xs font-bold px-3 py-1.5 uppercase tracking-widest">
            <Star className="w-3 h-3" /> Your top match
          </div>
          <div className="text-7xl">{top.country.flagEmoji}</div>
          <div>
            <h1 className="font-heading text-5xl font-extrabold uppercase tracking-tight text-text-primary">{top.country.name}</h1>
            <p className="text-accent font-bold text-xl mt-1">{top.matchPercent}% match</p>
          </div>
          {top.reasons.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {top.reasons.map((r) => (
                <span key={r} className="text-xs font-bold px-3 py-1 border-2 border-accent text-accent uppercase tracking-wide">{r}</span>
              ))}
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link href={"/country/" + top.country.slug + "/personalised"} className="cta-button px-6 py-3 text-sm font-bold uppercase tracking-wide">
              View Full Report
            </Link>
            <button onClick={handleViewOnGlobe} className="ghost-button px-6 py-3 text-sm font-bold uppercase tracking-wide">
              See on Globe
            </button>
          </div>

          {/* Next-step CTA */}
          <Link
            href={guideHref}
            className="inline-flex items-center gap-2 text-sm font-bold text-text-muted hover:text-accent transition-colors group"
          >
            Ready to explore {top.country.name}?
            <span className="text-accent group-hover:underline">{guideLabel}</span>
            <ArrowRight className="w-3.5 h-3.5 text-accent" />
          </Link>
        </div>

        {/* Rankings list */}
        <div>
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">
            Your full ranking {jobRoleDef ? `· ${jobRoleDef.label}` : ""}
          </p>
          <div className="space-y-2">
            {visibleMatches.map((match, i) => (
              <Link key={match.country.slug} href={"/country/" + match.country.slug + "/personalised"}
                className="flex items-center gap-4 p-4 border-2 border-[#2a2a2a] bg-[#111111] hover:border-text-primary transition-all group"
                style={i < 3 ? { boxShadow: "3px 3px 0 " + RANK_COLORS[i] } : {}}>
                <span className="font-heading font-extrabold text-lg w-7 text-right flex-shrink-0" style={{ color: i < 3 ? RANK_COLORS[i] : "#444" }}>
                  {i + 1}
                </span>
                <span className="text-2xl">{match.country.flagEmoji}</span>
                <span className="font-heading font-bold text-text-primary uppercase tracking-tight flex-1">{match.country.name}</span>
                <span className="font-bold text-sm" style={{ color: i < 3 ? RANK_COLORS[i] : "#666" }}>{match.matchPercent}%</span>
              </Link>
            ))}
          </div>

          {/* Upgrade gate */}
          {!isPro && (
            <div className="mt-4 border-2 border-[#2a2a2a] overflow-hidden" style={{ boxShadow: "4px 4px 0 #2a2a2a" }}>
              <div className="relative">
                <div className="opacity-30 pointer-events-none space-y-0">
                  {[11, 12, 13].map((n) => (
                    <div key={n} className="flex items-center gap-4 p-4 border-b border-[#1a1a1a]">
                      <span className="font-heading font-extrabold text-lg w-7 text-right text-text-muted">{n}</span>
                      <span className="text-2xl">🌍</span>
                      <div className="h-4 w-24 bg-[#2a2a2a]" />
                    </div>
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]/80">
                  <div className="text-center space-y-3 p-6">
                    <Lock className="w-6 h-6 text-accent mx-auto" />
                    <p className="font-heading font-bold text-text-primary uppercase text-sm">See all 25 countries ranked</p>
                    <p className="text-xs text-text-muted">Upgrade to Pro to unlock the full ranking.</p>
                    <Link href="/pro" className="cta-button px-6 py-2.5 text-xs font-bold inline-flex items-center gap-2 uppercase tracking-wide">
                      <Sparkles className="w-3 h-3" /> Upgrade to Pro ~ €5
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom CTAs */}
        <div className="text-center space-y-3 pt-2 pb-8">
          <button onClick={handleViewOnGlobe} className="cta-button w-full py-4 text-sm font-bold uppercase tracking-wide">
            View my matches on the Globe
          </button>
          <button onClick={() => router.push("/wizard")} className="text-sm font-bold text-text-muted hover:text-accent transition-colors uppercase tracking-wide">
            Retake the quiz
          </button>
        </div>
      </div>
    </div>
  );
}