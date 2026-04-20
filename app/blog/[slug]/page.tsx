import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Globe2, ArrowLeft } from "lucide-react";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { MDXRemote } from "next-mdx-remote/rsc";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = getPostBySlug(slug);
  if (!result) return { title: "Post Not Found" };
  const { data } = result;
  return {
    title: data.title,
    description: data.description,
    alternates: { canonical: `https://findorigio.com/blog/${slug}` },
    openGraph: {
      title: data.title,
      description: data.description,
      url: `https://findorigio.com/blog/${slug}`,
      siteName: "Origio",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: data.description,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const result = getPostBySlug(slug);
  if (!result) notFound();
  const { data, content } = result;

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

      <section className="max-w-2xl mx-auto px-4 py-12 md:py-16">
        <p className="text-sm text-accent font-semibold mb-3 uppercase tracking-wider">Relocation blog</p>
        <h1 className="font-heading text-4xl md:text-5xl font-extrabold text-text-primary mb-3">
          {data.title}
        </h1>
        <p className="text-text-muted text-sm mb-10">{data.date}</p>

        <article className="prose prose-invert prose-sm md:prose-base max-w-none
          prose-headings:font-heading prose-headings:text-text-primary
          prose-p:text-text-muted prose-p:leading-7
          prose-a:text-accent prose-a:no-underline hover:prose-a:underline
          prose-strong:text-text-primary
          prose-li:text-text-muted
          prose-hr:border-border">
          <MDXRemote source={content} />
        </article>

        {/* Bottom CTA */}
        <div className="mt-16 glass-panel rounded-2xl p-8 border border-accent/20 text-center">
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
      </section>
    </main>
  );
}