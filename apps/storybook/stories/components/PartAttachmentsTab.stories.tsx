import type { Meta, StoryObj } from "@storybook/react-vite";
import { PartAttachmentsTab } from "@fabbit/components";

const sampleDrawings = [
  {
    drawingId: "drawing-1",
    originalName: "DRV-PLATE-0142-REV-C.dwg",
    contentType: "application/acad",
    fileSize: 2_184_302,
    fileUrl: "https://example.com/files/drive-plate.dwg",
    createdAt: "2026-03-07T02:10:00Z",
  },
  {
    drawingId: "drawing-2",
    originalName: "DRV-PLATE-0142-조립도.pdf",
    contentType: "application/pdf",
    fileSize: 684_221,
    fileUrl: "https://example.com/files/drive-plate-assembly.pdf",
    createdAt: "2026-03-06T09:40:00Z",
  },
];

const sampleFiles = [
  {
    fileId: "file-1",
    originalName: "DRV-PLATE-0142-검토의견.pdf",
    contentType: "application/pdf",
    fileSize: 484_221,
    fileUrl: "https://example.com/files/drive-plate-review.pdf",
    createdAt: "2026-03-06T09:40:00Z",
  },
  {
    fileId: "file-2",
    originalName: "DRV-PLATE-0142-재질사양서.xlsx",
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    fileSize: 128_442,
    fileUrl: "https://example.com/files/material-spec.xlsx",
    createdAt: "2026-03-05T10:20:00Z",
  },
];

const meta = {
  title: "Components/PartAttachmentsTab",
  component: PartAttachmentsTab,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    drawings: sampleDrawings,
    files: sampleFiles,
    isDeleting: false,
    isDrawingUploading: false,
    isFileUploading: false,
    isLoading: false,
    onDeleteDrawing: async (_drawingId: string) => undefined,
    onDeleteFile: async (_fileId: string) => undefined,
    onUploadDrawings: async (_files: File[]) => undefined,
    onUploadFiles: async (_files: File[]) => undefined,
  },
} satisfies Meta<typeof PartAttachmentsTab>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    drawings: [],
    files: [],
  },
};

export const Showcase: Story = {
  render: (args) => (
    <div className="space-y-8">
      <PartAttachmentsTab {...args} />
      <PartAttachmentsTab
        {...args}
        drawings={[]}
        files={[]}
        isLoading
        showLoadingIndicator
      />
    </div>
  ),
};
