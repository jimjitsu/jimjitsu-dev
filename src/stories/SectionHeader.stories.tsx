import type { Meta, StoryObj } from "@storybook/react";
import { SectionHeader } from "@/components/section-header";
import { BowlingPinIcon, StrikeIcon } from "@/components/icons";

const meta = {
  title: "Components/SectionHeader",
  component: SectionHeader,
  parameters: { layout: "padded" },
} satisfies Meta<typeof SectionHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithSeeAll: Story = {
  args: {
    eyebrow: "Selected work",
    icon: <StrikeIcon size={16} className="text-red" />,
    title: "Featured projects.",
    seeAllHref: "/projects",
    seeAllLabel: "All projects",
  },
};

export const NoSeeAll: Story = {
  args: {
    eyebrow: "From the blog",
    icon: <BowlingPinIcon size={16} className="text-amber" />,
    title: "Recent writing.",
  },
};
