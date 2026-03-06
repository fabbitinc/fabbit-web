import type { Meta, StoryObj } from "@storybook/react-vite";
import { PartHistoryTab } from "@fabbit/components";

const meta = {
  title: "Components/PartHistoryTab",
  component: PartHistoryTab,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof PartHistoryTab>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomEntries: Story = {
  args: {
    notice: "ERP 동기화 이후 최근 변경 이력을 표시하는 예시입니다.",
    entries: [
      {
        id: "entry-1",
        title: "공급사가 변경되었습니다.",
        description: "기존 공급사에서 신규 협력사로 단가와 리드타임이 갱신되었습니다.",
        timestamp: "2026-03-06T07:30:00Z",
      },
      {
        id: "entry-2",
        title: "프로젝트 연결이 해제되었습니다.",
        description: "양산 전환 프로젝트에서 해당 부품 연결이 해제되었습니다.",
        timestamp: "2026-03-05T11:10:00Z",
      },
    ],
  },
};
