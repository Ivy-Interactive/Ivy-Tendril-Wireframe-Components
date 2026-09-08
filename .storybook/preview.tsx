import type { Preview } from "@storybook/react-vite";
import React from "react";
import "../src/styles/tendril.css";
import { SketchProvider } from "../src/sketch/SketchProvider";

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    backgrounds: {
      options: {
        paper: { name: "paper", value: "#fdfcf7" },
        white: { name: "white", value: "#ffffff" },
      },
    },
    docs: { toc: true },
  },
  initialGlobals: { backgrounds: { value: "paper" } },
  decorators: [
    (Story) => (
      <SketchProvider>
        <div className="tendril p-6">
          <Story />
        </div>
      </SketchProvider>
    ),
  ],
};

export default preview;
