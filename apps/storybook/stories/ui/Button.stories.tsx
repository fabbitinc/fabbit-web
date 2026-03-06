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
