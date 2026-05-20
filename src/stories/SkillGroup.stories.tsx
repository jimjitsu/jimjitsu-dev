import type { Decorator, Meta, StoryObj } from "@storybook/react";
import { SkillGroup } from "@/components/skill-group";

const meta = {
  title: "Components/SkillGroup",
  component: SkillGroup,
  parameters: { layout: "centered" },
  decorators: [
    ((Story) => (
      <div className="w-64">
        <Story />
      </div>
    )) as Decorator,
  ],
} satisfies Meta<typeof SkillGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Frameworks",
    items: ["React", "Next.js", "Vue", "Svelte"],
  },
};

export const ManyItems: Story = {
  args: {
    label: "Tooling",
    items: ["Webpack", "Vite", "Node.js", "npm", "pnpm", "Grunt", "Gulp", "GSAP", "Git", "Docker"],
  },
};

export const SingleItem: Story = {
  args: {
    label: "AI",
    items: ["Claude Code"],
  },
};
