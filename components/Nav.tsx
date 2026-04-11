"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Globe2, Menu, X, LogIn, LogOut, User } from "lucide-react";
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-border hover:border-border-hover transition-colors text-sm text-text-muted hover:text-text-primary"
            >
              <Search className="w-4 h-4" />
              <span>Search countries...</span>
              <kbd className="ml-4 px-1.5 py-0.5 text-[10px] rounded bg-bg-elevated border border-border text-text-muted">
                ⌘K
              </kbd>
            </button>

            <Link
              href="/best-countries-for/software-engineers"
              className="text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              Guides
            </Link>

            <Link
              href="/about"
              className="text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              About
            </Link>

            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-bg-elevated border border-border hover:border-border-hover transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xs text-text-muted truncate max-w-[120px]">
                    {user.user_metadata?.full_name || user.email}
                  </span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border hover:border-border-hover transition-colors text-xs text-text-muted hover:text-text-primary"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/profile"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-colors text-sm text-accent font-medium"
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

      {searchOpen && (
        <div className="absolute top-full left-0 right-0 glass-panel-strong border-t border-border">
          <div className="max-w-2xl mx-auto p-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="text"
                placeholder="Search for a country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-12 pr-4 py-3 bg-bg-elevated rounded-xl border border-border focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/20 text-text-primary placeholder:text-text-muted transition-colors"
              />
            </div>
            {searchQuery.length > 0 && (
              <div className="mt-3 max-h-64 overflow-y-auto">
                {filteredCountries.length === 0 ? (
                  <p className="text-text-muted text-sm py-4 text-center">No countries found</p>
                ) : (
                  <div className="space-y-1">
                    {filteredCountries.map((country) => (
                      <button
                        key={country.slug}
                        onClick={() => {
                          onCountrySelect(country.slug);
                          setSearchOpen(false);
                          setSearchQuery("");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-bg-elevated transition-colors text-left"
                      >
                        <span className="text-2xl">{country.flagEmoji}</span>
                        <div>
                          <p className="text-sm font-medium text-text-primary">{country.name}</p>
                          <p className="text-xs text-text-muted">Move Score: {country.moveScore}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {mobileMenuOpen && (
        <div className="md:hidden glass-panel-strong border-t border-border">
          <div className="p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search countries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-bg-elevated rounded-xl border border-border focus:border-accent/40 focus:outline-none text-sm text-text-primary placeholder:text-text-muted"
              />
            </div>

            {searchQuery.length > 0 && (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {filteredCountries.map((country) => (
                  <button
                    key={country.slug}
                    onClick={() => {
                      onCountrySelect(country.slug);
                      setMobileMenuOpen(false);
                      setSearchQuery("");
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg-elevated transition-colors text-left"
                  >
                    <span className="text-lg">{country.flagEmoji}</span>
                    <span className="text-sm">{country.name}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="pt-2 border-t border-border space-y-2">
              <Link
                href="/best-countries-for/software-engineers"
                className="block px-3 py-2 text-sm text-text-muted hover:text-text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Guides
              </Link>

              <Link
                href="/about"
                className="block px-3 py-2 text-sm text-text-muted hover:text-text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>

              {user ? (
                <div className="space-y-2">
                  <Link
                    href="/profile"
                    className="block px-3 py-2 text-xs text-text-muted"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {user.user_metadata?.full_name || user.email}
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm text-text-muted hover:text-text-primary transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/profile"
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-accent/10 border border-accent/20 text-sm text-accent font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn className="w-4 h-4" />
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