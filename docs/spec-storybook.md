# Spec: Storybook Integration

**Status:** Draft v1.0  
**Owner:** Jim Tierney  
**Feature slug:** `storybook-integration`

---

## 1. Feature Overview

Storybook provides an isolated browser environment for developing, documenting, and visually testing UI components outside the Next.js application. Adding it to the jimjitsu.dev site serves three goals:

1. **Component development in isolation** — build and iterate on components without needing Contentful data, a running Next.js server, or full page context.
2. **Living design system documentation** — the Strike Lane palette, Tailwind tokens, and component classes (`.btn-primary`, `.eyebrow`, `.display-heading`) become browsable and interactive, with Controls for exploring every prop combination.
3. **Visual regression baseline** — stories establish a known-good visual state for each component that Chromatic (or Playwright's screenshot assertions) can snapshot and diff on future changes.

This is a developer-tooling addition only. Storybook runs locally and can be deployed as a static site to a subdomain (e.g. `storybook.jimjitsu.dev`) but is not part of the main Next.js build.

---

## 2. Goals & Scope

### In scope (v1)

- Storybook 8.x configured for Next.js 16.x / React 19 via `@storybook/nextjs`
- Full design system integration: globals.css, Tailwind tokens, fonts, dark mode toggle
- **Component extraction** — six page-level patterns promoted to shared components before stories are written (see §12):
  - `PageHeader`, `BackLink`, `SectionHeader`, `SkillGroup`, `ProjectMetaBar`, `ArticleMetaLine`
- Stories for all presentational and interactive client components:
  - `Icons` (all 6 icons)
  - `BlogPostCard`, `ProjectCard`, `ContentfulImage`
  - `SidebarShell`, `ChatWidget`
  - All six extracted components above
- Typed Contentful mock factories (no real API calls)
- MSW-based API mock for the `/api/chat` route in `ChatWidget` stories
- CSF3 TypeScript stories throughout

### Out of scope (v1)

- **Async server components** (`MarkdownContent`, `Sidebar`) — these use Node.js async APIs and cannot run in Storybook's browser environment. See §10 for the rationale and future migration path.
- Chromatic CI integration — can be added later; stories are the prerequisite.
- Storybook deployment to a public subdomain.

---

## 3. Package Setup

Install all Storybook packages as dev dependencies in a single command:

```bash
pnpm add -D \
  storybook \
  @storybook/nextjs \
  @storybook/addon-essentials \
  @storybook/addon-themes \
  @storybook/addon-interactions \
  @storybook/test \
  msw \
  msw-storybook-addon
```

| Package | Role |
|---|---|
| `storybook` | CLI (`storybook dev`, `storybook build`) |
| `@storybook/nextjs` | Framework adapter — handles `next/image`, `next/link`, `next/navigation`, and `next/font` automatically |
| `@storybook/addon-essentials` | Bundles: Docs, Controls, Actions, Backgrounds, Viewport, Toolbars |
| `@storybook/addon-themes` | Dark mode toggle via `withThemeByMediaQuery` — emulates `prefers-color-scheme: dark` |
| `@storybook/addon-interactions` | Plays `play` functions in the story panel; required for interaction tests |
| `@storybook/test` | `userEvent`, `expect`, `fn()` — testing utilities for play functions |
| `msw` | Mock Service Worker — intercepts `fetch` in the browser for `ChatWidget` stories |
| `msw-storybook-addon` | Wires MSW into Storybook's preview lifecycle |

After installing MSW, initialize the service worker file in the Next.js public directory:

```bash
npx msw init public/
```

This creates `public/mockServiceWorker.js`. Commit this file — it must be served at the root URL for MSW to intercept fetches in Storybook's dev server.

**Note on Storybook version:** `@storybook/nextjs` tracks Next.js major versions. At the time of writing, Storybook 8.x supports Next.js 15.x; if Next.js 16.x support requires a patch, update to the latest 8.x release (`storybook@^8`). If Storybook 9 is available and stable, prefer it.

**Note on accessibility addon:** `@storybook/addon-a11y` (powered by axe-core) is not listed above but is worth adding — it surfaces WCAG violations inline in the Storybook panel, which aligns directly with the site's WCAG 2.1 AA goal. It's deferred to v2 only because it requires no story changes and can be dropped in at any point with a single `pnpm add -D @storybook/addon-a11y` and an addons entry in `main.ts`.

---

## 4. Config Files

### 4.1 `.storybook/main.ts`

```typescript
import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  stories: ["../src/stories/**/*.stories.@(ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-themes",
    "msw-storybook-addon",
  ],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  staticDirs: ["../public"],
};

export default config;
```

Key points:
- `stories` glob covers `src/stories/` only — no accidental story pickup from `src/components/` or test files.
- `staticDirs: ["../public"]` serves `public/mockServiceWorker.js` so MSW can register its service worker.
- `@storybook/nextjs` requires no `webpackFinal` or Babel config — it handles Next.js internals automatically.

### 4.2 `.storybook/preview.ts`

```typescript
import type { Preview } from "@storybook/nextjs";
import { withThemeByMediaQuery } from "@storybook/addon-themes";
import { initialize, mswLoader } from "msw-storybook-addon";
import "../src/app/globals.css";

// Initialize MSW. onUnhandledRequest: "bypass" avoids console noise for
// Storybook's own internal requests (HMR, fonts, etc.).
initialize({ onUnhandledRequest: "bypass" });

const preview: Preview = {
  decorators: [
    withThemeByMediaQuery({
      themes: {
        light: "",
        dark: "(prefers-color-scheme: dark)",
      },
      defaultTheme: "light",
    }),
  ],
  loaders: [mswLoader],
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    backgrounds: { disable: true },
    layout: "centered",
  },
};

export default preview;
```

**Why `backgrounds: { disable: true }`** — the Strike Lane palette is defined in `globals.css` as CSS custom properties. Enabling the Backgrounds addon's color picker would overlay an arbitrary background that breaks the design token chain. The dark mode toggle (via `withThemeByMediaQuery`) is the correct mechanism for theme switching on this site.

**Why `nextjs: { appDirectory: true }`** — tells `@storybook/nextjs` to use the App Router context, which makes `next/navigation` hooks (`useRouter`, `usePathname`) available inside stories.

---

## 5. Design System Integration

### 5.1 CSS Tokens and Component Classes

The `globals.css` import in `preview.ts` brings in:

- All CSS custom properties (`--color-ink`, `--color-teal`, `--font-display`, etc.)
- All Tailwind base/component/utility layers (via the `@tailwind` directives)
- Component class definitions (`.eyebrow`, `.eyebrow-sm`, `.display-heading`, `.btn-primary`, `.btn-secondary`)

No additional setup is needed. Tailwind's PostCSS processing runs through `@storybook/nextjs` automatically, so tokens like `bg-amber`, `text-ink-muted`, and `border-ink` resolve identically to how they behave in the Next.js app.

### 5.2 Fonts

`@storybook/nextjs` handles `next/font` automatically — the `sancreek`, `orbitron`, and `jetbrainsMono` instances in `src/lib/fonts.ts` are evaluated normally and inject `--font-display`, `--font-eyebrow`, and `--font-body` CSS variables into the document. No manual font mocking is required.

If a story renders a component that directly imports from `src/lib/fonts.ts` (e.g., to apply `fontVariables` to a wrapper element), wrap it in a decorator that adds the font variable classes to the story's root element:

```typescript
// In the individual story file, if needed:
export default {
  decorators: [
    (Story) => (
      <div className={fontVariables}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta;
```

In practice, this is only needed for stories that render the root `<html>` equivalent. Most component stories don't need it because `globals.css` already registers the font variables at the `:root` level via `@storybook/nextjs`'s document rendering.

### 5.3 Dark Mode

The site uses `prefers-color-scheme: dark` in `globals.css` (not a Tailwind `dark:` class variant). The `withThemeByMediaQuery` decorator in `preview.ts` emulates this by injecting a media query override into the rendered iframe, so toggling "dark" in the Storybook toolbar accurately reflects how the site looks in dark mode.

No story-level configuration is required — the decorator runs globally and every story gets the theme toolbar toggle.

---

## 6. Stories Architecture

### 6.1 Directory Structure

Stories live in `src/stories/` rather than co-located with components. This keeps `src/components/` free of non-production files and makes the Storybook surface area easy to find and audit.

```
src/stories/
├── mocks/
│   └── contentful.ts             # Typed mock factories for Entry<T> and Asset objects
├── Icons.stories.tsx
├── BlogPostCard.stories.tsx
├── ProjectCard.stories.tsx
├── ContentfulImage.stories.tsx
├── SidebarShell.stories.tsx
├── ChatWidget.stories.tsx
├── PageHeader.stories.tsx        # extracted component — see §12.1
├── BackLink.stories.tsx          # extracted component — see §12.2
├── SectionHeader.stories.tsx     # extracted component — see §12.3
├── SkillGroup.stories.tsx        # extracted component — see §12.4
├── ProjectMetaBar.stories.tsx    # extracted component — see §12.5
└── ArticleMetaLine.stories.tsx   # extracted component — see §12.6
```

### 6.2 Component Story Plan

Components marked **\*** must be extracted from page files into `src/components/` before stories can be written. See §12 for the extraction plan and recommended APIs.

| Component | Story file | Variants | Needs mock |
|---|---|---|---|
| Icons | `Icons.stories.tsx` | One story per icon (6 total); Controls for `size`, `className` | None |
| BlogPostCard | `BlogPostCard.stories.tsx` | Default, no-tags, no-excerpt, long-title | `Entry<BlogPostSkeleton>` |
| ProjectCard | `ProjectCard.stories.tsx` | accent=red/teal/amber, no-image, no-technologies | `Entry<ProjectSkeleton>` |
| ContentfulImage | `ContentfulImage.stories.tsx` | Standard, fill mode, missing asset (renders null) | `Asset` |
| SidebarShell | `SidebarShell.stories.tsx` | Closed, open, play function for Escape-to-close | None |
| ChatWidget | `ChatWidget.stories.tsx` | Collapsed, expanded-no-history, loading, stranger-response | MSW handler for `POST /api/chat` |
| PageHeader **\*** | `PageHeader.stories.tsx` | Default, no-description, no-icon, long-title, h2 variant | None |
| BackLink **\*** | `BackLink.stories.tsx` | Blog back, Projects back | None |
| SectionHeader **\*** | `SectionHeader.stories.tsx` | With see-all link, without | None |
| SkillGroup **\*** | `SkillGroup.stories.tsx` | Default, many-items, single-item | None |
| ProjectMetaBar **\*** | `ProjectMetaBar.stories.tsx` | All fields, role+tech only, links only, no links | None |
| ArticleMetaLine **\*** | `ArticleMetaLine.stories.tsx` | All fields, date only, with author, with tags | None |

---

## 7. Contentful Mocking Strategy

Contentful data types are complex generics (`Entry<T, undefined, string>`, `Asset<undefined>`). Rather than installing a mocking library, write typed factory functions in `src/stories/mocks/contentful.ts` that return correctly shaped objects. These factories are the single source of truth for all Contentful shapes used across stories.

### 7.1 `src/stories/mocks/contentful.ts`

```typescript
import type { Asset, Entry } from "contentful";
import type { BlogPostSkeleton, ProjectSkeleton } from "@/lib/contentful";

// ── Asset ────────────────────────────────────────────────────────────────────

export function mockAsset(overrides?: Partial<Asset["fields"]>): Asset<undefined> {
  return {
    sys: { id: "mock-asset", type: "Asset", createdAt: "", updatedAt: "", locale: "en-US", space: { sys: { type: "Link", linkType: "Space", id: "mock-space" } }, environment: { sys: { type: "Link", linkType: "Environment", id: "master" } }, revision: 1 },
    metadata: { tags: [], concepts: [] },
    fields: {
      title: "Mock image",
      description: "A mock Contentful asset",
      file: {
        url: "//images.ctfassets.net/mock/mock-image.jpg",
        fileName: "mock-image.jpg",
        contentType: "image/jpeg",
        details: { size: 12345, image: { width: 1200, height: 800 } },
      },
      ...overrides,
    },
    toPlainObject: () => ({} as ReturnType<Asset["toPlainObject"]>),
    update: () => Promise.resolve({} as Asset),
  } as unknown as Asset<undefined>;
}

// ── BlogPost ─────────────────────────────────────────────────────────────────

export function mockBlogPost(
  overrides?: Partial<Entry<BlogPostSkeleton, undefined, string>["fields"]>,
): Entry<BlogPostSkeleton, undefined, string> {
  return {
    sys: { id: "mock-post", type: "Entry", createdAt: "2025-01-15T00:00:00Z", updatedAt: "2025-01-15T00:00:00Z", locale: "en-US", contentType: { sys: { type: "Link", linkType: "ContentType", id: "blogPost" } }, space: { sys: { type: "Link", linkType: "Space", id: "mock-space" } }, environment: { sys: { type: "Link", linkType: "Environment", id: "master" } }, revision: 1 },
    metadata: { tags: [], concepts: [] },
    fields: {
      title: "Building a Design System from Scratch",
      slug: "building-design-system",
      excerpt: "How I built the Strike Lane design system using Tailwind CSS custom properties and brutalist aesthetics.",
      body: "# Full post body here\n\nLorem ipsum...",
      publishDate: "2025-01-15",
      tags: ["design-systems", "tailwind", "css"],
      ...overrides,
    },
    toPlainObject: () => ({} as ReturnType<Entry["toPlainObject"]>),
    update: () => Promise.resolve({} as Entry<BlogPostSkeleton, undefined, string>),
  } as unknown as Entry<BlogPostSkeleton, undefined, string>;
}

// ── Project ──────────────────────────────────────────────────────────────────

export function mockProject(
  overrides?: Partial<Entry<ProjectSkeleton, undefined, string>["fields"]>,
): Entry<ProjectSkeleton, undefined, string> {
  return {
    sys: { id: "mock-project", type: "Entry", createdAt: "2025-01-10T00:00:00Z", updatedAt: "2025-01-10T00:00:00Z", locale: "en-US", contentType: { sys: { type: "Link", linkType: "ContentType", id: "project" } }, space: { sys: { type: "Link", linkType: "Space", id: "mock-space" } }, environment: { sys: { type: "Link", linkType: "Environment", id: "master" } }, revision: 1 },
    metadata: { tags: [], concepts: [] },
    fields: {
      title: "jimjitsu.dev — Portfolio Site",
      slug: "jimjitsu-dev",
      summary: "Personal portfolio and blog built with Next.js, Tailwind CSS, and Contentful.",
      coverImage: mockAsset() as unknown as Entry<ProjectSkeleton, undefined, string>["fields"]["coverImage"],
      technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Contentful"],
      role: "Design + Engineering",
      liveUrl: "https://jimjitsu.dev",
      repoUrl: "https://github.com/jimtierney/jimjitsu-dev",
      featured: true,
      publishDate: "2025-01-10",
      order: 1,
      ...overrides,
    },
    toPlainObject: () => ({} as ReturnType<Entry["toPlainObject"]>),
    update: () => Promise.resolve({} as Entry<ProjectSkeleton, undefined, string>),
  } as unknown as Entry<ProjectSkeleton, undefined, string>;
}
```

**Note on type casting:** Contentful's `Entry` type includes non-serializable methods (`toPlainObject`, `update`). The factories use `as unknown as Entry<T>` to satisfy TypeScript without implementing the full SDK interface. This is acceptable in test/story code.

---

## 8. MSW Setup for ChatWidget

`ChatWidget` makes a `POST /api/chat` request. In Storybook, this request must be intercepted by MSW — the Next.js API route doesn't run in the browser environment.

Each `ChatWidget` story defines its own `parameters.msw.handlers` array, allowing different stories to simulate different server states (success, loading, error, stranger trigger).

### 8.1 Handler pattern

```typescript
import { http, HttpResponse } from "msw";

// In a ChatWidget story:
export const WithStrangerResponse: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post("/api/chat", () =>
          HttpResponse.json({
            jimbot: {
              text: "Look, I built that frontend, man. React, Tailwind, the whole deal. That rug really tied the room together.",
              triggered_stranger: true,
              trigger_type: "stranger_echo",
            },
            stranger: {
              text: "The Dude abides. I don't know about you, but I take comfort in that.",
            },
          }),
        ),
      ],
    },
  },
};
```

### 8.2 Simulating loading state

To keep the chat in a loading state (for visual inspection of the loading bubble), return a never-resolving promise:

```typescript
export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post("/api/chat", () => new Promise(() => {})),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Open the widget
    await userEvent.click(canvas.getByRole("button", { name: /open chat/i }));
    // Type and submit a message
    const input = canvas.getByRole("textbox");
    await userEvent.type(input, "What are your strongest skills?");
    await userEvent.keyboard("{Enter}");
  },
};
```

---

## 9. Component Story Details

### 9.1 Icons

```typescript
// src/stories/Icons.stories.tsx
import type { Meta, StoryObj } from "@storybook/nextjs";
import { BowlingPinIcon, BowlingBallIcon, LaneArrowIcon, StrikeIcon, ChatBubbleIcon, StarburstIcon } from "@/components/icons";

const meta = {
  title: "Design System/Icons",
  parameters: { layout: "centered" },
  argTypes: {
    size: { control: { type: "range", min: 16, max: 96, step: 4 } },
  },
} satisfies Meta;

export default meta;
```

One named export per icon (`BowlingPinIcon`, `BowlingBallIcon`, `LaneArrowIcon`, `StrikeIcon`, `ChatBubbleIcon`, `StarburstIcon`), each with `args: { size: 32 }` and `className` as a text control.

### 9.2 BlogPostCard

Four variants:

| Story | Key field changes |
|---|---|
| `Default` | All fields populated |
| `NoTags` | `tags: []` |
| `LongTitle` | Title is 80+ characters to test layout wrapping |
| `NoExcerpt` | `excerpt: undefined` |

`BlogPostCard` wraps its content in a `<Link>` which uses `next/link` — handled automatically by `@storybook/nextjs`. Set a `decorator` that wraps the story in a `max-w-sm` container to simulate card-in-grid context.

### 9.3 ProjectCard

Five variants:

| Story | Key changes |
|---|---|
| `AccentRed` | `accent="red"` (default) |
| `AccentTeal` | `accent="teal"` |
| `AccentAmber` | `accent="amber"` |
| `NoImage` | `coverImage: undefined` — tests the layout without the 16:10 image block |
| `NoTechnologies` | `technologies: undefined` |

### 9.4 ContentfulImage

Three variants:
- `Standard`: full `Asset` mock with known dimensions (1200×800). Renders with explicit `width`/`height`.
- `FillMode`: `fill={true}` — wrap in a `relative h-64 w-full` container to give it dimensions.
- `MissingAsset`: `asset={undefined}` — verifies the null guard renders nothing.

### 9.5 SidebarShell

`SidebarShell` accepts children (the sidebar nav content) and owns mobile open/close state internally. Stories pass a simple nav placeholder as children.

| Story | State |
|---|---|
| `Closed` | Default closed state (desktop) |
| `Open` | Open state on mobile (set viewport to `375px`) |
| `EscapeToClose` | `play` function opens the drawer then fires `Escape` — asserts the drawer closes |

The `play` function for `EscapeToClose`:

```typescript
play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: /open menu/i }));
  await expect(canvas.getByRole("dialog")).toBeVisible();
  await userEvent.keyboard("{Escape}");
  await expect(canvas.queryByRole("dialog")).not.toBeInTheDocument();
},
```

### 9.6 ChatWidget

| Story | MSW handler | Initial state |
|---|---|---|
| `Collapsed` | None | Widget in collapsed/button state |
| `Expanded` | None (widget just opened) | Widget open, welcome message visible |
| `Loading` | Never-resolving promise | Message submitted; loading dots visible |
| `JimbotResponse` | Returns `triggered_stranger: false` | Full Jimbo-t response bubble |
| `WithStrangerResponse` | Returns `triggered_stranger: true` | Both bubbles visible (Stranger fades in at 800ms) |
| `ErrorState` | Returns 500 | Error message bubble in Jimbo-t voice |

Play functions for the stories that require interaction before settling:

**`Expanded`** — opens the widget only:
```typescript
play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: /open chat/i }));
  await expect(canvas.getByRole("dialog")).toBeVisible();
},
```

**`JimbotResponse`** and **`WithStrangerResponse`** — opens the widget, submits a message, and waits for the MSW handler to resolve:
```typescript
play: async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: /open chat/i }));
  const input = canvas.getByRole("textbox");
  await userEvent.type(input, "Tell me about your work.");
  await userEvent.keyboard("{Enter}");
  // Response bubble appears once the MSW handler resolves
  await expect(await canvas.findByText(/jimbo-t/i)).toBeVisible();
},
```

The `Loading` play function is already shown in §8.2. `Collapsed` and `ErrorState` require no play function.

### 9.7 JsonLd

`JsonLd` (`src/components/json-ld.tsx`) renders a `<script type="application/ld+json">` tag with serialized structured data. It is a trivial synchronous component — no async, no Contentful calls. However, it has no meaningful visual state (it renders nothing visible) and its correctness is better validated by reading the rendered `<script>` tag in browser DevTools than by a Storybook story. **No story is needed.** If schema shapes need documentation, add inline JSDoc to the component.

---

## 10. Async Server Components

`MarkdownContent` (`src/components/markdown-content.tsx`) and `Sidebar` (`src/components/sidebar.tsx`) are async React Server Components. They:

- Use `async/await` at the component top level
- Call Node.js-only APIs (Contentful SDK, remark/rehype pipeline with Shiki)
- Cannot be rendered in Storybook's browser-side Webpack bundle

**These are explicitly out of scope for v1.** Do not create stories for them.

**Future migration path:** If stories for these components are ever needed, the approach is to extract the data-fetching and rendering logic into separate modules, then create a synchronous wrapper component that accepts pre-fetched data as props. The story renders the wrapper with static props; the Next.js page renders the wrapper by awaiting the server-side data fetch. This "data-down, events-up" split is the standard Storybook pattern for server components.

---

## 11. New Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

`pnpm storybook` starts Storybook on `http://localhost:6006`. It runs independently of `pnpm dev` — both can run simultaneously with no port conflicts.

---

## 12. Component Extraction Recommendations

Before writing stories for components that don't yet exist as discrete files, those page-level sections need to be extracted into `src/components/`. This section catalogs every candidate found by auditing all six `page.tsx` files, notes where the pattern repeats, and specifies the minimal public API needed to make stories viable.

The extractions are sorted from highest to lowest impact (reuse × visual complexity). All are synchronous, props-only components — no server-side data fetching — so all qualify for Storybook.

---

### 12.1 `PageHeader`

**Where it appears:** Every non-home page (`blog/page.tsx`, `projects/page.tsx`, `about/page.tsx`, `blog/[slug]/page.tsx`, `projects/[slug]/page.tsx`) and every sub-section in `page.tsx` — the highest-frequency pattern in the codebase.

**Current form:** An inline `<header>` block with an eyebrow paragraph (icon + label), an `<h1>` or `<h2>`, and an optional description `<p>`.

**Recommended API:**

```typescript
// src/components/page-header.tsx
interface PageHeaderProps {
  eyebrow: string;                    // e.g. "From the blog"
  icon?: React.ReactNode;             // e.g. <BowlingPinIcon size={16} className="text-amber" />
  title: string;                      // h1/h2 text
  description?: string;               // optional lead paragraph
  headingLevel?: "h1" | "h2";        // defaults to "h1"
}
```

**Stories:**

| Story | Key variations |
|---|---|
| `Default` | eyebrow + icon + title + description |
| `NoDescription` | title only; no description paragraph |
| `NoIcon` | eyebrow label with no icon |
| `LongTitle` | 60+ char title to test `display-heading` wrapping |
| `HeadingLevelH2` | `headingLevel="h2"` — for home page section use |

**Story file:** `src/stories/PageHeader.stories.tsx`

---

### 12.2 `BackLink`

**Where it appears:** `blog/[slug]/page.tsx` and `projects/[slug]/page.tsx`. The markup is byte-for-byte identical in both — a `<Link>` with `LaneArrowIcon` at `-rotate-90` and a shared Tailwind underline hover style.

**Current form:** Inline `<Link>` directly inside the detail page's `<main>`.

**Recommended API:**

```typescript
// src/components/back-link.tsx
interface BackLinkProps {
  href: string;    // e.g. "/blog"
  label: string;   // e.g. "All posts"
}
```

**Stories:**

| Story | Key variations |
|---|---|
| `Default` | `href="/blog" label="All posts"` |
| `Projects` | `href="/projects" label="All projects"` |

**Story file:** `src/stories/BackLink.stories.tsx`

---

### 12.3 `SectionHeader`

**Why not just reuse `PageHeader`?** `PageHeader` is a page-top `<header>` element with an `<h1>` and an optional description paragraph — a single-column stacked layout. `SectionHeader` is a within-page section marker: it always uses `<h2>`, never has a description, and uses a two-column flex layout so a "see all" link can sit flush-right opposite the heading. The structural difference and the mutually exclusive use cases (one per page vs. one per section) justify keeping them separate.

**Where it appears:** `FeaturedProjectsSection` and `RecentWritingSection` in `src/app/page.tsx`. Both use a two-column flex row: eyebrow + h2 on the left, a small "All X →" link on the right. The layout and typography are identical; only the text content differs.

**Current form:** Inline `<div className="flex items-end justify-between gap-4">` wrappers inside each section function.

**Recommended API:**

```typescript
// src/components/section-header.tsx
interface SectionHeaderProps {
  eyebrow: string;
  icon?: React.ReactNode;
  title: string;
  seeAllHref?: string;
  seeAllLabel?: string;   // e.g. "All projects"
}
```

**Stories:**

| Story | Key variations |
|---|---|
| `WithSeeAll` | All props including `seeAllHref` and `seeAllLabel` |
| `NoSeeAll` | No see-all link — simple centered eyebrow + heading |

**Story file:** `src/stories/SectionHeader.stories.tsx`

---

### 12.4 `SkillGroup` and `SkillPill`

**Where it appears:** The `SkillsSection` function in `src/app/page.tsx`. The bordered `<div>` wrapping a skill category and its pill list is currently assembled inline with `SKILL_GROUPS.map()`. Neither the group card nor the individual pill is reusable as-is.

**Current form:** Inline inside `SkillsSection`; `SkillsSection` itself is a local function not exported from the page.

**Recommended API:**

```typescript
// src/components/skill-group.tsx
interface SkillGroupProps {
  label: string;        // "Languages", "Frameworks", etc.
  items: readonly string[];
}
```

`SkillPill` can be a module-private component inside `skill-group.tsx` — it doesn't need its own file.

**Stories:**

| Story | Key variations |
|---|---|
| `Default` | 4 items (normal count) |
| `ManyItems` | 8+ items to verify wrap behavior |
| `SingleItem` | Edge case: a single-item category |

**Story file:** `src/stories/SkillGroup.stories.tsx`

---

### 12.5 `ProjectMetaBar`

**Where it appears:** `src/app/projects/[slug]/page.tsx` only — but it's complex enough (three optional fields, external link handling, `<dl>` semantics) to warrant isolation.

**Current form:** An inline `<dl>` block inside `ProjectDetailPage`.

**Recommended API:**

```typescript
// src/components/project-meta-bar.tsx
interface ProjectMetaBarProps {
  role?: string;
  technologies?: string[];
  liveUrl?: string;
  repoUrl?: string;
}
```

**Stories:**

| Story | Key variations |
|---|---|
| `AllFields` | All four props populated |
| `RoleAndTechOnly` | No URLs |
| `LinksOnly` | No role or tech |
| `NoLinks` | Role and tech, `liveUrl` and `repoUrl` both absent |

**Story file:** `src/stories/ProjectMetaBar.stories.tsx`

---

### 12.6 `ArticleMetaLine`

**Where it appears:** `src/app/blog/[slug]/page.tsx`. Renders the publication date (formatted), optional author name, and optional hashtag list in a single horizontal `<div>`. All three parts are optional — the permutation space makes this a good candidate for Controls.

**Current form:** Inline inside `BlogPostPage`.

**Recommended API:**

```typescript
// src/components/article-meta-line.tsx
interface ArticleMetaLineProps {
  publishDate: string;   // ISO date string
  author?: string;
  tags?: string[];
}
```

**Stories:**

| Story | Key variations |
|---|---|
| `AllFields` | Date + author + tags |
| `DateOnly` | No author, no tags |
| `WithAuthor` | Date + author, no tags |
| `WithTags` | Date + tags, no author |

**Story file:** `src/stories/ArticleMetaLine.stories.tsx`

---

### 12.7 Extraction order

Extract before starting Phase 4 (stories). The components are independent of each other, so all six can be extracted in parallel. Suggested order by blast radius:

1. `BackLink` — zero risk; moves 5 lines from two pages
2. `ArticleMetaLine` — contained to one page
3. `ProjectMetaBar` — contained to one page
4. `PageHeader` — touches every page; highest impact, needs the most care
5. `SectionHeader` — modifies two home-page section functions
6. `SkillGroup` — modifies `SkillsSection` and removes `SKILL_GROUPS.map` inline logic

Run `pnpm typecheck` and `pnpm build` after each extraction to catch regressions before moving on.

---

### 12.8 Updated story plan

See §6.2 for the complete story plan table — it is the single source of truth and already reflects all twelve components.

---

## 13. Implementation Checklist

**Phase 1 — Install & Config**

- [ ] Run the `pnpm add -D` command from §3
- [ ] Run `npx msw init public/` — commit `public/mockServiceWorker.js`
- [ ] Create `.storybook/main.ts` per §4.1
- [ ] Create `.storybook/preview.ts` per §4.2
- [ ] Add `storybook` and `build-storybook` scripts to `package.json`
- [ ] Add `storybook-static/` to `.gitignore`
- [ ] Run `pnpm storybook` — verify Storybook opens at `localhost:6006` with no errors

**Phase 2 — Design System Verification**

- [ ] Confirm `globals.css` tokens are active: create a throwaway story with `<div className="bg-teal text-ink p-4">Strike Lane</div>` and verify the correct colors render
- [ ] Toggle dark mode in the toolbar — verify the CSS custom properties flip as they do on the live site
- [ ] Confirm `font-display` (Sancreek) and `font-eyebrow` (Orbitron) load in the Storybook iframe
- [ ] Delete the throwaway story

**Phase 3 — Component Extraction** _(see §12 for APIs and recommended order)_

- [ ] Extract `BackLink` → `src/components/back-link.tsx`; update `blog/[slug]/page.tsx` and `projects/[slug]/page.tsx`
- [ ] Extract `ArticleMetaLine` → `src/components/article-meta-line.tsx`; update `blog/[slug]/page.tsx`
- [ ] Extract `ProjectMetaBar` → `src/components/project-meta-bar.tsx`; update `projects/[slug]/page.tsx`
- [ ] Extract `PageHeader` → `src/components/page-header.tsx`; update all five non-home pages and the home-page section functions
- [ ] Extract `SectionHeader` → `src/components/section-header.tsx`; update `FeaturedProjectsSection` and `RecentWritingSection` in `page.tsx`
- [ ] Extract `SkillGroup` → `src/components/skill-group.tsx`; update `SkillsSection` in `page.tsx`
- [ ] `pnpm typecheck && pnpm build` — no regressions before proceeding

**Phase 4 — Mocks**

- [ ] Create `src/stories/mocks/contentful.ts` with `mockAsset`, `mockBlogPost`, `mockProject` factories per §7
- [ ] Run `pnpm typecheck` — no TypeScript errors in mock file

**Phase 5 — Stories**

- [ ] `Icons.stories.tsx` — all 6 icons with Controls
- [ ] `BlogPostCard.stories.tsx` — 4 variants
- [ ] `ProjectCard.stories.tsx` — 5 variants
- [ ] `ContentfulImage.stories.tsx` — 3 variants
- [ ] `SidebarShell.stories.tsx` — 3 variants including `EscapeToClose` play function
- [ ] `ChatWidget.stories.tsx` — 6 variants with MSW handlers
- [ ] `PageHeader.stories.tsx` — 5 variants
- [ ] `BackLink.stories.tsx` — 2 variants
- [ ] `SectionHeader.stories.tsx` — 2 variants
- [ ] `SkillGroup.stories.tsx` — 3 variants
- [ ] `ProjectMetaBar.stories.tsx` — 4 variants
- [ ] `ArticleMetaLine.stories.tsx` — 4 variants

**Phase 6 — Validation**

- [ ] `pnpm storybook` — all stories render without console errors
- [ ] MSW handler fires for `ChatWidget` stories — verify via browser DevTools Network tab (requests should be intercepted, not reaching the server)
- [ ] `pnpm build-storybook` — static build completes successfully
- [ ] `pnpm typecheck` — no errors across stories and mocks
- [ ] `pnpm lint` — no lint errors
- [ ] Update `CLAUDE.md` with Storybook scripts and `src/stories/` location

---

## 14. New Files

```
.storybook/
├── main.ts                          Storybook config — framework, addons, stories glob
└── preview.ts                       Global decorators, MSW init, globals.css import

public/
└── mockServiceWorker.js             Generated by MSW init — commit to repo

src/components/                      New extracted components (§12)
├── page-header.tsx
├── back-link.tsx
├── section-header.tsx
├── skill-group.tsx
├── project-meta-bar.tsx
└── article-meta-line.tsx

src/stories/
├── mocks/
│   └── contentful.ts                Typed mock factories for Entry<T> and Asset
├── Icons.stories.tsx
├── BlogPostCard.stories.tsx
├── ProjectCard.stories.tsx
├── ContentfulImage.stories.tsx
├── SidebarShell.stories.tsx
├── ChatWidget.stories.tsx
├── PageHeader.stories.tsx
├── BackLink.stories.tsx
├── SectionHeader.stories.tsx
├── SkillGroup.stories.tsx
├── ProjectMetaBar.stories.tsx
└── ArticleMetaLine.stories.tsx
```

**Modified files:**

```
src/app/page.tsx                     Replace inline section functions with PageHeader, SectionHeader, SkillGroup
src/app/blog/page.tsx                Replace inline header with PageHeader
src/app/projects/page.tsx            Replace inline header with PageHeader
src/app/about/page.tsx               Replace inline header with PageHeader
src/app/blog/[slug]/page.tsx         Replace inline header, back link, meta line with extracted components
src/app/projects/[slug]/page.tsx     Replace inline header, back link, meta bar with extracted components
package.json                         Add storybook + build-storybook scripts; new dev dependencies
.gitignore                           Add storybook-static/ (build output)
CLAUDE.md                            Document Storybook scripts and stories location
```

---

## 15. Design Decisions Summary

| Decision | Choice | Reason |
|---|---|---|
| Storybook version | 8.x (`storybook@latest`) | React 19 support; CSF3 native |
| Framework adapter | `@storybook/nextjs` | Handles `next/image`, `next/link`, `next/navigation`, `next/font` — no manual mocking |
| Dark mode mechanism | `withThemeByMediaQuery` | Matches the site's real implementation (CSS media query, not a class or data attribute) |
| Backgrounds addon | Disabled | CSS custom properties define background — the addon would conflict |
| Stories location | `src/stories/` (not co-located) | Keeps `src/components/` free of non-production files; easier to audit |
| Contentful mocking | Plain TypeScript factories | No addon needed; fully typed; simple to extend |
| API mocking | MSW via `msw-storybook-addon` | Industry standard; intercepts at the network layer — no component code changes required |
| Async server components | Out of scope (v1) | Cannot run in browser; document the limitation and migration path |
| Stories format | CSF3 TypeScript (`satisfies Meta`) | Consistent with project's strict TypeScript setup; better inference than `Meta<typeof Component>` |
| Font handling | Automatic via `@storybook/nextjs` | No manual CSS variable injection; `next/font` runs normally |
| `public/mockServiceWorker.js` | Committed to repo | MSW requires the file to be served at the root; it's a generated but stable file |
