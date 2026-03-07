import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileIcon, type FileIconKind } from "@fabbit/components";

const fileKinds: { contentType: string; kind: FileIconKind; label: string; name: string }[] = [
  { kind: "pdf", label: "PDF", name: "specification.pdf", contentType: "application/pdf" },
  {
    kind: "document",
    label: "문서",
    name: "work-instruction.docx",
    contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
  { kind: "step", label: "STEP", name: "housing.step", contentType: "model/step" },
  { kind: "dwg", label: "DWG", name: "fixture.dwg", contentType: "application/acad" },
  {
    kind: "xlsx",
    label: "스프레드시트",
    name: "bom.xlsx",
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  },
  { kind: "image", label: "이미지", name: "inspection.png", contentType: "image/png" },
  { kind: "audio", label: "오디오", name: "voice-note.m4a", contentType: "audio/mp4" },
  { kind: "video", label: "비디오", name: "assembly.mp4", contentType: "video/mp4" },
  { kind: "archive", label: "압축", name: "handoff.zip", contentType: "application/zip" },
  { kind: "code", label: "구조화 데이터", name: "mapping.json", contentType: "application/json" },
  { kind: "other", label: "기타", name: "artifact.bin", contentType: "application/octet-stream" },
];

const meta = {
  title: "Components/FileIcon",
  component: FileIcon,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    kind: "pdf",
    name: "specification.pdf",
    contentType: "application/pdf",
  },
} satisfies Meta<typeof FileIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Showcase: Story = {
  render: () => (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {fileKinds.map((item) => (
        <div key={item.kind} className="flex items-center gap-3 rounded-lg border border-border/70 bg-card px-4 py-3">
          <div className="rounded-full bg-muted/70 p-2">
            <FileIcon kind={item.kind} name={item.name} contentType={item.contentType} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">{item.label}</p>
            <p className="truncate text-xs text-muted-foreground">{item.name}</p>
          </div>
        </div>
      ))}
    </div>
  ),
};
