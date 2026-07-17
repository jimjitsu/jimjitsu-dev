import {
  createClient,
  type ContentfulClientApi,
  type Entry,
  type EntryFieldTypes,
} from "contentful";

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

// Lazily-created client singletons. Importing this module never throws when
// Contentful env is absent — so `next build`, the chat route, and CI on
// Dependabot/fork PRs (which don't receive repo secrets) all still work.
// getClient() returns null without env, and the fetch helpers below degrade
// to empty results.
let deliveryClientSingleton: ContentfulClientApi<undefined> | null = null;
let previewClientSingleton: ContentfulClientApi<undefined> | null = null;

function getDeliveryClient(): ContentfulClientApi<undefined> | null {
  const space = process.env.CONTENTFUL_SPACE_ID;
  const accessToken = process.env.CONTENTFUL_DELIVERY_TOKEN;
  if (!space || !accessToken) return null;
  deliveryClientSingleton ??= createClient({
    space,
    environment: process.env.CONTENTFUL_ENVIRONMENT ?? "master",
    accessToken,
  });
  return deliveryClientSingleton;
}

function getPreviewClient(): ContentfulClientApi<undefined> | null {
  const space = process.env.CONTENTFUL_SPACE_ID;
  const accessToken = process.env.CONTENTFUL_PREVIEW_TOKEN;
  if (!space || !accessToken) return null;
  previewClientSingleton ??= createClient({
    space,
    environment: process.env.CONTENTFUL_ENVIRONMENT ?? "master",
    accessToken,
    host: "preview.contentful.com",
  });
  return previewClientSingleton;
}

/**
 * Pick the right client based on whether we're in draft/preview mode. Returns
 * null when the required env vars are absent — callers must handle that (the
 * fetch helpers below do). Pages can pass `draft` from `await draftMode()`.
 */
export function getClient(draft = false): ContentfulClientApi<undefined> | null {
  if (draft) return getPreviewClient() ?? getDeliveryClient();
  return getDeliveryClient();
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

export async function getAllProjects(
  opts: { draft?: boolean } = {},
): Promise<{ items: Entry<ProjectSkeleton, undefined, string>[] }> {
  const client = getClient(opts.draft);
  if (!client) return { items: [] };
  return client.getEntries<ProjectSkeleton>({
    content_type: "project",
    order: ["fields.order", "-fields.publishDate"],
    limit: 1000, // Contentful's max page size; lifts the silent 100-entry default.
  });
}

export async function getProjectBySlug(slug: string, opts: { draft?: boolean } = {}) {
  const client = getClient(opts.draft);
  if (!client) return null;
  const entries = await client.getEntries<ProjectSkeleton>({
    content_type: "project",
    "fields.slug": slug,
    limit: 1,
  });
  return entries.items[0] ?? null;
}

export async function getAllBlogPosts(
  opts: { draft?: boolean } = {},
): Promise<{ items: Entry<BlogPostSkeleton, undefined, string>[] }> {
  const client = getClient(opts.draft);
  if (!client) return { items: [] };
  return client.getEntries<BlogPostSkeleton>({
    content_type: "blogPost",
    order: ["-fields.publishDate"],
    limit: 1000, // Contentful's max page size; lifts the silent 100-entry default.
  });
}

export async function getBlogPostBySlug(slug: string, opts: { draft?: boolean } = {}) {
  const client = getClient(opts.draft);
  if (!client) return null;
  const entries = await client.getEntries<BlogPostSkeleton>({
    content_type: "blogPost",
    "fields.slug": slug,
    limit: 1,
  });
  return entries.items[0] ?? null;
}

export async function getFeaturedProjects(
  opts: { draft?: boolean; limit?: number } = {},
): Promise<{ items: Entry<ProjectSkeleton, undefined, string>[] }> {
  const client = getClient(opts.draft);
  if (!client) return { items: [] };
  return client.getEntries<ProjectSkeleton>({
    content_type: "project",
    "fields.featured": true,
    order: ["fields.order", "-fields.publishDate"],
    limit: opts.limit ?? 4,
  });
}

export async function getPrimaryAuthor(opts: { draft?: boolean } = {}) {
  const client = getClient(opts.draft);
  if (!client) return null;
  const entries = await client.getEntries<AuthorSkeleton>({
    content_type: "author",
    limit: 1,
  });
  return entries.items[0] ?? null;
}

export async function getSiteSettings(opts: { draft?: boolean } = {}) {
  const client = getClient(opts.draft);
  if (!client) return null;
  const entries = await client.getEntries<SiteSettingsSkeleton>({
    content_type: "siteSettings",
    limit: 1,
  });
  return entries.items[0] ?? null;
}
