import Link from "next/link";
import type { Entry } from "contentful";
import type { ProjectSkeleton } from "@/lib/contentful";
import { ContentfulImage } from "./contentful-image";

interface ProjectCardProps {
  project: Entry<ProjectSkeleton, undefined, string>;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { title, slug, summary, coverImage, technologies } = project.fields;

  return (
    <Link
      href={`/projects/${slug}`}
      className="group block border-2 border-neutral-900 bg-neutral-50 transition hover:-translate-y-0.5 dark:border-neutral-100 dark:bg-neutral-900"
    >
      {coverImage && "fields" in coverImage && (
        <div className="aspect-[16/10] overflow-hidden border-b-2 border-neutral-900 dark:border-neutral-100">
          <ContentfulImage
            asset={coverImage}
            alt={title}
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          />
        </div>
      )}
      <div className="flex flex-col gap-3 p-5">
        <h3 className="font-display text-2xl tracking-tight">{title}</h3>
        <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">{summary}</p>
        {technologies && technologies.length > 0 && (
          <ul className="flex flex-wrap gap-2 font-eyebrow text-[10px] uppercase tracking-[0.2em]">
            {technologies.map((tech) => (
              <li
                key={tech}
                className="border border-neutral-900 px-2 py-0.5 dark:border-neutral-100"
              >
                {tech}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Link>
  );
}
