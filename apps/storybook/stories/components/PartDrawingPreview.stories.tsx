import type { ReactNode } from "react";
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
    viewerType: "PDF",
    viewerUrl: "https://example.com/drawing.pdf",
    previewUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    originalFileUrl: "https://example.com/drawing.dxf",
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

function ShowcaseCard({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-border/60 bg-muted/10 p-4">
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
      </div>
      {children}
    </div>
  );
}

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
        conversionStatus: "PROCESSING",
        previewUrl: null,
      },
    },
  },
};

export const RequiresWebViewFile: Story = {
  args: {
    part: {
      partNumber: "HSG-FRM-8801",
      drawing: {
        drawingNumber: "DWG-8801",
        name: "하우징 프레임",
        version: "D",
        status: "원본 등록",
        conversionStatus: "MANUAL_REQUIRED",
        viewerType: null,
        viewerUrl: null,
        previewUrl: null,
        originalFileUrl: "https://example.com/housing-frame.dwg",
        webViewRequirement: {
          title: "웹에서 보기 위한 파일이 필요합니다.",
          description: "원본 파일은 저장되었습니다. 웹에서 확인하려면 추가 파일을 올려 주세요.",
        },
      },
    },
  },
};

export const Failed: Story = {
  args: {
    part: {
      ...samplePart,
      drawing: {
        ...samplePart.drawing,
        conversionStatus: "FAILED",
        failureMessage: "지원하지 않는 도면 형식입니다.",
        previewUrl: null,
        viewerUrl: null,
      },
    },
  },
};

export const Showcase: Story = {
  render: (args) => (
    <div className="grid gap-6 lg:grid-cols-2">
      <ShowcaseCard title="기본 미리보기">
        <PartDrawingPreview {...args} />
      </ShowcaseCard>

      <ShowcaseCard title="등록 전">
        <PartDrawingPreview
          {...args}
          part={{
            partNumber: samplePart.partNumber,
            drawing: null,
          }}
        />
      </ShowcaseCard>

      <ShowcaseCard title="산출물 생성 중">
        <PartDrawingPreview
          {...args}
          part={{
            ...samplePart,
            drawing: {
              ...samplePart.drawing,
              conversionStatus: "PROCESSING",
              previewUrl: null,
            },
          }}
        />
      </ShowcaseCard>

      <ShowcaseCard title="웹 확인용 파일 필요">
        <PartDrawingPreview
          {...args}
          part={{
            partNumber: "DRV-ASSY-3100",
            drawing: {
              drawingNumber: "ASSY-3100",
              name: "드라이브 유닛 어셈블리",
              version: "A",
              status: "원본 등록",
              conversionStatus: "MANUAL_REQUIRED",
              viewerType: null,
              viewerUrl: null,
              previewUrl: null,
              originalFileUrl: "https://example.com/drive-unit.sldasm",
              webViewRequirement: {
                title: "웹에서 보기 위한 파일이 필요합니다.",
                description: "원본 파일은 저장되었습니다. 웹에서 확인하려면 추가 파일을 올려 주세요.",
              },
            },
          }}
        />
      </ShowcaseCard>

      <ShowcaseCard title="실패 후 재업로드">
        <PartDrawingPreview
          {...args}
          part={{
            ...samplePart,
            drawing: {
              ...samplePart.drawing,
              conversionStatus: "FAILED",
              failureMessage: "지원하지 않는 도면 형식입니다.",
              previewUrl: null,
              viewerUrl: null,
            },
          }}
        />
      </ShowcaseCard>
    </div>
  ),
};
