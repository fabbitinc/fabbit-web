import type { Meta, StoryObj } from "@storybook/react-vite";
import { PartPropertiesTab, type PartPropertiesTabProps } from "@fabbit/components";

const samplePart = {
  partNumber: "DRV-PLATE-0142",
  name: "드라이브 유닛 베이스 플레이트",
  revision: "C",
  lifecycleState: "양산",
  category: "기구",
  material: "AL6061-T6",
  unit: "EA",
  leadTimeDays: 12,
  isPhantom: false,
  description: "인버터 하우징 하부에 장착되는 베이스 플레이트입니다.",
  drawing: {
    drawingNumber: "DWG-0142",
    name: "드라이브 유닛 베이스 플레이트",
    version: "4",
    status: "승인됨",
    conversionStatus: "COMPLETED",
    thumbnailUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    pdfUrl: "https://example.com/drawing.pdf",
    originalFileUrl: "https://example.com/drawing.dwg",
  },
} satisfies PartPropertiesTabProps["part"];

const meta = {
  title: "Components/PartPropertiesTab",
  component: PartPropertiesTab,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    isDeletingDrawing: false,
    isUploadingDrawing: false,
    part: samplePart,
    onDeleteDrawing: () => undefined,
    onUploadDrawing: () => undefined,
  },
} satisfies Meta<typeof PartPropertiesTab>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutDescription: Story = {
  args: {
    part: {
      ...samplePart,
      description: null,
      drawing: null,
      lifecycleState: null,
    },
  },
};

export const Showcase: Story = {
  render: (args) => (
    <div className="space-y-8">
      <PartPropertiesTab {...args} />
      <PartPropertiesTab
        {...args}
        part={{
          ...samplePart,
          category: "전장",
          isPhantom: true,
          lifecycleState: "중단",
          material: null,
          name: "모터 제어 PCB",
          partNumber: "CTRL-PCB-0207",
          revision: "F",
          unit: null,
        }}
      />
    </div>
  ),
};
