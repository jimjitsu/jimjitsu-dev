import type { Decorator, Meta, StoryObj } from "@storybook/react";
import { ContentfulImage } from "@/components/contentful-image";
import { mockAsset } from "./mocks/contentful";

const meta = {
  title: "Components/ContentfulImage",
  component: ContentfulImage,
  parameters: { layout: "centered" },
} satisfies Meta<typeof ContentfulImage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Standard: Story = {
  args: {
    asset: mockAsset(),
    alt: "Mock portfolio image",
    width: 600,
    height: 400,
  },
};

export const FillMode: Story = {
  decorators: [
    ((Story) => (
      <div className="relative h-64 w-96">
        <Story />
      </div>
    )) as Decorator,
  ],
  args: {
    asset: mockAsset(),
    alt: "Fill mode image",
    fill: true,
    className: "object-cover",
  },
};

export const MissingAsset: Story = {
  args: {
    asset: undefined,
    alt: "Missing asset",
  },
};
