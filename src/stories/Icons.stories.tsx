import type { Meta, StoryObj } from "@storybook/react";
import {
  BowlingPinIcon,
  BowlingBallIcon,
  LaneArrowIcon,
  StrikeIcon,
  ChatBubbleIcon,
  StarburstIcon,
} from "@/components/icons";

interface IconArgs {
  size: number;
  className: string;
}

const meta: Meta<IconArgs> = {
  title: "Design System/Icons",
  parameters: { layout: "centered" },
  argTypes: {
    size: { control: { type: "range", min: 16, max: 96, step: 4 } },
    className: { control: "text" },
  },
  args: { size: 32, className: "text-ink" },
};

export default meta;
type Story = StoryObj<IconArgs>;

export const BowlingPin: Story = {
  render: ({ size, className }: IconArgs) => <BowlingPinIcon size={size} className={className} />,
};

export const BowlingBall: Story = {
  render: ({ size, className }: IconArgs) => <BowlingBallIcon size={size} className={className} />,
};

export const LaneArrow: Story = {
  render: ({ size, className }: IconArgs) => <LaneArrowIcon size={size} className={className} />,
};

export const Strike: Story = {
  render: ({ size, className }: IconArgs) => <StrikeIcon size={size} className={className} />,
};

export const ChatBubble: Story = {
  render: ({ size, className }: IconArgs) => <ChatBubbleIcon size={size} className={className} />,
};

export const Starburst: Story = {
  render: ({ size, className }: IconArgs) => <StarburstIcon size={size} className={className} />,
};

export const AllIcons: Story = {
  name: "All Icons",
  render: ({ size, className }: IconArgs) => (
    <div className="flex flex-wrap items-center gap-6">
      <BowlingPinIcon size={size} className={className} />
      <BowlingBallIcon size={size} className={className} />
      <LaneArrowIcon size={size} className={className} />
      <StrikeIcon size={size} className={className} />
      <ChatBubbleIcon size={size} className={className} />
      <StarburstIcon size={size} className={className} />
    </div>
  ),
};
