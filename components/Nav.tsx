"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Zap, LogIn, User, Menu, X } from "lucide-react";
import { GlobeCountry } from "@/types";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import CommandSearch from "@/components/CommandSearch";

interface NavProps {
  countries?: GlobeCountry[];
  onCountrySelect?: (slug: string) => void;
}

export default function Nav({ countries = [], onCountrySelect }: NavProps) {
  const [searchOpen, setSearchOpen]         = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser]                     = useState<SupabaseUser | null>(null);
  const [isPro, setIsPro]                   = useState(false);

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

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [mobileMenuOpen]);

  const handleCountrySelect = (slug: string) => {
    onCountrySelect?.(slug);
  };

  return (
    <>
      <style>{`
        /* ── Pill container ─────────────────────────────── */
        .nav-pill {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
          display: flex;
          align-items: center;
          gap: 4px;
          height: 52px;
          background: rgba(14, 14, 14, 0.92);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 100px;
          padding: 6px 6px 6px 20px;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 4px 24px rgba(0,0,0,0.5);
          white-space: nowrap;
        }

        /* ── Logo wordmark ──────────────────────────────── */
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          margin-right: 8px;
          flex-shrink: 0;
        }
        .nav-logo-icon {
          width: 22px;
          height: 22px;
          background: #fff;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .nav-logo-icon svg {
          display: block;
        }
        .nav-logo-text {
          font-family: 'Cabinet Grotesk', sans-serif;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #fff;
        }

        /* ── Nav links ──────────────────────────────────── */
        .nav-link-item {
          font-family: 'Satoshi', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: rgba(255,255,255,0.52);
          text-decoration: none;
          padding: 7px 14px;
          border-radius: 100px;
          transition: color 0.18s ease, background 0.18s ease;
          letter-spacing: -0.01em;
        }
        .nav-link-item:hover {
          color: #fff;
          background: rgba(255,255,255,0.07);
        }
        .nav-link-pro {
          color: #4de6cc !important;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .nav-link-pro:hover {
          background: rgba(77,230,204,0.08) !important;
          color: #4de6cc !important;
        }

        /* ── Search button ──────────────────────────────── */
        .nav-search-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: 'Satoshi', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.38);
          padding: 7px 14px;
          border-radius: 100px;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: color 0.18s ease, background 0.18s ease;
        }
        .nav-search-btn:hover {
          color: #fff;
          background: rgba(255,255,255,0.07);
        }
        .nav-search-kbd {
          font-family: 'Satoshi', sans-serif;
          font-size: 10px;
          color: rgba(255,255,255,0.22);
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 4px;
          padding: 1px 5px;
        }

        /* ── CTA button ─────────────────────────────────── */
        .nav-cta {
          display: flex;
          align-items: center;
          gap: 6px;
          height: 40px;
          padding: 0 18px;
          border-radius: 100px;
          background: #fff;
          color: #0a0a0a;
          font-family: 'Satoshi', sans-serif;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          border: none;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.18s ease, color 0.18s ease;
          letter-spacing: -0.01em;
          margin-left: 4px;
        }
        .nav-cta:hover {
          background: #e8e8e8;
          color: #0a0a0a;
        }
        .nav-cta.pro-user {
          background: transparent;
          border: 1.5px solid rgba(77,230,204,0.4);
          color: #4de6cc;
        }
        .nav-cta.pro-user:hover {
          background: rgba(77,230,204,0.07);
          color: #4de6cc;
        }

        /* ── Mobile hamburger ───────────────────────────── */
        .nav-mobile-btn {
          display: none;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: transparent;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.55);
          transition: color 0.15s;
          flex-shrink: 0;
          margin-left: 4px;
        }
        .nav-mobile-btn:hover { color: #fff; }

        /* ── Product Hunt badge ─────────────────────────── */
        .ph-badge {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 101;
          display: block;
          line-height: 0;
          opacity: 0.88;
          transition: opacity 0.15s;
        }
        .ph-badge:hover { opacity: 1; }

        /* ── Responsive ─────────────────────────────────── */
        @media (max-width: 768px) {
          .nav-pill { top: 12px; height: 48px; padding-left: 14px; }
          .nav-links-inner { display: none; }
          .nav-cta { height: 36px; padding: 0 14px; font-size: 12px; }
          .nav-mobile-btn { display: flex; }
          .ph-badge { display: none; }
        }

        /* ── Mobile full-screen menu ────────────────────── */
        .mobile-menu {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 200;
          background: #0a0a0a;
          flex-direction: column;
          padding: 0;
          overflow-y: auto;
        }
        .mobile-menu.open { display: flex; }
        .mobile-menu-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 24px;
          border-bottom: 1px solid #1a1a1a;
        }
        .mobile-menu-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px 24px;
          font-size: 22px;
          font-weight: 700;
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          font-family: 'Cabinet Grotesk', sans-serif;
          border-bottom: 1px solid #111;
          transition: color 0.15s ease;
          letter-spacing: -0.01em;
        }
        .mobile-menu-link:hover { color: #fff; }
        .mobile-menu-link.pro { color: #4de6cc; }
        .mobile-menu-footer {
          padding: 24px;
          margin-top: auto;
          border-top: 1px solid #1a1a1a;
        }
      `}</style>

      <nav className="nav-pill" role="navigation" aria-label="Main navigation">
        {/* Logo */}
        <Link href="/" className="nav-logo">
          <span className="nav-logo-icon">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect width="12" height="12" rx="2" fill="#0a0a0a"/>
              <circle cx="6" cy="6" r="3" fill="#fff"/>
            </svg>
          </span>
          <span className="nav-logo-text">Origio</span>
        </Link>

        {/* Desktop links */}
        <div className="nav-links-inner" style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {countries.length > 0 && (
            <button className="nav-search-btn" onClick={() => setSearchOpen(true)} aria-label="Search countries">
              <Search size={12} />
              Search
              <span className="nav-search-kbd">/</span>
            </button>
          )}
          <Link href="/cities"            className="nav-link-item">Cities</Link>
          <Link href="/salary-calculator" className="nav-link-item">Calculator</Link>
          <Link href="/blog"              className="nav-link-item">Blog</Link>
          <Link href="/about"             className="nav-link-item">About</Link>
          {!isPro && (
            <Link href="/pro" className="nav-link-item nav-link-pro">
              <Zap size={11} />
              Pro
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="nav-mobile-btn" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
          <Menu size={18} />
        </button>

        {/* CTA */}
        {user ? (
          <a href="/profile" className={`nav-cta${isPro ? " pro-user" : ""}`}>
            <User size={13} />
            {user.user_metadata?.full_name?.split(" ")[0] || user.email?.split("@")[0]}
            {isPro && <span style={{ fontSize: 9, letterSpacing: "0.12em" }}>PRO</span>}
          </a>
        ) : (
          <a href="/signin" className="nav-cta">
            Sign In
          </a>
        )}
      </nav>

      {/* Product Hunt badge */}
      <a
        href="https://www.producthunt.com/products/origio?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-origio"
        target="_blank" rel="noopener noreferrer"
        className="ph-badge" aria-label="Origio on Product Hunt"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="Origio on Product Hunt"
          src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1138152&theme=dark&t=1779092788392"
          width={250} height={54} style={{ display: "block" }}
        />
      </a>

      {/* Mobile full-screen menu */}
      <div className={`mobile-menu${mobileMenuOpen ? " open" : ""}`} role="dialog" aria-modal="true" aria-label="Mobile navigation">
        <div className="mobile-menu-header">
          <Link href="/" className="nav-logo" onClick={() => setMobileMenuOpen(false)}>
            <span className="nav-logo-icon">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect width="12" height="12" rx="2" fill="#0a0a0a"/>
                <circle cx="6" cy="6" r="3" fill="#fff"/>
              </svg>
            </span>
            <span className="nav-logo-text">Origio</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            style={{ background: "none", border: "1px solid #2a2a2a", color: "rgba(255,255,255,0.5)", cursor: "pointer", padding: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: "8px 0", flex: 1 }}>
          {countries.length > 0 && (
            <button
              onClick={() => { setMobileMenuOpen(false); setSearchOpen(true); }}
              style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "18px 24px", background: "none", border: "none", borderBottom: "1px solid #111", cursor: "pointer", textAlign: "left" }}
            >
              <Search size={18} style={{ color: "rgba(255,255,255,0.4)", flexShrink: 0 }} />
              <span style={{ fontSize: 22, fontWeight: 700, color: "rgba(255,255,255,0.7)", fontFamily: "'Cabinet Grotesk', sans-serif", letterSpacing: "-0.01em" }}>Search countries</span>
            </button>
          )}
          <Link href="/wizard"            className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>Find My Country</Link>
          <Link href="/cities"            className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>Cities</Link>
          <Link href="/compare"           className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>Compare</Link>
          <Link href="/salary-calculator" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>Calculator</Link>
          <Link href="/blog"              className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
          <Link href="/about"             className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>About</Link>
          {!isPro && (
            <Link href="/pro" className="mobile-menu-link pro" onClick={() => setMobileMenuOpen(false)}>
              <Zap size={16} /> Origio Pro
            </Link>
          )}
        </div>

        <div className="mobile-menu-footer">
          {user ? (
            <a href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", background: isPro ? "transparent" : "#fff", borderRadius: 100, color: isPro ? "#4de6cc" : "#0a0a0a", textDecoration: "none", fontWeight: 700, fontSize: 14, border: isPro ? "1.5px solid rgba(77,230,204,0.4)" : "none" }}
            >
              <User size={15} />
              {user.user_metadata?.full_name?.split(" ")[0] || user.email?.split("@")[0]}
              {isPro && <span style={{ fontSize: 10, letterSpacing: "0.12em", marginLeft: 4 }}>PRO</span>}
            </a>
          ) : (
            <a href="/signin"
              onClick={() => setMobileMenuOpen(false)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", background: "#fff", borderRadius: 100, color: "#0a0a0a", textDecoration: "none", fontWeight: 700, fontSize: 14 }}
            >
              <LogIn size={15} />
              Sign In
            </a>
          )}
        </div>
      </div>

      <CommandSearch
        countries={countries}
        onCountrySelect={handleCountrySelect}
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}
