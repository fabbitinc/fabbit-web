import type { Meta, StoryObj } from "@storybook/react-vite";
import { PartHeaderCard, type PartHeaderCardProps } from "@fabbit/components";

const samplePart = {
  partNumber: "DRV-PLATE-0142",
  name: "드라이브 유닛 베이스 플레이트",
  revision: "C",
  material: "AL6061-T6",
  unit: "EA",
  category: "기구",
  lifecycleState: "양산",
  childrenCount: 14,
  parentsCount: 3,
  suppliersCount: 2,
  filesCount: 8,
  projectsCount: 4,
} satisfies PartHeaderCardProps["part"];

const meta = {
  title: "Components/PartHeaderCard",
  component: PartHeaderCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof PartHeaderCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    part: samplePart,
  },
};

export const WithoutOptionalFields: Story = {
  args: {
    part: {
      ...samplePart,
      category: null,
      lifecycleState: null,
      material: null,
      name: null,
      unit: null,
    },
  },
};

export const Showcase: Story = {
  render: () => (
    <div className="space-y-6">
      <PartHeaderCard part={samplePart} />
      <PartHeaderCard
        part={{
          ...samplePart,
          category: "전장",
          lifecycleState: "중단",
          name: "모터 제어 PCB",
          partNumber: "CTRL-PCB-0207",
          revision: "F",
        }}
      />
    </div>
  ),
};
