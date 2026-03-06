import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  PartsTemplateProcessingScreen,
  type PartsTemplateProcessingStep,
} from "@fabbit/components";

const inProgressSteps = [
  { key: "parsing", label: "파일 구조 파싱", status: "completed" },
  { key: "normalizing", label: "헤더/컬럼 정규화", status: "completed" },
  { key: "analyzing", label: "속성 후보 분석", status: "in_progress" },
  { key: "finalizing", label: "템플릿 버전 생성", status: "pending" },
] satisfies PartsTemplateProcessingStep[];

const completedSteps = [
  { key: "parsing", label: "파일 구조 파싱", status: "completed" },
  { key: "normalizing", label: "헤더/컬럼 정규화", status: "completed" },
  { key: "analyzing", label: "속성 후보 분석", status: "completed" },
  { key: "finalizing", label: "템플릿 버전 생성", status: "completed" },
] satisfies PartsTemplateProcessingStep[];

const meta = {
  title: "Components/PartsTemplateProcessingScreen",
  component: PartsTemplateProcessingScreen,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  args: {
    canProceed: false,
    canRetry: true,
    error: null,
    fileName: "모터_서브어셈블리_템플릿.xlsx",
    hasUpload: true,
    logs: [
      "분석 대상 파일 확인: 모터_서브어셈블리_템플릿.xlsx",
      "파일 구조와 시트를 파싱하고 있습니다...",
      "컬럼명 표준화를 진행합니다...",
      "속성 후보와 데이터 타입을 추론합니다...",
    ],
    progress: 68,
    steps: inProgressSteps,
    onProceed: () => undefined,
    onRetry: () => undefined,
  },
} satisfies Meta<typeof PartsTemplateProcessingScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Completed: Story = {
  args: {
    canProceed: true,
    logs: [
      "분석 대상 파일 확인: 모터_서브어셈블리_템플릿.xlsx",
      "파일 구조와 시트를 파싱하고 있습니다...",
      "원본 컬럼 헤더 추출 완료",
      "속성 분석이 완료되었습니다. 매핑 검토 단계로 이동할 수 있습니다.",
    ],
    progress: 100,
    steps: completedSteps,
  },
};

export const ErrorState: Story = {
  args: {
    error: "속성 분석 처리 중 오류가 발생했습니다. 파일 형식을 다시 확인해주세요.",
  },
};

export const MissingUpload: Story = {
  args: {
    canRetry: false,
    hasUpload: false,
    logs: ["업로드 정보가 없어 분석을 시작하지 못했습니다."],
    progress: 0,
    steps: [
      { key: "parsing", label: "파일 구조 파싱", status: "pending" },
      { key: "normalizing", label: "헤더/컬럼 정규화", status: "pending" },
      { key: "analyzing", label: "속성 후보 분석", status: "pending" },
      { key: "finalizing", label: "템플릿 버전 생성", status: "pending" },
    ],
  },
};
