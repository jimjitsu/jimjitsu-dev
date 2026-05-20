import type { Decorator, Meta, StoryObj } from "@storybook/react";
import { BlogPostCard } from "@/components/blog-post-card";
import { mockBlogPost } from "./mocks/contentful";

const meta = {
  title: "Components/BlogPostCard",
  component: BlogPostCard,
  decorators: [
    ((Story) => (
      <div className="w-80">
        <Story />
      </div>
    )) as Decorator,
  ],
  parameters: { layout: "centered" },
} satisfies Meta<typeof BlogPostCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { post: mockBlogPost() },
};

export const NoTags: Story = {
  args: { post: mockBlogPost({ tags: [] }) },
};

export const NoExcerpt: Story = {
  args: { post: mockBlogPost({ excerpt: undefined }) },
};

export const LongTitle: Story = {
  args: {
    post: mockBlogPost({
      title:
        "Everything I Learned Building a Component Library Across Four Different Design Systems Over Three Years",
    }),
  },
};
