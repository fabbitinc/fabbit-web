import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChangeRequestDiffTab } from "@fabbit/components";

const meta = {
  title: "Components/ChangeRequestDiffTab",
  component: ChangeRequestDiffTab,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof ChangeRequestDiffTab>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomItems: Story = {
  args: {
    notice: "서버 diff 계약이 연결되면 이 영역을 실제 비교 데이터로 교체합니다.",
    items: [
      {
        id: "custom-1",
        type: "modified",
        partNumber: "CTRL-PCB-0207",
        name: "모터 제어 PCB",
        fields: [
          { label: "Revision", before: "E", after: "F" },
          { label: "부품명", before: "제어 PCB", after: "모터 제어 PCB" },
        ],
      },
      {
        id: "custom-2",
        type: "added",
        partNumber: "CBL-019",
        name: "센서 하네스",
        fields: [{ label: "수량", after: "2" }],
      },
    ],
  },
};
