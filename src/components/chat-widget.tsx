"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BowlingPinIcon, ChatBubbleIcon } from "./icons";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

interface Message {
  id: string;
  role: "user" | "jimbot" | "stranger";
  text: string;
}

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

interface ApiResponse {
  jimbot?: { text: string; triggered_stranger: boolean };
  stranger?: { text: string };
  error?: string;
}

/* -------------------------------------------------------------------------- */
/* Constants                                                                   */
/* -------------------------------------------------------------------------- */

const WELCOME =
  "Name's Jimbo-t — Jim Tierney's digital twin, here to talk you through the man's career. Projects, skills, the whole... what-have-you. Ask me anything about Jim.";

const SUGGESTIONS = [
  "What are Jim's strongest skills?",
  "Walk me through a project Jim's proud of.",
  "What's Jim's approach to design systems?",
];

/* -------------------------------------------------------------------------- */
/* Sub-components                                                               */
/* -------------------------------------------------------------------------- */

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] border border-ink bg-surface px-3 py-2 font-mono text-sm text-ink">
        {text}
      </div>
    </div>
  );
}

function JimbotBubble({ text, showLabel = true }: { text: string; showLabel?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      {showLabel && <p className="eyebrow-sm text-ink-muted">Jimbo-t</p>}
      <div className="border-2 border-l-4 border-ink border-l-amber bg-base px-3 py-2 font-mono text-sm text-ink">
        {text}
      </div>
    </div>
  );
}

function StrangerBubble({ text }: { text: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className={`flex flex-col gap-1 transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}
    >
      <p className="eyebrow-sm text-teal">The Stranger</p>
      <div className="border-2 border-l-4 border-dashed border-ink border-l-teal bg-surface px-3 py-2 font-mono text-sm text-ink">
        {text}
      </div>
    </div>
  );
}

function LoadingBubble() {
  return (
    <div className="flex flex-col gap-1">
      <p className="sr-only">Jimbo-t is typing</p>
      <p className="eyebrow-sm text-ink-muted" aria-hidden="true">
        Jimbo-t
      </p>
      <div className="border-2 border-l-4 border-ink border-l-amber bg-base px-3 py-2">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-1.5 w-1.5 animate-pulse bg-ink-muted"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="inline-block h-1.5 w-1.5 animate-pulse bg-ink-muted"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="inline-block h-1.5 w-1.5 animate-pulse bg-ink-muted"
            style={{ animationDelay: "300ms" }}
          />
        </span>
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Main widget                                                                  */
/* -------------------------------------------------------------------------- */

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasUserMessage, setHasUserMessage] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  // history is kept in a ref to avoid stale closure issues in sendMessage
  const historyRef = useRef<ChatTurn[]>([]);
  // Pending Stranger reveal — tracked so a rapid next send can flush it in
  // order instead of letting it land after the user's next message.
  const strangerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingStrangerRef = useRef<string | null>(null);
  const wasOpenRef = useRef(false);

  // Auto-scroll on new messages or loading state change
  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus textarea when the panel opens and again when it re-enables after a
  // send (disabled={loading} ejects focus, stranding keyboard users).
  useEffect(() => {
    if (open && !loading) {
      textareaRef.current?.focus();
    }
  }, [open, loading]);

  // Return focus to the trigger button when the panel closes.
  useEffect(() => {
    if (wasOpenRef.current && !open) {
      triggerRef.current?.focus();
    }
    wasOpenRef.current = open;
  }, [open]);

  // Clear any pending Stranger reveal on unmount.
  useEffect(() => {
    return () => {
      if (strangerTimerRef.current) clearTimeout(strangerTimerRef.current);
    };
  }, []);

  // Body scroll lock while open (mobile UX)
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Focus trap + Escape key. Focusables are recomputed per keydown because the
  // panel's DOM changes while open (chips unmount, buttons toggle disabled) —
  // a list captured at open time goes stale and lets focus escape.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim().slice(0, 500);
      if (!trimmed || loading) return;

      // If a Stranger reveal is still pending from the last exchange, flush it
      // now so it lands before the new user message instead of after it.
      if (strangerTimerRef.current) {
        clearTimeout(strangerTimerRef.current);
        strangerTimerRef.current = null;
      }
      if (pendingStrangerRef.current) {
        const pendingText = pendingStrangerRef.current;
        pendingStrangerRef.current = null;
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "stranger", text: pendingText },
        ]);
      }

      setInput("");
      setHasUserMessage(true);

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        text: trimmed,
      };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);

      const history = [...historyRef.current];

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20_000);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, history }),
          signal: controller.signal,
        });

        const data = (await res.json()) as ApiResponse;

        if (!res.ok || !data.jimbot) {
          const errText =
            data.error ?? "Life does not stop and start at your convenience — try again, man.";
          setMessages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), role: "jimbot", text: errText },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), role: "jimbot", text: data.jimbot!.text },
          ]);

          // Update conversation history for next request
          const assistantContent = data.stranger?.text
            ? `[Jimbo-t]: ${data.jimbot.text}\n[The Stranger]: ${data.stranger.text}`
            : `[Jimbo-t]: ${data.jimbot.text}`;

          historyRef.current = [
            ...historyRef.current,
            { role: "user" as const, content: trimmed },
            { role: "assistant" as const, content: assistantContent },
          ].slice(-20); // keep last 10 exchanges (20 turns)

          // Delayed Stranger reveal — tracked in refs so the next send can
          // cancel the timer and flush the text in order.
          if (data.jimbot.triggered_stranger && data.stranger?.text) {
            const strangerText = data.stranger.text;
            pendingStrangerRef.current = strangerText;
            strangerTimerRef.current = setTimeout(() => {
              strangerTimerRef.current = null;
              pendingStrangerRef.current = null;
              setMessages((prev) => [
                ...prev,
                { id: crypto.randomUUID(), role: "stranger", text: strangerText },
              ]);
            }, 800);
          }
        }
      } catch (err) {
        const timedOut = err instanceof DOMException && err.name === "AbortError";
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "jimbot",
            text: timedOut
              ? "That one took too long, man. This is a very complicated case — lotta ins, lotta outs. Try again."
              : "Look, something went wrong. Life does not stop and start at your convenience — just try again, man.",
          },
        ]);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    },
    [loading],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize up to 3 lines (~72px)
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 72)}px`;
  };

  const charCount = input.length;

  return (
    <>
      {/* Trigger button — hidden when panel is open */}
      {!open && (
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open chat with Jimbo-t"
          className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center border-2 border-ink bg-teal text-[rgb(var(--color-base))] shadow-[3px_3px_0_0_rgb(var(--color-ink))] transition hover:-translate-y-0.5 lg:bottom-8 lg:right-8"
        >
          <ChatBubbleIcon size={20} />
        </button>
      )}

      {/* Backdrop — always rendered so the opacity transition works. Hidden
          from AT: Escape and the close button are the accessible affordances. */}
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-hidden="true"
        tabIndex={-1}
        className={`fixed inset-0 z-30 bg-ink/20 transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Chat panel */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Chat with Jimbo-t"
          aria-modal="true"
          className="fixed inset-x-0 bottom-0 z-40 flex max-h-[80dvh] flex-col border-t-2 border-ink bg-base lg:inset-x-auto lg:bottom-24 lg:right-8 lg:max-h-[520px] lg:w-[380px] lg:max-w-[calc(100vw-2rem)] lg:border-2 lg:shadow-[4px_4px_0_0_rgb(var(--color-ink))]"
        >
          {/* Amber accent bar */}
          <div className="h-2 flex-shrink-0 bg-amber" />

          {/* Header */}
          <div className="flex-shrink-0 border-b-2 border-ink">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <BowlingPinIcon size={16} className="text-teal" />
                <span className="font-display text-xl leading-none text-ink">Jimbo-t</span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="inline-flex items-center justify-center p-1 text-ink-muted transition hover:text-ink"
              >
                <CloseIcon />
              </button>
            </div>
            <p className="eyebrow-sm px-4 pb-3 text-ink-muted">Ask about Jim&apos;s career</p>
          </div>

          {/* Conversation area */}
          <div
            role="log"
            aria-label="Conversation"
            className="flex-1 space-y-4 overflow-y-auto px-4 py-3"
          >
            {/* Static welcome bubble (not in history) */}
            <JimbotBubble text={WELCOME} showLabel={false} />

            {/* Suggested question chips — disappear after first user message */}
            {!hasUserMessage && (
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void sendMessage(s)}
                    className="border border-ink bg-surface px-3 py-1.5 font-mono text-xs text-ink transition-colors hover:bg-ink hover:text-[rgb(var(--color-base))]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Message history */}
            {messages.map((msg) => {
              if (msg.role === "user") return <UserBubble key={msg.id} text={msg.text} />;
              if (msg.role === "stranger") return <StrangerBubble key={msg.id} text={msg.text} />;
              return <JimbotBubble key={msg.id} text={msg.text} />;
            })}

            {/* Loading indicator */}
            {loading && <LoadingBubble />}

            {/* Scroll anchor */}
            <div ref={scrollAnchorRef} />
          </div>

          {/* Input area */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-shrink-0 items-end gap-2 border-t-2 border-ink p-3"
          >
            <div className="flex flex-1 flex-col gap-1">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask about Jim's career..."
                rows={1}
                maxLength={500}
                disabled={loading}
                className="w-full resize-none bg-base font-mono text-sm text-ink placeholder:text-ink-muted focus:outline-none disabled:opacity-50"
              />
              {charCount > 400 && (
                <p className="eyebrow-sm self-end text-ink-muted">{charCount}/500</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn-primary flex-shrink-0 px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
