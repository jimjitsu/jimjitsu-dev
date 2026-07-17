import { expect, test } from "@playwright/test";

test.describe("Projects", () => {
  test("index page loads with h1 heading", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("detail page loads without error when a project link exists", async ({ page }) => {
    await page.goto("/projects");

    const projectLink = page.locator('a[href^="/projects/"]').first();
    // Surface an empty CMS as a visible skip instead of a silent green pass.
    test.skip((await projectLink.count()) === 0, "No projects in Contentful — nothing to follow");

    const href = await projectLink.getAttribute("href");
    if (!href) return;

    await page.goto(href);
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByText(/page not found/i)).not.toBeVisible();
    // Project detail has an h1
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
