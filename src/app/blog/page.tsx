import Link from "next/link";
import type { Metadata } from "next";
import { articles } from "@/data/blog/articles";
import Starfield from "@/components/Starfield";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Blog — Astrologie psychologique | Ciel Natal",
  description:
    "Articles educatifs sur l'astrologie psychologique : ascendant, elements, aspects planetaires et bien plus. Apprends a lire ton theme natal.",
  keywords: [
    "blog astrologie",
    "astrologie psychologique",
    "ascendant",
    "elements astrologie",
    "aspects planetaires",
    "theme natal",
  ],
  openGraph: {
    title: "Blog — Ciel Natal",
    description:
      "Explore nos articles sur l'astrologie psychologique et apprends a lire ton theme natal.",
  },
};

export default function BlogPage() {
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
          Retour
        </Link>

        <h1 className="font-cinzel text-2xl sm:text-3xl text-[var(--color-text-primary)] mb-2">
          Blog
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mb-10">
          Explorations en astrologie psychologique
        </p>

        <div className="grid gap-6 sm:grid-cols-2">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="group glass p-6 rounded-xl border border-[var(--color-glass-border)] hover:border-[var(--color-accent-lavender)]/40 transition-all duration-300"
            >
              <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-secondary)] mb-3">
                <time dateTime={article.date}>{article.date}</time>
                <span aria-hidden="true">&middot;</span>
                <span>{article.readingTime}</span>
              </div>
              <h2 className="font-cinzel text-base text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-lavender)] transition mb-2">
                {article.titleFr}
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed line-clamp-3">
                {article.excerptFr}
              </p>
            </Link>
          ))}
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
