import { expect, test } from "@playwright/test";

const MOCK_JIMBOT_ONLY = {
  jimbot: {
    text: "Yeah, React is kind of my thing, man.",
    triggered_stranger: false,
    trigger_type: null,
  },
};

const MOCK_WITH_STRANGER = {
  jimbot: {
    text: "Look, I don't give a shit what stack you're used to — I pick the right tool.",
    triggered_stranger: true,
    trigger_type: "profanity",
  },
  stranger: {
    text: "Sir, I have to ask you to watch the language. Though I'll say, he does seem to know his tooling.",
  },
};

test.describe("Chat widget", () => {
  test("trigger button is visible on homepage", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("button", { name: "Open chat with Jimbo-t" }),
    ).toBeVisible();
  });

  test("opens panel with welcome message and suggestion chips", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open chat with Jimbo-t" }).click();

    const dialog = page.getByRole("dialog", { name: "Chat with Jimbo-t" });
    await expect(dialog).toBeVisible();

    // Welcome message is present
    await expect(dialog).toContainText("Jimbo-t");
    await expect(dialog).toContainText("Ask about Jim");

    // Suggestion chips
    await expect(
      page.getByRole("button", { name: "What are your strongest skills?" }),
    ).toBeVisible();
  });

  test("closes panel via close button", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open chat with Jimbo-t" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.getByRole("button", { name: "Close chat" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("closes panel via Escape key", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open chat with Jimbo-t" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("sends a message and displays mocked Jimbo-t response", async ({ page }) => {
    await page.route("/api/chat", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify(MOCK_JIMBOT_ONLY),
      });
    });

    await page.goto("/");
    await page.getByRole("button", { name: "Open chat with Jimbo-t" }).click();

    await page.getByPlaceholder("Ask about Jim's career...").fill("Tell me about React");
    await page.getByRole("button", { name: "Send" }).click();

    // User message echoed in the conversation
    await expect(page.getByText("Tell me about React")).toBeVisible();

    // Jimbo-t response appears
    await expect(page.getByText("Yeah, React is kind of my thing, man.")).toBeVisible();

    // Suggestion chips disappear after user message
    await expect(
      page.getByRole("button", { name: "What are your strongest skills?" }),
    ).not.toBeVisible();
  });

  test("shows Stranger bubble after 800ms delay when triggered", async ({ page }) => {
    await page.route("/api/chat", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify(MOCK_WITH_STRANGER),
      });
    });

    await page.goto("/");
    await page.getByRole("button", { name: "Open chat with Jimbo-t" }).click();

    await page.getByPlaceholder("Ask about Jim's career...").fill("Tell me about your stack");
    await page.getByRole("button", { name: "Send" }).click();

    // Jimbo-t response
    await expect(
      page.getByText("Look, I don't give a shit what stack you're used to — I pick the right tool."),
    ).toBeVisible();

    // Stranger response appears (wait up to 3s to account for the 800ms delay + transition)
    await expect(
      page.getByText(
        "Sir, I have to ask you to watch the language. Though I'll say, he does seem to know his tooling.",
      ),
    ).toBeVisible({ timeout: 3000 });

    await expect(page.getByText("The Stranger")).toBeVisible();
  });

  test("suggestion chip submits message on click", async ({ page }) => {
    await page.route("/api/chat", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify(MOCK_JIMBOT_ONLY),
      });
    });

    await page.goto("/");
    await page.getByRole("button", { name: "Open chat with Jimbo-t" }).click();

    await page.getByRole("button", { name: "What are your strongest skills?" }).click();

    // The suggestion text becomes a user message in the conversation
    await expect(page.getByText("What are your strongest skills?").last()).toBeVisible();
  });
});
