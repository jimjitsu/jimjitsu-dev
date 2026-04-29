import type { Metadata } from "next";
import { getAllProjects } from "@/lib/contentful";
import { ProjectCard } from "@/components/project-card";
import { StrikeIcon } from "@/components/icons";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected projects and case studies by Jim Tierney.",
};

// Rotates through the three accent colors so the grid has a bowling-stripe rhythm.
const ACCENT_CYCLE = ["red", "teal", "amber"] as const;

export default async function ProjectsIndexPage() {
  const { items: projects } = await getAllProjects();

  return (
    <main className="mx-auto flex min-h-dvh max-w-4xl flex-col gap-10 px-6 py-16 sm:px-10 sm:py-20">
      <header className="flex flex-col gap-4">
        <p className="eyebrow flex items-center gap-2">
          <StrikeIcon size={16} className="text-red" />
          Selected work
        </p>
        <h1 className="display-heading">Projects.</h1>
        <p className="max-w-2xl text-base leading-relaxed text-ink-muted">
          Case studies from work shipped over the years.
        </p>
      </header>

      {projects.length === 0 ? (
        <p className="text-sm text-ink-muted">No projects published yet.</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2">
          {projects.map((project, index) => (
            <li key={project.sys.id}>
              <ProjectCard project={project} accent={ACCENT_CYCLE[index % ACCENT_CYCLE.length]} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
