import { articlesByDate } from "@/data/blog/articles";

// RSS 2.0 feed of the blog (QA 2026-11: there was none, and /blog/rss.xml
// answered 200 with an empty article page).
export const dynamic = "force-static";

const SITE = "https://natalune.com";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function GET() {
  const items = articlesByDate()
    .map((a) => {
      const url = `${SITE}/blog/${a.slug}`;
      return `    <item>
      <title>${esc(a.titleFr)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(`${a.date}T12:00:00Z`).toUTCString()}</pubDate>
      <description>${esc(a.excerptFr)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Natalune · le blogue</title>
    <link>${SITE}/blog</link>
    <atom:link href="${SITE}/blog/rss.xml" rel="self" type="application/rss+xml" />
    <description>Astrologie psychologique, ciel du moment et rêves.</description>
    <language>fr-CA</language>
${items}
  </channel>
</rss>
`;
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
