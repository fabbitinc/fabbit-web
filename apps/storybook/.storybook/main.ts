import tailwindcss from "@tailwindcss/vite";
import type { StorybookConfig } from "@storybook/react-vite";
import { fileURLToPath } from "node:url";
import { mergeConfig } from "vite";

const webRoot = fileURLToPath(new URL("../../web", import.meta.url));
const webSrc = fileURLToPath(new URL("../../web/src", import.meta.url));
const storybookRoot = fileURLToPath(new URL("..", import.meta.url));
const packagesRoot = fileURLToPath(new URL("../../../packages", import.meta.url));

const config: StorybookConfig = {
  stories: ["../stories/**/*.mdx", "../../web/src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: async (config) => {
    return mergeConfig(config, {
      plugins: [tailwindcss()],
      resolve: {
        alias: {
          "@": webSrc,
        },
      },
      server: {
        fs: {
          allow: [webRoot, storybookRoot, packagesRoot],
        },
      },
    });
  },
};

export default config;
