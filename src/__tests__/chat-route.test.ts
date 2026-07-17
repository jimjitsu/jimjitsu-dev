import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

// Hoist mocks before any imports from the modules under test.
vi.mock("@/lib/chat-context", () => ({
  getCareerContext: vi.fn().mockResolvedValue("### Bio\nTest bio content."),
}));

vi.mock("@/lib/chat-prompts", () => ({
  buildSystemPrompt: vi.fn().mockReturnValue("Test system prompt"),
}));

// Import handler after mocks are registered.
const { POST } = await import("@/app/api/chat/route");

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

function makeRequest(body: unknown, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

function mockFetch(responseBody: unknown, ok = true) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValueOnce({
      ok,
      status: ok ? 200 : 500,
      text: vi.fn().mockResolvedValue("error"),
      json: vi.fn().mockResolvedValue(responseBody),
    }),
  );
}

/* -------------------------------------------------------------------------- */
/* Tests                                                                       */
/* -------------------------------------------------------------------------- */

describe("POST /api/chat — input validation", () => {
  it("returns 400 when message field is absent", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code: string };
    expect(body.code).toBe("validation_error");
  });

  it("returns 400 when message is an empty string", async () => {
    const res = await POST(makeRequest({ message: "  " }));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code: string };
    expect(body.code).toBe("validation_error");
  });

  it("returns 400 when message exceeds 500 characters", async () => {
    const res = await POST(makeRequest({ message: "a".repeat(501) }));
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code: string };
    expect(body.code).toBe("validation_error");
  });

  it("returns 400 for invalid JSON body", async () => {
    const req = new NextRequest("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json{",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

describe("POST /api/chat — API key check", () => {
  let savedKey: string | undefined;

  beforeEach(() => {
    savedKey = process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_API_KEY;
  });

  afterEach(() => {
    if (savedKey !== undefined) process.env.OPENROUTER_API_KEY = savedKey;
    vi.unstubAllGlobals();
  });

  it("returns 500 when OPENROUTER_API_KEY is absent", async () => {
    const res = await POST(makeRequest({ message: "Hello" }));
    expect(res.status).toBe(500);
    const body = (await res.json()) as { code: string };
    expect(body.code).toBe("llm_error");
  });
});

describe("POST /api/chat — successful responses", () => {
  beforeEach(() => {
    process.env.OPENROUTER_API_KEY = "test-key-vitest";
  });

  afterEach(() => {
    delete process.env.OPENROUTER_API_KEY;
    vi.unstubAllGlobals();
  });

  it("returns 200 with jimbot response when not triggered", async () => {
    mockFetch({
      choices: [
        {
          message: {
            content: JSON.stringify({
              jimbot: {
                text: "Yeah, React is kind of my thing, man.",
                triggered_stranger: false,
                trigger_type: null,
              },
            }),
          },
        },
      ],
    });

    const res = await POST(makeRequest({ message: "Tell me about React" }));
    expect(res.status).toBe(200);

    const body = (await res.json()) as {
      jimbot: { text: string; triggered_stranger: boolean };
      stranger?: unknown;
    };
    expect(body.jimbot.text).toBe("Yeah, React is kind of my thing, man.");
    expect(body.jimbot.triggered_stranger).toBe(false);
    expect(body.stranger).toBeUndefined();
  });

  it("includes stranger when triggered_stranger is true", async () => {
    mockFetch({
      choices: [
        {
          message: {
            content: JSON.stringify({
              jimbot: {
                text: "Look, I don't give a shit what stack you're used to.",
                triggered_stranger: true,
                trigger_type: "profanity",
              },
              stranger: {
                text: "Sir, I have to ask you to watch the language.",
              },
            }),
          },
        },
      ],
    });

    const res = await POST(makeRequest({ message: "What stack do you use?" }));
    expect(res.status).toBe(200);

    const body = (await res.json()) as {
      jimbot: { triggered_stranger: boolean };
      stranger?: { text: string };
    };
    expect(body.jimbot.triggered_stranger).toBe(true);
    expect(body.stranger?.text).toBe("Sir, I have to ask you to watch the language.");
  });

  it("strips markdown code fences from LLM response", async () => {
    const rawWithFences =
      "```json\n" +
      JSON.stringify({
        jimbot: {
          text: "New shit has come to light.",
          triggered_stranger: false,
          trigger_type: null,
        },
      }) +
      "\n```";

    mockFetch({
      choices: [{ message: { content: rawWithFences } }],
    });

    const res = await POST(makeRequest({ message: "Any updates?" }));
    expect(res.status).toBe(200);

    const body = (await res.json()) as { jimbot: { text: string } };
    expect(body.jimbot.text).toBe("New shit has come to light.");
  });

  it("returns 502 when OpenRouter returns a non-ok status", async () => {
    mockFetch({}, false);

    const res = await POST(makeRequest({ message: "Hello" }));
    expect(res.status).toBe(502);
    const body = (await res.json()) as { code: string };
    expect(body.code).toBe("llm_error");
  });

  it("caps history at 10 turns and still returns 200", async () => {
    mockFetch({
      choices: [
        {
          message: {
            content: JSON.stringify({
              jimbot: {
                text: "Calmer than you are.",
                triggered_stranger: false,
                trigger_type: null,
              },
            }),
          },
        },
      ],
    });

    // Send 15 history turns (exceeds the 10-turn cap)
    const history = Array.from({ length: 15 }, (_, i) => ({
      role: i % 2 === 0 ? "user" : "assistant",
      content: `Turn ${i}`,
    }));

    const res = await POST(makeRequest({ message: "Still there?", history }));
    expect(res.status).toBe(200);
  });
});
