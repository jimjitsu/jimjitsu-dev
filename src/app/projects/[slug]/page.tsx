import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllProjects, getProjectBySlug } from "@/lib/contentful";
import { ContentfulImage } from "@/components/contentful-image";
import { MarkdownContent } from "@/components/markdown-content";

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
  return {
    title: project.fields.title,
    description: project.fields.summary,
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const { title, summary, coverImage, role, technologies, liveUrl, repoUrl, body } =
    project.fields;

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-10 px-6 py-16 sm:px-10">
      <Link
        href="/projects"
        className="font-eyebrow text-xs uppercase tracking-[0.2em] underline underline-offset-4"
      >
        ← All projects
      </Link>

      <header className="flex flex-col gap-4">
        <p className="eyebrow">Case Study</p>
        <h1 className="display-heading">{title}</h1>
        {summary && (
          <p className="max-w-2xl text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
            {summary}
          </p>
        )}
      </header>

      {coverImage && "fields" in coverImage && (
        <div className="border-2 border-neutral-900 dark:border-neutral-100">
          <ContentfulImage
            asset={coverImage}
            alt={title}
            className="h-auto w-full"
            priority
          />
        </div>
      )}

      <dl className="grid grid-cols-1 gap-x-10 gap-y-4 border-y-2 border-neutral-900 py-6 sm:grid-cols-3 dark:border-neutral-100">
        {role && (
          <div>
            <dt className="font-eyebrow text-[10px] uppercase tracking-[0.2em] text-neutral-600 dark:text-neutral-400">
              Role
            </dt>
            <dd className="mt-1 text-sm">{role}</dd>
          </div>
        )}
        {technologies && technologies.length > 0 && (
          <div>
            <dt className="font-eyebrow text-[10px] uppercase tracking-[0.2em] text-neutral-600 dark:text-neutral-400">
              Tech
            </dt>
            <dd className="mt-1 text-sm">{technologies.join(" · ")}</dd>
          </div>
        )}
        {(liveUrl || repoUrl) && (
          <div>
            <dt className="font-eyebrow text-[10px] uppercase tracking-[0.2em] text-neutral-600 dark:text-neutral-400">
              Links
            </dt>
            <dd className="mt-1 flex flex-col gap-1 text-sm">
              {liveUrl && (
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4"
                >
                  Live site ↗
                </a>
              )}
              {repoUrl && (
                <a
                  href={repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4"
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
