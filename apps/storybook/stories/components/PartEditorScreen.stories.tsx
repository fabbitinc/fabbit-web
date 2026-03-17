import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  PartEditorScreen,
  type PartEditorScreenDrawingSummary,
  type PartEditorScreenExtendedField,
  type PartEditorScreenFormValues,
  type PartEditorScreenReferenceStats,
} from "@fabbit/components";

const categoryOptions = [
  { value: "mechanical", label: "기구" },
  { value: "electrical", label: "전장" },
  { value: "purchase", label: "구매품" },
  { value: "assy", label: "조립품" },
];

const lifecycleOptions = [
  { value: "draft", label: "초안" },
  { value: "development", label: "개발" },
  { value: "mass-production", label: "양산" },
  { value: "hold", label: "보류" },
];

const unitOptions = [
  { value: "ea", label: "EA" },
  { value: "set", label: "SET" },
  { value: "assy", label: "ASSY" },
  { value: "m", label: "M" },
];

const createFormValues: PartEditorScreenFormValues = {
  category: "mechanical",
  description: "",
  isPhantom: false,
  leadTimeDays: "14",
  lifecycleState: "draft",
  material: "AL6061-T6",
  name: "드라이브 유닛 베이스 플레이트",
  partNumber: "DRV-BASE-0142",
  revision: "",
  unit: "ea",
};

const editFormValues: PartEditorScreenFormValues = {
  category: "assy",
  description:
    "모터 하우징과 센서 브래킷의 체결 기준이 되는 상위 조립품입니다. 양산 치공구 기준 홀 간격이 변경되어 리비전 업데이트가 필요합니다.",
  isPhantom: true,
  leadTimeDays: "3",
  lifecycleState: "mass-production",
  material: "복합 조립품",
  name: "드라이브 모듈 메인 어셈블리",
  partNumber: "DRV-ASSY-0104",
  revision: "D",
  unit: "assy",
};

const createExtendedFields: PartEditorScreenExtendedField[] = [
  {
    id: "surface",
    label: "표면 처리",
    placeholder: "예: 샌드블라스트 + 아노다이징",
    value: "",
  },
  {
    id: "spec",
    label: "규격 키",
    helperText: "공급사 검색과 템플릿 매핑에서 재사용됩니다.",
    placeholder: "예: BASE-AL-6T",
    value: "BASE-AL-6T",
  },
];

const editExtendedFields: PartEditorScreenExtendedField[] = [
  {
    id: "surface",
    label: "표면 처리",
    placeholder: "표면 처리 정보를 입력하세요",
    value: "흑색 아노다이징",
  },
  {
    id: "tolerance",
    label: "주요 공차",
    helperText: "가공 기준과 검사 항목을 묶는 키입니다.",
    placeholder: "예: +/-0.05",
    value: "+/-0.05",
  },
  {
    id: "tooling",
    label: "치공구 번호",
    placeholder: "예: JIG-DRV-22",
    value: "JIG-DRV-22",
  },
  {
    id: "erp",
    label: "ERP 코드",
    placeholder: "예: ERP-700184",
    value: "ERP-700184",
  },
];

const editDrawing: PartEditorScreenDrawingSummary = {
  drawingNumber: "DWG-DRV-0104-D",
  name: "drv-assy-main-revD.pdf",
  revision: "D",
  version: "D",
  status: "ACTIVE",
  conversionStatus: "COMPLETED",
  viewerType: "PDF",
  viewerUrl: "https://example.com/drawings/drv-assy-main-revD.pdf",
  previewUrl: "https://picsum.photos/1200/900?random=12",
  originalFileUrl: "https://example.com/drawings/drv-assy-main-revD-original.pdf",
};

const reviewDrawing: PartEditorScreenDrawingSummary = {
  drawingNumber: "DWG-DRV-0104-E",
  name: "drv-assy-main-revE.step",
  revision: "E",
  version: "E",
  status: "ACTIVE",
  conversionStatus: "ACTION_REQUIRED",
  viewerType: null,
  viewerUrl: null,
  previewUrl: null,
  originalFileUrl: "https://example.com/drawings/drv-assy-main-revE.step",
  webViewRequirement: {
    title: "웹에서 보기 위한 파일이 필요합니다.",
    description: "원본 파일은 저장되었습니다. 웹에서 확인하려면 PDF 또는 GLB 형식 파일을 올려 주세요.",
  },
};

const createStats: PartEditorScreenReferenceStats = {
  attachments: 0,
  childParts: 0,
  linkedProjects: 0,
  linkedSuppliers: 0,
};

const editStats: PartEditorScreenReferenceStats = {
  attachments: 8,
  childParts: 12,
  linkedProjects: 4,
  linkedSuppliers: 2,
};

function PartEditorScreenStory({
  initialDrawing = null,
  initialExtendedFields,
  initialFormValues,
  initialStats,
  lastSavedLabel,
  lockedFields,
  mode,
}: {
  initialDrawing?: PartEditorScreenDrawingSummary | null;
  initialExtendedFields: PartEditorScreenExtendedField[];
  initialFormValues: PartEditorScreenFormValues;
  initialStats: PartEditorScreenReferenceStats;
  lastSavedLabel?: string;
  lockedFields?: { lifecycleState?: boolean; partNumber?: boolean; revision?: boolean };
  mode: "create" | "edit";
}) {
  const [formValues, setFormValues] = useState(initialFormValues);
  const [extendedFields, setExtendedFields] = useState(initialExtendedFields);

  return (
    <PartEditorScreen
      categoryOptions={categoryOptions}
      drawing={initialDrawing}
      extendedFields={extendedFields}
      formValues={formValues}
      lastSavedLabel={lastSavedLabel}
      lifecycleOptions={lifecycleOptions}
      lockedFields={lockedFields}
      mode={mode}
      referenceStats={initialStats}
      unitOptions={unitOptions}
      onBack={() => undefined}
      onChange={setFormValues}
      onExtendedFieldsChange={setExtendedFields}
      onSaveDraft={() => undefined}
      onSubmit={() => undefined}
    />
  );
}

const meta = {
  title: "Components/PartEditorScreen",
  component: PartEditorScreenStory,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof PartEditorScreenStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Create: Story = {
  args: {
    initialExtendedFields: createExtendedFields,
    initialFormValues: createFormValues,
    initialStats: createStats,
    mode: "create",
  },
  render: (args) => <PartEditorScreenStory {...args} />,
};

export const Edit: Story = {
  args: {
    initialDrawing: editDrawing,
    initialExtendedFields: editExtendedFields,
    initialFormValues: editFormValues,
    initialStats: editStats,
    lastSavedLabel: "마지막 저장 12분 전",
    mode: "edit",
  },
  render: (args) => <PartEditorScreenStory {...args} />,
};

export const EditWithLockedFields: Story = {
  args: {
    initialDrawing: editDrawing,
    initialExtendedFields: editExtendedFields,
    initialFormValues: editFormValues,
    initialStats: editStats,
    lastSavedLabel: "마지막 저장 12분 전",
    lockedFields: { partNumber: true, revision: true, lifecycleState: true },
    mode: "edit",
  },
  render: (args) => <PartEditorScreenStory {...args} />,
};

export const ReviewReady: Story = {
  args: {
    initialDrawing: reviewDrawing,
    initialExtendedFields: editExtendedFields,
    initialFormValues: {
      ...editFormValues,
      lifecycleState: "development",
      revision: "E",
    },
    initialStats: editStats,
    lastSavedLabel: "변경 초안 저장됨",
    mode: "edit",
  },
  render: (args) => <PartEditorScreenStory {...args} />,
};
