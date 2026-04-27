import type { Metadata } from "next";
import { ContentfulImage } from "@/components/contentful-image";
import { MarkdownContent } from "@/components/markdown-content";
import { contentful, type AuthorSkeleton } from "@/lib/contentful";

export const metadata: Metadata = {
  title: "About",
  description: "About Jim Tierney — frontend engineer, Milwaukee.",
};

/**
 * Pull the singleton Author entry. We assume there's just one for now;
 * if multiple exist, this picks whichever Contentful returns first.
 */
async function getPrimaryAuthor() {
  const entries = await contentful.getEntries<AuthorSkeleton>({
    content_type: "author",
    limit: 1,
  });
  return entries.items[0] ?? null;
}

export default async function AboutPage() {
  const author = await getPrimaryAuthor();

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-10 px-6 py-16 sm:px-10">
      <header className="flex flex-col gap-4">
        <p className="eyebrow">About</p>
        <h1 className="display-heading">{author?.fields.name ?? "Jim Tierney"}.</h1>
      </header>

      {author?.fields.avatar && "fields" in author.fields.avatar && (
        <div className="max-w-xs border-2 border-neutral-900 dark:border-neutral-100">
          <ContentfulImage
            asset={author.fields.avatar}
            alt={author.fields.name}
            className="h-auto w-full"
          />
        </div>
      )}

      {author?.fields.bio ? (
        <MarkdownContent source={author.fields.bio} />
      ) : (
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Bio coming soon. Add a bio to your Author entry in Contentful.
        </p>
      )}

      <div className="flex flex-wrap gap-4 border-t-2 border-neutral-900 pt-6 text-sm dark:border-neutral-100">
        <a href="/resume.pdf" className="underline underline-offset-4">
          Download resume (PDF)
        </a>
        <a
          href="mailto:jimbo.c.tierney@gmail.com"
          className="underline underline-offset-4"
        >
          Get in touch
        </a>
      </div>
    </main>
  );
}
