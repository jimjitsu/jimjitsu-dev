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

    const res = await request.get(ogImage!);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
  });
});
