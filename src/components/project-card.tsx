import Link from "next/link";
import type { Entry } from "contentful";
import type { ProjectSkeleton } from "@/lib/contentful";
import { ContentfulImage } from "./contentful-image";

interface ProjectCardProps {
  project: Entry<ProjectSkeleton, undefined, string>;
  /** Tailwind text-color class to use for the top accent stripe. */
  accent?: "red" | "teal" | "amber";
}

const ACCENT_BG: Record<NonNullable<ProjectCardProps["accent"]>, string> = {
  red: "bg-red",
  teal: "bg-teal",
  amber: "bg-amber",
};

export function ProjectCard({ project, accent = "red" }: ProjectCardProps) {
  const { title, slug, summary, coverImage, technologies } = project.fields;

  return (
    <Link
      href={`/projects/${slug}`}
      className="group block border-2 border-ink bg-base transition hover:-translate-y-0.5"
    >
      {/* Top accent stripe — flat, brutalist, plays the bowling-stripe role. */}
      <div className={`h-2 w-full ${ACCENT_BG[accent]}`} aria-hidden="true" />
      {coverImage && "fields" in coverImage && (
        <div className="aspect-[16/10] overflow-hidden border-b-2 border-ink">
          <ContentfulImage
            asset={coverImage}
            alt={title}
            sizes="(min-width: 640px) 50vw, 100vw"
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          />
        </div>
      )}
      <div className="flex flex-col gap-3 p-5">
        <h3 className="font-display text-2xl tracking-tight text-ink">{title}</h3>
        <p className="text-sm leading-relaxed text-ink-muted">{summary}</p>
        {technologies && technologies.length > 0 && (
          <ul className="flex flex-wrap gap-2 font-eyebrow text-xs tracking-[0.04em]">
            {technologies.map((tech) => (
              <li key={tech} className="bg-amber/20 border border-amber px-2 py-0.5 text-ink">
                {tech}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Link>
  );
}
