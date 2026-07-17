import type { Metadata } from "next";
import Link from "next/link";
import {
  getAllBlogPosts,
  getFeaturedProjects,
  getPrimaryAuthor,
  getSiteSettings,
  type SkillGroup,
} from "@/lib/contentful";
import { CONTACT_EMAIL, SITE_URL } from "@/lib/constants";
import { JsonLd } from "@/components/json-ld";
import { ProjectCard } from "@/components/project-card";
import { BlogPostCard } from "@/components/blog-post-card";
import { SectionHeader } from "@/components/section-header";
import { SkillGroup as SkillGroupComponent } from "@/components/skill-group";
import {
  BowlingBallIcon,
  BowlingPinIcon,
  LaneArrowIcon,
  StarburstIcon,
  StrikeIcon,
} from "@/components/icons";

export const revalidate = 60;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const FALLBACK_HERO_TITLE = "Frontend developer";

const FALLBACK_HERO_BIO =
  "I specialize in frontend development with an eye for detail and an understanding of creative concerns, design systems, responsive designed sites, and developing with a focus on web performance and accessibility. Progressive enhancement, incremental improvements, and mobile-first development are my jam, I enjoy hard problems, and love elegant solutions.";

const FALLBACK_SKILLS: SkillGroup[] = [
  { label: "Languages", items: ["HTML", "CSS", "JavaScript", "TypeScript"] },
  { label: "Frameworks", items: ["React", "Next.js", "Vue", "Svelte", "jQuery"] },
  { label: "Styling", items: ["Tailwind CSS", "Bootstrap", "Foundation"] },
  { label: "Tooling", items: ["Webpack", "Node.js", "npm", "Grunt", "Gulp", "GSAP", "Git"] },
  { label: "CMS", items: ["Contentful", "Kentico", "Sitecore", "Wordpress"] },
  { label: "AI", items: ["Claude Code", "Cursor", "GitHub Copilot"] },
];

const FALLBACK_ATTRIBUTES: string[] = [
  "Design systems development and governance",
  "Web performance optimization",
  "Accessibility (WCAG 2.1 AA)",
  "Agile / user story refinement",
  "Cross-functional collaboration with UX and design",
  "Freelance developer hiring and management",
];

/**
 * Home page.
 * Each section is full-bleed so it can carry its own background color.
 * Inner content centers via mx-auto + max-w-* (spec §6.2).
 */
export default async function HomePage() {
  const [{ items: featuredProjects }, { items: recentPosts }, author, settings] = await Promise.all(
    [
      getFeaturedProjects(),
      getAllBlogPosts().then((res) => ({ items: res.items.slice(0, 3) })),
      getPrimaryAuthor(),
      getSiteSettings(),
    ],
  );

  // Use the first paragraph of the author bio as the home snapshot blurb.
  const bioSnippet = author?.fields.bio?.split(/\n\n/)[0] ?? null;

  const socialLinks = author?.fields.socialLinks
    ? Object.values(author.fields.socialLinks as Record<string, string>)
    : [];

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Jim Tierney — Frontend Engineer",
    url: SITE_URL,
  };

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
    <main>
      <JsonLd schema={websiteSchema} />
      <JsonLd schema={personSchema} />
      <Section bg="base">
        <HeroSection
          title={settings?.fields.heroTitle ?? FALLBACK_HERO_TITLE}
          bio={settings?.fields.heroBio ?? FALLBACK_HERO_BIO}
        />
      </Section>

      <Section bg="surface">
        <AboutSnapshotSection bio={bioSnippet} />
      </Section>

      <Section bg="base">
        <FeaturedProjectsSection projects={featuredProjects} />
      </Section>

      <Section bg="base">
        <RecentWritingSection posts={recentPosts} />
      </Section>

      <Section bg="surface">
        <SkillsSection
          skills={settings?.fields.skills ?? FALLBACK_SKILLS}
          attributes={settings?.fields.attributes ?? FALLBACK_ATTRIBUTES}
        />
      </Section>

      <Section bg="base">
        <ContactSection />
      </Section>
    </main>
  );
}

/**
 * Full-bleed section wrapper. Lets each home-page section carry its own
 * background while keeping content boxed by an inner max-width container.
 */
function Section({ children, bg }: { children: React.ReactNode; bg: "base" | "surface" }) {
  const bgClass = bg === "surface" ? "bg-surface" : "bg-base";
  return (
    <div className={`${bgClass} border-b-2 border-ink/10 last:border-b-0`}>
      <div className="mx-auto max-w-4xl px-6 py-20 sm:px-10 sm:py-24">{children}</div>
    </div>
  );
}

function HeroSection({ title, bio }: { title: string; bio: string }) {
  return (
    <section aria-labelledby="hero-heading" className="relative flex flex-col gap-6">
      {/* Decorative starburst floats behind the heading at low opacity. */}
      <StarburstIcon
        aria-hidden="true"
        size={320}
        className="pointer-events-none absolute -right-10 -top-10 text-amber/20"
      />
      <p className="eyebrow flex items-center gap-2">
        <BowlingPinIcon size={16} className="text-red" />
        Jim Tierney
      </p>
      <h1 id="hero-heading" className="display-heading">
        {title}
      </h1>
      <p className="max-w-2xl text-base leading-relaxed text-ink-muted">{bio}</p>
      <div className="flex flex-wrap gap-4">
        <Link href="/projects" className="btn-primary">
          See projects
          <LaneArrowIcon size={14} className="rotate-90" />
        </Link>
        <Link href="/blog" className="btn-secondary">
          Read the blog
        </Link>
      </div>
    </section>
  );
}

function AboutSnapshotSection({ bio }: { bio: string | null }) {
  return (
    <section aria-labelledby="about-heading" className="flex flex-col gap-4">
      <p className="eyebrow flex items-center gap-2">
        <BowlingBallIcon size={16} className="text-teal" />
        About
      </p>
      <h2 id="about-heading" className="display-heading">
        A bit about me.
      </h2>
      <p className="max-w-2xl text-base leading-relaxed text-ink-muted">
        {bio ??
          "Frontend engineer based in Milwaukee, WI. Over a decade building fast, accessible, component-driven UIs and the design systems that power them."}
      </p>
      <div className="flex flex-wrap gap-4 text-sm">
        <Link
          href="/about"
          className="text-ink decoration-amber decoration-2 underline-offset-4 hover:underline"
        >
          More about me
        </Link>
        <a
          href="/resume.pdf"
          className="text-ink decoration-amber decoration-2 underline-offset-4 hover:underline"
        >
          Download resume
        </a>
      </div>
    </section>
  );
}

function FeaturedProjectsSection({
  projects,
}: {
  projects: Awaited<ReturnType<typeof getFeaturedProjects>>["items"];
}) {
  return (
    <section aria-labelledby="projects-heading" className="flex flex-col gap-6">
      <SectionHeader
        id="projects-heading"
        eyebrow="Selected work"
        icon={<StrikeIcon size={16} className="text-red" />}
        title="Featured projects."
        seeAllHref="/projects"
        seeAllLabel="All projects"
      />
      {projects.length === 0 ? (
        <p className="text-sm text-ink-muted">
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
      <SectionHeader
        id="writing-heading"
        eyebrow="From the blog"
        icon={<BowlingPinIcon size={16} className="text-amber" />}
        title="Recent writing."
        seeAllHref="/blog"
        seeAllLabel="All posts"
      />
      {posts.length === 0 ? (
        <p className="text-sm text-ink-muted">
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

function SkillsSection({ skills, attributes }: { skills: SkillGroup[]; attributes: string[] }) {
  return (
    <section aria-labelledby="skills-heading" className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <p className="eyebrow flex items-center gap-2">
          <StarburstIcon size={16} className="text-teal" />
          Toolkit
        </p>
        <h2 id="skills-heading" className="display-heading">
          Skills &amp; tech.
        </h2>
      </div>

      <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map(({ label, items }) => (
          <SkillGroupComponent key={label} label={label} items={items} />
        ))}
      </dl>

      <ul className="grid gap-2 text-sm text-ink-muted sm:grid-cols-2">
        {attributes.map((attr) => (
          <li key={attr}>{attr}</li>
        ))}
      </ul>
    </section>
  );
}

function ContactSection() {
  return (
    <section aria-labelledby="contact-heading" className="flex flex-col gap-4">
      <p className="eyebrow flex items-center gap-2">
        <BowlingBallIcon size={16} className="text-red" />
        Get in touch
      </p>
      <h2 id="contact-heading" className="display-heading">
        Say hi.
      </h2>
      <p className="text-base text-ink-muted">
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-ink decoration-amber decoration-2 underline-offset-4 hover:underline"
        >
          {CONTACT_EMAIL}
        </a>
      </p>
    </section>
  );
}
