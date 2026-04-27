import type { Metadata } from "next";
import { getAllProjects } from "@/lib/contentful";
import { ProjectCard } from "@/components/project-card";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected projects and case studies by Jim Tierney.",
};

export default async function ProjectsIndexPage() {
  const { items: projects } = await getAllProjects();

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-10 px-6 py-16 sm:px-10">
      <header className="flex flex-col gap-4">
        <p className="eyebrow">Selected Work</p>
        <h1 className="display-heading">Projects.</h1>
        <p className="max-w-2xl text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
          Case studies from work shipped over the years.
        </p>
      </header>

      {projects.length === 0 ? (
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          No projects published yet.
        </p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2">
          {projects.map((project) => (
            <li key={project.sys.id}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
