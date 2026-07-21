'use client'

import Link from 'next/link'
import { useLocale } from '@/lib/i18n'
import { articles } from '@/data/blog/articles'
import { extraFor } from '@/data/blog/extras'
import ArticleHero from '@/components/blog/ArticleHero'

// Compact "latest from the blog" strip, reusable on the portal (any topic) and
// the natal-chart page (only chart-related slugs). Cards mirror the blog index.
export default function LatestArticles({
  title,
  slugs,
  limit = 3,
}: {
  title?: string
  slugs?: string[] // if given, restrict to these (chart-related); else most recent
  limit?: number
}) {
  const { locale } = useLocale()
  const fr = locale === 'fr'

  const pool = slugs
    ? slugs.map((s) => articles.find((a) => a.slug === s)).filter((a): a is (typeof articles)[number] => !!a)
    : [...articles].sort((a, b) => b.date.localeCompare(a.date))

  const list = pool.slice(0, limit)
  if (list.length === 0) return null

  return (
    <section className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-end justify-between mb-6 gap-4">
        <h2 className="font-cinzel text-2xl sm:text-3xl text-[var(--color-text-primary)]">
          {title ?? (fr ? 'Du journal' : 'From the journal')}
        </h2>
        <Link
          href="/blog"
          className="text-sm text-[var(--color-accent-lavender)] hover:text-[var(--color-text-primary)] transition whitespace-nowrap"
        >
          {fr ? 'Tout le journal →' : 'All articles →'}
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {list.map((a) => (
          <Link
            key={a.slug}
            href={`/blog/${a.slug}`}
            className="group glass rounded-xl overflow-hidden border border-[var(--color-glass-border)] hover:border-[var(--color-accent-lavender)]/40 transition"
          >
            <ArticleHero variant={extraFor(a.slug).hero} rounded="" className="h-24" />
            <div className="p-4">
              <p className="text-[11px] text-[var(--color-text-muted)] mb-1.5">
                {a.date} · {a.readingTime}
              </p>
              <h3 className="font-cinzel text-sm text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-lavender)] transition leading-snug mb-1.5">
                {fr ? a.titleFr : a.titleEn}
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed line-clamp-2">
                {fr ? a.excerptFr : a.excerptEn}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
