import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllProjects, getProjectBySlug, resolveAssetUrl } from "@/lib/contentful";
import { ContentfulImage } from "@/components/contentful-image";
import { MarkdownContent } from "@/components/markdown-content";
import { BackLink } from "@/components/back-link";
import { ProjectMetaBar } from "@/components/project-meta-bar";
import { JsonLd } from "@/components/json-ld";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 60;

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
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
      ? resolveAssetUrl(String(coverImage.fields.file?.url ?? ""))
      : undefined;

  return {
    title,
    description: summary,
    alternates: { canonical: `/projects/${slug}` },
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

  const { title, summary, coverImage, role, technologies, liveUrl, repoUrl, body } = project.fields;

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

      <BackLink href="/projects" label="All projects" />

      <header className="flex flex-col gap-4">
        <p className="eyebrow">Case study</p>
        <h1 className="display-heading">{title}</h1>
        {summary && <p className="max-w-2xl text-base leading-relaxed text-ink-muted">{summary}</p>}
      </header>

      {coverImage && "fields" in coverImage && (
        <div className="border-2 border-ink">
          <ContentfulImage asset={coverImage} alt={title} className="h-auto w-full" priority />
        </div>
      )}

      <ProjectMetaBar
        role={role}
        technologies={technologies ?? undefined}
        liveUrl={liveUrl}
        repoUrl={repoUrl}
      />

      <MarkdownContent source={body} />
    </main>
  );
}
