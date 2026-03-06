import type { Meta, StoryObj } from "@storybook/react-vite";
import { StorageUsagePanel, type StorageUsagePanelProps } from "@fabbit/components";

const trend = [
  { date: "2026-03-01", drawing: 180_000_000_000, attachment: 80_000_000_000, other: 20_000_000_000 },
  { date: "2026-03-02", drawing: 182_000_000_000, attachment: 81_000_000_000, other: 21_000_000_000 },
  { date: "2026-03-03", drawing: 184_000_000_000, attachment: 84_000_000_000, other: 21_500_000_000 },
  { date: "2026-03-04", drawing: 185_000_000_000, attachment: 86_000_000_000, other: 22_000_000_000 },
  { date: "2026-03-05", drawing: 188_000_000_000, attachment: 88_000_000_000, other: 22_400_000_000 },
  { date: "2026-03-06", drawing: 190_000_000_000, attachment: 90_000_000_000, other: 22_900_000_000 },
  { date: "2026-03-07", drawing: 194_000_000_000, attachment: 94_000_000_000, other: 23_500_000_000 },
] satisfies StorageUsagePanelProps["trend"];

const usage = {
  bytesUsed: 311_500_000_000,
  bytesLimit: 400_000_000_000,
  bytesOverage: 0,
  allowOverage: true,
  categories: [
    { category: "drawing", bytesUsed: 194_000_000_000, fileCount: 1820 },
    { category: "attachment", bytesUsed: 94_000_000_000, fileCount: 3811 },
    { category: "other", bytesUsed: 23_500_000_000, fileCount: 442 },
  ],
} satisfies StorageUsagePanelProps["usage"];

const meta = {
  title: "Components/StorageUsagePanel",
  component: StorageUsagePanel,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    trend,
    usage,
  },
} satisfies Meta<typeof StorageUsagePanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Overage: Story = {
  args: {
    usage: {
      ...usage,
      bytesUsed: 438_000_000_000,
      bytesOverage: 38_000_000_000,
    },
  },
};
