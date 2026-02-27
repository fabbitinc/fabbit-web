import { create } from "storybook/theming";

export const fabbitStorybookTheme = create({
  base: "light",
  brandTitle: "Fabbit Design System",
  brandTarget: "_self",
  colorPrimary: "#1f6feb",
  colorSecondary: "#0ea5a6",
  appBg: "#f6f8fb",
  appContentBg: "#ffffff",
  appPreviewBg: "#ffffff",
  appBorderColor: "#d0d7e1",
  appBorderRadius: 10,
  fontBase:
    '"SF Pro Text", "Pretendard", "Segoe UI", "Noto Sans KR", -apple-system, BlinkMacSystemFont, sans-serif',
  fontCode:
    '"JetBrains Mono", "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  textColor: "#142238",
  textInverseColor: "#ffffff",
  barTextColor: "#4b5d73",
  barSelectedColor: "#1f6feb",
  barHoverColor: "#1f6feb",
  barBg: "#ffffff",
  inputBg: "#ffffff",
  inputBorder: "#c3cedb",
  inputTextColor: "#142238",
  inputBorderRadius: 8,
});
