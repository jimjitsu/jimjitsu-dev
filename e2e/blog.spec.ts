import { expect, test } from "@playwright/test";

test.describe("Blog", () => {
  test("index page loads with h1 heading", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("detail page loads without error when a post link exists", async ({ page }) => {
    await page.goto("/blog");

    const postLink = page.locator('a[href^="/blog/"]').first();
    // Surface an empty CMS as a visible skip instead of a silent green pass.
    test.skip((await postLink.count()) === 0, "No blog posts in Contentful — nothing to follow");

    const href = await postLink.getAttribute("href");
    if (!href) return;

    await page.goto(href);
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByText(/page not found/i)).not.toBeVisible();
    // Post detail has an h1
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
