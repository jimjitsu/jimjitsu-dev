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
        "prose prose-neutral max-w-none font-mono dark:prose-invert prose-headings:font-display prose-headings:tracking-tight prose-pre:my-6 prose-pre:overflow-x-auto prose-pre:rounded-none prose-pre:border-2 prose-pre:border-neutral-900 dark:prose-pre:border-neutral-100"
      }
      dangerouslySetInnerHTML={{ __html: String(file) }}
    />
  );
}
