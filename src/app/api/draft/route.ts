import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

/**
 * Enables Next.js Draft Mode so Contentful drafts render via the preview client.
 * Point Contentful's preview URL here:
 *   /api/draft?secret=<CONTENTFUL_PREVIEW_SECRET>&slug=/blog/<slug>
 *
 * Draft Mode sets a cookie that bypasses the static/ISR cache for this session
 * only — published visitors are unaffected. Exit via /api/draft/disable.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug") ?? "/";

  const expected = process.env.CONTENTFUL_PREVIEW_SECRET;
  if (!expected || secret !== expected) {
    return new Response("Invalid preview secret.", { status: 401 });
  }

  // Only allow site-relative paths — never an absolute or protocol-relative URL.
  const safeSlug = slug.startsWith("/") && !slug.startsWith("//") ? slug : "/";

  (await draftMode()).enable();
  redirect(safeSlug);
}
