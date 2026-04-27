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
      className="group block border-2 border-neutral-900 p-5 transition hover:-translate-y-0.5 dark:border-neutral-100"
    >
      <div className="flex flex-col gap-3">
        {publishDate && (
          <p className="font-eyebrow text-xs uppercase tracking-[0.2em] text-neutral-600 dark:text-neutral-400">
            <time dateTime={publishDate}>
              {new Date(publishDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </p>
        )}
        <h3 className="font-display text-2xl leading-tight tracking-tight group-hover:underline">
          {title}
        </h3>
        {excerpt && (
          <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
            {excerpt}
          </p>
        )}
        {tags && tags.length > 0 && (
          <ul className="flex flex-wrap gap-2 font-eyebrow text-[10px] uppercase tracking-[0.2em]">
            {tags.map((tag) => (
              <li key={tag} className="text-neutral-600 dark:text-neutral-400">
                #{tag}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Link>
  );
}
