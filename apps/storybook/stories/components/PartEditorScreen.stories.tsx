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

const ownerTeamOptions = [
  { value: "me-team", label: "기구설계팀" },
  { value: "ee-team", label: "전장설계팀" },
  { value: "quality-team", label: "품질기획팀" },
  { value: "sourcing-team", label: "구매운영팀" },
];

const createFormValues: PartEditorScreenFormValues = {
  category: "mechanical",
  description: "",
  isPhantom: false,
  leadTimeDays: "14",
  lifecycleState: "draft",
  material: "AL6061-T6",
  name: "드라이브 유닛 베이스 플레이트",
  ownerTeamId: "me-team",
  partNumber: "DRV-BASE-0142",
  revision: "A",
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
  ownerTeamId: "quality-team",
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
  fileName: "drv-assy-main-revD.pdf",
  note: "도면 PDF와 3D 뷰어가 모두 최신 리비전으로 변환 완료된 상태입니다.",
  revision: "D",
  statusLabel: "검토 준비 완료",
  statusTone: "success",
  updatedAtLabel: "2026년 3월 7일 14:20 업데이트",
};

const reviewDrawing: PartEditorScreenDrawingSummary = {
  drawingNumber: "DWG-DRV-0104-E",
  fileName: "drv-assy-main-revE.pdf",
  note: "센서 브래킷 간섭 수정본이 반영됐지만, 공급사 공유 전에 최종 릴리즈 승인 확인이 필요합니다.",
  revision: "E",
  statusLabel: "승인 대기",
  statusTone: "warning",
  updatedAtLabel: "2026년 3월 9일 09:30 업데이트",
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
  mode,
}: {
  initialDrawing?: PartEditorScreenDrawingSummary | null;
  initialExtendedFields: PartEditorScreenExtendedField[];
  initialFormValues: PartEditorScreenFormValues;
  initialStats: PartEditorScreenReferenceStats;
  lastSavedLabel?: string;
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
      mode={mode}
      ownerTeamOptions={ownerTeamOptions}
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
