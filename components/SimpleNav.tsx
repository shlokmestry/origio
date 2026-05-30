import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SimpleNav() {
  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div style={{ width: 22, height: 22, background: '#fff', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect width="12" height="12" rx="2" fill="#0a0a0a"/>
              <circle cx="6" cy="6" r="3" fill="#fff"/>
            </svg>
          </div>
          <span className="font-heading text-[15px] font-extrabold text-text-primary" style={{ letterSpacing: '-0.02em' }}>Origio</span>
        </Link>
        <Link href="/" className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Globe
        </Link>
      </div>
    </nav>
  );
}
