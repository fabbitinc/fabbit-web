import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { PlanSelectionScreen } from "@fabbit/components";

const planOptions = [
  {
    tier: "starter",
    name: "Starter",
    priceLabel: "무료",
    description: "빠르게 시작하고 제품 구조를 검증하기에 적합합니다.",
    features: [
      "스토리지 2GB",
      "BOM 분석 50건/월",
      "도면 분석 10건/월",
      "AI 채팅 200회/월",
    ],
    badge: "추천",
  },
  {
    tier: "team",
    name: "Team",
    priceLabel: "₩249,000",
    description: "소규모 제조팀의 본격 운영을 위한 플랜입니다.",
    features: [
      "스토리지 100GB",
      "BOM 분석 3,000건/월",
      "도면 분석 300건/월",
      "AI 채팅 3,000회/월",
      "사용량 대시보드",
    ],
    disabled: true,
  },
  {
    tier: "enterprise",
    name: "Enterprise",
    priceLabel: "₩999,000",
    description: "대형 조직을 위한 맞춤 솔루션과 지원 플랜입니다.",
    features: [
      "스토리지 1TB",
      "BOM 분석 30,000건/월",
      "도면 분석 3,000건/월",
      "AI 채팅 30,000회/월",
      "전담 지원",
      "보안/컴플라이언스 옵션",
    ],
    badge: "Enterprise",
    disabled: true,
  },
];

function PlanSelectionScreenStory({
  isSubmitting = false,
}: {
  isSubmitting?: boolean;
}) {
  const [selectedPlan, setSelectedPlan] = useState("starter");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <PlanSelectionScreen
          isConfirmOpen={isConfirmOpen}
          isSubmitting={isSubmitting}
          organizationName="Fabbit Manufacturing"
          planOptions={planOptions}
          selectedPlan={selectedPlan}
          onConfirm={() => undefined}
          onOpenConfirmChange={setIsConfirmOpen}
          onSelectPlan={setSelectedPlan}
        />
      </div>
    </div>
  );
}

const meta = {
  title: "Components/PlanSelectionScreen",
  component: PlanSelectionScreenStory,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof PlanSelectionScreenStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <PlanSelectionScreenStory />,
};

export const Submitting: Story = {
  render: () => <PlanSelectionScreenStory isSubmitting />,
};
