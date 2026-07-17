import { NextRequest, NextResponse } from "next/server";
import { getCareerContext } from "@/lib/chat-context";
import { buildSystemPrompt } from "@/lib/chat-prompts";
import { SITE_URL } from "@/lib/constants";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

interface JimbotResponse {
  text: string;
  triggered_stranger: boolean;
  trigger_type: "profanity" | "stranger_echo" | null;
}

interface StrangerResponse {
  text: string;
}

interface ChatResponse {
  jimbot: JimbotResponse;
  stranger?: StrangerResponse;
}

interface ChatError {
  error: string;
  code: "validation_error" | "llm_error" | "rate_limited";
}

interface OpenRouterChoice {
  message: { content: string | null };
}

interface OpenRouterResponse {
  choices: OpenRouterChoice[];
}

/* -------------------------------------------------------------------------- */
/* Rate limiter — in-memory, best-effort for serverless                        */
/* -------------------------------------------------------------------------- */

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = 20;
  const windowMs = 60_000;

  // Evict expired entries once the map grows, so it doesn't accumulate
  // one entry per unique IP for the lifetime of the instance.
  if (rateLimitMap.size > 500) {
    for (const [key, value] of rateLimitMap) {
      if (value.resetAt <= now) rateLimitMap.delete(key);
    }
  }

  const entry = rateLimitMap.get(ip);
  if (!entry || entry.resetAt <= now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

/* -------------------------------------------------------------------------- */
/* Route handler                                                               */
/* -------------------------------------------------------------------------- */

const LLM_ERROR =
  "Look, something went wrong. Life does not stop and start at your convenience — just try again, man.";

// Bound the upstream call so a hung OpenRouter request can't pin the function
// (and the widget's spinner) until the platform kills it.
const UPSTREAM_TIMEOUT_MS = 15_000;
export const maxDuration = 30;

// History caps: 20 turns = 10 user/assistant exchanges (matches the client's
// window). Per-turn content is truncated, not rejected — assistant turns
// legitimately run long, and an oversized turn shouldn't fail the request.
// Without this cap, attacker-controlled history is an unbounded token-spend
// vector (the 500-char limit only covers `message`).
const MAX_HISTORY_TURNS = 20;
const MAX_TURN_CHARS = 2_000;

export async function POST(req: NextRequest): Promise<NextResponse<ChatResponse | ChatError>> {
  // Rate limit
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      {
        error: "This aggression will not stand, man. Twenty requests per minute — that's the rule.",
        code: "rate_limited",
      },
      { status: 429 },
    );
  }

  // Parse body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "That's not a request, man. Send valid JSON.", code: "validation_error" },
      { status: 400 },
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Missing request body.", code: "validation_error" },
      { status: 400 },
    );
  }

  const { message, history } = body as { message?: unknown; history?: unknown };

  if (typeof message !== "string" || message.trim().length === 0) {
    return NextResponse.json(
      {
        error: "Missing or empty message. Give me something to work with, man.",
        code: "validation_error",
      },
      { status: 400 },
    );
  }

  if (message.length > 500) {
    return NextResponse.json(
      {
        error: "Message too long — 500 characters max. That's just, like, the rules.",
        code: "validation_error",
      },
      { status: 400 },
    );
  }

  // The message renders as plain text client-side and goes to the LLM as data,
  // so no HTML stripping — it would only mangle legit questions about markup.
  const sanitizedMessage = message.trim().slice(0, 500);

  // Validate shape first, then cap turn count (drop oldest) and turn length.
  const rawHistory = Array.isArray(history) ? history : [];
  const cappedHistory = (rawHistory as ChatTurn[])
    .filter(
      (t) =>
        t &&
        typeof t === "object" &&
        (t.role === "user" || t.role === "assistant") &&
        typeof t.content === "string",
    )
    .slice(-MAX_HISTORY_TURNS)
    .map((t) => ({ role: t.role, content: t.content.slice(0, MAX_TURN_CHARS) }));

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error("OPENROUTER_API_KEY is not set");
    return NextResponse.json({ error: LLM_ERROR, code: "llm_error" }, { status: 500 });
  }

  const model = process.env.OPENROUTER_MODEL ?? "google/gemini-2.5-flash";

  // Build messages
  const careerContext = await getCareerContext();
  const systemPrompt = buildSystemPrompt(careerContext);

  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...cappedHistory,
    { role: "user" as const, content: sanitizedMessage },
  ];

  // Call OpenRouter
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": SITE_URL,
        "X-Title": "jimjitsu-digital-twin",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.8,
        max_tokens: 600,
        response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });

    if (!response.ok) {
      console.error("OpenRouter error:", response.status, await response.text());
      return NextResponse.json({ error: LLM_ERROR, code: "llm_error" }, { status: 502 });
    }

    const completion = (await response.json()) as OpenRouterResponse;
    const raw = completion.choices[0]?.message?.content ?? "";

    // Strip markdown code fences Gemini occasionally adds
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsed: ChatResponse;
    try {
      parsed = JSON.parse(cleaned) as ChatResponse;
    } catch {
      console.error("Failed to parse LLM response:", cleaned);
      return NextResponse.json({ error: LLM_ERROR, code: "llm_error" }, { status: 502 });
    }

    if (!parsed.jimbot?.text) {
      console.error("LLM response missing jimbot.text:", parsed);
      return NextResponse.json({ error: LLM_ERROR, code: "llm_error" }, { status: 502 });
    }

    // Only include stranger when triggered
    const result: ChatResponse = {
      jimbot: parsed.jimbot,
      ...(parsed.jimbot.triggered_stranger && parsed.stranger?.text
        ? { stranger: parsed.stranger }
        : {}),
    };

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof DOMException && err.name === "TimeoutError") {
      console.error("OpenRouter request timed out after", UPSTREAM_TIMEOUT_MS, "ms");
      return NextResponse.json({ error: LLM_ERROR, code: "llm_error" }, { status: 504 });
    }
    console.error("Chat route error:", err);
    return NextResponse.json({ error: LLM_ERROR, code: "llm_error" }, { status: 500 });
  }
}
