# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev                  # start Next.js dev server
pnpm build                # production build
pnpm typecheck            # tsc --noEmit
pnpm lint                 # ESLint
pnpm format               # Prettier (write)
pnpm format:check         # Prettier (check only)
pnpm test                 # Vitest unit tests (run once)
pnpm test:watch           # Vitest watch mode
pnpm test:e2e             # Playwright e2e tests (starts dev server automatically)
pnpm test:e2e:ui          # Playwright UI mode

# Contentful migrations
pnpm contentful:migrate:initial                        # run 0001-initial-content-types.cjs
node scripts/run-migration.cjs migrations/<file>.cjs   # run any migration directly
```

**Testing layout:**
- Unit tests live in `src/__tests__/` and match `**/*.test.ts`. Run with `pnpm test`.
- E2e tests live in `e2e/` and match `**/*.spec.ts`. Run with `pnpm test:e2e`.
- Playwright starts `pnpm dev` automatically; it reuses an already-running server in local dev.

## Architecture

### Routing & layout

All pages live in `src/app/` using the Next.js App Router. The persistent sidebar layout is split into two components for a deliberate reason:

- **`Sidebar`** (`src/components/sidebar.tsx`) — server component; fetches `SiteSettings` from Contentful for nav links and social links.
- **`SidebarShell`** (`src/components/sidebar-shell.tsx`) — client component; owns mobile open/close state, backdrop, route-change auto-close, and body scroll lock.

`RootLayout` wraps children in `lg:pl-72` so all page content clears the fixed sidebar on desktop.

### Contentful integration

All CMS logic lives in `src/lib/contentful.ts`. Key patterns:

- **TypeScript skeletons** (`ProjectSkeleton`, `BlogPostSkeleton`, etc.) mirror the content types defined in `migrations/0001-initial-content-types.cjs`. If you add a field in a migration, add it to the skeleton.
- **Two clients** — `contentful` (delivery/published) and `contentfulPreview` (drafts). Always go through `getClient(draft?)` rather than importing clients directly, so pages can opt into preview mode.
- The module **throws at init** if `CONTENTFUL_SPACE_ID` or `CONTENTFUL_DELIVERY_TOKEN` are absent. Copy `.env.local.example` to `.env.local` before running.
- Environment vars use `CONTENTFUL_ENVIRONMENT` (defaults to `master`). The active environment for this project is `jimjitsu-dev`.

### Static generation

Every dynamic route (`/blog/[slug]`, `/projects/[slug]`) exports `generateStaticParams()` to pre-render at build time. New dynamic route segments need this or they'll 404 in production.

### Markdown rendering

`src/components/MarkdownContent` is an **async server component** that runs the full unified pipeline: `remark-parse → remark-gfm → remark-rehype → rehype-pretty-code → rehype-stringify`. It outputs HTML via `dangerouslySetInnerHTML`.

`rehype-pretty-code` is async (Shiki loads grammars lazily), which is why `react-markdown`'s synchronous `runSync` cannot be used — even though `react-markdown` is still listed as a dependency.

### Design system

**Color** — The "Strike Lane" palette lives entirely in CSS custom properties in `globals.css` as unprefixed RGB triples (`--color-ink: 26 26 26`). Tailwind tokens (`bg-ink`, `text-amber`, etc.) are wired to these properties with `<alpha-value>` so arbitrary opacities work. Dark mode flips the custom properties inside a `prefers-color-scheme: dark` media query — **not** via Tailwind's `dark:` variant prefix.

**Typography** — Three fonts loaded via `next/font` in `src/lib/fonts.ts`, injected into `<html>` as CSS variables (`--font-display`, `--font-body`, `--font-eyebrow`). Tailwind `font-display`, `font-mono`, and `font-eyebrow` utilities map to these. The heading pattern is always an `.eyebrow` span (Orbitron) above a `.display-heading` (Sancreek); `<h1>–<h2>` at large sizes only.

**Component classes** — `.eyebrow`, `.eyebrow-sm`, `.display-heading`, `.btn-primary`, `.btn-secondary` are defined in `globals.css` under `@layer components`.

### Contentful migrations

Migration files live in `migrations/` and are plain CommonJS (`*.cjs`). The runner (`scripts/run-migration.cjs`) reads `.env.local` directly via Node.js to avoid shell variable expansion issues on Windows. Each migration should be idempotent within an environment — don't re-run an already-applied migration.

### Digital Twin Chatbot ("Jimbo-t & The Stranger")

A floating chat widget mounted in `layout.tsx`. Full spec: `docs/spec-digital-twin-chatbot.md`.

**New env vars** (add to `.env.local` and Vercel dashboard):
- `OPENROUTER_API_KEY` — server-side only, never expose to the browser
- `OPENROUTER_MODEL` — optional; defaults to `google/gemini-2.5-flash`

**Key files:**
- `src/app/api/chat/route.ts` — `POST /api/chat`; validates request, calls OpenRouter, returns `{ jimbot, stranger? }` JSON
- `src/lib/chat-context.ts` — assembles career context string from Contentful; wrapped in `unstable_cache` at 60s revalidation. Called at request time only — never at module init.
- `src/lib/chat-prompts.ts` — `buildSystemPrompt(careerContext)` assembles the 6-section system prompt; imports quote library from `src/data/big_lebowski_quotes.json`
- `src/components/chat-widget.tsx` — `"use client"` component; full widget UI with focus trap, Escape-to-close, 800ms Stranger reveal delay

**`unstable_cache` pattern:** `getCareerContext()` in `chat-context.ts` wraps the Contentful fetch with `unstable_cache(fn, [key], { revalidate: 60 })`. The function is only invoked inside the route handler (request time), never at module initialization.
