"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Globe2, Menu, X, LogIn, User, Sparkles, Bookmark } from "lucide-react";
import { GlobeCountry } from "@/types";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface NavProps {
  countries: GlobeCountry[];
  onCountrySelect: (slug: string) => void;
}

export default function Nav({ countries, onCountrySelect }: NavProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isPro, setIsPro] = useState(false);

  const fetchProStatus = useCallback(async (userId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_pro')
      .eq('id', userId)
      .single();
    setIsPro(profile?.is_pro ?? false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProStatus(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProStatus(session.user.id);
      } else {
        setIsPro(false);
      }
    });

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProStatus(session.user.id);
        } else {
          setIsPro(false);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchProStatus]);

  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Globe2 className="w-6 h-6 text-accent" />
            <span className="font-heading text-xl font-extrabold tracking-tight text-text-primary">
              Origio
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-5">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              <Search className="w-4 h-4" />
              <span>Search countries...</span>
            </button>

            <Link href="/guides"
              className="text-sm text-text-muted hover:text-text-primary transition-colors">
              Guides
            </Link>

            <Link href="/about"
              className="text-sm text-text-muted hover:text-text-primary transition-colors">
              About
            </Link>

            {!isPro && (
              <a href="/pro"
                className="flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent/80 transition-colors">
                <Sparkles className="w-3.5 h-3.5" />
                Origio Pro
              </a>
            )}

            {user ? (
              <a href="/profile"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-colors ${
                  isPro
                    ? 'bg-accent/10 border-accent/30 hover:border-accent/50'
                    : 'bg-bg-elevated border-border hover:border-border-hover'
                }`}>
                {isPro
                  ? <Sparkles className="w-3.5 h-3.5 text-accent" />
                  : <User className="w-3.5 h-3.5 text-accent" />
                }
                <span className="text-xs text-text-muted truncate max-w-[120px]">
                  {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                </span>
                {isPro && <span className="text-[10px] font-bold text-accent">PRO</span>}
              </a>
            ) : (
              /* Bookmark-style Sign In button */
              <a href="/signin"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-elevated border border-border hover:border-border-hover transition-colors text-sm text-text-primary font-medium">
                <Bookmark className="w-4 h-4 text-text-muted" />
                Sign In
              </a>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-bg-elevated transition-colors">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="absolute top-full left-0 right-0 glass-panel-strong border-t border-border">
          <div className="max-w-2xl mx-auto p-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input type="text" placeholder="Search for a country..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} autoFocus
                className="w-full pl-12 pr-4 py-3 bg-bg-elevated rounded-xl border border-border focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/20 text-text-primary placeholder:text-text-muted transition-colors" />
            </div>
            {searchQuery.length > 0 && (
              <div className="mt-3 max-h-64 overflow-y-auto">
                {filteredCountries.length === 0 ? (
                  <p className="text-sm text-text-muted text-center py-4">No countries found</p>
                ) : (
                  filteredCountries.map((country) => (
                    <button
                      key={country.slug}
                      onClick={() => {
                        onCountrySelect(country.slug);
                        setSearchOpen(false);
                        setSearchQuery("");
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg-elevated transition-colors text-left"
                    >
                      <span className="text-xl">{country.flagEmoji}</span>
                      <span className="text-sm">{country.name}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 glass-panel-strong border-t border-border">
          <div className="p-4 space-y-2">
            {searchQuery.length > 0 && filteredCountries.map((country) => (
              <button
                key={country.slug}
                onClick={() => {
                  onCountrySelect(country.slug);
                  setMobileMenuOpen(false);
                  setSearchQuery("");
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg-elevated transition-colors text-left"
              >
                <span className="text-xl">{country.flagEmoji}</span>
                <span className="text-sm">{country.name}</span>
              </button>
            ))}

            <div className="pt-2 border-t border-border space-y-2">
              <a href="/guides"
                className="block px-3 py-2 text-sm text-text-muted hover:text-text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}>
                Guides
              </a>
              <a href="/about"
                className="block px-3 py-2 text-sm text-text-muted hover:text-text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}>
                About
              </a>
              {!isPro && (
                <a href="/pro"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-accent"
                  onClick={() => setMobileMenuOpen(false)}>
                  <Sparkles className="w-3.5 h-3.5" />
                  Origio Pro
                </a>
              )}
              {user ? (
                <a href="/profile"
                  className="block px-3 py-2 text-xs text-text-muted"
                  onClick={() => setMobileMenuOpen(false)}>
                  {isPro && '✦ '}{user.user_metadata?.full_name || user.email}
                  {isPro && <span className="ml-1 text-accent font-bold">PRO</span>}
                </a>
              ) : (
                <a href="/signin"
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-bg-elevated border border-border text-sm text-text-primary font-medium"
                  onClick={() => setMobileMenuOpen(false)}>
                  <Bookmark className="w-4 h-4 text-text-muted" />
                  Sign In
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}