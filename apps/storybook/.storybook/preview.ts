import type { Preview } from "@storybook/react-vite";
import { createElement } from "react";
import "./preview.css";
import { fabbitStorybookTheme } from "./theme";

const primaryThemes = [
  "theme-primary-1",
  "theme-primary-2",
  "theme-primary-3",
  "theme-primary-4",
  "theme-primary-5",
  "theme-primary-6",
  "theme-primary-7",
  "theme-primary-8",
  "theme-primary-9",
  "theme-primary-10",
] as const;
const commonThemes = [
  "theme-common-1",
] as const;
const colorModes = ["dark"] as const;

const applyThemeClasses = (primaryTheme: string, commonTheme: string, colorMode: string) => {
  const root = document.documentElement;
  root.classList.remove(...primaryThemes, ...commonThemes, ...colorModes);

  if (primaryTheme) root.classList.add(primaryTheme);
  if (commonTheme) root.classList.add(commonTheme);
  if (colorMode === "dark") root.classList.add("dark");
};

const getThemeClassName = (primaryTheme: string, commonTheme: string, colorMode: string) =>
  [primaryTheme, commonTheme, colorMode === "dark" ? "dark" : undefined].filter(Boolean).join(" ");

const preview: Preview = {
  initialGlobals: {
    primaryTheme: "theme-primary-1",
    commonTheme: "theme-common-1",
    colorMode: "light",
  },
  globalTypes: {
    primaryTheme: {
      name: "Primary",
      description: "브랜드 테마",
      toolbar: {
        icon: "paintbrush",
        items: [
          { value: "theme-primary-1", title: "1 · Blueprint Blue" },
          { value: "theme-primary-2", title: "2 · High-Tech Precision" },
          { value: "theme-primary-3", title: "3 · Mossy Production" },
          { value: "theme-primary-4", title: "4 · Cobalt Trust" },
          { value: "theme-primary-5", title: "5 · Slate Innovation" },
          { value: "theme-primary-6", title: "6 · Emerald ESG" },
          { value: "theme-primary-7", title: "7 · Safety Industrial" },
          { value: "theme-primary-8", title: "8 · Intelligence Violet" },
          { value: "theme-primary-9", title: "9 · Graphite Precision" },
          { value: "theme-primary-10", title: "10 · Bronze Premium" },
        ],
      },
    },
    commonTheme: {
      name: "Common",
      description: "상태 색상 테마",
      toolbar: {
        icon: "contrast",
        items: [
          { value: "theme-common-1", title: "Common 1 / Default" },
        ],
      },
    },
    colorMode: {
      name: "Mode",
      description: "라이트/다크 모드",
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
      const primaryTheme = String(context.globals.primaryTheme);
      const commonTheme = String(context.globals.commonTheme);
      const colorMode = String(context.globals.colorMode);

      applyThemeClasses(primaryTheme, commonTheme, colorMode);

      const isFullscreen = context.parameters.layout === "fullscreen";

      return createElement(
        "div",
        {
          className: getThemeClassName(primaryTheme, commonTheme, colorMode),
          style: {
            ...(isFullscreen && { minHeight: "100vh" }),
            backgroundColor: "var(--background)",
            color: "var(--foreground)",
          },
        },
        createElement(Story),
      );
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
