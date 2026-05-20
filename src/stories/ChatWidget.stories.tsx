import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import { http, HttpResponse } from "msw";
import { ChatWidget } from "@/components/chat-widget";

const meta = {
  title: "Components/ChatWidget",
  component: ChatWidget,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ChatWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

// Renders the collapsed trigger button only.
export const Collapsed: Story = {};

// Opens the widget to the welcome-message state.
export const Expanded: Story = {
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /open chat/i }));
    await expect(canvas.getByRole("dialog")).toBeVisible();
  },
};

// Submits a message; MSW never resolves so loading dots stay visible.
export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [http.post("/api/chat", () => new Promise(() => {}))],
    },
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /open chat/i }));
    const input = canvas.getByRole("textbox");
    await userEvent.type(input, "What are your strongest skills?");
    await userEvent.keyboard("{Enter}");
  },
};

// Full Jimbo-t response with no Stranger trigger.
export const JimbotResponse: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post("/api/chat", () =>
          HttpResponse.json({
            jimbot: {
              text: "Yeah, React for a decade. Tailwind, TypeScript, design systems. That's my whole deal, man. The Dude abides, but the Dude also ships accessible components.",
              triggered_stranger: false,
              trigger_type: null,
            },
          }),
        ),
      ],
    },
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /open chat/i }));
    const input = canvas.getByRole("textbox");
    await userEvent.type(input, "What are your strongest skills?");
    await userEvent.keyboard("{Enter}");
    await canvas.findByText(/React for a decade/i);
  },
};

// Jimbo-t + The Stranger both appear.
export const WithStrangerResponse: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post("/api/chat", () =>
          HttpResponse.json({
            jimbot: {
              text: "Look, I don't give a shit what stack you're used to — I pick the right tool for the job. That rug really tied the room together.",
              triggered_stranger: true,
              trigger_type: "profanity",
            },
            stranger: {
              text: "Sir, I have to ask you to watch the language. Though I'll say, he does know his tooling.",
            },
          }),
        ),
      ],
    },
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /open chat/i }));
    const input = canvas.getByRole("textbox");
    await userEvent.type(input, "What stack do you use?");
    await userEvent.keyboard("{Enter}");
    await canvas.findByText(/right tool for the job/i);
  },
};

// Server returns an error.
export const ErrorState: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post("/api/chat", () =>
          HttpResponse.json(
            {
              error: "Look, something went wrong. Life does not stop and start at your convenience — just try again, man.",
              code: "llm_error",
            },
            { status: 500 },
          ),
        ),
      ],
    },
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /open chat/i }));
    const input = canvas.getByRole("textbox");
    await userEvent.type(input, "Tell me something.");
    await userEvent.keyboard("{Enter}");
  },
};
