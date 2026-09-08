import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs"],
  framework: { name: "@storybook/react-vite", options: {} },
  typescript: { reactDocgen: "react-docgen-typescript" },
  // The library build emits .d.ts files; Storybook has no use for them.
  viteFinal: async (config) => ({
    ...config,
    plugins: (config.plugins ?? []).filter(
      (plugin) => !(plugin && typeof plugin === "object" && "name" in plugin && plugin.name === "vite:dts"),
    ),
  }),
};

export default config;
