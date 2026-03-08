import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileIcon, FILE_ICON_EXTENSION_RULES, type FileIconKind } from "@fabbit/components";

const fileKinds: { contentType: string; kind: FileIconKind; label: string; name: string }[] = [
  { kind: "pdf", label: "PDF", name: ".pdf", contentType: "application/pdf" },
  {
    kind: "document",
    label: "문서",
    name: ".docx",
    contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
  { kind: "step", label: "STEP", name: ".step", contentType: "model/step" },
  { kind: "dwg", label: "DWG", name: ".dwg", contentType: "application/acad" },
  {
    kind: "xlsx",
    label: "스프레드시트",
    name: ".xlsx",
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  },
  { kind: "image", label: "이미지", name: ".png", contentType: "image/png" },
  { kind: "audio", label: "오디오", name: ".m4a", contentType: "audio/mp4" },
  { kind: "video", label: "비디오", name: ".mp4", contentType: "video/mp4" },
  { kind: "archive", label: "압축", name: ".zip", contentType: "application/zip" },
  { kind: "code", label: "구조화 데이터", name: ".json", contentType: "application/json" },
  { kind: "other", label: "기타", name: ".bin", contentType: "application/octet-stream" },
];

const extensionsByKind = Object.fromEntries(
  FILE_ICON_EXTENSION_RULES.map((rule) => [rule.kind, rule.extensions]),
) as Partial<Record<FileIconKind, readonly string[]>>;

const meta = {
  title: "Components/FileIcon",
  component: FileIcon,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    kind: "pdf",
    name: ".pdf",
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
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">{item.label}</p>
            <p className="truncate text-xs text-muted-foreground">{item.name}</p>
            {extensionsByKind[item.kind]?.length ? (
              <div className="mt-2 flex flex-wrap gap-1">
                {extensionsByKind[item.kind]?.map((extension) => (
                  <span
                    key={`${item.kind}-${extension}`}
                    className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                  >
                    {extension}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  ),
};
