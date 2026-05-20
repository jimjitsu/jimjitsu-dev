import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import { SidebarShell } from "@/components/sidebar-shell";

function NavPlaceholder() {
  return (
    <nav className="flex flex-col gap-4 p-6">
      <p className="eyebrow-sm">Navigation</p>
      <a href="#" className="text-sm text-ink hover:underline">
        Home
      </a>
      <a href="#" className="text-sm text-ink hover:underline">
        Projects
      </a>
      <a href="#" className="text-sm text-ink hover:underline">
        Blog
      </a>
      <a href="#" className="text-sm text-ink hover:underline">
        About
      </a>
    </nav>
  );
}

const meta = {
  title: "Components/SidebarShell",
  component: SidebarShell,
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true },
  },
} satisfies Meta<typeof SidebarShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {
  args: { children: <NavPlaceholder /> },
};

export const Open: Story = {
  args: { children: <NavPlaceholder /> },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /open menu/i }));
    await expect(canvas.getByRole("complementary")).toBeVisible();
  },
};

export const EscapeToClose: Story = {
  args: { children: <NavPlaceholder /> },
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /open menu/i }));
    const sidebar = canvas.getByRole("complementary");
    await expect(sidebar).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expect(sidebar).not.toHaveClass("translate-x-0");
  },
};
