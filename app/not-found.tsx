import { Globe2 } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-6 text-center">
      <div className="space-y-6 max-w-md">
        <div className="text-7xl">🌍</div>
        <div className="space-y-2">
          <h1 className="font-heading text-5xl font-extrabold">404</h1>
          <p className="font-heading text-xl font-bold text-text-primary">We could not find that page</p>
          <p className="text-text-muted text-sm leading-relaxed">The country or page you are looking for does not exist yet. Head back to the globe and explore what we have.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="/" className="cta-button px-6 py-3 rounded-2xl text-sm font-medium inline-flex items-center gap-2">
            <Globe2 className="w-4 h-4" />
            Back to Globe
          </a>
          <a href="/wizard" className="px-6 py-3 rounded-2xl text-sm border border-border hover:border-accent/30 text-text-muted hover:text-text-primary transition-colors">
            Take the quiz
          </a>
        </div>
      </div>
    </div>
  );
}
