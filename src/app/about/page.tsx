import type { Metadata } from "next";
import { ContentfulImage } from "@/components/contentful-image";
import { MarkdownContent } from "@/components/markdown-content";
import { getPrimaryAuthor } from "@/lib/contentful";
import { BowlingPinIcon } from "@/components/icons";
import { PageHeader } from "@/components/page-header";
import { JsonLd } from "@/components/json-ld";
import { CONTACT_EMAIL, SITE_URL } from "@/lib/constants";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "About",
  description: "About Jim Tierney — frontend engineer, Milwaukee.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const author = await getPrimaryAuthor();

  const socialLinks = author?.fields.socialLinks
    ? Object.values(author.fields.socialLinks as Record<string, string>)
    : [];

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author?.fields.name ?? "Jim Tierney",
    url: SITE_URL,
    email: CONTACT_EMAIL,
    jobTitle: "Frontend Engineer",
    ...(socialLinks.length > 0 && { sameAs: socialLinks }),
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-10 px-6 py-16 sm:px-10 sm:py-20">
      <JsonLd schema={personSchema} />

      <PageHeader
        eyebrow="About"
        icon={<BowlingPinIcon size={16} className="text-red" />}
        title={`${author?.fields.name ?? "Jim Tierney"}.`}
      />

      {author?.fields.avatar && "fields" in author.fields.avatar && (
        <div className="max-w-xs border-2 border-ink">
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
        <p className="text-sm text-ink-muted">
          Bio coming soon. Add a bio to your Author entry in Contentful.
        </p>
      )}

      <div className="flex flex-wrap gap-4 border-t-2 border-ink pt-6 text-sm">
        <a
          href="/resume.pdf"
          className="text-ink decoration-amber decoration-2 underline-offset-4 hover:underline"
        >
          Download resume (PDF)
        </a>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-ink decoration-amber decoration-2 underline-offset-4 hover:underline"
        >
          Get in touch
        </a>
      </div>
    </main>
  );
}
