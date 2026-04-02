import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { articles } from "@/data/blog/articles";
import Starfield from "@/components/Starfield";
import SiteFooter from "@/components/SiteFooter";

/* ------------------------------------------------------------------ */
/*  Static generation                                                  */
/* ------------------------------------------------------------------ */

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) return {};
  return {
    title: `${article.titleFr} — Blog | Ciel Natal`,
    description: article.excerptFr,
    keywords: [
      "astrologie",
      "astrologie psychologique",
      "theme natal",
      article.titleFr,
    ],
    openGraph: {
      title: `${article.titleFr} — Ciel Natal`,
      description: article.excerptFr,
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = articles.find((a) => a.slug === slug);
  if (!article) notFound();

  return (
    <main className="relative min-h-screen">
      <Starfield />
      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-12 pb-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition mb-8"
        >
          <svg
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Blog
        </Link>

        <div className="mb-4 flex items-center gap-3 text-[10px] text-[var(--color-text-secondary)]">
          <time dateTime={article.date}>{article.date}</time>
          <span aria-hidden="true">&middot;</span>
          <span>{article.readingTime}</span>
        </div>

        <h1 className="font-cinzel text-2xl sm:text-3xl text-[var(--color-text-primary)] mb-8">
          {article.titleFr}
        </h1>

        <article className="glass p-6 sm:p-8 text-sm text-[var(--color-text-primary)]/80 leading-relaxed space-y-6">
          {article.contentFr.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </article>

        <div className="mt-10 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs text-[var(--color-accent-lavender)] hover:text-[var(--color-text-primary)] transition"
          >
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Tous les articles
          </Link>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
