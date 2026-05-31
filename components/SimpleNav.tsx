import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SimpleNav() {
  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span style={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: 17, letterSpacing: '-0.03em', color: '#f0f0e8', lineHeight: 1 }}>Origio</span>
        </Link>
        <Link href="/" className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Globe
        </Link>
      </div>
    </nav>
  );
}
