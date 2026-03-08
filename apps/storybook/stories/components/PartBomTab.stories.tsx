import type { Meta, StoryObj } from "@storybook/react-vite";
import { PartBomTab } from "@fabbit/components";

const meta = {
  title: "Components/PartBomTab",
  component: PartBomTab,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    childrenItems: [
      {
        id: "part-child-1",
        partNumber: "SUB-ASM-0008",
        name: "모터 마운트 브라켓",
        quantity: 2,
      },
      {
        id: "part-child-2",
        partNumber: "STD-BOLT-M08",
        name: "육각 볼트 M8",
        quantity: 4,
      },
    ],
    parentItems: [
      {
        id: "part-parent-1",
        partNumber: "ASM-DRV-1001",
        name: "드라이브 유닛 조립체",
        quantity: 1,
      },
    ],
    isLoading: false,
    onExploreDirectionChange: (_direction) => undefined,
    onPartClick: (_partId) => undefined,
  },
} satisfies Meta<typeof PartBomTab>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    childrenItems: [],
    parentItems: [],
  },
};

export const Showcase: Story = {
  render: (args) => (
    <div className="space-y-8">
      <PartBomTab {...args} />
      <PartBomTab {...args} childrenItems={[]} parentItems={[]} isLoading={true} />
    </div>
  ),
};
