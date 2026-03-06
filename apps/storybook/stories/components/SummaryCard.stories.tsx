import type { Meta, StoryObj } from "@storybook/react-vite";
import { CircleDot, GitPullRequestArrow, Package } from "lucide-react";

import { SummaryCard } from "@fabbit/components";

const meta = {
  title: "Components/SummaryCard",
  component: SummaryCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof SummaryCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: CircleDot,
    label: "할당된 이슈",
    value: "3건",
    sub: "열린 이슈",
    onClick: () => {},
  },
};

export const WithoutClick: Story = {
  args: {
    icon: Package,
    label: "관리 중인 부품",
    value: "1,234개",
    sub: "전체 부품 수",
  },
};

export const ChangeRequest: Story = {
  args: {
    icon: GitPullRequestArrow,
    label: "할당된 변경요청",
    value: "2건",
    sub: "진행 중인 CR",
    onClick: () => {},
  },
};
