import type { Meta, StoryObj } from "@storybook/react-vite";
import { AIUsagePanel, type AIUsagePanelProps } from "@fabbit/components";

const trend = [
  { date: "2026-03-01", bomAnalysis: 42, drawingAnalysis: 18, aiChat: 27 },
  { date: "2026-03-02", bomAnalysis: 55, drawingAnalysis: 22, aiChat: 31 },
  { date: "2026-03-03", bomAnalysis: 49, drawingAnalysis: 24, aiChat: 28 },
  { date: "2026-03-04", bomAnalysis: 63, drawingAnalysis: 35, aiChat: 30 },
  { date: "2026-03-05", bomAnalysis: 70, drawingAnalysis: 40, aiChat: 34 },
  { date: "2026-03-06", bomAnalysis: 78, drawingAnalysis: 44, aiChat: 37 },
  { date: "2026-03-07", bomAnalysis: 82, drawingAnalysis: 48, aiChat: 41 },
] satisfies AIUsagePanelProps["trend"];

const usage = {
  currentPeriodEnd: "2026-03-31T00:00:00Z",
  planCreditsUsed: 8400,
  planCreditsLimit: 12000,
  planCreditsRemaining: 3600,
  bonusCreditsUsed: 1200,
  bonusCreditsRemaining: 2800,
  categories: [
    { category: "BOM_ANALYSIS", creditsUsed: 5100, usageCount: 182 },
    { category: "DRAWING_ANALYSIS", creditsUsed: 2300, usageCount: 74 },
    { category: "AI_CHAT", creditsUsed: 1000, usageCount: 410 },
  ],
} satisfies AIUsagePanelProps["usage"];

const meta = {
  title: "Components/AIUsagePanel",
  component: AIUsagePanel,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    trend,
    usage,
  },
} satisfies Meta<typeof AIUsagePanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Warning: Story = {
  args: {
    usage: {
      ...usage,
      planCreditsUsed: 11000,
      planCreditsRemaining: 1000,
    },
  },
};
