import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { getAllBlogPosts } from "@/lib/contentful";
import { BlogPostCard } from "@/components/blog-post-card";
import { BowlingPinIcon } from "@/components/icons";
import { PageHeader } from "@/components/page-header";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog",
  description: "Writing by Jim Tierney on frontend, design systems, and adjacent territory.",
  alternates: { canonical: "/blog" },
};

export default async function BlogIndexPage() {
  const { isEnabled: draft } = await draftMode();
  const { items: posts } = await getAllBlogPosts({ draft });

  return (
    <main className="mx-auto flex min-h-dvh max-w-4xl flex-col gap-10 px-6 py-16 sm:px-10 sm:py-20">
      <PageHeader
        eyebrow="From the blog"
        icon={<BowlingPinIcon size={16} className="text-amber" />}
        title="Writing."
        description="Notes on frontend craft, design systems, and the projects I'm working on."
      />

      {posts.length === 0 ? (
        <p className="text-sm text-ink-muted">No posts published yet.</p>
      ) : (
        <ul className="grid gap-6">
          {posts.map((post) => (
            <li key={post.sys.id}>
              <BlogPostCard post={post} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
