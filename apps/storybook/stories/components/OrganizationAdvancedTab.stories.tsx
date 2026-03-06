import type { Meta, StoryObj } from "@storybook/react-vite";
import { OrganizationAdvancedTab } from "@fabbit/components";

const meta = {
  title: "Components/OrganizationAdvancedTab",
  component: OrganizationAdvancedTab,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof OrganizationAdvancedTab>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomPolicies: Story = {
  args: {
    cards: [
      {
        title: "감사 로그 보관 기간",
        description: "기본값 365일",
        badge: "365일",
      },
      {
        title: "외부 SIEM 연동",
        description: "주요 보안 이벤트를 SIEM으로 전송",
        badge: "설정 완료",
      },
    ],
  },
};
