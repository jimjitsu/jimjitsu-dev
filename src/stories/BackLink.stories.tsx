import type { Meta, StoryObj } from "@storybook/react";
import { BackLink } from "@/components/back-link";

const meta = {
  title: "Components/BackLink",
  component: BackLink,
  parameters: { layout: "centered" },
} satisfies Meta<typeof BackLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ToBlog: Story = {
  args: { href: "/blog", label: "All posts" },
};

export const ToProjects: Story = {
  args: { href: "/projects", label: "All projects" },
};
