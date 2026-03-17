import type { Meta, StoryObj } from "@storybook/react-vite";
import { PartHistoryTab } from "@fabbit/components";

const meta = {
  title: "Components/PartHistoryTab",
  component: PartHistoryTab,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof PartHistoryTab>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
