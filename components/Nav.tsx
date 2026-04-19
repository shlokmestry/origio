"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Globe2, Menu, X, LogIn, User, Sparkles } from "lucide-react";
import { GlobeCountry } from "@/types";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface NavProps {
  countries: GlobeCountry[];
  onCountrySelect: (slug: string) => void;
  onSearchOpen?: () => void;
}

export default function Nav({ countries, onCountrySelect, onSearchOpen }: NavProps) {
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
      if (session?.user) await fetchProStatus(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) await fetchProStatus(session.user.id);
      else setIsPro(false);
    });

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        if (session?.user) await fetchProStatus(session.user.id);
        else setIsPro(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchProStatus]);

  const handleSearchClick = () => {
    onSearchOpen?.();
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Globe2 className="w-6 h-6 text-accent" />
            <span className="font-heading text-xl font-extrabold tracking-tight text-text-primary">
              Origio
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            {/* Search button — opens CommandSearch */}
            <button
              onClick={handleSearchClick}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-border hover:border-border-hover transition-colors text-sm text-text-muted hover:text-text-primary"
            >
              <Search className="w-4 h-4" />
              <span>Search countries...</span>
              <kbd className="ml-4 px-1.5 py-0.5 text-[10px] rounded bg-bg-elevated border border-border text-text-muted">⌘K</kbd>
            </button>

            <Link href="/guides" className="text-sm text-text-muted hover:text-text-primary transition-colors">
              Guides
            </Link>
            <Link href="/about" className="text-sm text-text-muted hover:text-text-primary transition-colors">
              About
            </Link>

            {!isPro && (
              <Link href="/pro" className="flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent/80 transition-colors">
                <Sparkles className="w-3.5 h-3.5" />
                Origio Pro
              </Link>
            )}

            {user ? (
              <Link
                href="/profile"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-colors ${
                  isPro
                    ? 'bg-accent/10 border-accent/30 hover:border-accent/50'
                    : 'bg-bg-elevated border-border hover:border-border-hover'
                }`}
              >
                {isPro
                  ? <Sparkles className="w-3.5 h-3.5 text-accent" />
                  : <User className="w-3.5 h-3.5 text-accent" />
                }
                <span className="text-xs text-text-muted truncate max-w-[120px]">
                  {user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]}
                </span>
                {isPro && <span className="text-[10px] font-bold text-accent">PRO</span>}
              </Link>
            ) : (
              <Link
                href="/signin"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-colors text-sm text-accent font-medium"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-bg-elevated transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 glass-panel-strong border-t border-border">
          <div className="p-4 space-y-2">
            <button
              onClick={handleSearchClick}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-bg-elevated border border-border text-sm text-text-muted text-left"
            >
              <Search className="w-4 h-4" />
              Search countries...
            </button>

            <div className="pt-2 border-t border-border space-y-1">
              <Link href="/guides" className="block px-3 py-2 text-sm text-text-muted hover:text-text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>
                Guides
              </Link>
              <Link href="/about" className="block px-3 py-2 text-sm text-text-muted hover:text-text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>
                About
              </Link>
              {!isPro && (
                <Link href="/pro" className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-accent" onClick={() => setMobileMenuOpen(false)}>
                  <Sparkles className="w-3.5 h-3.5" />
                  Origio Pro
                </Link>
              )}
              {user ? (
                <Link href="/profile" className="block px-3 py-2 text-sm text-text-muted hover:text-text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Profile
                </Link>
              ) : (
                <Link href="/signin" className="block px-3 py-2 text-sm text-accent font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}