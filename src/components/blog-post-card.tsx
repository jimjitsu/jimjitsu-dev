import Link from "next/link";
import type { Entry } from "contentful";
import type { BlogPostSkeleton } from "@/lib/contentful";

interface BlogPostCardProps {
  post: Entry<BlogPostSkeleton, undefined, string>;
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  const { title, slug, excerpt, publishDate, tags } = post.fields;

  return (
    <Link
      href={`/blog/${slug}`}
      className="group block border-2 border-ink bg-base transition hover:-translate-y-0.5"
    >
      {/* Teal accent stripe distinguishes posts from projects. */}
      <div className="h-2 w-full bg-teal" aria-hidden="true" />
      <div className="flex flex-col gap-3 p-5">
        {publishDate && (
          <p className="font-eyebrow text-sm tracking-[0.04em] text-ink-muted">
            <time dateTime={publishDate}>
              {new Date(publishDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </p>
        )}
        <h3 className="font-display text-2xl leading-tight tracking-tight text-ink group-hover:underline group-hover:decoration-amber group-hover:decoration-2 group-hover:underline-offset-4">
          {title}
        </h3>
        {excerpt && <p className="text-sm leading-relaxed text-ink-muted">{excerpt}</p>}
        {tags && tags.length > 0 && (
          <ul className="flex flex-wrap gap-2 font-eyebrow text-xs tracking-[0.04em]">
            {tags.map((tag) => (
              <li key={tag} className="text-ink-muted">
                #{tag}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Link>
  );
}
