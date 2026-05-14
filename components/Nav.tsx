"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Zap, LogIn, User } from "lucide-react";
import { GlobeCountry } from "@/types";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import CommandSearch from "@/components/CommandSearch";

interface NavProps {
  countries?: GlobeCountry[];
  onCountrySelect?: (slug: string) => void;
}

export default function Nav({ countries = [], onCountrySelect }: NavProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [user, setUser]             = useState<SupabaseUser | null>(null);
  const [isPro, setIsPro]           = useState(false);

  const fetchProStatus = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles").select("is_pro").eq("id", userId).single();
    setIsPro(data?.is_pro ?? false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) await fetchProStatus(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) await fetchProStatus(session.user.id);
        else setIsPro(false);
      }
    );
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

  // Global "/" shortcut to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleCountrySelect = (slug: string) => {
    onCountrySelect?.(slug);
  };

  return (
    <>
      <style>{`
        .nav-pill {
          position: fixed;
          top: 18px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
          display: flex;
          align-items: center;
          height: 52px;
          background: #131e2e;
          border-radius: 100px;
          padding: 4px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06);
          white-space: nowrap;
          gap: 0;
        }
        .nav-logo-pill {
          display: flex; align-items: center; gap: 7px;
          height: 44px; background: #fff; border-radius: 100px;
          padding: 0 14px 0 10px; margin-right: 2px;
          text-decoration: none; flex-shrink: 0;
          transition: background 0.15s;
        }
        .nav-logo-pill:hover { background: #f0f0f0; }
        .nav-logo-sq { width: 13px; height: 13px; background: #0a0a0a; border-radius: 3px; flex-shrink: 0; }
        .nav-logo-text {
          font-size: 11px; font-weight: 800; letter-spacing: 0.16em;
          color: #0a0a0a; text-transform: uppercase; font-family: 'Satoshi', sans-serif;
        }
        .nav-links-inner { display: flex; align-items: center; gap: 2px; padding: 0 6px; }
        .nav-link-item {
          font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.6);
          text-decoration: none; padding: 8px 13px; border-radius: 100px;
          transition: color 0.15s, background 0.15s; font-family: 'Satoshi', sans-serif;
        }
        .nav-link-item:hover { color: #fff; background: rgba(255,255,255,0.08); }
        .nav-link-pro { color: #00ffd5 !important; display: flex; align-items: center; gap: 4px; }
        .nav-link-pro:hover { background: rgba(0,255,213,0.08) !important; }
        .nav-search-btn {
          display: flex; align-items: center; gap: 7px;
          font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.4);
          padding: 8px 14px; border-radius: 100px; border: none;
          background: transparent; cursor: pointer;
          transition: color 0.15s, background 0.15s; font-family: 'Satoshi', sans-serif;
        }
        .nav-search-btn:hover { color: rgba(255,255,255,0.75); background: rgba(255,255,255,0.07); }
        .nav-search-btn-kbd {
          font-size: 10px; font-family: monospace;
          color: rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 4px;
          padding: 1px 5px;
          letter-spacing: 0;
        }
        .nav-auth-pill {
          display: flex; align-items: center; gap: 6px;
          height: 44px; background: #fff; border-radius: 100px;
          padding: 0 18px; margin-left: 2px; text-decoration: none; flex-shrink: 0;
          font-size: 13px; font-weight: 600; color: #0a0a0a;
          border: none; cursor: pointer; transition: background 0.15s;
          font-family: 'Satoshi', sans-serif;
        }
        .nav-auth-pill:hover { background: #f0f0f0; }
        .nav-auth-pill.pro-user {
          background: transparent; border: 1.5px solid rgba(0,255,213,0.35); color: #00ffd5;
        }
        .nav-auth-pill.pro-user:hover { background: rgba(0,255,213,0.06); }
        @media (max-width: 768px) {
          .nav-pill { top: 12px; height: 46px; }
          .nav-links-inner { display: none; }
          .nav-logo-pill { height: 38px; }
          .nav-auth-pill { height: 38px; padding: 0 14px; font-size: 12px; }
        }
      `}</style>

      <nav className="nav-pill" role="navigation" aria-label="Main navigation">
        <Link href="/" className="nav-logo-pill">
          <span className="nav-logo-sq" />
          <span className="nav-logo-text">Origio</span>
        </Link>

        <div className="nav-links-inner">
          {countries.length > 0 && (
            <button
              className="nav-search-btn"
              onClick={() => setSearchOpen(true)}
              aria-label="Search countries"
            >
              <Search size={13} />
              Search countries…
              <span className="nav-search-btn-kbd">/</span>
            </button>
          )}
          <Link href="/guides"            className="nav-link-item">Guides</Link>
          <Link href="/salary-calculator" className="nav-link-item">Calculator</Link>
          <Link href="/blog"              className="nav-link-item">Blog</Link>
          <Link href="/about"             className="nav-link-item">About</Link>
          {!isPro && (
            <Link href="/pro" className="nav-link-item nav-link-pro">
              <Zap size={11} />
              Origio Pro
            </Link>
          )}
        </div>

        {user ? (
          <a href="/profile" className={`nav-auth-pill${isPro ? " pro-user" : ""}`}>
            <User size={13} />
            {user.user_metadata?.full_name?.split(" ")[0] || user.email?.split("@")[0]}
            {isPro && <span style={{ fontSize: 9, letterSpacing: "0.12em" }}>PRO</span>}
          </a>
        ) : (
          <a href="/signin" className="nav-auth-pill">
            <LogIn size={13} />
            Sign In
          </a>
        )}
      </nav>

      {/* CommandSearch modal — centered, with illustration */}
      <CommandSearch
        countries={countries}
        onCountrySelect={handleCountrySelect}
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}