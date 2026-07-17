import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  stories: ["../src/stories/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-themes", "msw-storybook-addon"],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  // ./public holds Storybook-only assets (the MSW worker) so they don't ship
  // with the production site; ../public provides the real site assets.
  staticDirs: ["../public", "./public"],
};

export default config;
