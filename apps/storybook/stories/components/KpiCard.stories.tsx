import type { Meta, StoryObj } from "@storybook/react-vite";

import { KpiCard } from "@fabbit/components";

const meta = {
  title: "Components/KpiCard",
  component: KpiCard,
  tags: ["autodocs"],
  args: {
    label: "가동률",
    value: "94.2%",
    change: "+2.1%",
    changePositive: true,
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof KpiCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Negative: Story = {
  args: {
    label: "불량률",
    value: "1.3%",
    change: "-0.4%",
    changePositive: false,
  },
};

export const NoChange: Story = {
  args: {
    label: "생산량",
    value: "12,450",
    change: undefined,
  },
};

