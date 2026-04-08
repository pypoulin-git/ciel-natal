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
      "astrology",
      "astrologie psychologique",
      "psychological astrology",
      article.titleFr,
      article.titleEn,
    ],
    openGraph: {
      title: `${article.titleFr} — Ciel Natal`,
      description: article.excerptFr,
      images: [`/api/og?title=${encodeURIComponent(article.titleFr)}`],
      type: "article",
      publishedTime: article.date,
    },
    alternates: {
      canonical: `https://ciel-natal.vercel.app/blog/${slug}`,
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
    description: article.excerptFr,
    datePublished: article.date,
    author: { "@type": "Organization", name: "Ciel Natal" },
    publisher: { "@type": "Organization", name: "Ciel Natal", url: "https://ciel-natal.vercel.app" },
    image: `https://ciel-natal.vercel.app/api/og?title=${encodeURIComponent(article.titleFr)}`,
    url: `https://ciel-natal.vercel.app/blog/${slug}`,
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
