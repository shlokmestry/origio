import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#1a1a1a] bg-[#0a0a0a] mt-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
              <div className="w-3 h-3 bg-accent flex-shrink-0" />
              <span className="font-heading text-base font-extrabold text-text-primary uppercase tracking-wide">Origio</span>
            </Link>
            <p className="text-[11px] text-[#444440] leading-relaxed max-w-[180px]">
              Relocation research for professionals moving abroad.
            </p>
          </div>

          {/* Explore */}
          <div>
            <p className="text-[9px] font-bold text-[#444440] uppercase tracking-[0.2em] mb-4">Explore</p>
            <ul className="space-y-2.5">
              {[
                { href: "/", label: "Globe" },
                { href: "/wizard", label: "Find My Country" },
                { href: "/compare", label: "Compare" },
                { href: "/guides", label: "Guides" },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[12px] text-[#888880] hover:text-[#f0f0e8] transition-colors font-medium">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-[9px] font-bold text-[#444440] uppercase tracking-[0.2em] mb-4">Company</p>
            <ul className="space-y-2.5">
              {[
                { href: "/about", label: "About" },
                { href: "/blog", label: "Blog" },
                { href: "/contact", label: "Contact" },
                { href: "/pro", label: "Origio Pro" },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[12px] text-[#888880] hover:text-[#f0f0e8] transition-colors font-medium">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-[9px] font-bold text-[#444440] uppercase tracking-[0.2em] mb-4">Legal</p>
            <ul className="space-y-2.5">
              {[
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms of Service" },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[12px] text-[#888880] hover:text-[#f0f0e8] transition-colors font-medium">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#1a1a1a] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] font-bold text-[#333330] uppercase tracking-[0.15em]">
            © 2026 Origio · findorigio.com
          </p>
          <p className="text-[10px] text-[#333330] uppercase tracking-[0.1em] font-bold">
            Data · Not advice
          </p>
        </div>
      </div>
    </footer>
  );
}
