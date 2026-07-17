import { expect, test } from "@playwright/test";

const ROUTES = ["/", "/about", "/blog", "/projects"];

test.describe("Runtime health", () => {
  for (const route of ROUTES) {
    test(`${route} loads with no uncaught or hydration errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(`pageerror: ${e}`));
      page.on("console", (m) => {
        if (m.type() === "error" && /hydrat/i.test(m.text())) {
          errors.push(`console: ${m.text()}`);
        }
      });

      await page.goto(route, { waitUntil: "networkidle" });
      expect(errors, errors.join("\n")).toEqual([]);
    });
  }

  // Regression guard for the Phase 1 hydration bug: browser extensions (Grammarly,
  // password managers) mutate <body> before React hydrates. suppressHydrationWarning
  // on <body> must keep that mismatch from aborting hydration and killing
  // interactivity (which previously stopped the chat panel from opening).
  test("tolerates extension-injected <body> attributes without breaking interactivity", async ({
    page,
  }) => {
    const hydrationErrors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error" && /hydrat/i.test(m.text())) hydrationErrors.push(m.text());
    });

    // Runs before the app bundle; DOMContentLoaded fires before hydration.
    await page.addInitScript(() => {
      document.addEventListener("DOMContentLoaded", () => {
        document.body.setAttribute("data-gr-ext-installed", "");
        document.body.setAttribute("data-new-gr-c-s-check-loaded", "14.1");
      });
    });

    await page.goto("/");

    // Interactivity intact: the chat trigger still opens the panel.
    await page.getByRole("button", { name: "Open chat with Jimbo-t" }).click();
    await expect(page.getByRole("dialog", { name: "Chat with Jimbo-t" })).toBeVisible();
    expect(hydrationErrors, hydrationErrors.join("\n")).toEqual([]);
  });
});
