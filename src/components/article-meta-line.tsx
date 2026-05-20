interface ArticleMetaLineProps {
  publishDate: string;
  author?: string;
  tags?: string[];
}

export function ArticleMetaLine({ publishDate, author, tags }: ArticleMetaLineProps) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 font-eyebrow text-xs tracking-[0.04em] text-ink-muted">
      <time dateTime={publishDate}>
        {new Date(publishDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </time>
      {author && <span>· {author}</span>}
      {tags && tags.length > 0 && <span>· {tags.map((t) => `#${t}`).join(" ")}</span>}
    </div>
  );
}
