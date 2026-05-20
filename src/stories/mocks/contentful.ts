import type { Asset, Entry } from "contentful";
import type { BlogPostSkeleton, ProjectSkeleton } from "@/lib/contentful";

// ── Asset ────────────────────────────────────────────────────────────────────

export function mockAsset(overrides?: Partial<Asset["fields"]>): Asset<undefined> {
  return {
    sys: {
      id: "mock-asset",
      type: "Asset",
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
      locale: "en-US",
      space: { sys: { type: "Link", linkType: "Space", id: "mock-space" } },
      environment: { sys: { type: "Link", linkType: "Environment", id: "master" } },
      revision: 1,
    },
    metadata: { tags: [], concepts: [] },
    fields: {
      title: "Mock image",
      description: "A mock Contentful asset",
      file: {
        url: "//images.ctfassets.net/mock/mock-image.jpg",
        fileName: "mock-image.jpg",
        contentType: "image/jpeg",
        details: { size: 12345, image: { width: 1200, height: 800 } },
      },
      ...overrides,
    },
  } as unknown as Asset<undefined>;
}

// ── BlogPost ─────────────────────────────────────────────────────────────────

export function mockBlogPost(
  overrides?: Partial<Entry<BlogPostSkeleton, undefined, string>["fields"]>,
): Entry<BlogPostSkeleton, undefined, string> {
  return {
    sys: {
      id: "mock-post",
      type: "Entry",
      createdAt: "2025-01-15T00:00:00Z",
      updatedAt: "2025-01-15T00:00:00Z",
      locale: "en-US",
      contentType: { sys: { type: "Link", linkType: "ContentType", id: "blogPost" } },
      space: { sys: { type: "Link", linkType: "Space", id: "mock-space" } },
      environment: { sys: { type: "Link", linkType: "Environment", id: "master" } },
      revision: 1,
    },
    metadata: { tags: [], concepts: [] },
    fields: {
      title: "Building a Design System from Scratch",
      slug: "building-design-system",
      excerpt:
        "How I built the Strike Lane design system using Tailwind CSS custom properties and brutalist aesthetics.",
      body: "# Full post body\n\nLorem ipsum dolor sit amet.",
      publishDate: "2025-01-15",
      tags: ["design-systems", "tailwind", "css"],
      ...overrides,
    },
  } as unknown as Entry<BlogPostSkeleton, undefined, string>;
}

// ── Project ──────────────────────────────────────────────────────────────────

export function mockProject(
  overrides?: Partial<Entry<ProjectSkeleton, undefined, string>["fields"]>,
): Entry<ProjectSkeleton, undefined, string> {
  return {
    sys: {
      id: "mock-project",
      type: "Entry",
      createdAt: "2025-01-10T00:00:00Z",
      updatedAt: "2025-01-10T00:00:00Z",
      locale: "en-US",
      contentType: { sys: { type: "Link", linkType: "ContentType", id: "project" } },
      space: { sys: { type: "Link", linkType: "Space", id: "mock-space" } },
      environment: { sys: { type: "Link", linkType: "Environment", id: "master" } },
      revision: 1,
    },
    metadata: { tags: [], concepts: [] },
    fields: {
      title: "jimjitsu.dev — Portfolio Site",
      slug: "jimjitsu-dev",
      summary: "Personal portfolio and blog built with Next.js, Tailwind CSS, and Contentful.",
      coverImage: mockAsset() as unknown as Entry<
        ProjectSkeleton,
        undefined,
        string
      >["fields"]["coverImage"],
      technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Contentful"],
      role: "Design + Engineering",
      liveUrl: "https://jimjitsu.dev",
      repoUrl: "https://github.com/jimtierney/jimjitsu-dev",
      featured: true,
      publishDate: "2025-01-10",
      order: 1,
      ...overrides,
    },
  } as unknown as Entry<ProjectSkeleton, undefined, string>;
}
