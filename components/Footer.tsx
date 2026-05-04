import Link from "next/link";

export default function Footer() {
  const cols = [
    {
      heading: "Product",
      links: [
        { href: "/wizard",  label: "Find My Country" },
        { href: "/compare", label: "Compare Countries" },
        { href: "/pro",     label: "Origio Pro" },
        { href: "/blog",    label: "Blog" },
        { href: "/guides",  label: "Relocation Guides" },
      ],
    },
    {
      heading: "Data",
      links: [
        { href: "/faq",     label: "FAQ" },
        { href: "/about",   label: "About" },
        { href: "/contact", label: "Contact" },
      ],
    },
    {
      heading: "Legal",
      links: [
        { href: "/privacy", label: "Privacy Policy" },
        { href: "/terms",   label: "Terms of Service" },
      ],
    },
  ];

  return (
    <footer
      className="border-t"
      style={{ borderColor: "#e8e4dc", background: "#f5f2ec" }}
    >
      {/* ── Link columns ── */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">

          {/* Brand col */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-5 hover:opacity-80 transition-opacity">
              <div className="w-3 h-3 bg-[#00c4a0] border-2 border-[#1a1a1a] flex-shrink-0" />
              <span className="font-heading text-[15px] font-extrabold tracking-tight text-[#1a1a1a] uppercase">Origio</span>
            </Link>
            <p className="text-[11px] text-[#888] leading-relaxed max-w-[180px] font-mono">
              25 countries ranked for your job and passport.
            </p>
          </div>

          {/* Link cols */}
          {cols.map((col) => (
            <div key={col.heading}>
              <p className="text-[10px] font-bold text-[#aaa] uppercase tracking-[0.2em] mb-4">{col.heading}</p>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[12px] font-medium text-[#888] hover:text-[#1a1a1a] transition-colors"
                      style={{ textDecoration: "none" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Giant wordmark ── */}
      <div
        className="border-t overflow-hidden select-none"
        style={{ borderColor: "#e8e4dc" }}
        aria-hidden
      >
        <div className="max-w-7xl mx-auto px-4">
          <p
            className="font-heading font-extrabold uppercase tracking-tight text-[#ece8e0]"
            style={{
              fontSize: "clamp(80px, 18vw, 220px)",
              lineHeight: 0.85,
              letterSpacing: "-0.04em",
              userSelect: "none",
            }}
          >
            Origio
          </p>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div
        className="border-t"
        style={{ borderColor: "#e8e4dc" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[10px] font-mono text-[#aaa]">© Origio 2026</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="text-[10px] font-mono text-[#aaa] hover:text-[#1a1a1a] transition-colors">Privacy</Link>
            <Link href="/terms"   className="text-[10px] font-mono text-[#aaa] hover:text-[#1a1a1a] transition-colors">Terms</Link>
            <Link href="/contact" className="text-[10px] font-mono text-[#aaa] hover:text-[#1a1a1a] transition-colors">Contact</Link>
            <a
              href="mailto:hello@findorigio.com"
              className="text-[10px] font-mono text-[#aaa] hover:text-[#1a1a1a] transition-colors"
            >
              hello@findorigio.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
