import type { Meta, StoryObj } from "@storybook/react-vite";
import { PartPropertiesTab, type PartPropertiesTabProps } from "@fabbit/components";

const readyPart = {
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
    viewerType: "PDF",
    viewerUrl: "https://example.com/drawing.pdf",
    previewUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    originalFileUrl: "https://example.com/drawing.dxf",
  },
} satisfies PartPropertiesTabProps["part"];

const dwgActionRequiredPart = {
  ...readyPart,
  name: "하우징 프레임",
  partNumber: "HSG-FRM-8801",
  revision: "D",
  lifecycleState: "검토",
  material: "AL5052",
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
} satisfies PartPropertiesTabProps["part"];

const solidWorksActionRequiredPart = {
  ...readyPart,
  category: "조립품",
  name: "드라이브 유닛 어셈블리",
  partNumber: "DRV-ASSY-3100",
  revision: "A",
  lifecycleState: "개발",
  material: "복합 조립",
  unit: "SET",
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
} satisfies PartPropertiesTabProps["part"];

const processingPart = {
  ...readyPart,
  category: "전장",
  name: "모터 커버",
  partNumber: "MTR-COVER-1108",
  revision: "F",
  drawing: {
    drawingNumber: "MTR-COVER-1108",
    name: "모터 커버 3D",
    version: "F",
    status: "변환 중",
    conversionStatus: "PROCESSING",
    viewerType: "GLB",
    viewerUrl: null,
    previewUrl: null,
    originalFileUrl: "https://example.com/motor-cover.step",
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
    drawingActivityState: "idle",
    part: readyPart,
  },
} satisfies Meta<typeof PartPropertiesTab>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const RequiresWebViewFileForDWG: Story = {
  args: {
    part: dwgActionRequiredPart,
  },
};

export const RequiresWebViewFileForSolidWorks: Story = {
  args: {
    part: solidWorksActionRequiredPart,
  },
};

export const Processing: Story = {
  args: {
    drawingActivityState: "processing",
    part: processingPart,
  },
};

export const Uploading: Story = {
  args: {
    drawingActivityState: "uploading",
    part: {
      ...readyPart,
      drawing: null,
    },
  },
};

export const WithoutDescription: Story = {
  args: {
    part: {
      ...readyPart,
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
        part={dwgActionRequiredPart}
      />
      <PartPropertiesTab
        {...args}
        drawingActivityState="processing"
        part={processingPart}
      />
      <PartPropertiesTab
        {...args}
        drawingActivityState="uploading"
        part={{
          ...readyPart,
          drawing: null,
        }}
      />
      <PartPropertiesTab
        {...args}
        part={{
          ...readyPart,
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
