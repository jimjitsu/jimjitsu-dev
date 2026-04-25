# Portfolio Site & Blog — Project Specification

**Status:** v1.0 — ready for build
**Owner:** Jim Tierney
**Last updated:** 2026-04-24

---

## 1. Overview

A personal portfolio and blog for a frontend engineer. The site serves as a professional home on the web: a place to showcase project work, publish writing, and provide a clear path for prospective employers, collaborators, and readers to learn about the author and get in touch.

The site will be a multi-page React/Next.js application, with long-form content (projects and blog posts) managed through Contentful as a headless CMS.

## 2. Goals

- Present a polished, performant first impression that reflects strong frontend craftsmanship.
- Make it easy to add and update projects and blog posts without code changes (via Contentful).
- Rank well in search for the author's name and for blog post topics.
- Be fast, accessible, and mobile-friendly by default.
- Serve as a living demonstration of the author's own frontend capabilities.

## 3. Non-Goals (for v1)

- E-commerce, paid subscriptions, or gated content.
- User accounts, comments, or other user-generated content.
- Multi-language / i18n support.
- A CMS-driven design system (visual design lives in code; only content lives in Contentful).
- Newsletter signup / email capture.
- `/now` and `/uses` pages.
- Custom contact form (mailto + social links only for v1).
- Tag pages, tag filtering, and on-site search (deferred to v1.1+).

## 4. Target Audience

- **Hiring managers and recruiters** evaluating the author for frontend roles.
- **Fellow engineers** looking at project case studies or reading blog posts.
- **Potential collaborators or clients** exploring a working relationship.

## 5. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js (App Router) | SSG/ISR for content pages; SSR where dynamic. |
| Language | TypeScript | Strict mode. |
| UI | React 18+ | Server Components where appropriate. |
| Content format | **Markdown** (GFM) | Project case studies and blog posts authored as markdown in Contentful. Rendered with `react-markdown` + `remark-gfm` + syntax highlighting via `rehype-pretty-code` (Shiki). |
| Styling | **Tailwind CSS** | Utility-first, with `@tailwindcss/typography` for long-form markdown content. |
| CMS | Contentful | Headless, fetched at build time (ISR) via Contentful Delivery API. |
| Hosting | **Vercel** | Zero-config Next.js deploys; preview URLs per PR; Vercel Image Optimization. |
| Analytics | **Vercel Analytics** | Enabled via the Vercel dashboard at launch. |
| Contact | **Mailto + social links** | No form backend in v1. Email link in footer and home CTA. |
| Package manager | pnpm | Fast installs, disk-efficient. |
| Testing | Vitest + Playwright *(post-MVP)* | Not blocking v1 launch; add when the site stabilizes. |

## 6. Site Architecture

### 6.1 Page Map

- `/` — Home
- `/projects` — Projects index
- `/projects/[slug]` — Individual project case study
- `/blog` — Blog index (with pagination)
- `/blog/[slug]` — Individual blog post
- `/about` — About page (dedicated), plus a shorter About section on the home page
- `/resume.pdf` — Downloadable resume (static file served from `/public`)
- `/404`, `/500` — Error pages
- `/rss.xml`, `/sitemap.xml`, `/robots.txt` — Feeds & SEO

### 6.2 Homepage Sections

The homepage is composed of multiple overview sections, stacked vertically. Proposed sections (to be refined):

1. **Hero** — Name, role, one-line value proposition, primary CTAs (e.g., "See projects", "Read the blog").
2. **About snapshot** — Short bio paragraph with a "More about me" link to `/about` and a "Download resume" link to `/resume.pdf`.
3. **Featured projects** — 2–4 hand-picked projects pulled from Contentful.
4. **Recent writing** — 3 most recent blog posts.
5. **Skills / tech** — Visual summary of core technologies.
6. **Contact / footer CTA** — Mailto link plus social icons (GitHub, LinkedIn, etc.).

### 6.3 Projects Section

- Index page lists all projects with thumbnail, title, short description, and tags.
- Filterable or sortable by tag/technology *(optional — v1.1)*.
- Project detail page renders a long-form markdown case study: hero image, problem statement, role, tech stack, write-up with embedded images and code blocks, links to live site and repo.

### 6.4 Blog Section

- Index page lists posts in reverse-chronological order with title, date, excerpt, and tags.
- Pagination or infinite scroll for older posts *(pagination preferred for SEO)*.
- Post detail page renders markdown from Contentful: headings, images, code blocks with syntax highlighting, blockquotes, links.
- Tag pages at `/blog/tag/[tag]` *(optional — v1.1)*.
- RSS feed at `/rss.xml`.

## 7. Content Model (Contentful)

All long-form body fields use Contentful's **Long text** field type, which the Contentful UI renders with a built-in markdown editor (preview + basic toolbar). No Rich Text fields in v1.

Images referenced inside markdown bodies use either (a) markdown image syntax pointing at Contentful asset URLs, or (b) a simple custom syntax (e.g., `![alt](contentful:assetId)`) that the renderer resolves to a `next/image` component for optimization. Decide the exact approach during build.

Field lists are starting points and will be refined.

### 7.1 `Project`

- `title` (Short text, required)
- `slug` (Short text, required, unique)
- `summary` (Short text) — used on cards and meta description
- `coverImage` (Media, required)
- `gallery` (Media, multiple)
- `role` (Short text)
- `technologies` (Short text, list)
- `liveUrl` (Short text)
- `repoUrl` (Short text)
- `body` (**Long text / markdown**) — full case study
- `featured` (Boolean) — surfaced on home
- `publishDate` (Date)
- `order` (Integer) — manual sort override

### 7.2 `BlogPost`

- `title` (Short text, required)
- `slug` (Short text, required, unique)
- `excerpt` (Short text) — used on cards and meta description
- `coverImage` (Media)
- `body` (**Long text / markdown**, required)
- `tags` (Short text, list)
- `publishDate` (Date, required)
- `author` (Reference → `Author`)
- `canonicalUrl` (Short text) — for cross-posted content
- `featured` (Boolean)

### 7.3 `Author`

- `name` (Short text)
- `bio` (Long text / markdown)
- `avatar` (Media)
- `socialLinks` (JSON or references)

### 7.4 `SiteSettings` (singleton)

- `siteTitle`, `siteDescription`, `ogImage`, `navLinks`, `footerLinks`, `socialLinks`.

## 8. Design & UX

### 8.1 Aesthetic

A mashup of **brutalist web design** and a **retro bowling alley** aesthetic.

- Brutalist influence: raw structural layouts, heavy borders, stark contrast, exposed grid, minimal decoration around the content itself, confident use of negative space.
- Retro bowling alley influence: delivered through iconography, graphic elements, color, and texture — pins, balls, lane arrows, score-sheet marks, starburst/atomic-age shapes, mid-century signage vibes, neon accents.
- The tension between the two (cold-brutalist structure, warm-retro decoration) is the point.

### 8.2 Typography

Heading pattern: a short pre-heading in Orbitron (small, uppercase, tracked out) sitting above a larger display heading in Sancreek.

| Role | Font | Source | Notes |
|---|---|---|---|
| Display / primary heading | **Sancreek** | Google Fonts | Used for `h1`–`h2` at larger sizes. Western/carnival character — carries the retro personality. |
| Pre-heading / eyebrow / small heading | **Orbitron** | Google Fonts | Used inside an element like `<span class="eyebrow">` or `<small>` above the Sancreek heading. Geometric, futuristic foil to Sancreek. |
| Body copy | **JetBrains Mono** | Google Fonts | Consolas was the target vibe, but isn't freely web-licensed. JetBrains Mono is a close, free substitute. |

Loading: all fonts via `next/font` for self-hosting and zero layout shift.

### 8.3 Color

Palette TBD, but the bowling-alley direction points toward a mid-century palette: cream/bone as a base, deep teal or turquoise, mustard/amber, warm red, with the option of neon pink or electric blue as an accent. Brutalism pushes us toward strong contrast and a small number of colors used with conviction.

Light and dark themes, with system preference as default.

### 8.4 Motion & Interaction

Subtle, intentional. Respect `prefers-reduced-motion`. Any bowling-themed motion (rolling, knocking over, score tallying) used sparingly — at most one or two signature moments.

### 8.5 Iconography & Graphic Elements

The retro bowling vibe comes through largely in graphics rather than typography or color alone. Options to explore in the design pass:

- Pins, balls, lane arrows, starburst shapes, score-sheet symbols (X for strike, / for spare).
- Style direction TBD: flat vector, screenprint/textured, hand-drawn, or atomic-age geometric.

### 8.6 Responsiveness & Accessibility

- Mobile-first; test at 375px, 768px, 1024px, 1440px.
- Accessibility target: WCAG 2.1 AA. Keyboard nav, visible focus, alt text on all images, semantic landmarks, color contrast checked.
- Sancreek is a display face — use it only at large sizes and keep body copy in the monospace face for readability.

## 9. Performance

- Core Web Vitals: LCP < 2.5s, INP < 200ms, CLS < 0.1 on median mobile.
- Use `next/image` for all Contentful and local imagery.
- Static generation (`generateStaticParams`) for all project and post pages.
- Incremental Static Regeneration for content freshness without rebuilds.
- Minimal client-side JavaScript; lean into React Server Components.
- Lighthouse score target: 95+ across Performance, Accessibility, Best Practices, SEO.

## 10. SEO

- Per-page `<title>` and meta description driven by Contentful content.
- Open Graph and Twitter Card tags on every page.
- JSON-LD structured data: `Person` on `/about`, `Article` on blog posts, `BreadcrumbList` on nested pages.
- Auto-generated `sitemap.xml` and `robots.txt`.
- Canonical URLs, including support for cross-posted blog content.

## 11. Analytics & Observability

- **Vercel Analytics** enabled at launch via the Vercel dashboard.
- Error tracking: deferred past MVP. Add Sentry or similar once the site sees real traffic.
- Uptime monitoring: not needed for v1.

## 12. Build, Deploy, & Content Workflow

- **Source control:** GitHub, with PR-based workflow.
- **CI:** Run typecheck, lint, and tests on every PR.
- **Preview deploys:** Every PR gets a preview URL.
- **Content updates:** Contentful webhook → revalidate affected pages via on-demand ISR.
- **Environments:** `production` (main branch) and `preview` (PRs). Contentful spaces: single space with preview + published environments, or a dedicated preview space *(TBD)*.

## 13. Decisions Log

Resolved 2026-04-24:

1. **Styling:** Tailwind CSS, with `@tailwindcss/typography` for rich-text.
2. **Hosting:** Vercel.
3. **About:** Short About section on home + dedicated `/about` page.
4. **Contact:** Mailto link + social links only — no form in v1.
5. **Design direction:** Rough ideas in hand; needs a follow-up design conversation to finalize typography, color, and tone before build starts.
6. **v1 feature adds:** Resume / CV download (`/resume.pdf`). No newsletter, `/now`, or `/uses`.
7. **Timeline:** MVP in 1–2 weeks.
8. **Launch content:** Small starter set — 1–3 projects and 1–3 blog posts.
9. **Domain:** `jimjitsu.dev`, registered via GoDaddy. DNS managed at GoDaddy; point `A` / `CNAME` records to Vercel at launch (no nameserver change required).
10. **Contentful:** Reuse the existing space (ID `glsf6lviq3r0`). Treat as a clean slate — current draft entries will not be migrated. Project lives in a dedicated environment within the space (e.g., a `jimjitsu-dev` environment branched from `master`) so content authoring stays isolated.
11. **GitHub repo:** Public, named `jimjitsu-dev`. Repo itself is part of the portfolio.
12. **Analytics:** Vercel Analytics at launch.

## 14. Launch Starter Content

Both projects and posts will be stubbed with placeholders during the build so pages can be wired up before the final copy lands.

### 14.1 Projects (3)

**1. Visit Utah**
- Role: Lead Frontend Developer
- Employer/agency: Hanson Dodge
- Tech: Kentico CMS backend. Custom design system, reorderable parallax components, light scroll-jacking on the frontend.
- Story angle: How a robust, well-specified design system can empower content editors — giving them a deep kit of composable, reorderable components so they can build visually rich, story-driven pages without needing a developer for every new layout.
- Assets to gather: hero imagery, screenshots, live URL, any case-study details Jim wants to add.

**2. Medical College of Wisconsin**
- Role: Lead Frontend Developer
- Employer/agency: Hanson Dodge
- Tech: Sitecore backend with a re-themeable design system on the frontend.
- Story angle: Empowering a large organization with a diverse range of departments and content editors — a shared toolkit that gives individual departments and editors meaningful freedom (layout, emphasis, imagery, theming) while preserving a unified brand aesthetic across the whole institution.
- Assets to gather: hero imagery, screenshots, live URL, case-study details.

**3. Snow Basin & Sun Valley — dual site build**
- Role: Lead Frontend Developer
- Employer/agency: Hanson Dodge
- Tech (from resume): Kentico CMS, shared frontend codebase serving two distinct brands simultaneously.
- Story angle: One FE codebase, two brands — how the tooling was structured to support parallel themed builds without duplication.
- Assets to gather: screenshots from both sites, live URLs, details on the theming/tooling approach.

### 14.2 Blog Posts (3)

**1. Building this portfolio site**
- Working title: TBD (e.g., "Building jimjitsu.dev: Next.js + Contentful from scratch")
- Angle: The build itself — decisions made (why Next.js App Router, why Contentful, why Tailwind), tradeoffs, gotchas, what'd be different in hindsight.
- Status: Write as the site gets built; publish at or shortly after launch.

**2. Building a Fortnite map**
- Working title: TBD
- Angle: Experience building a Fortnite creative map — design, iteration, what translated (or didn't) from web work to game dev.
- Status: To be written. Original content; no cross-post.

**3. (Third post — TBD)**
- Topic and angle: TBD. Pick before launch.
- A few pitch directions if helpful: a tech-opinion piece (e.g., lessons from years of shipping design systems), a short tutorial from your day-to-day toolkit, or a career-perspective piece (the 10+ year FE dev arc).

## 15. Still to Discuss

- **Color palette:** Defer to the mockup phase. Settle specific hex values for base, accent, and neutrals in both light and dark themes alongside the first mockups.
- **Iconography style:** Flat vector vs. screenprint/textured vs. hand-drawn vs. atomic-age geometric. Settle alongside mockups.
- Pick the third blog post topic.

## 16. Milestones — 1 to 2 Week MVP Plan

Aggressive timeline; scope is deliberately trimmed. Anything not in this list is post-launch.

**Days 1–2 — Spec lock & design direction**
- Close out the items in §14 (design direction, domain, Contentful space).
- Pick typography, color palette, and one or two reference sites for visual direction.

**Days 3–4 — Scaffold**
- Next.js (App Router) + TypeScript + Tailwind + ESLint + Prettier.
- GitHub repo, Vercel project, preview deploys wired up.
- Base layout, header, footer, nav, light/dark theme toggle.

**Days 5–7 — Core pages with placeholder content**
- Home (all six sections) with hardcoded content.
- `/about` page.
- `/projects` and `/projects/[slug]` — static shell.
- `/blog` and `/blog/[slug]` — static shell with rich-text styling.
- Resume download link in place.

**Days 8–10 — Contentful integration**
- Set up Contentful space and content models (`Project`, `BlogPost`, `Author`, `SiteSettings`).
- Seed the starter content: 1–3 projects and 1–3 blog posts.
- Replace hardcoded content with Contentful fetches; wire ISR revalidation.
- Rich-text renderer (with embedded images and code blocks).

**Days 11–12 — Polish & launch prep**
- SEO: per-page metadata, Open Graph, JSON-LD, sitemap, RSS, robots.
- Analytics enabled.
- Lighthouse pass, accessibility sweep, 375px/768px/1440px visual QA.
- Custom domain + DNS.

**Day 13–14 — Launch & buffer**
- Deploy to production. Smoke test. Announce.

**Post-launch backlog (explicitly out of scope for v1):**
- Tag pages and tag filtering on `/blog` and `/projects`.
- On-site search.
- Newsletter signup.
- `/now` and `/uses` pages.
- Custom contact form with serverless route.
- Comments or reactions.
- Error tracking (Sentry).
