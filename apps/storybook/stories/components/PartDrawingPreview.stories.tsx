import type { Meta, StoryObj } from "@storybook/react-vite";
import { PartDrawingPreview, type PartDrawingPreviewProps } from "@fabbit/components";

const samplePart = {
  partNumber: "DRV-PLATE-0142",
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
} satisfies PartDrawingPreviewProps["part"];

const meta = {
  title: "Components/PartDrawingPreview",
  component: PartDrawingPreview,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    part: samplePart,
    isDeleting: false,
    isUploading: false,
    onDelete: () => undefined,
    onUpload: () => undefined,
  },
} satisfies Meta<typeof PartDrawingPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithDrawing: Story = {};

export const Empty: Story = {
  args: {
    part: {
      partNumber: samplePart.partNumber,
      drawing: null,
    },
  },
};

export const Processing: Story = {
  args: {
    part: {
      ...samplePart,
      drawing: {
        ...samplePart.drawing,
        conversionStatus: "PENDING",
        thumbnailUrl: null,
      },
    },
  },
};
