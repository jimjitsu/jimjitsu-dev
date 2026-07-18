import { expect, test } from "@playwright/test";

test.describe("Dynamic OG images", () => {
  test("a blog post exposes a generated og:image that renders as PNG", async ({
    page,
    request,
  }) => {
    await page.goto("/blog");
    const link = page.locator('a[href^="/blog/"]').first();
    test.skip((await link.count()) === 0, "No blog posts in Contentful — nothing to follow");

    const href = await link.getAttribute("href");
    await page.goto(href!);

    const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");
    expect(ogImage).toContain("/opengraph-image");

    // The meta URL is absolute against metadataBase (the production domain in a
    // prod build). Fetch just the path so it resolves against the server under
    // test, not the live site.
    const { pathname, search } = new URL(ogImage!);
    const res = await request.get(pathname + search);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
  });
});
