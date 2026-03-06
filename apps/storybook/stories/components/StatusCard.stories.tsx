import type { Meta, StoryObj } from "@storybook/react-vite";

import { StatusCard } from "@fabbit/components";
import { Separator } from "@fabbit/ui";

const meta = {
  title: "Components/StatusCard",
  component: StatusCard,
  tags: ["autodocs"],
  args: {
    name: "CNC-001",
    status: "가동",
    statusVariant: "success",
    progress: 78,
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof StatusCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: "w-[240px]",
  },
};

export const Maintenance: Story = {
  args: {
    name: "PRESS-003",
    status: "정비중",
    statusVariant: "warning",
    progress: 0,
    className: "w-[240px]",
  },
};

export const Broken: Story = {
  args: {
    name: "LATHE-002",
    status: "고장",
    statusVariant: "danger",
    progress: 45,
    className: "w-[240px]",
  },
};

export const WithChildren: Story = {
  args: {
    name: "CNC-005",
    status: "가동",
    statusVariant: "success",
    progress: 92,
    className: "w-[260px]",
  },
  render: (args) => (
    <StatusCard {...args}>
      <Separator className="my-2" />
      <div className="space-y-1 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>현재 작업</span>
          <span className="text-foreground">WO-2401</span>
        </div>
        <div className="flex justify-between">
          <span>라인</span>
          <span className="text-foreground">A동 1라인</span>
        </div>
      </div>
    </StatusCard>
  ),
};

