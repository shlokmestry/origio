import SimpleNav from "@/components/SimpleNav";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-6 text-center">
      <div className="space-y-6 max-w-md">
        <div className="text-7xl">🌍</div>
        <div className="space-y-3">
          <h1 className="font-heading text-7xl font-extrabold text-text-primary">404</h1>
          <p className="font-heading text-xl font-bold text-text-primary uppercase tracking-tight">We could not find that page</p>
          <p className="text-text-muted text-sm leading-relaxed">The country or page you are looking for does not exist yet. Head back to the globe and explore what we have.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a href="/" className="cta-button px-6 py-3 text-sm font-bold inline-flex items-center gap-2 uppercase">
            <Globe2 className="w-4 h-4" />
            Back to Globe
          </a>
          <a href="/wizard" className="ghost-button px-6 py-3 text-sm font-bold uppercase tracking-wide">
            Take the quiz
          </a>
        </div>
      </div>
    </div>
  );
}