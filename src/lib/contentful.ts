import { createClient, type ContentfulClientApi, type EntryFieldTypes } from "contentful";

/* -------------------------------------------------------------------------- */
/* Type definitions — mirror the content types in migrations/0001-...        */
/* -------------------------------------------------------------------------- */

export type AuthorSkeleton = {
  contentTypeId: "author";
  fields: {
    name: EntryFieldTypes.Symbol;
    bio?: EntryFieldTypes.Text;
    avatar?: EntryFieldTypes.AssetLink;
    socialLinks?: EntryFieldTypes.Object<Record<string, string>>;
  };
};

export type ProjectSkeleton = {
  contentTypeId: "project";
  fields: {
    title: EntryFieldTypes.Symbol;
    slug: EntryFieldTypes.Symbol;
    summary: EntryFieldTypes.Symbol;
    coverImage: EntryFieldTypes.AssetLink;
    gallery?: EntryFieldTypes.Array<EntryFieldTypes.AssetLink>;
    role?: EntryFieldTypes.Symbol;
    technologies?: EntryFieldTypes.Array<EntryFieldTypes.Symbol>;
    liveUrl?: EntryFieldTypes.Symbol;
    repoUrl?: EntryFieldTypes.Symbol;
    body?: EntryFieldTypes.Text;
    featured?: EntryFieldTypes.Boolean;
    publishDate?: EntryFieldTypes.Date;
    order?: EntryFieldTypes.Integer;
  };
};

export type BlogPostSkeleton = {
  contentTypeId: "blogPost";
  fields: {
    title: EntryFieldTypes.Symbol;
    slug: EntryFieldTypes.Symbol;
    excerpt?: EntryFieldTypes.Symbol;
    coverImage?: EntryFieldTypes.AssetLink;
    body: EntryFieldTypes.Text;
    tags?: EntryFieldTypes.Array<EntryFieldTypes.Symbol>;
    publishDate: EntryFieldTypes.Date;
    author?: EntryFieldTypes.EntryLink<AuthorSkeleton>;
    canonicalUrl?: EntryFieldTypes.Symbol;
    featured?: EntryFieldTypes.Boolean;
  };
};

export type SkillGroup = { label: string; items: string[] };

export type SiteSettingsSkeleton = {
  contentTypeId: "siteSettings";
  fields: {
    siteTitle: EntryFieldTypes.Symbol;
    siteDescription: EntryFieldTypes.Symbol;
    ogImage?: EntryFieldTypes.AssetLink;
    navLinks?: EntryFieldTypes.Object<Array<{ label: string; href: string }>>;
    footerLinks?: EntryFieldTypes.Object<Array<{ label: string; href: string }>>;
    socialLinks?: EntryFieldTypes.Object<Record<string, string>>;
    heroTitle?: EntryFieldTypes.Symbol;
    heroBio?: EntryFieldTypes.Text;
    sidebarBio?: EntryFieldTypes.Symbol;
    skills?: EntryFieldTypes.Object<SkillGroup[]>;
    attributes?: EntryFieldTypes.Object<string[]>;
  };
};

/* -------------------------------------------------------------------------- */
/* Client                                                                     */
/* -------------------------------------------------------------------------- */

const space = process.env.CONTENTFUL_SPACE_ID;
const environment = process.env.CONTENTFUL_ENVIRONMENT ?? "master";
const deliveryToken = process.env.CONTENTFUL_DELIVERY_TOKEN;
const previewToken = process.env.CONTENTFUL_PREVIEW_TOKEN;

if (!space || !deliveryToken) {
  // Throw at module init to fail fast in dev. In a future iteration we may
  // soften this so non-Contentful pages can still build during scaffold work.
  throw new Error(
    "Contentful env vars missing. Copy .env.local.example to .env.local and fill them in.",
  );
}

/**
 * The default Contentful Delivery client — published content only.
 * Use this for production reads.
 */
export const contentful: ContentfulClientApi<undefined> = createClient({
  space,
  environment,
  accessToken: deliveryToken,
});

/**
 * Preview client — returns draft content. Only initialized if a preview token
 * is configured. Use behind a draft-mode check.
 */
export const contentfulPreview: ContentfulClientApi<undefined> | null = previewToken
  ? createClient({
      space,
      environment,
      accessToken: previewToken,
      host: "preview.contentful.com",
    })
  : null;

/**
 * Pick the right client based on whether we're in draft/preview mode.
 * Pages can pass `draft` from `await draftMode()` (Next.js).
 */
export function getClient(draft = false): ContentfulClientApi<undefined> {
  if (draft && contentfulPreview) return contentfulPreview;
  return contentful;
}

/* -------------------------------------------------------------------------- */
/* Helpers — thin wrappers for the most common fetches.                      */
/* -------------------------------------------------------------------------- */

/**
 * Contentful asset URLs are protocol-relative (`//images.ctfassets.net/...`).
 * Normalize to https so they work in metadata, RSS, and next/image.
 */
export function resolveAssetUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined;
  return url.startsWith("//") ? `https:${url}` : url;
}

export async function getAllProjects(opts: { draft?: boolean } = {}) {
  const client = getClient(opts.draft);
  return client.getEntries<ProjectSkeleton>({
    content_type: "project",
    order: ["fields.order", "-fields.publishDate"],
  });
}

export async function getProjectBySlug(slug: string, opts: { draft?: boolean } = {}) {
  const client = getClient(opts.draft);
  const entries = await client.getEntries<ProjectSkeleton>({
    content_type: "project",
    "fields.slug": slug,
    limit: 1,
  });
  return entries.items[0] ?? null;
}

export async function getAllBlogPosts(opts: { draft?: boolean } = {}) {
  const client = getClient(opts.draft);
  return client.getEntries<BlogPostSkeleton>({
    content_type: "blogPost",
    order: ["-fields.publishDate"],
  });
}

export async function getBlogPostBySlug(slug: string, opts: { draft?: boolean } = {}) {
  const client = getClient(opts.draft);
  const entries = await client.getEntries<BlogPostSkeleton>({
    content_type: "blogPost",
    "fields.slug": slug,
    limit: 1,
  });
  return entries.items[0] ?? null;
}

export async function getFeaturedProjects(opts: { draft?: boolean; limit?: number } = {}) {
  const client = getClient(opts.draft);
  return client.getEntries<ProjectSkeleton>({
    content_type: "project",
    "fields.featured": true,
    order: ["fields.order", "-fields.publishDate"],
    limit: opts.limit ?? 4,
  });
}

export async function getPrimaryAuthor(opts: { draft?: boolean } = {}) {
  const client = getClient(opts.draft);
  const entries = await client.getEntries<AuthorSkeleton>({
    content_type: "author",
    limit: 1,
  });
  return entries.items[0] ?? null;
}

export async function getSiteSettings(opts: { draft?: boolean } = {}) {
  const client = getClient(opts.draft);
  const entries = await client.getEntries<SiteSettingsSkeleton>({
    content_type: "siteSettings",
    limit: 1,
  });
  return entries.items[0] ?? null;
}
