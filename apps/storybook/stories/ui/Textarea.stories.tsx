import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Label, Textarea } from "@fabbit/ui";

const meta = {
  component: Textarea,
  tags: ["autodocs"],
  args: {
    placeholder: "설명을 입력하세요",
    disabled: false,
    rows: 5,
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="flex w-[360px] flex-col gap-2">
      <Label htmlFor="project-description">프로젝트 설명</Label>
      <Textarea id="project-description" {...args} />
    </div>
  ),
};

export const WithValue: Story = {
  args: {
    defaultValue:
      "도면 검토 워크플로를 정리하고, 검토 결과를 공유하기 위한 내부 프로젝트입니다.",
  },
  render: (args) => (
    <div className="flex w-[360px] flex-col gap-2">
      <Label htmlFor="project-notes">비고</Label>
      <Textarea id="project-notes" {...args} />
    </div>
  ),
};
