import tailwindcss from "@tailwindcss/vite";
import type { StorybookConfig } from "@storybook/react-vite";
import { fileURLToPath } from "node:url";
import { mergeConfig } from "vite";

const webRoot = fileURLToPath(new URL("../../web", import.meta.url));
const webSrc = fileURLToPath(new URL("../../web/src", import.meta.url));
const storybookRoot = fileURLToPath(new URL("..", import.meta.url));
const packagesRoot = fileURLToPath(new URL("../../../packages", import.meta.url));
const packageUiEntry = fileURLToPath(new URL("../../../packages/ui/src/index.ts", import.meta.url));
const packageUiStyles = fileURLToPath(new URL("../../../packages/ui/src/styles.css", import.meta.url));
const packageThemeStyles = fileURLToPath(new URL("../../../packages/theme/src/index.css", import.meta.url));

const config: StorybookConfig = {
  stories: ["../stories/**/*.mdx", "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-toolbars"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: async (config) => {
    return mergeConfig(config, {
      plugins: [tailwindcss()],
      esbuild: {
        jsx: "automatic",
        jsxImportSource: "react",
      },
      optimizeDeps: {
        exclude: ["@fabbit/ui"],
        esbuildOptions: {
          jsx: "automatic",
          jsxImportSource: "react",
          tsconfigRaw: {
            compilerOptions: {
              jsx: "react-jsx",
            },
          },
        },
      },
      resolve: {
        alias: [
          {
            find: "@fabbit/ui/styles.css",
            replacement: packageUiStyles,
          },
          {
            find: "@fabbit/theme/styles.css",
            replacement: packageThemeStyles,
          },
          {
            find: "@fabbit/ui",
            replacement: packageUiEntry,
          },
          {
            find: "@",
            replacement: webSrc,
          },
        ],
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
