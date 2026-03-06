import type { Meta, StoryObj } from "@storybook/react-vite";

import { StatGroup, KpiCard } from "@fabbit/components";

const meta = {
  title: "Components/StatGroup",
  component: StatGroup,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof StatGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <StatGroup>
      <KpiCard label="가동률" value="94.2%" change="+2.1%" changePositive />
      <KpiCard label="불량률" value="0.6%" change="-0.2%" changePositive />
      <KpiCard label="일일 생산량" value="1,248개" change="+48" changePositive />
      <KpiCard label="설비 가용률" value="87.5%" change="-1.3%" changePositive={false} />
    </StatGroup>
  ),
};

export const ThreeColumns: Story = {
  render: () => (
    <StatGroup columns={3}>
      <KpiCard label="진행중 작업지시" value="12건" />
      <KpiCard label="금일 완료" value="8건" change="+3" changePositive />
      <KpiCard label="지연 건수" value="2건" change="+1" changePositive={false} />
    </StatGroup>
  ),
};

export const TwoColumns: Story = {
  render: () => (
    <StatGroup columns={2}>
      <KpiCard label="수입 검사 합격률" value="98.4%" change="+0.5%" changePositive />
      <KpiCard label="출하 검사 합격률" value="99.1%" change="+0.2%" changePositive />
    </StatGroup>
  ),
};
