"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n";
import type { BlogArticle } from "@/data/blog/articles";
import ShareButtons from "@/components/ShareButtons";

export default function BlogArticleContent({ article }: { article: BlogArticle }) {
  const { locale } = useLocale();
  const fr = locale === "fr";

  const title = fr ? article.titleFr : article.titleEn;
  const content = fr ? article.contentFr : article.contentEn;
  const shareUrl = `https://ciel-natal.vercel.app/blog/${article.slug}`;

  return (
    <>
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition mb-8"
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Blog
      </Link>

      <div className="mb-4 flex items-center gap-3 text-xs text-[var(--color-text-secondary)]">
        <time dateTime={article.date}>{article.date}</time>
        <span aria-hidden="true">&middot;</span>
        <span>{article.readingTime}</span>
      </div>

      <h1 className="font-cinzel text-2xl sm:text-3xl text-[var(--color-text-primary)] mb-8">
        {title}
      </h1>

      <article className="glass p-6 sm:p-8 text-sm text-[var(--color-text-primary)]/80 leading-relaxed space-y-6">
        {content.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </article>

      <div className="mt-8 flex justify-center">
        <ShareButtons url={shareUrl} title={title} />
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-xs text-[var(--color-accent-lavender)] hover:text-[var(--color-text-primary)] transition"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {fr ? "Tous les articles" : "All articles"}
        </Link>
      </div>
    </>
  );
}
