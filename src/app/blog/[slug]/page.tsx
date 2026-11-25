import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { articles } from "@/data/blog/articles";
import Starfield from "@/components/Starfield";
import SiteFooter from "@/components/SiteFooter";
import BlogArticleContent from "./BlogArticleContent";

/* ------------------------------------------------------------------ */
/*  Static generation                                                  */
/* ------------------------------------------------------------------ */

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

/** Search engines cut descriptions past ~155 characters: end on a whole word. */
function metaDescription(text: string, max = 155): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.\s]+$/, "")}…`;
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
    title: `${article.titleFr} — Blog | Natalune`,
    description: metaDescription(article.excerptFr),
    keywords: [
      "astrologie",
      "astrology",
      "astrologie psychologique",
      "psychological astrology",
      article.titleFr,
      article.titleEn,
    ],
    openGraph: {
      title: `${article.titleFr} — Natalune`,
      description: metaDescription(article.excerptFr),
      images: [`/api/og?title=${encodeURIComponent(article.titleFr)}`],
      type: "article",
      publishedTime: article.date,
    },
    alternates: {
      canonical: `https://natalune.com/blog/${slug}`,
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.titleFr,
    description: metaDescription(article.excerptFr),
    datePublished: article.date,
    author: { "@type": "Organization", name: "Natalune" },
    publisher: { "@type": "Organization", name: "Natalune", url: "https://natalune.com" },
    image: `https://natalune.com/api/og?title=${encodeURIComponent(article.titleFr)}`,
    url: `https://natalune.com/blog/${slug}`,
    inLanguage: ["fr", "en"],
  };

  return (
    <main className="relative min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Starfield />
      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-12 pb-8">
        <BlogArticleContent article={article} />
      </div>
      <SiteFooter />
    </main>
  );
}
