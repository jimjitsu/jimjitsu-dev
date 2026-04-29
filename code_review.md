# Code Review — jimjitsu.dev

Reviewed against: `src/`, `tailwind.config.ts`, `next.config.ts`, `tsconfig.json`, `package.json`.

Issues are grouped by severity. Line numbers are pinned to current file state.

---

## Critical

### 1. Sidebar uses `bg-white` — breaks dark mode
**`src/components/sidebar-shell.tsx:64`**

```tsx
className={`... bg-white ...`}
```

`bg-white` is always white. The sidebar background never switches to the dark theme's `--color-base`. Should be `bg-base` to match the rest of the page in dark mode.

**Fix:** Replace `bg-white` with `bg-base`.

---

## High

### 2. No ISR `revalidate` export on any page

None of the route files (`page.tsx` in `/`, `/about`, `/blog`, `/blog/[slug]`, `/projects`, `/projects/[slug]`) export a `revalidate` constant. Without it, Next.js uses the static default — pages built once and never refreshed unless the site is redeployed. Contentful content edits will not appear on the live site.

**Fix:** Add to every page that reads from Contentful:

```ts
export const revalidate = 60; // seconds — tune to taste
```

### 3. Unused `react-markdown` dependency
**`package.json:26`**

`react-markdown` is listed as a runtime dependency but is not imported anywhere. `markdown-content.tsx` was rewritten to use the unified pipeline directly. The dead dependency adds ~40 kB to the install graph and is misleading.

**Fix:** `pnpm remove react-markdown`

### 4. Duplicate `@/lib/contentful` import
**`src/app/page.tsx:2–3`**

```ts
import { contentful, type ProjectSkeleton } from "@/lib/contentful";
import { getAllBlogPosts } from "@/lib/contentful";
```

Two separate import statements from the same module. The linter doesn't catch this because it's not a standard ESLint rule in this config.

**Fix:** Merge into one:

```ts
import { contentful, getAllBlogPosts, type ProjectSkeleton } from "@/lib/contentful";
```

---

## Medium

### 5. Focus not trapped when mobile sidebar is open
**`src/components/sidebar-shell.tsx`**

When the sidebar drawer is open on mobile, keyboard focus can escape to the dimmed page content behind it. A user tabbing through the page will exit the sidebar and reach links and buttons that are visually hidden behind the backdrop. This fails WCAG 2.1 SC 2.1.2 (No Keyboard Trap, in the reverse sense — focus should be *contained* in the dialog).

**Fix:** Add a focus trap. The lightweight `focus-trap-react` package handles this, or implement manually by intercepting Tab/Shift+Tab within the `<aside>` and cycling back to the first focusable element.

### 6. Hardcoded email in three places
**`src/app/page.tsx:264`, `src/app/about/page.tsx:63`, `src/components/sidebar.tsx`**

`jimbo.c.tierney@gmail.com` appears as a string literal three times. One update would require three edits.

**Fix:**

```ts
// src/lib/constants.ts
export const CONTACT_EMAIL = "jimbo.c.tierney@gmail.com";
```

Import and use in all three locations.

### 7. No root error boundary
**`src/app/layout.tsx`**

There is no `error.tsx` or `not-found.tsx` at the app root. If any server component throws (e.g. a Contentful API outage), the entire page crashes with Next.js's generic error screen. Same for 404s — `notFound()` is called in dynamic routes but the fallback is Next's unstyled default.

**Fix:** Add `src/app/error.tsx` (client component with `reset()`) and `src/app/not-found.tsx` styled to match the site.

### 8. `ContentfulImage` doesn't handle `fill` mode
**`src/components/contentful-image.tsx:30–31`**

The component always passes `width` and `height` to `next/image`. If a caller passes `fill` as a spread prop via `...rest`, `next/image` will receive conflicting props (`fill` + explicit dimensions), which it rejects with a runtime error.

**Fix:** Detect `fill` in rest props and skip width/height:

```tsx
const isFill = "fill" in rest;
const finalWidth = isFill ? undefined : (width ?? imageDetails?.width ?? 1200);
const finalHeight = isFill ? undefined : (height ?? imageDetails?.height ?? 800);
```

### 9. Missing `sizes` prop on images used in grids
**`src/components/project-card.tsx`, `src/components/blog-post-card.tsx`**

Card images don't set the `sizes` attribute. Without it, the browser assumes the image fills 100vw and downloads a full-width image even when the card is rendered in a two-column grid. This inflates LCP on the projects index page.

**Fix:** Add `sizes` matching the grid breakpoints, e.g.:

```tsx
sizes="(min-width: 640px) 50vw, 100vw"
```

### 10. Lorem ipsum in production build
**`src/app/page.tsx:116`**

```tsx
Lorem ipsum placeholder bio. Replace once the /about page copy is locked.
```

This ships to the live site as-is. It also appears on the About snapshot section which is visible above the fold on desktop.

**Fix:** Replace with real copy, or pull bio from the Author entry in Contentful (same as `/about` does).

---

## Low

### 11. Skills section content is unpolished
**`src/app/page.tsx:229–244`**

Several items have inconsistent capitalization or read as rough notes:

- `Javascript` → `JavaScript`
- `svelte` → `Svelte`
- `subversion` → `Subversion`
- `"Very good at figuring things out"` — reads as placeholder; not what an employer scans a portfolio for

The section is also a plain `<ul>` of text bullets. The spec (§6.2) describes a "visual summary of core technologies" — this is not that.

**Fix:** Replace with the visual skills grid described in the spec, and fix capitalization in the interim.

### 12. Deprecated component files still in repo
**`src/components/site-header.tsx`, `src/components/site-footer.tsx`**

Both are commented as deprecated/unused. They were kept during a sandbox session when deletion wasn't possible. They are now safe to delete.

**Fix:** `rm src/components/site-header.tsx src/components/site-footer.tsx`

### 13. Scroll lock effect captures stale `original`
**`src/components/sidebar-shell.tsx:27–34`**

```ts
const original = document.body.style.overflow;
document.body.style.overflow = open ? "hidden" : original;
```

When `open` transitions to `false`, `original` is evaluated from the current DOM state — which is `"hidden"` (set by the prior open=true effect). The cleanup function correctly restores the pre-open value, but the effect body itself briefly sets overflow to `"hidden"` before the cleanup runs. In practice the effect and its cleanup are synchronous so this is invisible, but the logic is fragile.

**Fix:** Simplify to only set when opening, and always restore via cleanup:

```ts
useEffect(() => {
  if (!open) return;
  const original = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  return () => { document.body.style.overflow = original; };
}, [open]);
```

### 14. `minimumCacheTTL` not set for Next.js Image
**`next.config.ts`**

Contentful image URLs are stable (immutable per asset version). Without `minimumCacheTTL`, Next.js Image Optimization defaults to 60 seconds, causing unnecessary re-processing on Vercel.

**Fix:**

```ts
images: {
  remotePatterns: [...],
  minimumCacheTTL: 31_536_000, // 1 year
}
```

### 15. Hamburger button only opens — never toggles
**`src/components/sidebar-shell.tsx:41`**

```tsx
onClick={() => setOpen(true)}
```

On mobile, the hamburger remains visible (stacked behind the backdrop) when the drawer is open. Tapping it again calls `setOpen(true)` on an already-open sidebar — a no-op. `aria-expanded={open}` correctly reports `true`, but the interaction is misleading. The close affordance is the backdrop and the X button.

This is a minor UX point, not a blocker. Toggling is the expected behavior:

**Fix:** `onClick={() => setOpen((v) => !v)}`

---

## Not Issues (clarifying false positives)

- **`aria-expanded={open}` (boolean):** React converts boolean `aria-*` props to the strings `"true"` / `"false"` in the DOM. No change needed.
- **Type guard `"fields" in author.fields.avatar`:** This is the correct Contentful SDK idiom. Unresolved links have only `sys`; resolved entries have `fields`. The guard is accurate.
- **`dangerouslySetInnerHTML` in `MarkdownContent`:** The HTML is produced by the unified/rehype pipeline from content you control in Contentful. This is not a meaningful XSS surface — it would require a compromised Contentful account. Adding `rehype-sanitize` would strip code block HTML that `rehype-pretty-code` emits, breaking syntax highlighting. Leave as-is.
- **`tsconfig.json`:** Strict mode is enabled; no issues.

---

## Action Summary

| # | File | Action | Effort |
|---|------|---------|--------|
| 1 | sidebar-shell.tsx | Replace `bg-white` with `bg-base` | 1 min |
| 2 | all page files | Add `export const revalidate = 60` | 5 min |
| 3 | package.json | `pnpm remove react-markdown` | 1 min |
| 4 | page.tsx | Merge duplicate import | 1 min |
| 5 | sidebar-shell.tsx | Add focus trap | 30 min |
| 6 | 3 files | Extract `CONTACT_EMAIL` constant | 10 min |
| 7 | src/app/ | Add `error.tsx` + `not-found.tsx` | 1–2 hr |
| 8 | contentful-image.tsx | Handle `fill` prop | 10 min |
| 9 | card components | Add `sizes` prop | 10 min |
| 10 | page.tsx | Replace Lorem ipsum | content |
| 11 | page.tsx | Rewrite skills section | 1–2 hr |
| 12 | src/components/ | Delete deprecated files | 1 min |
| 13 | sidebar-shell.tsx | Fix scroll lock effect | 5 min |
| 14 | next.config.ts | Add `minimumCacheTTL` | 1 min |
| 15 | sidebar-shell.tsx | Toggle instead of `setOpen(true)` | 1 min |
