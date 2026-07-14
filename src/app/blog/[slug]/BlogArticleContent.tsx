"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n";
import { articles, type BlogArticle } from "@/data/blog/articles";
import { extraFor } from "@/data/blog/extras";
import ArticleHero from "@/components/blog/ArticleHero";
import ShareButtons from "@/components/ShareButtons";

export default function BlogArticleContent({ article }: { article: BlogArticle }) {
  const { locale } = useLocale();
  const fr = locale === "fr";

  const title = fr ? article.titleFr : article.titleEn;
  const content = fr ? article.contentFr : article.contentEn;
  const shareUrl = `https://natalune.com/blog/${article.slug}`;
  const extra = extraFor(article.slug);
  const related = extra.related
    .map((slug) => articles.find((a) => a.slug === slug))
    .filter((a): a is BlogArticle => !!a)
    .slice(0, 3);

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

      <h1 className="font-cinzel text-2xl sm:text-3xl text-[var(--color-text-primary)] mb-6">
        {title}
      </h1>

      {/* Hero illustration */}
      <ArticleHero variant={extra.hero} className="h-40 sm:h-52 mb-8" />

      <article className="glass p-6 sm:p-8 text-sm text-[var(--color-text-primary)]/80 leading-relaxed space-y-6">
        {/* Lead paragraph, slightly emphasised */}
        {content.map((paragraph, i) =>
          i === 0 ? (
            <p key={i} className="text-base text-[var(--color-text-primary)] leading-relaxed first-letter:font-cinzel first-letter:text-3xl first-letter:text-[var(--color-accent-gold)] first-letter:mr-1 first-letter:float-left first-letter:leading-none">
              {paragraph}
            </p>
          ) : (
            <p key={i}>{paragraph}</p>
          )
        )}
      </article>

      {/* Pour aller plus loin — references (internal links spread SEO; external = sources) */}
      {extra.references.length > 0 && (
        <section className="mt-8 glass p-6" style={{ borderColor: "rgba(224,169,78,0.25)" }}>
          <h2 className="text-xs uppercase tracking-widest text-[var(--color-accent-gold)]/85 mb-4">
            {fr ? "Pour aller plus loin" : "Go further"}
          </h2>
          <ul className="space-y-2.5">
            {extra.references.map((ref, i) => {
              const label = fr ? ref.fr : ref.en;
              return (
                <li key={i} className="flex items-start gap-2.5">
                  <span aria-hidden="true" className="text-[var(--color-accent-lavender)] mt-0.5 shrink-0">
                    {ref.external ? "↗" : "→"}
                  </span>
                  {ref.external ? (
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent-lavender)] transition underline decoration-dotted decoration-[var(--color-text-muted)]/40 underline-offset-4"
                    >
                      {label}
                    </a>
                  ) : (
                    <Link
                      href={ref.url}
                      className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent-lavender)] transition"
                    >
                      {label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Share */}
      <div className="mt-8 flex justify-center">
        <ShareButtons url={shareUrl} title={title} />
      </div>

      {/* Related articles — internal cross-links */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="font-cinzel text-lg text-[var(--color-text-primary)] mb-4">
            {fr ? "À lire ensuite" : "Read next"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {related.map((a) => {
              const rx = extraFor(a.slug);
              return (
                <Link
                  key={a.slug}
                  href={`/blog/${a.slug}`}
                  className="group glass rounded-xl overflow-hidden border border-[var(--color-glass-border)] hover:border-[var(--color-accent-lavender)]/40 transition"
                >
                  <ArticleHero variant={rx.hero} rounded="" className="h-20" />
                  <div className="p-3">
                    <h3 className="text-sm text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-lavender)] transition leading-snug">
                      {fr ? a.titleFr : a.titleEn}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Closing CTA — turn a reader into a chart */}
      <section className="mt-12 glass p-6 sm:p-8 text-center" style={{ borderColor: "rgba(179,167,224,0.3)" }}>
        <h2 className="font-cinzel text-xl text-[var(--color-text-primary)] mb-2">
          {fr ? "Et toi, que raconte ton ciel ?" : "What does your sky say?"}
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-5 max-w-md mx-auto leading-relaxed">
          {fr
            ? "Calcule ta carte du ciel gratuitement et découvre ton Soleil, ta Lune, ton Ascendant et tes maisons."
            : "Calculate your birth chart for free and discover your Sun, Moon, Ascendant and houses."}
        </p>
        <Link
          href="/"
          className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-full text-white text-sm font-medium"
        >
          <span aria-hidden="true">✦</span>
          {fr ? "Lire ma carte natale" : "Read my natal chart"}
        </Link>
      </section>

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
