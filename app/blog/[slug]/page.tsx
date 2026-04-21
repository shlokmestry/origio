import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Globe2, ArrowLeft, Calendar, Tag } from "lucide-react";

type Props = {
  params: Promise<{ slug: string }>;
};

// Hardcoded posts - you can move this to a separate file later
const POSTS: Record<string, {
  title: string;
  description: string;
  date: string;
  category: string;
  content: React.ReactNode;
}> = {
  "software-engineer-salary-germany": {
    title: "Software Engineer Salaries in Germany: Full Breakdown 2026",
    description: "Tax, take-home pay, and cost of living explained with real numbers.",
    date: "2026-04-15",
    category: "Salary Guides",
    content: (
      <div className="prose prose-invert max-w-none">
        <p className="lead">Germany is one of Europe's top destinations for software engineers, but how much do you actually take home after tax?</p>
        
        <h2>Average Salaries by Experience</h2>
        <ul>
          <li><strong>Junior (0-2 years):</strong> €45,000 - €55,000</li>
          <li><strong>Mid-level (3-5 years):</strong> €60,000 - €80,000</li>
          <li><strong>Senior (5+ years):</strong> €80,000 - €110,000</li>
          <li><strong>Staff/Principal:</strong> €110,000 - €150,000+</li>
        </ul>

        <h2>Tax Breakdown</h2>
        <p>German tax can look scary at first glance, but here's what actually happens to a €70,000 salary:</p>
        <ul>
          <li><strong>Gross salary:</strong> €70,000</li>
          <li><strong>Income tax (~19%):</strong> -€13,300</li>
          <li><strong>Social security (~20%):</strong> -€14,000</li>
          <li><strong>Net take-home:</strong> ~€42,700 per year (€3,558/month)</li>
        </ul>

        <h2>Cost of Living</h2>
        <p>Your €3,558/month goes further than you'd think:</p>
        <ul>
          <li><strong>Rent (1-bed, city center):</strong> €1,200</li>
          <li><strong>Groceries:</strong> €320</li>
          <li><strong>Transport:</strong> €85 (monthly pass)</li>
          <li><strong>Utilities:</strong> €280</li>
          <li><strong>Total:</strong> ~€1,885/month</li>
        </ul>
        <p>That leaves you with <strong>€1,673/month</strong> for savings, travel, and fun.</p>

        <h2>Compare with Other Countries</h2>
        <p>Want to see how Germany stacks up?</p>
        <ul>
          <li><Link href="/compare?a=germany&b=netherlands" className="text-accent hover:underline">Germany vs Netherlands</Link></li>
          <li><Link href="/compare?a=germany&b=united-states" className="text-accent hover:underline">Germany vs USA</Link></li>
        </ul>
      </div>
    ),
  },
  "us-h1b-visa-guide": {
    title: "H1B Visa Guide for Software Engineers 2026",
    description: "Steps, timelines, lottery odds, and alternatives explained.",
    date: "2026-04-10",
    category: "Visa Guides",
    content: (
      <div className="prose prose-invert max-w-none">
        <p className="lead">The H1B is the main route for software engineers moving to the US, but it's lottery-based and highly competitive.</p>
        
        <h2>How the H1B Lottery Works</h2>
        <ul>
          <li><strong>Cap:</strong> 85,000 visas/year (65k general + 20k advanced degree)</li>
          <li><strong>2025 Applications:</strong> ~780,000 registrations</li>
          <li><strong>Odds:</strong> ~11% chance</li>
        </ul>

        <h2>Timeline</h2>
        <ol>
          <li><strong>March:</strong> Registration period opens</li>
          <li><strong>April:</strong> Lottery results announced</li>
          <li><strong>June-Sept:</strong> File petition if selected</li>
          <li><strong>Oct 1:</strong> H1B employment can start</li>
        </ol>

        <h2>Alternatives to H1B</h2>
        <p>If you don't win the lottery:</p>
        <ul>
          <li><strong>L-1:</strong> Intracompany transfer (work abroad first)</li>
          <li><strong>O-1:</strong> Extraordinary ability (harder but no cap)</li>
          <li><strong>E-2:</strong> Investor visa (need ~$100k+)</li>
          <li><strong>Canada PR → TN Visa:</strong> Work in Canada first</li>
        </ul>

        <p>Want to compare countries?</p>
        <Link href="/best-countries-for/software-engineers" className="text-accent hover:underline">See best countries for software engineers →</Link>
      </div>
    ),
  },
  "cost-of-living-dublin-vs-berlin": {
    title: "Dublin vs Berlin: Cost of Living Compared",
    description: "Rent, groceries, transport, and lifestyle costs side by side.",
    date: "2026-04-08",
    category: "City Comparisons",
    content: (
      <div className="prose prose-invert max-w-none">
        <p className="lead">Both cities are tech hubs, but Dublin is significantly more expensive. Here's the full breakdown.</p>
        
        <h2>Monthly Costs (1-person)</h2>
        <table>
          <thead>
            <tr>
              <th>Expense</th>
              <th>Dublin</th>
              <th>Berlin</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Rent (1-bed, city center)</td>
              <td>€2,100</td>
              <td>€1,200</td>
            </tr>
            <tr>
              <td>Groceries</td>
              <td>€350</td>
              <td>€320</td>
            </tr>
            <tr>
              <td>Transport</td>
              <td>€120</td>
              <td>€85</td>
            </tr>
            <tr>
              <td>Utilities</td>
              <td>€190</td>
              <td>€280</td>
            </tr>
            <tr>
              <td><strong>Total</strong></td>
              <td><strong>€2,760</strong></td>
              <td><strong>€1,885</strong></td>
            </tr>
          </tbody>
        </table>

        <h2>Verdict</h2>
        <p>Dublin costs <strong>€875/month more</strong> — that's €10,500/year.</p>

        <p>Compare the full picture:</p>
        <Link href="/compare?a=ireland&b=germany" className="text-accent hover:underline">Ireland vs Germany full comparison →</Link>
      </div>
    ),
  },
};

export async function generateStaticParams() {
  return Object.keys(POSTS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = POSTS[slug];
  if (!post) return { title: "Post Not Found" };
  return {
    title: `${post.title} — Origio Blog`,
    description: post.description,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = POSTS[slug];
  if (!post) notFound();

  return (
    <main className="min-h-screen bg-bg-primary">
      <nav className="sticky top-0 z-50 glass-panel border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Globe2 className="w-5 h-5 text-accent" />
            <span className="font-heading text-lg font-extrabold text-text-primary">Origio</span>
          </Link>
          <Link href="/blog" className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            All Articles
          </Link>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-4 py-12">
        <header className="mb-10">
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs text-accent font-semibold uppercase tracking-wider">
              <Tag className="w-3 h-3" />
              {post.category}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-text-muted">
              <Calendar className="w-3 h-3" />
              {new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
          <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-text-primary mb-4">
            {post.title}
          </h1>
          <p className="text-text-muted text-lg">{post.description}</p>
        </header>

        <div className="prose-content">
          {post.content}
        </div>

        <footer className="mt-16 pt-8 border-t border-border">
          <Link href="/blog" className="text-accent hover:underline text-sm">
            ← Back to all articles
          </Link>
        </footer>
      </article>
    </main>
  );
}