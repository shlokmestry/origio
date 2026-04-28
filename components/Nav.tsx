"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Menu, X, User, Sparkles, Bookmark } from "lucide-react";
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

  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
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
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              Search countries...
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

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 border-2 border-[#2a2a2a] hover:border-text-primary transition-colors"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#0f0f0f] border-b-2 border-[#2a2a2a]">
          <div className="max-w-2xl mx-auto p-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search for a country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-11 pr-4 py-3 bg-[#1a1a1a] border-2 border-[#2a2a2a] focus:border-accent text-text-primary placeholder:text-text-muted outline-none text-sm font-medium transition-colors"
              />
            </div>
            {searchQuery.length > 0 && (
              <div className="mt-2 max-h-60 overflow-y-auto border-2 border-[#2a2a2a] border-t-0">
                {filteredCountries.length === 0 ? (
                  <p className="text-sm text-text-muted text-center py-4">No countries found</p>
                ) : (
                  filteredCountries.map((country) => (
                    <button
                      key={country.slug}
                      onClick={() => { onCountrySelect(country.slug); setSearchOpen(false); setSearchQuery(""); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#1a1a1a] transition-colors text-left border-b border-[#1a1a1a] last:border-0"
                    >
                      <span className="text-lg">{country.flagEmoji}</span>
                      <span className="text-sm font-medium">{country.name}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#0f0f0f] border-b-2 border-[#2a2a2a]">
          <div className="p-4 space-y-0">
            {/* Search */}
            <button
              onClick={() => { setSearchOpen(true); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-3 text-sm font-bold uppercase tracking-wide text-text-muted hover:text-text-primary border-b-2 border-[#1a1a1a] text-left"
            >
              <Search className="w-3.5 h-3.5" /> Search Countries
            </button>
            <a href="/guides" className="block px-3 py-3 text-sm font-bold uppercase tracking-wide text-text-muted hover:text-text-primary border-b-2 border-[#1a1a1a]" onClick={() => setMobileMenuOpen(false)}>Guides</a>
            {/* Blog */}
            <a href="/blog" className="block px-3 py-3 text-sm font-bold uppercase tracking-wide text-text-muted hover:text-text-primary border-b-2 border-[#1a1a1a]" onClick={() => setMobileMenuOpen(false)}>Blog</a>
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
  );
}