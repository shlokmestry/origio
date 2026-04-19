import Link from 'next/link'
import { Globe2, Sparkles } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-bg-primary flex flex-col">
      <nav className="glass-panel border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Globe2 className="w-5 h-5 text-accent" />
            <span className="font-heading text-lg font-extrabold text-text-primary">Origio</span>
          </Link>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center space-y-8 max-w-md">
          <div className="text-8xl">🌍</div>

          <div className="space-y-3">
            <p className="text-accent text-sm font-bold uppercase tracking-widest">404</p>
            <h1 className="font-heading text-4xl font-extrabold text-text-primary">
              Page not found
            </h1>
            <p className="text-text-muted leading-relaxed">
              This page doesn&apos;t exist. Maybe the country you&apos;re looking for is on the globe — or you followed a broken link.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/" className="cta-button px-6 py-3 rounded-xl text-sm inline-flex items-center gap-2 w-full sm:w-auto justify-center">
              <Globe2 className="w-4 h-4" />
              Back to Globe
            </Link>
            <Link href="/wizard" className="px-6 py-3 rounded-xl text-sm border border-border hover:border-accent/30 text-text-muted hover:text-text-primary transition-colors inline-flex items-center gap-2 w-full sm:w-auto justify-center">
              <Sparkles className="w-4 h-4" />
              Find My Country
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-text-muted">
            <Link href="/faq" className="hover:text-accent transition-colors">FAQ</Link>
            <Link href="/contact" className="hover:text-accent transition-colors">Contact</Link>
            <Link href="/about" className="hover:text-accent transition-colors">About</Link>
          </div>
        </div>
      </div>
    </main>
  )
}