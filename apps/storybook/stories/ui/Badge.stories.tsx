import type { Meta, StoryObj } from "@storybook/react-vite";
import { CircleCheck, Clock, AlertTriangle, Info, Minus, Sparkles } from "lucide-react";

import { Badge } from "@fabbit/ui";

const meta = {
  component: Badge,
  tags: ["autodocs"],
  args: {
    children: "Badge",
    variant: "default",
  },
  argTypes: {
    children: { control: "text" },
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "운영중" },
};

export const Secondary: Story = {
  args: { children: "초안", variant: "secondary" },
};

export const Outline: Story = {
  args: { children: "검토 필요", variant: "outline" },
};

export const Destructive: Story = {
  args: { children: "삭제됨", variant: "destructive" },
};

export const Ghost: Story = {
  args: { children: "숨김", variant: "ghost" },
};

export const Success: Story = {
  args: { children: "열림", variant: "success" },
};

export const Warning: Story = {
  args: { children: "대기", variant: "warning" },
};

export const Danger: Story = {
  args: { children: "오류", variant: "danger" },
};

export const InfoStatus: Story = {
  args: { children: "진행중", variant: "info" },
};

export const Neutral: Story = {
  args: { children: "초안", variant: "neutral" },
};

export const Accent: Story = {
  args: { children: "병합됨", variant: "accent" },
};

export const SuccessWithIcon: Story = {
  args: { variant: "success" },
  render: (args) => (
    <Badge {...args}>
      <CircleCheck /> 열림
    </Badge>
  ),
};

export const WarningWithIcon: Story = {
  args: { variant: "warning" },
  render: (args) => (
    <Badge {...args}>
      <Clock /> 대기
    </Badge>
  ),
};

export const DangerWithIcon: Story = {
  args: { variant: "danger" },
  render: (args) => (
    <Badge {...args}>
      <AlertTriangle /> 오류
    </Badge>
  ),
};

export const InfoWithIcon: Story = {
  args: { variant: "info" },
  render: (args) => (
    <Badge {...args}>
      <Info /> 진행중
    </Badge>
  ),
};

export const NeutralWithIcon: Story = {
  args: { variant: "neutral" },
  render: (args) => (
    <Badge {...args}>
      <Minus /> 초안
    </Badge>
  ),
};

export const AccentWithIcon: Story = {
  args: { variant: "accent" },
  render: (args) => (
    <Badge {...args}>
      <Sparkles /> 병합됨
    </Badge>
  ),
};

export const Showcase: Story = {
  parameters: { layout: "centered" },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: "12px", color: "var(--muted-foreground)", width: "60px" }}>Text</span>
        <Badge variant="success">열림</Badge>
        <Badge variant="warning">대기</Badge>
        <Badge variant="danger">오류</Badge>
        <Badge variant="info">진행중</Badge>
        <Badge variant="neutral">초안</Badge>
        <Badge variant="accent">병합됨</Badge>
      </div>
      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: "12px", color: "var(--muted-foreground)", width: "60px" }}>Icon</span>
        <Badge variant="success"><CircleCheck /> 열림</Badge>
        <Badge variant="warning"><Clock /> 대기</Badge>
        <Badge variant="danger"><AlertTriangle /> 오류</Badge>
        <Badge variant="info"><Info /> 진행중</Badge>
        <Badge variant="neutral"><Minus /> 초안</Badge>
        <Badge variant="accent"><Sparkles /> 병합됨</Badge>
      </div>
    </div>
  ),
};
