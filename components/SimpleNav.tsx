import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export default function SimpleNav() {
  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <Image
            src="/origio_logo_dark_final.png"
            alt="Origio"
            width={96}
            height={24}
            style={{ height: 24, width: "auto" }}
            priority
          />
        </Link>
        <Link href="/" className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Globe
        </Link>
      </div>
    </nav>
  );
}