# Setup Guide — jimjitsu.dev

One-time steps to go from the scaffold in this folder to a running dev server, a GitHub repo, and a live Vercel preview deploy.

## 1. Install prerequisites (local machine)

- **Node.js 22.x** — the repo has a `.nvmrc` pinning to `22`. If you use `nvm-windows` or `fnm`, run `fnm use` / `nvm use` in this folder.
- **pnpm** — install globally if you don't have it:
  ```bash
  npm install -g pnpm
  ```

## 2. Install dependencies and start the dev server

From the repo root (this folder):

```bash
pnpm install
pnpm dev
```

Open <http://localhost:3000>. You should see the scaffolded home page with:

- Orbitron eyebrow labels (small, uppercase, tracked-out)
- Sancreek display headings (large, retro)
- JetBrains Mono body copy

If the fonts aren't loading, hard-refresh once — `next/font` needs to download them on first compile.

## 3. Initialize the Git repo and push to GitHub

### 3a. Create the remote repo

On GitHub (you'll do this in the browser):

1. Go to <https://github.com/new>.
2. Repository name: **`jimjitsu-dev`**.
3. Visibility: **Public**.
4. Do **not** initialize with a README, .gitignore, or license — we already have those locally.
5. Click **Create repository**.

### 3b. Push from local

Back in this folder:

```bash
git init
git add .
git commit -m "Initial scaffold: Next.js + TypeScript + Tailwind + fonts"
git branch -M main
git remote add origin https://github.com/<your-github-username>/jimjitsu-dev.git
git push -u origin main
```

Replace `<your-github-username>` with your actual GitHub handle.

## 4. Connect Vercel

1. Go to <https://vercel.com/new>.
2. Import the `jimjitsu-dev` repo (authorize GitHub access if prompted).
3. Framework preset should auto-detect as **Next.js**. Leave all defaults.
4. Click **Deploy**.

Vercel will build and deploy. After the first deploy, every push to `main` ships to production and every PR gets its own preview URL.

## 5. Attach the custom domain (`jimjitsu.dev`)

Defer this until you're ready to go live — your `*.vercel.app` URL works fine in the meantime.

When ready:

1. In the Vercel project, go to **Settings → Domains**.
2. Add `jimjitsu.dev` and `www.jimjitsu.dev`.
3. Vercel will show the DNS records you need.
4. In GoDaddy DNS:
   - Add an `A` record: host `@`, value `76.76.21.21`.
   - Add a `CNAME` record: host `www`, value `cname.vercel-dns.com.`.
5. Wait for propagation (usually minutes; can take longer).

## 6. Enable Vercel Analytics

In the Vercel project, go to **Analytics** and enable Web Analytics. Add the `@vercel/analytics` package when you're ready:

```bash
pnpm add @vercel/analytics
```

Then drop `<Analytics />` into `src/app/layout.tsx`. (We'll do this closer to launch.)

## 7. Contentful (next workstream)

Nothing to do for Contentful yet — the scaffold runs fully on hard-coded placeholder content. The next workstream will:

- Create a dedicated environment in space `glsf6lviq3r0`.
- Define the four content types (`Project`, `BlogPost`, `Author`, `SiteSettings`).
- Seed the starter entries.
- Wire up the Contentful Delivery client and markdown renderer.

Environment variables you'll eventually add (in Vercel **Settings → Environment Variables** and locally in a `.env.local` file):

```
CONTENTFUL_SPACE_ID=glsf6lviq3r0
CONTENTFUL_ENVIRONMENT=jimjitsu-dev
CONTENTFUL_ACCESS_TOKEN=<Content Delivery API token>
CONTENTFUL_PREVIEW_ACCESS_TOKEN=<Preview API token>
```

## Common commands

| Command             | What it does                                     |
| ------------------- | ------------------------------------------------ |
| `pnpm dev`          | Start the dev server at <http://localhost:3000>. |
| `pnpm build`        | Production build.                                |
| `pnpm start`        | Run the production build locally.                |
| `pnpm lint`         | ESLint.                                          |
| `pnpm typecheck`    | Strict TypeScript check (no emit).               |
| `pnpm format`       | Prettier write.                                  |
| `pnpm format:check` | Prettier check (CI-friendly).                    |
