import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllProjects, getProjectBySlug } from "@/lib/contentful";
import { ContentfulImage } from "@/components/contentful-image";
import { MarkdownContent } from "@/components/markdown-content";
import { LaneArrowIcon } from "@/components/icons";
import { JsonLd } from "@/components/json-ld";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 60;

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

function resolveContentfulUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined;
  return url.startsWith("//") ? `https:${url}` : url;
}

export async function generateStaticParams() {
  const { items } = await getAllProjects();
  return items.map((item) => ({ slug: item.fields.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};

  const { title, summary, coverImage } = project.fields;

  const ogImageUrl =
    coverImage && "fields" in coverImage
      ? resolveContentfulUrl(String(coverImage.fields.file?.url ?? ""))
      : undefined;

  return {
    title,
    description: summary,
    openGraph: {
      title,
      description: summary,
      type: "website",
      url: `${SITE_URL}/projects/${slug}`,
      ...(ogImageUrl && { images: [{ url: ogImageUrl }] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: summary,
      ...(ogImageUrl && { images: [ogImageUrl] }),
    },
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const { title, summary, coverImage, role, technologies, liveUrl, repoUrl, body } =
    project.fields;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Projects", item: `${SITE_URL}/projects` },
      { "@type": "ListItem", position: 3, name: title, item: `${SITE_URL}/projects/${slug}` },
    ],
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-10 px-6 py-16 sm:px-10 sm:py-20">
      <JsonLd schema={breadcrumbSchema} />

      <Link
        href="/projects"
        className="inline-flex items-center gap-2 font-eyebrow text-sm tracking-[0.04em] text-ink decoration-amber decoration-2 underline-offset-4 hover:underline"
      >
        <LaneArrowIcon size={14} className="-rotate-90" />
        All projects
      </Link>

      <header className="flex flex-col gap-4">
        <p className="eyebrow">Case study</p>
        <h1 className="display-heading">{title}</h1>
        {summary && (
          <p className="max-w-2xl text-base leading-relaxed text-ink-muted">{summary}</p>
        )}
      </header>

      {coverImage && "fields" in coverImage && (
        <div className="border-2 border-ink">
          <ContentfulImage asset={coverImage} alt={title} className="h-auto w-full" priority />
        </div>
      )}

      <dl className="grid grid-cols-1 gap-x-10 gap-y-4 border-y-2 border-ink py-6 sm:grid-cols-3">
        {role && (
          <div>
            <dt className="eyebrow-sm">Role</dt>
            <dd className="mt-1 text-sm text-ink">{role}</dd>
          </div>
        )}
        {technologies && technologies.length > 0 && (
          <div>
            <dt className="eyebrow-sm">Tech</dt>
            <dd className="mt-1 text-sm text-ink">{technologies.join(" · ")}</dd>
          </div>
        )}
        {(liveUrl || repoUrl) && (
          <div>
            <dt className="eyebrow-sm">Links</dt>
            <dd className="mt-1 flex flex-col gap-1 text-sm">
              {liveUrl && (
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink decoration-amber decoration-2 underline-offset-4 hover:underline"
                >
                  Live site ↗
                </a>
              )}
              {repoUrl && (
                <a
                  href={repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink decoration-amber decoration-2 underline-offset-4 hover:underline"
                >
                  Repository ↗
                </a>
              )}
            </dd>
          </div>
        )}
      </dl>

      <MarkdownContent source={body} />
    </main>
  );
}
