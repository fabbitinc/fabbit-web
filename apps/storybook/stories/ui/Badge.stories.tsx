import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Badge } from "@fabbit/ui";

const meta = {
  component: Badge,
  tags: ["autodocs"],
  args: {
    children: "운영중",
    variant: "default",
  },
  argTypes: {
    children: {
      control: "text",
    },
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Secondary: Story = {
  args: {
    children: "초안",
    variant: "secondary",
  },
};

export const Outline: Story = {
  args: {
    children: "검토 필요",
    variant: "outline",
  },
};

export const Destructive: Story = {
  args: {
    children: "오류",
    variant: "destructive",
  },
};
