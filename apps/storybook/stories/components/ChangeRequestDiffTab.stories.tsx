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
    changes: {
      items: [
        {
          id: "custom-1",
          type: "modified",
          before: {
            part_number: "CTRL-PCB-0207",
            name: "제어 PCB",
            revision: "E",
            category: "전자부품",
            lifecycle_state: "production",
            material: "FR-4",
            unit: "EA",
            description: "메인 제어 보드",
            is_phantom: false,
            lead_time_days: 12,
          },
          after: {
            part_number: "CTRL-PCB-0207",
            name: "모터 제어 PCB",
            revision: "F",
            category: "전자부품",
            lifecycle_state: "production",
            material: "FR-4",
            unit: "EA",
            description: "모터 제어용 메인 보드",
            is_phantom: false,
            lead_time_days: 14,
          },
        },
        {
          id: "custom-2",
          type: "added",
          before: null,
          after: {
            part_number: "CBL-019",
            name: "센서 하네스",
            revision: "A",
            category: "배선",
            lifecycle_state: "prototype",
            material: "PVC",
            unit: "EA",
            description: "센서 연결 하네스",
            is_phantom: false,
            lead_time_days: 5,
          },
        },
      ],
    },
  },
};
