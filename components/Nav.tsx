"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Menu, X, User } from "lucide-react";
import { GlobeCountry } from "@/types";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface NavProps {
  countries?: GlobeCountry[];
  onCountrySelect?: (slug: string) => void;
}

export default function Nav({ countries = [], onCountrySelect }: NavProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isPro, setIsPro] = useState(false);

  const fetchProStatus = useCallback(async (userId: string) => {
    const { data } = await supabase.from("profiles").select("is_pro").eq("id", userId).single();
    setIsPro(data?.is_pro ?? false);
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
    return () => { subscription.unsubscribe(); document.removeEventListener("visibilitychange", handleVisibility); };
  }, [fetchProStatus]);

  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navLinks = [
    { href: "/wizard", label: "Find My Country" },
    { href: "/blog", label: "Blog" },
    { href: "/guides", label: "Guides" },
    { href: "/about", label: "About" },
    ...(!isPro ? [{ href: "/pro", label: "Pro", accent: true }] : []),
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "rgba(10,10,10,0.96)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #1a1a1a",
      }}
    >
      {/* ── Main bar — 56px tall, 3-column: logo | links | auth ── */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">

          {/* LEFT — logo */}
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity flex-shrink-0">
            <div className="w-3 h-3 bg-[#00ffd5] border-2 border-[#f0f0e8] flex-shrink-0" />
            <span className="font-heading text-[17px] font-extrabold tracking-tight text-[#f0f0e8] uppercase">
              Origio
            </span>
          </Link>

          {/* CENTER — nav links (desktop) */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[13px] font-bold uppercase tracking-wider transition-colors"
                style={{ color: link.accent ? "#00ffd5" : "#888880" }}
                onMouseEnter={e => { if (!link.accent) (e.currentTarget as HTMLElement).style.color = "#f0f0e8"; }}
                onMouseLeave={e => { if (!link.accent) (e.currentTarget as HTMLElement).style.color = "#888880"; }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* RIGHT — search + auth (desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {countries.length > 0 && (
              <button
                onClick={() => { setSearchOpen(!searchOpen); setSearchQuery(""); }}
                className="flex items-center gap-2 text-[13px] font-bold text-[#888880] hover:text-[#f0f0e8] transition-colors uppercase tracking-widest"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            )}

            {user ? (
              <a
                href="/profile"
                className="flex items-center gap-1.5 px-3 py-2 text-[13px] font-bold uppercase tracking-wider transition-colors border"
                style={{
                  borderColor: isPro ? "#00ffd5" : "#2a2a2a",
                  color: isPro ? "#00ffd5" : "#f0f0e8",
                  boxShadow: isPro ? "2px 2px 0 #00ffd5" : "2px 2px 0 #2a2a2a",
                }}
              >
                <User className="w-3.5 h-3.5" />
                {user.user_metadata?.full_name?.split(" ")[0] || user.email?.split("@")[0]}
                {isPro && <span className="text-[10px] font-bold">PRO</span>}
              </a>
            ) : (
              <a
                href="/signin"
                className="flex items-center gap-1.5 px-3 py-2 text-[13px] font-bold text-[#f0f0e8] uppercase tracking-wider border border-[#2a2a2a] hover:border-[#f0f0e8] transition-colors"
                style={{ boxShadow: "2px 2px 0 #2a2a2a" }}
              >
                Sign in
              </a>
            )}
          </div>

          {/* MOBILE — hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 border border-[#2a2a2a] hover:border-[#f0f0e8] transition-colors"
          >
            {mobileMenuOpen ? <X className="w-4 h-4 text-[#f0f0e8]" /> : <Menu className="w-4 h-4 text-[#f0f0e8]" />}
          </button>
        </div>
      </div>

      {/* ── Search dropdown ── */}
      {searchOpen && (
        <div className="border-t border-[#1a1a1a] bg-[#0d0d0d]">
          <div className="max-w-2xl mx-auto px-6 py-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666660]" />
              <input
                type="text"
                placeholder="Search countries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-10 pr-4 py-2.5 bg-[#111] border border-[#2a2a2a] focus:border-[#00ffd5] text-[#f0f0e8] placeholder:text-[#444] outline-none text-[13px] transition-colors"
              />
            </div>
            {searchQuery.length > 0 && (
              <div className="mt-1 max-h-56 overflow-y-auto border border-[#2a2a2a] border-t-0">
                {filteredCountries.length === 0 ? (
                  <p className="text-[12px] text-[#666660] text-center py-4 font-mono">No countries found</p>
                ) : (
                  filteredCountries.map((country) => (
                    <button
                      key={country.slug}
                      onClick={() => {
                        onCountrySelect?.(country.slug);
                        setSearchOpen(false);
                        setSearchQuery("");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#1a1a1a] transition-colors text-left border-b border-[#111] last:border-0"
                    >
                      <span className="text-lg">{country.flagEmoji}</span>
                      <span className="text-[13px] font-bold text-[#f0f0e8]">{country.name}</span>
                      <span className="text-[11px] font-mono text-[#666660] ml-auto">{country.moveScore}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Mobile menu ── */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#1a1a1a] bg-[#0d0d0d]">
          <div className="px-6 py-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center py-3.5 text-[13px] font-bold uppercase tracking-wider border-b border-[#111] last:border-0 transition-colors"
                style={{ color: link.accent ? "#00ffd5" : "#888880" }}
              >
                {link.label}
              </a>
            ))}
            <div className="py-3">
              {user ? (
                <a href="/profile" onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-3 text-[13px] font-bold uppercase tracking-widest"
                  style={{ color: isPro ? "#00ffd5" : "#888880" }}>
                  <User className="w-3.5 h-3.5" />
                  {user.user_metadata?.full_name?.split(" ")[0] || user.email?.split("@")[0]}
                  {isPro && " · Pro"}
                </a>
              ) : (
                <a href="/signin" onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-3 border border-[#2a2a2a] text-[13px] font-bold text-[#f0f0e8] uppercase tracking-wider mt-2">
                  Sign in
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}