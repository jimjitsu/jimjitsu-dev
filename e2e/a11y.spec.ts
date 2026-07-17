import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const ROUTES = ["/", "/about", "/blog", "/projects"];

test.describe("Accessibility", () => {
  for (const route of ROUTES) {
    test(`${route} has no serious or critical axe violations`, async ({ page }) => {
      await page.goto(route, { waitUntil: "networkidle" });

      const { violations } = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();

      const seriousOrCritical = violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical",
      );

      const summary = seriousOrCritical
        .map((v) => `${v.id} [${v.impact}] × ${v.nodes.length}`)
        .join("\n");

      expect(seriousOrCritical, summary).toEqual([]);
    });
  }
});
