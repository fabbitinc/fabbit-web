import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  PartsTemplateAnalysisScreen,
  type PartsTemplateAnalysisExample,
} from "@fabbit/components";

const sampleExamples = [
  {
    title: "부품 목록 파일",
    description: "품번, 품명, 재질처럼 부품 자체 속성이 정리된 파일",
    rows: [
      { part_number: "DRV-001", part_name: "구동 브래킷", material: "알루미늄", revision: "B" },
      { part_number: "SNS-014", part_name: "센서 하우징", material: "SUS304", revision: "A" },
    ],
  },
  {
    title: "부모-자식 BOM",
    description: "상위 부품과 하위 부품이 같은 행에 같이 있는 구조",
    rows: [
      {
        parent_part_number: "ASM-100",
        parent_part_name: "모터 모듈",
        child_part_number: "DRV-001",
        quantity: 2,
      },
      {
        parent_part_number: "ASM-100",
        parent_part_name: "모터 모듈",
        child_part_number: "SNS-014",
        quantity: 1,
      },
    ],
  },
  {
    title: "루트 지정 BOM",
    description: "특정 부품을 기준으로 자식 목록만 정리된 구조",
    rows: [
      { part_number: "DRV-001", part_name: "구동 브래킷", quantity: 2, unit: "EA" },
      { part_number: "CBL-090", part_name: "전원 하네스", quantity: 1, unit: "EA" },
    ],
  },
] satisfies PartsTemplateAnalysisExample[];

const meta = {
  title: "Components/PartsTemplateAnalysisScreen",
  component: PartsTemplateAnalysisScreen,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  args: {
    accept: ".xlsx,.xls,.csv",
    description: undefined,
    examples: sampleExamples,
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
    description: "현재는 부품 PT-120 기준 상세 템플릿으로 저장됩니다.",
  },
};

export const Uploading: Story = {
  args: {
    isUploading: true,
  },
};
