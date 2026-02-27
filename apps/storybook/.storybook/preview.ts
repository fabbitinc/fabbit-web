import type { Preview } from "@storybook/react-vite";
import "./preview.css";
import { fabbitStorybookTheme } from "./theme";

const primaryThemes = ["theme-primary-1", "theme-primary-2", "theme-primary-4"] as const;
const commonThemes = ["theme-common-1", "theme-common-2", "theme-common-4"] as const;
const colorModes = ["dark"] as const;

const applyThemeClasses = (themePreset: string, colorMode: string) => {
  const root = document.documentElement;
  root.classList.remove(...primaryThemes, ...commonThemes, ...colorModes);

  const [primaryTheme, commonTheme] = themePreset.split(" ");
  if (primaryTheme) root.classList.add(primaryTheme);
  if (commonTheme) root.classList.add(commonTheme);
  if (colorMode === "dark") root.classList.add("dark");
};

const preview: Preview = {
  globalTypes: {
    themePreset: {
      name: "Theme",
      description: "Primary/Common 테마 조합",
      defaultValue: "theme-primary-1 theme-common-1",
      toolbar: {
        icon: "paintbrush",
        items: [
          { value: "theme-primary-1 theme-common-1", title: "Default Blue" },
          { value: "theme-primary-2 theme-common-2", title: "Ocean Teal" },
          { value: "theme-primary-4 theme-common-4", title: "Warm Clay" },
        ],
      },
    },
    colorMode: {
      name: "Mode",
      description: "라이트/다크 모드",
      defaultValue: "light",
      toolbar: {
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
      },
    },
  },
  decorators: [
    (Story, context) => {
      applyThemeClasses(String(context.globals.themePreset), String(context.globals.colorMode));
      return Story();
    },
  ],
  parameters: {
    docs: {
      theme: fabbitStorybookTheme,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: "centered",
  },
};

export default preview;
