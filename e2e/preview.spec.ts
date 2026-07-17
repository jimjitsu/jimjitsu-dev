import { expect, test } from "@playwright/test";

test.describe("Draft preview route", () => {
  test("rejects a request without a valid preview secret", async ({ request }) => {
    const res = await request.get("/api/draft?secret=definitely-not-the-secret&slug=/blog", {
      maxRedirects: 0,
    });
    expect(res.status()).toBe(401);
  });
});
