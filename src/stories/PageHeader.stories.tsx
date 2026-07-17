import type { Meta, StoryObj } from "@storybook/react";
import { PageHeader } from "@/components/page-header";
import { BowlingPinIcon, StrikeIcon } from "@/components/icons";

const meta = {
  title: "Components/PageHeader",
  component: PageHeader,
  parameters: { layout: "padded" },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    eyebrow: "From the blog",
    icon: <BowlingPinIcon size={16} className="text-amber" />,
    title: "Writing.",
    description: "Notes on frontend craft, design systems, and the projects I'm working on.",
  },
};

export const NoDescription: Story = {
  args: {
    eyebrow: "Selected work",
    icon: <StrikeIcon size={16} className="text-red" />,
    title: "Projects.",
  },
};

export const NoIcon: Story = {
  args: {
    eyebrow: "About",
    title: "Jim Tierney.",
    description: "Frontend engineer based in Milwaukee, WI.",
  },
};

export const LongTitle: Story = {
  args: {
    eyebrow: "Case study",
    title: "Enterprise Component Library Spanning Four Products and Three Design Systems.",
    description:
      "A deep dive into the technical and organizational challenges of building at scale.",
  },
};

export const HeadingLevelH2: Story = {
  args: {
    eyebrow: "Skills & toolkit",
    icon: <StrikeIcon size={16} className="text-teal" />,
    title: "Skills & tech.",
    headingLevel: "h2",
  },
};
