import type { Meta, StoryObj } from "@storybook/react";
import { ProjectMetaBar } from "@/components/project-meta-bar";

const meta = {
  title: "Components/ProjectMetaBar",
  component: ProjectMetaBar,
  parameters: { layout: "padded" },
} satisfies Meta<typeof ProjectMetaBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllFields: Story = {
  args: {
    role: "Design + Engineering",
    technologies: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Contentful"],
    liveUrl: "https://jimjitsu.dev",
    repoUrl: "https://github.com/jimtierney/jimjitsu-dev",
  },
};

export const RoleAndTechOnly: Story = {
  args: {
    role: "Frontend Engineer",
    technologies: ["Vue", "Nuxt", "SCSS"],
  },
};

export const LinksOnly: Story = {
  args: {
    liveUrl: "https://example.com",
    repoUrl: "https://github.com/example/repo",
  },
};

export const NoLinks: Story = {
  args: {
    role: "Design + Engineering",
    technologies: ["React", "TypeScript", "Storybook"],
  },
};
