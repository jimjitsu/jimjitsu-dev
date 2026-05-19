import { NextRequest, NextResponse } from "next/server";
import { getCareerContext } from "@/lib/chat-context";
import { buildSystemPrompt } from "@/lib/chat-prompts";

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

export async function POST(
  req: NextRequest,
): Promise<NextResponse<ChatResponse | ChatError>> {
  // Rate limit
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      {
        error:
          "This aggression will not stand, man. Twenty requests per minute — that's the rule.",
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

  // Sanitize: strip HTML tags, hard-truncate
  const sanitizedMessage = message.replace(/<[^>]*>/g, "").trim().slice(0, 500);

  // Cap history at 10 turns (drop oldest)
  const rawHistory = Array.isArray(history) ? history : [];
  const cappedHistory = (rawHistory as ChatTurn[]).slice(-10).filter(
    (t) =>
      t &&
      typeof t === "object" &&
      (t.role === "user" || t.role === "assistant") &&
      typeof t.content === "string",
  );

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
        "HTTP-Referer": "https://jimjitsu.dev",
        "X-Title": "jimjitsu-digital-twin",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.8,
        max_tokens: 600,
        response_format: { type: "json_object" },
      }),
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
    console.error("Chat route error:", err);
    return NextResponse.json({ error: LLM_ERROR, code: "llm_error" }, { status: 500 });
  }
}
