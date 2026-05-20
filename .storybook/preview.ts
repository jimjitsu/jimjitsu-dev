import type { Preview } from "@storybook/react";
import { initialize, mswLoader } from "msw-storybook-addon";
import "../src/app/globals.css";

initialize({ onUnhandledRequest: "bypass" });

const preview: Preview = {
  loaders: [mswLoader],
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    backgrounds: { disable: true },
    layout: "centered",
  },
};

export default preview;
