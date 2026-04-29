import type { Metadata } from "next";
import { getAllBlogPosts } from "@/lib/contentful";
import { BlogPostCard } from "@/components/blog-post-card";
import { BowlingPinIcon } from "@/components/icons";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog",
  description: "Writing by Jim Tierney on frontend, design systems, and adjacent territory.",
};

export default async function BlogIndexPage() {
  const { items: posts } = await getAllBlogPosts();

  return (
    <main className="mx-auto flex min-h-dvh max-w-4xl flex-col gap-10 px-6 py-16 sm:px-10 sm:py-20">
      <header className="flex flex-col gap-4">
        <p className="eyebrow flex items-center gap-2">
          <BowlingPinIcon size={16} className="text-amber" />
          From the blog
        </p>
        <h1 className="display-heading">Writing.</h1>
        <p className="max-w-2xl text-base leading-relaxed text-ink-muted">
          Notes on frontend craft, design systems, and the projects I&apos;m working on.
        </p>
      </header>

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
