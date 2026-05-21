import { expect, test } from "@playwright/test";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders the h1 hero heading", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("has primary navigation with expected links", async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav).toBeVisible();
    // Test by href (code-defined routes) rather than label (CMS content that can vary)
    await expect(nav.locator('a[href="/projects"]')).toBeVisible();
    await expect(nav.locator('a[href="/blog"]')).toBeVisible();
    await expect(nav.locator('a[href="/about"]')).toBeVisible();
  });

  test('has "See projects" CTA link', async ({ page }) => {
    await expect(page.getByRole("link", { name: /See projects/i })).toBeVisible();
  });

  test("has chat trigger button", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: "Open chat with Jimbo-t" }),
    ).toBeVisible();
  });

  test("has no broken page error", async ({ page }) => {
    await expect(page.getByText(/something went wrong/i)).not.toBeVisible();
    await expect(page.getByText(/page not found/i)).not.toBeVisible();
  });
});
