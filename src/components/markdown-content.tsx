import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypePrettyCode, { type Options as RehypePrettyCodeOptions } from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";

const PRETTY_CODE_OPTIONS: RehypePrettyCodeOptions = {
  theme: { light: "github-light", dark: "github-dark" },
  keepBackground: false,
};

interface MarkdownContentProps {
  source: string | undefined | null;
  className?: string;
}

export async function MarkdownContent({ source, className }: MarkdownContentProps) {
  if (!source) return null;

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypePrettyCode, PRETTY_CODE_OPTIONS)
    .use(rehypeStringify)
    .process(source);

  return (
    <div
      className={
        className ??
        "prose prose-neutral max-w-none font-mono text-ink dark:prose-invert prose-headings:font-display prose-headings:tracking-tight prose-headings:text-ink prose-a:text-ink prose-a:decoration-amber prose-a:decoration-2 prose-a:underline-offset-4 prose-strong:text-ink prose-pre:my-6 prose-pre:overflow-x-auto prose-pre:rounded-none prose-pre:border-2 prose-pre:border-ink"
      }
      dangerouslySetInnerHTML={{ __html: String(file) }}
    />
  );
}
