import { unstable_cache } from "next/cache";
import { getAllProjects, getAllBlogPosts, getPrimaryAuthor } from "./contentful";

const SKILLS = `Languages: HTML, CSS, JavaScript, TypeScript
Frameworks: React, Next.js, Vue, Svelte, jQuery
Styling: Tailwind CSS, Bootstrap, Foundation
Tooling: Webpack, Node.js, npm, Grunt, Gulp, GSAP, Git
CMS: Contentful, Kentico, Sitecore, WordPress
AI: Claude Code, Cursor, GitHub Copilot
Additional: Design systems, web performance, WCAG 2.1 AA accessibility, agile, cross-functional collaboration`.trim();

const FALLBACK_CAREER_CONTEXT = `### Bio
Jim Tierney is a frontend engineer based in Milwaukee, WI. He has over a decade of experience at agencies like Hanson Dodge and Ascedia, where he specialized in building fast, accessible, component-driven UIs and the design systems that power them. He's worked on large-scale Sitecore, Kentico, and WordPress projects, led frontend teams, mentored developers, and collaborated closely with UX and design.

### Skills
${SKILLS}`.trim();

async function fetchCareerContext(): Promise<string> {
  try {
    const [projectsResult, postsResult, author] = await Promise.all([
      getAllProjects(),
      getAllBlogPosts(),
      getPrimaryAuthor(),
    ]);

    const bio = author?.fields.bio ?? "Frontend engineer based in Milwaukee, WI.";

    const projectsText = projectsResult.items
      .map((p) => {
        const f = p.fields;
        const tech = Array.isArray(f.technologies) ? f.technologies.join(", ") : "";
        const urls = [
          f.liveUrl ? `Live: ${f.liveUrl}` : null,
          f.repoUrl ? `Repo: ${f.repoUrl}` : null,
        ]
          .filter(Boolean)
          .join(" | ");
        return [
          `**${String(f.title)}**${f.role ? ` — ${String(f.role)}` : ""}`,
          tech ? `Technologies: ${tech}` : null,
          f.summary ? String(f.summary) : null,
          urls || null,
        ]
          .filter(Boolean)
          .join("\n");
      })
      .join("\n\n");

    const postsText = postsResult.items
      .map((p) => {
        const f = p.fields;
        const tags = Array.isArray(f.tags) && f.tags.length > 0 ? ` (${f.tags.join(", ")})` : "";
        return `${String(f.title)}${f.excerpt ? ` — ${String(f.excerpt)}` : ""}${tags}`;
      })
      .join("\n");

    return `### Bio
${bio}

### Skills
${SKILLS}

### Projects
${projectsText || "No projects published yet."}

### Writing (topics Jim covers)
${postsText || "No posts published yet."}`.trim();
  } catch {
    return FALLBACK_CAREER_CONTEXT;
  }
}

export const getCareerContext = unstable_cache(fetchCareerContext, ["chat-career-context"], {
  revalidate: 60,
});
