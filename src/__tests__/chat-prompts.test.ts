import { describe, expect, it } from "vitest";
import { buildSystemPrompt } from "@/lib/chat-prompts";

const TEST_CONTEXT = `### Bio
Frontend engineer based in Milwaukee, WI.

### Skills
HTML, CSS, JavaScript, TypeScript

### Projects
**Visit Utah** — Lead Frontend Developer
Technologies: React, Kentico
A robust design system for content editors.

### Writing
Building this portfolio site — Decisions, tradeoffs, and gotchas.`;

describe("buildSystemPrompt", () => {
  it("returns a non-empty string", () => {
    const prompt = buildSystemPrompt(TEST_CONTEXT);
    expect(prompt).toBeTypeOf("string");
    expect(prompt.length).toBeGreaterThan(200);
  });

  it("puts JSON format instruction before the character brief", () => {
    const prompt = buildSystemPrompt(TEST_CONTEXT);
    const jsonIdx = prompt.indexOf("You are a JSON API");
    const characterIdx = prompt.indexOf("You are Jimbo-t");
    expect(jsonIdx).toBeGreaterThanOrEqual(0);
    expect(characterIdx).toBeGreaterThan(jsonIdx);
  });

  it("injects the career context", () => {
    const prompt = buildSystemPrompt(TEST_CONTEXT);
    expect(prompt).toContain("Frontend engineer based in Milwaukee, WI");
    expect(prompt).toContain("Visit Utah");
    expect(prompt).toContain("Building this portfolio site");
  });

  it("includes The Dude quotes", () => {
    const prompt = buildSystemPrompt(TEST_CONTEXT);
    expect(prompt).toContain("The Dude abides");
    expect(prompt).toContain("That rug really tied the room together");
  });

  it("includes Walter Sobchak quotes", () => {
    const prompt = buildSystemPrompt(TEST_CONTEXT);
    expect(prompt).toContain("MARK IT ZERO");
    expect(prompt).toContain("world of pain");
  });

  it("frames Jimbo-t as a third-person hype-man, not as Jim", () => {
    const prompt = buildSystemPrompt(TEST_CONTEXT);
    expect(prompt).toContain("You are NOT Jim");
    expect(prompt).toContain("THIRD PERSON");
  });

  it("activates supporting-cast quotes", () => {
    const prompt = buildSystemPrompt(TEST_CONTEXT);
    expect(prompt).toContain("Supporting Cast");
    expect(prompt).toContain("I am the walrus."); // Donny
    expect(prompt).toContain("Nobody fucks with the Jesus."); // Jesus
  });

  it("includes Stranger trigger rules with profanity list", () => {
    const prompt = buildSystemPrompt(TEST_CONTEXT);
    expect(prompt).toContain("triggered_stranger");
    expect(prompt).toContain("PROFANITY");
    expect(prompt).toContain("STRANGER_ECHO");
  });

  it("includes topic constraint rules", () => {
    const prompt = buildSystemPrompt(TEST_CONTEXT);
    expect(prompt).toContain("Topic Rules");
    expect(prompt).toContain("off-topic");
  });

  it("includes the response JSON schema", () => {
    const prompt = buildSystemPrompt(TEST_CONTEXT);
    expect(prompt).toContain('"jimbot"');
    expect(prompt).toContain('"triggered_stranger"');
    expect(prompt).toContain('"stranger"');
  });
});
