import { beforeEach, describe, expect, it, vi } from "vitest";

// unstable_cache just wraps the fetcher; make it a pass-through so we exercise
// the real assembly/fallback logic without the cache layer.
vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));

const getAllProjects = vi.fn();
const getAllBlogPosts = vi.fn();
const getPrimaryAuthor = vi.fn();
const getSiteSettings = vi.fn();

vi.mock("@/lib/contentful", () => ({
  getAllProjects: () => getAllProjects(),
  getAllBlogPosts: () => getAllBlogPosts(),
  getPrimaryAuthor: () => getPrimaryAuthor(),
  getSiteSettings: () => getSiteSettings(),
}));

const { getCareerContext } = await import("@/lib/chat-context");

describe("getCareerContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("assembles context from Contentful data on success", async () => {
    getAllProjects.mockResolvedValue({
      items: [
        {
          fields: {
            title: "Visit Utah",
            role: "Lead FE",
            technologies: ["Next.js", "React"],
            summary: "A travel site with parallax.",
            liveUrl: "https://visitutah.com",
          },
        },
      ],
    });
    getAllBlogPosts.mockResolvedValue({
      items: [{ fields: { title: "On design systems", excerpt: "Notes", tags: ["css"] } }],
    });
    getPrimaryAuthor.mockResolvedValue({ fields: { bio: "Custom author bio." } });
    getSiteSettings.mockResolvedValue({
      fields: { skills: [{ label: "Frontend core", items: ["React", "Next.js"] }] },
    });

    const ctx = await getCareerContext();

    expect(ctx).toContain("Custom author bio.");
    expect(ctx).toContain("### Projects");
    expect(ctx).toContain("Visit Utah");
    expect(ctx).toContain("Next.js, React");
    expect(ctx).toContain("On design systems");
    // Skills come from the CMS siteSettings, not the hardcoded fallback.
    expect(ctx).toContain("Frontend core: React, Next.js");
  });

  it("uses the hardcoded skills fallback when the CMS has none", async () => {
    getAllProjects.mockResolvedValue({ items: [] });
    getAllBlogPosts.mockResolvedValue({ items: [] });
    getPrimaryAuthor.mockResolvedValue(null);
    getSiteSettings.mockResolvedValue({ fields: {} }); // no skills field

    const ctx = await getCareerContext();

    expect(ctx).toContain("Languages: HTML, CSS, JavaScript, TypeScript");
  });

  it("falls back to the static context when Contentful throws", async () => {
    getAllProjects.mockRejectedValue(new Error("Contentful unavailable"));
    getAllBlogPosts.mockResolvedValue({ items: [] });
    getPrimaryAuthor.mockResolvedValue(null);
    getSiteSettings.mockResolvedValue(null);

    const ctx = await getCareerContext();

    expect(ctx).toContain("Jim Tierney is a frontend engineer based in Milwaukee");
    // Fallback carries bio + skills only, not the CMS-derived project section.
    expect(ctx).not.toContain("### Projects");
  });
});
