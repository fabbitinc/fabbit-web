import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Input, Label } from "@fabbit/ui";

const meta = {
  component: Input,
  tags: ["autodocs"],
  args: {
    placeholder: "프로젝트 이름을 입력하세요",
    disabled: false,
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="flex w-[320px] flex-col gap-2">
      <Label htmlFor="project-name">프로젝트 이름</Label>
      <Input id="project-name" {...args} />
    </div>
  ),
};

export const WithValue: Story = {
  args: {
    defaultValue: "Fabbit Alpha",
  },
  render: (args) => (
    <div className="flex w-[320px] flex-col gap-2">
      <Label htmlFor="project-slug">프로젝트 코드</Label>
      <Input id="project-slug" {...args} />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    defaultValue: "읽기 전용 값",
    disabled: true,
  },
  render: (args) => (
    <div className="flex w-[320px] flex-col gap-2">
      <Label htmlFor="readonly-field">읽기 전용</Label>
      <Input id="readonly-field" {...args} />
    </div>
  ),
};
