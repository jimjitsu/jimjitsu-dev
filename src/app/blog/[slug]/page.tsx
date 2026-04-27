import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllBlogPosts, getBlogPostBySlug } from "@/lib/contentful";
import { ContentfulImage } from "@/components/contentful-image";
import { MarkdownContent } from "@/components/markdown-content";

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
  return {
    title: post.fields.title,
    description: post.fields.excerpt,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const { title, excerpt, coverImage, body, tags, publishDate, author, canonicalUrl } =
    post.fields;
  const authorName =
    author && "fields" in author ? (author.fields.name as string | undefined) : undefined;

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-10 px-6 py-16 sm:px-10">
      <Link
        href="/blog"
        className="font-eyebrow text-xs uppercase tracking-[0.2em] underline underline-offset-4"
      >
        ← All posts
      </Link>

      <header className="flex flex-col gap-4">
        <p className="eyebrow">Post</p>
        <h1 className="display-heading">{title}</h1>
        {excerpt && (
          <p className="max-w-2xl text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
            {excerpt}
          </p>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-1 font-eyebrow text-[10px] uppercase tracking-[0.2em] text-neutral-600 dark:text-neutral-400">
          <time dateTime={publishDate}>
            {new Date(publishDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          {authorName && <span>· {authorName}</span>}
          {tags && tags.length > 0 && <span>· {tags.map((t) => `#${t}`).join(" ")}</span>}
        </div>
      </header>

      {coverImage && "fields" in coverImage && (
        <div className="border-2 border-neutral-900 dark:border-neutral-100">
          <ContentfulImage asset={coverImage} alt={title} className="h-auto w-full" priority />
        </div>
      )}

      <MarkdownContent source={body} />

      {canonicalUrl && (
        <p className="border-t-2 border-neutral-900 pt-6 text-xs text-neutral-600 dark:border-neutral-100 dark:text-neutral-400">
          Originally published at{" "}
          <a
            href={canonicalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            {canonicalUrl}
          </a>
          .
        </p>
      )}
    </main>
  );
}
