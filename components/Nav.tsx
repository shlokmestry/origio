"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Menu, X, User, Sparkles, Bookmark } from "lucide-react";
import { GlobeCountry } from "@/types";
import { supabase } from "@/lib/supabase";
import CommandSearch from "@/components/CommandSearch";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface NavProps {
  countries: GlobeCountry[];
  onCountrySelect: (slug: string) => void;
}

export default function Nav({ countries, onCountrySelect }: NavProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isPro, setIsPro] = useState(false);

  const fetchProStatus = useCallback(async (userId: string) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_pro")
      .eq("id", userId)
      .single();
    setIsPro(profile?.is_pro ?? false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) await fetchProStatus(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) await fetchProStatus(session.user.id);
      else setIsPro(false);
    });

    const handleVisibility = async () => {
      if (document.visibilityState === "visible") {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        if (session?.user) await fetchProStatus(session.user.id);
        else setIsPro(false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchProStatus]);

  // cmd+k / ctrl+k global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleCountrySelect = useCallback((slug: string) => {
    onCountrySelect(slug);
    setSearchOpen(false);
  }, [onCountrySelect]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a] border-b-2 border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">

            <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <div className="w-4 h-4 bg-accent border-2 border-text-primary flex-shrink-0" />
              <span className="font-heading text-lg font-extrabold tracking-tight text-text-primary uppercase">
                Origio
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              {/* Search trigger — opens CommandSearch modal */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 border-2 border-[#2a2a2a] text-sm font-medium text-text-muted hover:border-accent hover:text-text-primary transition-all"
                style={{ boxShadow: "2px 2px 0 #2a2a2a" }}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search countries...</span>
                <kbd className="ml-2 px-1.5 py-0.5 text-[10px] font-mono border border-[#2a2a2a] text-text-muted">
                  ⌘K
                </kbd>
              </button>

              <Link href="/guides" className="text-sm font-bold text-text-muted hover:text-text-primary transition-colors uppercase tracking-wide">
                Guides
              </Link>
              <Link href="/blog" className="text-sm font-bold text-text-muted hover:text-text-primary transition-colors uppercase tracking-wide">
                Blog
              </Link>
              <Link href="/about" className="text-sm font-bold text-text-muted hover:text-text-primary transition-colors uppercase tracking-wide">
                About
              </Link>

              {!isPro && (
                <a href="/pro" className="flex items-center gap-1.5 text-sm font-bold text-accent hover:opacity-80 transition-opacity uppercase tracking-wide">
                  <Sparkles className="w-3.5 h-3.5" />
                  Origio Pro
                </a>
              )}

              {user ? (
                <a
                  href="/profile"
                  className={`flex items-center gap-2 px-3 py-1.5 border-2 font-bold text-xs uppercase tracking-wide transition-all ${
                    isPro
                      ? "border-accent text-accent"
                      : "border-[#2a2a2a] text-text-primary hover:border-text-primary"
                  }`}
                  style={{ boxShadow: "2px 2px 0 " + (isPro ? "#00ffd5" : "#2a2a2a") }}
                >
                  {isPro ? <Sparkles className="w-3 h-3" /> : <User className="w-3 h-3" />}
                  {user.user_metadata?.full_name?.split(" ")[0] || user.email?.split("@")[0]}
                  {isPro && <span className="text-[10px]">PRO</span>}
                </a>
              ) : (
                <a
                  href="/signin"
                  className="flex items-center gap-2 px-3 py-1.5 border-2 border-[#2a2a2a] font-bold text-xs text-text-primary uppercase tracking-wide hover:border-text-primary transition-all"
                  style={{ boxShadow: "2px 2px 0 #2a2a2a" }}
                >
                  <Bookmark className="w-3 h-3" />
                  Sign In
                </a>
              )}
            </div>

            {/* Mobile: search icon + hamburger */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 border-2 border-[#2a2a2a] hover:border-accent transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 border-2 border-[#2a2a2a] hover:border-text-primary transition-colors"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[#0f0f0f] border-b-2 border-[#2a2a2a]">
            <div className="p-4 space-y-0">
              <a href="/guides" className="block px-3 py-3 text-sm font-bold uppercase tracking-wide text-text-muted hover:text-text-primary border-b-2 border-[#1a1a1a]" onClick={() => setMobileMenuOpen(false)}>Guides</a>
              <a href="/about" className="block px-3 py-3 text-sm font-bold uppercase tracking-wide text-text-muted hover:text-text-primary border-b-2 border-[#1a1a1a]" onClick={() => setMobileMenuOpen(false)}>About</a>
              {!isPro && (
                <a href="/pro" className="flex items-center gap-1.5 px-3 py-3 text-sm font-bold text-accent border-b-2 border-[#1a1a1a]" onClick={() => setMobileMenuOpen(false)}>
                  <Sparkles className="w-3.5 h-3.5" /> Origio Pro
                </a>
              )}
              <div className="pt-3">
                {user ? (
                  <a href="/profile" className="block px-3 py-2 text-xs font-bold text-text-muted uppercase" onClick={() => setMobileMenuOpen(false)}>
                    {isPro && "✦ "}{user.user_metadata?.full_name || user.email}
                  </a>
                ) : (
                  <a href="/signin" className="flex items-center justify-center gap-2 px-3 py-3 border-2 border-[#2a2a2a] text-sm font-bold text-text-primary uppercase" onClick={() => setMobileMenuOpen(false)}>
                    <Bookmark className="w-4 h-4" /> Sign In
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* CommandSearch modal — rendered outside nav, covers full screen */}
      <CommandSearch
        countries={countries}
        onCountrySelect={handleCountrySelect}
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}