import type { Meta, StoryObj } from "@storybook/react-vite";
import { HardDrive, Sparkles } from "lucide-react";

import { UsageCard } from "@fabbit/components";

const meta = {
  title: "Components/UsageCard",
  component: UsageCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof UsageCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-[300px]">
      <UsageCard
        icon={HardDrive}
        label="파일 저장 용량"
        used={8.2}
        limit={10}
        unit="GB"
      />
    </div>
  ),
};

export const Low: Story = {
  render: () => (
    <div className="w-[300px]">
      <UsageCard
        icon={Sparkles}
        label="AI 크레딧"
        used={320}
        limit={1000}
        unit="크레딧"
      />
    </div>
  ),
};

export const Critical: Story = {
  render: () => (
    <div className="w-[300px]">
      <UsageCard
        icon={HardDrive}
        label="파일 저장 용량"
        used={9.5}
        limit={10}
        unit="GB"
      />
    </div>
  ),
};
