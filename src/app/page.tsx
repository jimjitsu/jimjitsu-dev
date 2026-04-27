import Link from "next/link";
import { contentful, type ProjectSkeleton } from "@/lib/contentful";
import { getAllBlogPosts } from "@/lib/contentful";
import { ProjectCard } from "@/components/project-card";
import { BlogPostCard } from "@/components/blog-post-card";

/**
 * Home page.
 * Section structure mirrors spec §6.2. Featured projects and recent writing
 * pull from Contentful; the rest stay hardcoded until design mockups land.
 */
export default async function HomePage() {
  const [{ items: featuredProjects }, { items: recentPosts }] = await Promise.all([
    contentful.getEntries<ProjectSkeleton>({
      content_type: "project",
      "fields.featured": true,
      order: ["fields.order", "-fields.publishDate"],
      limit: 4,
    }),
    getAllBlogPosts().then((res) => ({ items: res.items.slice(0, 3) })),
  ]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-24 px-6 py-16 sm:px-10">
      <HeroSection />
      <AboutSnapshotSection />
      <FeaturedProjectsSection projects={featuredProjects} />
      <RecentWritingSection posts={recentPosts} />
      <SkillsSection />
      <ContactSection />
    </main>
  );
}

function HeroSection() {
  return (
    <section aria-labelledby="hero-heading" className="flex flex-col gap-6">
      <p className="eyebrow">Jim Tierney</p>
      <h1 id="hero-heading" className="display-heading">
        Frontend engineer, design-system obsessive.
      </h1>
      <p className="max-w-2xl text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
        I build fast, accessible, component-driven frontends — and the tooling that lets content
        teams go wild without breaking the brand.
      </p>
      <div className="flex flex-wrap gap-4">
        <Link
          href="/projects"
          className="border-2 border-neutral-900 bg-neutral-900 px-5 py-3 text-sm font-bold uppercase tracking-wider text-neutral-50 transition hover:-translate-y-0.5 dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
        >
          See projects
        </Link>
        <Link
          href="/blog"
          className="border-2 border-neutral-900 px-5 py-3 text-sm font-bold uppercase tracking-wider text-neutral-900 transition hover:-translate-y-0.5 dark:border-neutral-100 dark:text-neutral-100"
        >
          Read the blog
        </Link>
      </div>
    </section>
  );
}

function AboutSnapshotSection() {
  return (
    <section aria-labelledby="about-heading" className="flex flex-col gap-4">
      <p className="eyebrow">About</p>
      <h2 id="about-heading" className="display-heading">
        A bit about me.
      </h2>
      <p className="max-w-2xl text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
        Lorem ipsum placeholder bio. Replace once the /about page copy is locked.
      </p>
      <div className="flex flex-wrap gap-4 text-sm">
        <Link href="/about" className="underline underline-offset-4">
          More about me
        </Link>
        <a href="/resume.pdf" className="underline underline-offset-4">
          Download resume
        </a>
      </div>
    </section>
  );
}

function FeaturedProjectsSection({
  projects,
}: {
  projects: Awaited<ReturnType<typeof contentful.getEntries<ProjectSkeleton>>>["items"];
}) {
  return (
    <section aria-labelledby="projects-heading" className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p className="eyebrow">Selected Work</p>
          <h2 id="projects-heading" className="display-heading">
            Featured projects.
          </h2>
        </div>
        <Link
          href="/projects"
          className="font-eyebrow text-xs uppercase tracking-[0.2em] underline underline-offset-4"
        >
          All projects →
        </Link>
      </div>
      {projects.length === 0 ? (
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Mark a few projects as <code>Featured</code> in Contentful to populate this section.
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
    </section>
  );
}

function RecentWritingSection({
  posts,
}: {
  posts: Awaited<ReturnType<typeof getAllBlogPosts>>["items"];
}) {
  return (
    <section aria-labelledby="writing-heading" className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p className="eyebrow">From the Blog</p>
          <h2 id="writing-heading" className="display-heading">
            Recent writing.
          </h2>
        </div>
        <Link
          href="/blog"
          className="font-eyebrow text-xs uppercase tracking-[0.2em] underline underline-offset-4"
        >
          All posts →
        </Link>
      </div>
      {posts.length === 0 ? (
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          No blog posts yet — publish one in Contentful and it&apos;ll show up here.
        </p>
      ) : (
        <ul className="grid gap-6">
          {posts.map((post) => (
            <li key={post.sys.id}>
              <BlogPostCard post={post} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function SkillsSection() {
  return (
    <section aria-labelledby="skills-heading" className="flex flex-col gap-4">
      <p className="eyebrow">Toolkit</p>
      <h2 id="skills-heading" className="display-heading">
        Skills &amp; tech.
      </h2>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        Placeholder — visual summary of core tech to come.
      </p>
    </section>
  );
}

function ContactSection() {
  return (
    <section aria-labelledby="contact-heading" className="flex flex-col gap-4">
      <p className="eyebrow">Get in touch</p>
      <h2 id="contact-heading" className="display-heading">
        Say hi.
      </h2>
      <p className="text-base text-neutral-700 dark:text-neutral-300">
        <a href="mailto:jimbo.c.tierney@gmail.com" className="underline underline-offset-4">
          jimbo.c.tierney@gmail.com
        </a>
      </p>
    </section>
  );
}
