import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "@fabbit/ui";

const meta = {
  component: Button,
  tags: ["autodocs"],
  args: {
    children: "새 항목 만들기",
    variant: "default",
    size: "default",
    disabled: false,
  },
  argTypes: {
    children: {
      control: "text",
    },
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Outline: Story = {
  args: {
    variant: "outline",
  },
};

export const WithIcon: Story = {
  args: {
    children: "프로젝트 추가",
  },
  render: (args) => (
    <Button {...args}>
      <span className="text-base leading-none">+</span>
      {args.children}
    </Button>
  ),
};

export const Destructive: Story = {
  args: {
    children: "삭제",
    variant: "destructive",
  },
};

export const Showcase: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">variant</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
          <Button>새 항목 만들기</Button>
          <Button variant="secondary">보조 작업</Button>
          <Button variant="outline">아웃라인</Button>
          <Button variant="ghost">고스트</Button>
          <Button variant="destructive">삭제</Button>
          <Button variant="link">링크</Button>
        </div>
      </div>
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">size</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
          <Button size="sm">작은 버튼</Button>
          <Button>기본 버튼</Button>
          <Button size="lg">큰 버튼</Button>
          <Button size="icon"><span className="text-base leading-none">+</span></Button>
        </div>
      </div>
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">상태</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
          <Button>활성</Button>
          <Button disabled>비활성</Button>
        </div>
      </div>
    </div>
  ),
};
