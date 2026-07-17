import { afterEach, describe, expect, it, vi } from "vitest";

// Validates that importing/using the Contentful helpers without env doesn't
// throw — the lazy-init contract that lets `next build` and CI (Dependabot /
// fork PRs, which get no secrets) succeed against a content-less site.
describe("Contentful graceful degradation without env", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("returns null client and empty results when env vars are absent", async () => {
    vi.stubEnv("CONTENTFUL_SPACE_ID", "");
    vi.stubEnv("CONTENTFUL_DELIVERY_TOKEN", "");
    vi.resetModules();

    const { getClient, getAllProjects, getAllBlogPosts, getProjectBySlug, getSiteSettings } =
      await import("@/lib/contentful");

    expect(getClient()).toBeNull();
    expect((await getAllProjects()).items).toEqual([]);
    expect((await getAllBlogPosts()).items).toEqual([]);
    expect(await getProjectBySlug("anything")).toBeNull();
    expect(await getSiteSettings()).toBeNull();
  });
});
