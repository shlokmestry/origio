/* eslint-disable react/no-unescaped-entities */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Globe2, ArrowLeft, Calendar, Tag } from "lucide-react";

type Props = {
  params: Promise<{ slug: string }>;
};

const POSTS: Record<string, {
  title: string;
  description: string;
  date: string;
  category: string;
  content: React.ReactNode;
}> = {
  "software-engineer-salary-germany": {
    title: "Software Engineer Salaries in Germany: Full Breakdown 2026",
    description: "Junior to senior salary ranges, exact tax deductions, take-home pay, and whether Germany is worth it compared to the UK and Netherlands.",
    date: "2026-04-15",
    category: "Salary Guides",
    content: (
      <div className="prose prose-invert max-w-none">
        <p className="lead">Germany consistently ranks as one of Europe's top destinations for software engineers but the headline salaries can be misleading once you factor in Germany's notoriously high tax and social security system. This guide breaks down real numbers so you know exactly what lands in your bank account.</p>

        <h2>Salary Ranges by Experience (2026)</h2>
        <p>These figures are based on current market data from Berlin, Munich, and Hamburg the three dominant tech hubs:</p>
        <ul>
          <li><strong>Junior (0–2 years):</strong> €42,000 – €55,000</li>
          <li><strong>Mid-level (3–5 years):</strong> €58,000 – €80,000</li>
          <li><strong>Senior (5+ years):</strong> €80,000 – €115,000</li>
          <li><strong>Staff / Principal:</strong> €115,000 – €160,000+</li>
          <li><strong>Engineering Manager:</strong> €100,000 – €150,000</li>
        </ul>
        <p>Berlin skews slightly lower than Munich due to a higher concentration of startups vs enterprise. Munich and Frankfurt tend to pay 10–15% more.</p>

        <h2>Exact Tax Breakdown on €70,000</h2>
        <p>Germany has a progressive income tax system plus mandatory social security contributions. Here is what happens to a €70,000 gross salary:</p>
        <ul>
          <li><strong>Gross salary:</strong> €70,000/year</li>
          <li><strong>Income tax (~18.5%):</strong> –€12,950</li>
          <li><strong>Solidarity surcharge:</strong> –€0 (abolished under €73k since 2021)</li>
          <li><strong>Health insurance (~7.3%):</strong> –€5,110</li>
          <li><strong>Pension insurance (~9.3%):</strong> –€6,510</li>
          <li><strong>Unemployment insurance (~1.3%):</strong> –€910</li>
          <li><strong>Long-term care insurance (~1.7%):</strong> –€1,190</li>
          <li><strong>Net take-home:</strong> ~€43,330/year (€3,611/month)</li>
        </ul>
        <p>The effective total deduction is around 38%, which is high but includes full health insurance unlike the US where you pay separately for that.</p>

        <h2>What Does €3,611/Month Actually Cover?</h2>
        <p>Here is a realistic monthly budget for a single person living in Berlin:</p>
        <ul>
          <li><strong>Rent (1-bed, city centre):</strong> €1,200–€1,500</li>
          <li><strong>Groceries:</strong> €280–€350</li>
          <li><strong>Public transport (monthly pass):</strong> €86</li>
          <li><strong>Utilities (electricity, internet, heating):</strong> €200–€300</li>
          <li><strong>Phone plan:</strong> €15–€30</li>
          <li><strong>Total fixed costs:</strong> ~€1,900–€2,300</li>
        </ul>
        <p>That leaves you with <strong>€1,300–€1,700/month</strong> for savings, travel, eating out, and everything else. In Munich, expect rent to be €400–€600 higher, which tightens this considerably.</p>

        <h2>Germany vs Netherlands vs UK</h2>
        <p>How does Germany compare to the other popular European tech destinations?</p>
        <ul>
          <li><strong>Netherlands:</strong> Similar gross salaries, slightly lower tax on mid-range incomes. The 30% ruling for expats exempts 30% of your salary from tax for 5 years a massive advantage.</li>
          <li><strong>United Kingdom:</strong> Higher gross salaries in London, but London rent easily hits £2,000+/month. Net result is roughly similar disposable income to Germany.</li>
          <li><strong>Germany wins on:</strong> job security, work-life balance, long-term residency path, and quality of life outside major cities.</li>
        </ul>

        <h2>Visa Options for Software Engineers</h2>
        <p>Germany has made it significantly easier for non-EU engineers to relocate:</p>
        <ul>
          <li><strong>EU Blue Card:</strong> Requires a job offer above €45,300/year. Permanent residency after 21 months with B1 German, or 33 months without.</li>
          <li><strong>Job Seeker Visa:</strong> 6 months to come to Germany and find a job before applying for a work permit.</li>
          <li><strong>Skilled Worker Visa:</strong> For those with a recognised qualification and a confirmed job offer.</li>
        </ul>

        <h2>Is Germany Worth It?</h2>
        <p>Germany is an excellent choice if you value stability, work-life balance, and a clear path to permanent residency. It is not the right move if you are chasing maximum take-home pay the US and Switzerland beat Germany significantly on that front. But for a sustainable, high-quality life in Europe with strong employment protection, Germany remains one of the best options in 2026.</p>

        <div className="mt-8 flex flex-col gap-3 not-prose">
          <Link href="/best-countries-for/software-engineers" className="text-accent hover:underline text-sm">See best countries for software engineers →</Link>
          <Link href="/salary-calculator" className="text-accent hover:underline text-sm">Calculate your Germany take-home pay →</Link>
          <Link href="/compare?a=germany&b=netherlands" className="text-accent hover:underline text-sm">Compare Germany vs Netherlands →</Link>
        </div>
      </div>
    ),
  },

  "us-h1b-visa-guide": {
    title: "H1B Visa Guide for Software Engineers 2026",
    description: "Lottery odds, full timeline, what happens if you don't get selected, and the 4 best backup routes into the US tech industry.",
    date: "2026-04-10",
    category: "Visa Guides",
    content: (
      <div className="prose prose-invert max-w-none">
        <p className="lead">The H1B is the most sought-after work visa in the world and also one of the most frustrating. With lottery odds sitting around 14–18%, most software engineers who apply do not get selected. This guide covers the full process, real odds, and the best alternatives if the lottery does not go your way.</p>

        <h2>What Is the H1B Visa?</h2>
        <p>The H1B is a non-immigrant US work visa for speciality occupations which includes almost all software engineering roles. It is employer-sponsored, meaning a US company must file on your behalf. You cannot apply independently.</p>
        <ul>
          <li><strong>Annual cap:</strong> 85,000 visas (65,000 general + 20,000 for US master's degree holders)</li>
          <li><strong>2026 registrations:</strong> approximately 470,000</li>
          <li><strong>Selection odds:</strong> roughly 14–18%</li>
          <li><strong>Duration:</strong> 3 years, renewable for another 3</li>
          <li><strong>Path to green card:</strong> Yes, via EB-2 or EB-3 — but backlogs for Indian nationals can exceed 50 years</li>
        </ul>

        <h2>Full H1B Timeline for 2026–2027 Cycle</h2>
        <ol>
          <li><strong>January–February:</strong> Employer registers you in the H1B system and pays the $10 registration fee</li>
          <li><strong>March 1–18:</strong> Official registration window opens</li>
          <li><strong>Late March:</strong> USCIS runs the lottery and notifies selected registrations</li>
          <li><strong>April 1 – June 30:</strong> If selected, employer files the full H1B petition</li>
          <li><strong>August–September:</strong> USCIS adjudicates petitions (premium processing = 15 business days)</li>
          <li><strong>October 1:</strong> H1B employment can legally begin</li>
        </ol>

        <h2>What Happens If You Are Not Selected?</h2>
        <p>Most people are not selected. Here are the four most realistic alternatives:</p>
        <ul>
          <li><strong>L-1 Intracompany Transfer:</strong> Work for a multinational outside the US for 1 year, then transfer to the US office. No cap, no lottery. This is the cleanest path for engineers already at large companies.</li>
          <li><strong>O-1A Extraordinary Ability:</strong> For engineers with notable achievements open source contributions, patents, conference talks, or significant industry recognition. No cap and no lottery but requires strong documentation.</li>
          <li><strong>Canada PR then TN Visa:</strong> Get Canadian permanent residency via Express Entry (6–12 months if your score is high), then use the TN visa to work in the US as a Canadian resident. Increasingly popular strategy.</li>
          <li><strong>Re-register next year:</strong> If not selected, you can try again the following year — many employers will keep you on a remote basis in the meantime.</li>
        </ul>

        <h2>Premium Processing — Is It Worth It?</h2>
        <p>Premium processing ($2,805 in 2026) guarantees USCIS will act on your petition within 15 business days. It does not increase your chances of approval it only speeds up the decision. Most employers at larger tech companies will cover this cost. For time-sensitive situations it is absolutely worth it.</p>

        <h2>H1B vs Other US Visa Routes</h2>
        <ul>
          <li><strong>H1B:</strong> Most common, lottery-based, employer-sponsored</li>
          <li><strong>L-1:</strong> No lottery, requires prior employment at same company abroad</li>
          <li><strong>O-1:</strong> No lottery, high bar for eligibility, strong for senior engineers</li>
          <li><strong>EB-1C:</strong> Green card directly for multinational managers bypasses the H1B entirely</li>
        </ul>

        <div className="mt-8 flex flex-col gap-3 not-prose">
          <Link href="/best-countries-for/software-engineers" className="text-accent hover:underline text-sm">See best countries for software engineers →</Link>
          <Link href="/country/usa" className="text-accent hover:underline text-sm">Full USA country profile →</Link>
          <Link href="/country/canada" className="text-accent hover:underline text-sm">Canada as an alternative →</Link>
        </div>
      </div>
    ),
  },

  "cost-of-living-dublin-vs-berlin": {
    title: "Dublin vs Berlin: Cost of Living for Tech Workers in 2026",
    description: "Full monthly cost comparison rent, groceries, transport, healthcare plus which city gives you more disposable income on a tech salary.",
    date: "2026-04-08",
    category: "City Comparisons",
    content: (
      <div className="prose prose-invert max-w-none">
        <p className="lead">Dublin and Berlin are both thriving tech hubs with strong hiring markets, English-friendly environments, and access to major European companies. But the cost of living difference between them is enormous and it directly affects how much of your salary you actually keep.</p>

        <h2>Monthly Cost Breakdown (Single Person, 2026)</h2>
        <table>
          <thead>
            <tr>
              <th>Expense</th>
              <th>Dublin</th>
              <th>Berlin</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Rent (1-bed, city centre)</td><td>€2,100–€2,500</td><td>€1,200–€1,500</td></tr>
            <tr><td>Groceries</td><td>€350–€420</td><td>€280–€350</td></tr>
            <tr><td>Public transport</td><td>€140</td><td>€86</td></tr>
            <tr><td>Utilities</td><td>€160–€200</td><td>€200–€300</td></tr>
            <tr><td>Health insurance</td><td>€80–€120 (private)</td><td>€0 (included in tax)</td></tr>
            <tr><td>Phone</td><td>€20–€40</td><td>€15–€30</td></tr>
            <tr><td><strong>Total</strong></td><td><strong>€2,850–€3,400</strong></td><td><strong>€1,780–€2,265</strong></td></tr>
          </tbody>
        </table>
        <p>Dublin costs roughly <strong>€900–€1,100/month more</strong> — that is up to <strong>€13,200/year</strong> extra just to cover the same lifestyle.</p>

        <h2>How Do Salaries Compare?</h2>
        <ul>
          <li><strong>Mid-level software engineer, Dublin:</strong> €70,000–€90,000 gross. After Irish tax (~33% effective), take-home is roughly €49,000–€62,000/year.</li>
          <li><strong>Mid-level software engineer, Berlin:</strong> €60,000–€80,000 gross. After German tax (~38% effective), take-home is roughly €40,000–€52,000/year.</li>
        </ul>
        <p>Dublin wins on gross salary and net take-home — but once you subtract the higher cost of living, the <strong>disposable income gap almost disappears</strong>. A senior engineer in Berlin often has more money left at end of month than a peer in Dublin earning €15k more.</p>

        <h2>Quality of Life Differences</h2>
        <ul>
          <li><strong>Space:</strong> Berlin apartments are significantly larger for the same price. A €1,400/month flat in Berlin is a 2-bedroom; in Dublin it is a small studio.</li>
          <li><strong>Work culture:</strong> Germany has stronger worker protections 30 days annual leave is standard, working beyond contracted hours is uncommon.</li>
          <li><strong>Language:</strong> Both cities are English-friendly in tech, but Berlin daily life increasingly requires German for bureaucracy, landlords, and local services.</li>
          <li><strong>Weather:</strong> Both cities have cold grey winters. Dublin is milder but wetter. Berlin has warmer summers.</li>
          <li><strong>Visa:</strong> Non-EU workers find Germany slightly easier to navigate long-term due to the EU Blue Card route.</li>
        </ul>

        <h2>Verdict</h2>
        <p>If maximising take-home pay matters most, Dublin edges ahead for high earners particularly at senior level where Irish salaries pull significantly above German ones. But for overall quality of life, space, and disposable income at mid-level, Berlin is the stronger choice in 2026.</p>

        <div className="mt-8 flex flex-col gap-3 not-prose">
          <Link href="/compare?a=ireland&b=germany" className="text-accent hover:underline text-sm">Full Ireland vs Germany comparison →</Link>
          <Link href="/salary-calculator" className="text-accent hover:underline text-sm">Calculate your take-home pay in both countries →</Link>
          <Link href="/country/ireland" className="text-accent hover:underline text-sm">Full Ireland country profile →</Link>
          <Link href="/country/germany" className="text-accent hover:underline text-sm">Full Germany country profile →</Link>
        </div>
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
    alternates: { canonical: `https://findorigio.com/blog/${slug}` },
    openGraph: {
      title: `${post.title} — Origio Blog`,
      description: post.description,
      url: `https://findorigio.com/blog/${slug}`,
      siteName: "Origio",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} — Origio Blog`,
      description: post.description,
    },
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
              {new Date(post.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
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
          {/* Bottom CTA */}
          <div className="glass-panel rounded-2xl p-8 border border-accent/20 text-center mb-8">
            <h3 className="font-heading text-xl font-bold text-text-primary mb-2">
              Find your perfect country
            </h3>
            <p className="text-text-muted text-sm mb-6 max-w-sm mx-auto">
              Answer 8 quick questions and get a personalised ranking based on your salary, visa, and lifestyle priorities.
            </p>
            <Link href="/wizard" className="cta-button px-6 py-3 rounded-xl text-sm inline-flex items-center gap-2">
              Find My Country
            </Link>
          </div>
          <Link href="/blog" className="text-accent hover:underline text-sm">
            Back to all articles
          </Link>
        </footer>
      </article>
    </main>
  );
}