# Contentful Setup

End-to-end walkthrough for setting up the `jimjitsu-dev` environment in Contentful, applying content type migrations, and authoring the first entries.

You only need to do steps 1–5 once.

---

## 1. Create the dedicated environment

Content lives in space **`glsf6lviq3r0`**. We don't write to `master` directly — every change happens in a dedicated environment first.

1. Open the Contentful web app and switch to the space.
2. **Settings → Environments**.
3. Click **Add environment**.
4. **ID:** `jimjitsu-dev`
5. **Source:** `master` (clones the existing structure — fine even though we treat it as a clean slate).
6. Save.

You should now see two environments: `master` and `jimjitsu-dev`. The header in the Contentful UI shows which one you're working in — make sure it says `jimjitsu-dev` for everything below.

## 2. Generate API tokens

Three tokens are needed. All three live in **Settings → API keys**.

### 2a. Content Management Token (CMA)

Used by the migration scripts to create/modify content types. **Generated once, used locally.**

1. **Settings → API keys → Content management tokens** tab.
2. Click **Generate personal token**.
3. Name it something like `jim-cli-local`.
4. Copy the token immediately — Contentful only shows it once.

### 2b. Delivery + Preview tokens

Used at runtime by the Next.js app to fetch published / draft content.

1. **Settings → API keys → Content delivery / preview tokens** tab.
2. Click **Add API key**.
3. Name it `jimjitsu-dev`.
4. Under **Environments**, check `jimjitsu-dev` (and only that one for now).
5. Save. The key page now shows two tokens:
   - **Content Delivery API - access token** → goes into `CONTENTFUL_DELIVERY_TOKEN`
   - **Content Preview API - access token** → goes into `CONTENTFUL_PREVIEW_TOKEN`

## 3. Wire env vars locally

Copy the example file and fill in the three tokens:

```bash
copy .env.local.example .env.local
```

Then edit `.env.local`:

```env
CONTENTFUL_SPACE_ID=glsf6lviq3r0
CONTENTFUL_ENVIRONMENT=jimjitsu-dev
CONTENTFUL_MANAGEMENT_TOKEN=<the CMA token from step 2a>
CONTENTFUL_DELIVERY_TOKEN=<the delivery token from step 2b>
CONTENTFUL_PREVIEW_TOKEN=<the preview token from step 2b>
```

`.env.local` is in `.gitignore` — it should never be committed. (Verify with `git status` if you're unsure.)

## 4. Run the initial migration

This creates the four content types (`Author`, `Project`, `BlogPost`, `SiteSettings`) defined in `migrations/0001-initial-content-types.cjs`:

```bash
pnpm install         # if you haven't, to pick up contentful-cli + dotenv-cli
pnpm contentful:migrate:initial
```

The CLI will print a plan, then prompt to confirm. Type `y`. After it finishes, refresh **Content model** in the Contentful UI — you should see all four types.

If you hit an error like "ContentType already exists", the migration was partially applied. The simplest recovery is to delete the `jimjitsu-dev` environment and recreate it (step 1), then re-run.

## 5. Author the first entries

In the `jimjitsu-dev` environment:

### 5a. Create yourself as an Author

**Content → Add entry → Author**.

- **Name:** Jim Tierney
- **Bio:** A short markdown bio (a sentence or two for now).
- **Avatar:** Upload a headshot (skip if you don't have one yet).
- **Social links:** A JSON object, e.g.:
  ```json
  {
    "github": "https://github.com/<your-handle>",
    "linkedin": "https://www.linkedin.com/in/jimbo-c-tierney/"
  }
  ```

Save → **Publish**.

### 5b. Create the SiteSettings singleton

**Content → Add entry → Site settings**. Only ever create one of these.

- **Site title:** `Jim Tierney`
- **Site description:** Single sentence used as the default meta description.
- **OG image:** Upload a 1200x630 image (can stub for now).
- **Nav links:** JSON, e.g.:
  ```json
  [
    { "label": "Projects", "href": "/projects" },
    { "label": "Blog", "href": "/blog" },
    { "label": "About", "href": "/about" }
  ]
  ```
- **Footer links:** Same shape; can be empty for now.
- **Social links:** JSON object as above.

Save → **Publish**.

### 5c. Create the three projects

For each project, **Content → Add entry → Project**. Field reference:

| Field        | Notes                                              |
| ------------ | -------------------------------------------------- |
| Title        | Plain text                                         |
| Slug         | Lowercase, hyphens only — e.g. `visit-utah`        |
| Summary      | One-line card description                          |
| Cover image  | Upload to media                                    |
| Gallery      | Optional — additional screenshots                  |
| Role         | "Lead Frontend Developer"                          |
| Technologies | Array of short strings                             |
| Live URL     | The deployed site URL                              |
| Repo URL     | Optional                                           |
| Body         | Long-form markdown case study                      |
| Featured     | `true` for any you want surfaced on the home page  |
| Publish date | When it shipped                                    |
| Sort order   | Optional manual override; lower = earlier in lists |

The three to create (per spec §14.1): **Visit Utah**, **Medical College of Wisconsin**, **Snow Basin & Sun Valley**.

### 5d. Create the two blog posts (third is TBD)

**Content → Add entry → Blog post**.

| Field         | Notes                                                                   |
| ------------- | ----------------------------------------------------------------------- |
| Title         | Plain text                                                              |
| Slug          | Lowercase, hyphens only                                                 |
| Excerpt       | Used on cards and meta description                                      |
| Cover image   | Optional                                                                |
| Body          | Markdown — supports code blocks with syntax highlighting at render time |
| Tags          | Array of strings                                                        |
| Publish date  | Required — drives ordering and is shown on the post                     |
| Author        | Link to the Author entry from 5a                                        |
| Canonical URL | Only fill if cross-posting from elsewhere                               |
| Featured      | Optional                                                                |

The two to create: **Building this portfolio site**, **Building a Fortnite map**. Both can start as drafts.

## 6. Add env vars to Vercel (when you're ready to deploy)

In the Vercel project for `jimjitsu-dev`:

1. **Settings → Environment Variables**.
2. Add the same five vars from `.env.local`. Scope each to **Production** + **Preview** (and **Development** if you want `vercel env pull` to grab them).

Re-deploy after adding so the new env is picked up.

## Future migrations

Each future content-model change is a new numbered file in `migrations/`:

- `0002-add-something.cjs`
- `0003-rename-field.cjs`

Each migration must be **idempotent within a single environment** (don't re-run an already-applied migration — Contentful will error). Add a corresponding `pnpm contentful:migrate <path>` invocation when you make one.

## Troubleshooting

- **"Cannot find module 'dotenv-cli'"** — run `pnpm install`.
- **"Provided access token is invalid"** — your CMA token is wrong, expired, or scoped to a different space. Regenerate.
- **"Could not resolve 'master'"** — `CONTENTFUL_ENVIRONMENT` isn't set in `.env.local` or you forgot to create the `jimjitsu-dev` environment.
- **Content type already exists** — migration was partially applied. Delete the environment and recreate, or write a corrective migration.
