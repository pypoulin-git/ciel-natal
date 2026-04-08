"use client";

import Link from "next/link";
import { articles } from "@/data/blog/articles";
import Starfield from "@/components/Starfield";
import SiteFooter from "@/components/SiteFooter";
import { useLocale } from "@/lib/i18n";

export default function BlogPage() {
  const { locale } = useLocale();
  const isFr = locale !== "en";

  return (
    <main className="relative min-h-screen">
      <Starfield />
      <div className="relative z-10 max-w-3xl mx-auto px-4 pt-12 pb-8">
        <Link
          href="/"
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
          {isFr ? "Retour" : "Back"}
        </Link>

        <h1 className="font-cinzel text-2xl sm:text-3xl text-[var(--color-text-primary)] mb-2">
          Blog
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mb-10">
          {isFr ? "Explorations en astrologie psychologique" : "Explorations in psychological astrology"}
        </p>

        <div className="grid gap-6 sm:grid-cols-2">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="group glass p-6 rounded-xl border border-[var(--color-glass-border)] hover:border-[var(--color-accent-lavender)]/40 transition-all duration-300"
            >
              <div className="flex items-center gap-3 text-xs text-[var(--color-text-secondary)] mb-3">
                <time dateTime={article.date}>{article.date}</time>
                <span aria-hidden="true">&middot;</span>
                <span>{article.readingTime}</span>
              </div>
              <h2 className="font-cinzel text-base text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-lavender)] transition mb-2">
                {isFr ? article.titleFr : article.titleEn}
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed line-clamp-3">
                {isFr ? article.excerptFr : article.excerptEn}
              </p>
            </Link>
          ))}
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
