import { getAllBlogPosts } from "@/lib/contentful";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 3600;

export async function GET() {
  const { items: posts } = await getAllBlogPosts();

  const items = posts
    .map((post) => {
      const { title, slug, excerpt, publishDate, canonicalUrl } = post.fields;
      const link = canonicalUrl ?? `${SITE_URL}/blog/${slug}`;
      return [
        `    <item>`,
        `      <title><![CDATA[${title}]]></title>`,
        `      <link>${link}</link>`,
        `      <guid isPermaLink="true">${SITE_URL}/blog/${slug}</guid>`,
        `      <pubDate>${new Date(publishDate).toUTCString()}</pubDate>`,
        excerpt ? `      <description><![CDATA[${excerpt}]]></description>` : "",
        `    </item>`,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Jim Tierney</title>
    <link>${SITE_URL}</link>
    <description>Writing on frontend craft, design systems, and adjacent territory.</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
