import type { Decorator, Meta, StoryObj } from "@storybook/react";
import { ProjectCard } from "@/components/project-card";
import { mockProject } from "./mocks/contentful";

const meta = {
  title: "Components/ProjectCard",
  component: ProjectCard,
  decorators: [
    ((Story) => (
      <div className="w-80">
        <Story />
      </div>
    )) as Decorator,
  ],
  parameters: { layout: "centered" },
} satisfies Meta<typeof ProjectCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AccentRed: Story = {
  args: { project: mockProject(), accent: "red" },
};

export const AccentTeal: Story = {
  args: { project: mockProject(), accent: "teal" },
};

export const AccentAmber: Story = {
  args: { project: mockProject(), accent: "amber" },
};

export const NoImage: Story = {
  args: { project: mockProject({ coverImage: undefined as never }), accent: "red" },
};

export const NoTechnologies: Story = {
  args: { project: mockProject({ technologies: undefined }), accent: "red" },
};
