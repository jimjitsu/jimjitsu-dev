import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { getAllBlogPosts, getBlogPostBySlug, resolveAssetUrl } from "@/lib/contentful";
import { ContentfulImage } from "@/components/contentful-image";
import { MarkdownContent } from "@/components/markdown-content";
import { BackLink } from "@/components/back-link";
import { ArticleMetaLine } from "@/components/article-meta-line";
import { JsonLd } from "@/components/json-ld";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 60;

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const { items } = await getAllBlogPosts();
  return items.map((item) => ({ slug: item.fields.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};

  const { title, excerpt, coverImage, publishDate, canonicalUrl } = post.fields;

  const ogImageUrl =
    coverImage && "fields" in coverImage
      ? resolveAssetUrl(String(coverImage.fields.file?.url ?? ""))
      : undefined;

  return {
    title,
    description: excerpt,
    alternates: { canonical: canonicalUrl ?? `/blog/${slug}` },
    openGraph: {
      title,
      description: excerpt,
      type: "article",
      publishedTime: publishDate,
      url: `${SITE_URL}/blog/${slug}`,
      ...(ogImageUrl && { images: [{ url: ogImageUrl }] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: excerpt,
      ...(ogImageUrl && { images: [ogImageUrl] }),
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const { isEnabled: draft } = await draftMode();
  const post = await getBlogPostBySlug(slug, { draft });
  if (!post) notFound();

  const { title, excerpt, coverImage, body, tags, publishDate, author, canonicalUrl } = post.fields;
  const authorName =
    author && "fields" in author ? (author.fields.name as string | undefined) : undefined;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    datePublished: publishDate,
    dateModified: post.sys.updatedAt,
    url: `${SITE_URL}/blog/${slug}`,
    author: {
      "@type": "Person",
      name: authorName ?? "Jim Tierney",
      url: SITE_URL,
    },
    ...(excerpt && { description: excerpt }),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: title, item: `${SITE_URL}/blog/${slug}` },
    ],
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-10 px-6 py-16 sm:px-10 sm:py-20">
      <JsonLd schema={articleSchema} />
      <JsonLd schema={breadcrumbSchema} />

      <BackLink href="/blog" label="All posts" />

      <header className="flex flex-col gap-4">
        <p className="eyebrow">Post</p>
        <h1 className="display-heading">{title}</h1>
        {excerpt && <p className="max-w-2xl text-base leading-relaxed text-ink-muted">{excerpt}</p>}
        <ArticleMetaLine publishDate={publishDate} author={authorName} tags={tags ?? undefined} />
      </header>

      {coverImage && "fields" in coverImage && (
        <div className="border-2 border-ink">
          <ContentfulImage asset={coverImage} alt={title} className="h-auto w-full" priority />
        </div>
      )}

      <MarkdownContent source={body} />

      {canonicalUrl && (
        <p className="border-t-2 border-ink pt-6 text-xs text-ink-muted">
          Originally published at{" "}
          <a
            href={canonicalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink decoration-amber decoration-2 underline-offset-4 hover:underline"
          >
            {canonicalUrl}
          </a>
          .
        </p>
      )}
    </main>
  );
}
