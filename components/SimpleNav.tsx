import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SimpleNav() {
  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-3 h-3 bg-accent flex-shrink-0" />
          <span className="font-heading text-lg font-extrabold text-text-primary uppercase tracking-wide">Origio</span>
        </Link>
        <Link href="/" className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Globe
        </Link>
      </div>
    </nav>
  );
}
