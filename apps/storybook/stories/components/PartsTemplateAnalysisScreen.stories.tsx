import type { Meta, StoryObj } from "@storybook/react-vite";
import { PartsTemplateAnalysisScreen } from "@fabbit/components";

const meta = {
  title: "Components/PartsTemplateAnalysisScreen",
  component: PartsTemplateAnalysisScreen,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  args: {
    accept: ".xlsx,.xls,.csv",
    description: "업로드 파일을 분석해 부품 속성 템플릿을 생성합니다.",
    isUploading: false,
    onBackClick: () => undefined,
    onFilesSelect: () => undefined,
  },
} satisfies Meta<typeof PartsTemplateAnalysisScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const PartScoped: Story = {
  args: {
    description: "부품(PT-120) 기준으로 상세 속성 템플릿을 생성합니다.",
  },
};

export const Uploading: Story = {
  args: {
    isUploading: true,
  },
};
