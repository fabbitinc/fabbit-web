import type { Meta, StoryObj } from "@storybook/react-vite";

import { StepIndicator } from "@fabbit/components";

const meta = {
  title: "Components/StepIndicator",
  component: StepIndicator,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof StepIndicator>;

export default meta;

type Story = StoryObj<typeof meta>;

const processSteps = [
  { id: "incoming", label: "수입 검사" },
  { id: "cutting", label: "절단" },
  { id: "cnc", label: "CNC 가공" },
  { id: "finishing", label: "후처리" },
  { id: "final-qc", label: "최종 검사" },
];

export const Default: Story = {
  args: {
    steps: processSteps,
    currentStepId: "cnc",
  },
};

export const FirstStep: Story = {
  args: {
    steps: processSteps,
    currentStepId: "incoming",
  },
};

export const LastStep: Story = {
  args: {
    steps: processSteps,
    currentStepId: "final-qc",
  },
};

export const WithDescription: Story = {
  args: {
    steps: [
      { id: "request", label: "변경 요청", description: "ECR 접수" },
      { id: "review", label: "기술 검토", description: "영향도 분석" },
      { id: "approve", label: "승인", description: "CCB 결재" },
      { id: "execute", label: "실행", description: "BOM/도면 반영" },
      { id: "close", label: "완료", description: "ECN 발행" },
    ],
    currentStepId: "approve",
  },
};
