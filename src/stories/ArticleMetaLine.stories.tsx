import type { Meta, StoryObj } from "@storybook/react";
import { ArticleMetaLine } from "@/components/article-meta-line";

const meta = {
  title: "Components/ArticleMetaLine",
  component: ArticleMetaLine,
  parameters: { layout: "centered" },
} satisfies Meta<typeof ArticleMetaLine>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllFields: Story = {
  args: {
    publishDate: "2025-01-15",
    author: "Jim Tierney",
    tags: ["design-systems", "tailwind", "css"],
  },
};

export const DateOnly: Story = {
  args: { publishDate: "2025-01-15" },
};

export const WithAuthor: Story = {
  args: {
    publishDate: "2025-01-15",
    author: "Jim Tierney",
  },
};

export const WithTags: Story = {
  args: {
    publishDate: "2025-01-15",
    tags: ["react", "nextjs", "performance"],
  },
};
