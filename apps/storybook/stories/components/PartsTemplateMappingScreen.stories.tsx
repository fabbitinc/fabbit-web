import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  MappingSaveDialog,
  PartsTemplateMappingScreen,
} from "@fabbit/components";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@fabbit/ui";

function MappingBoardPlaceholder() {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.4fr_0.6fr]">
      <Card className="border-border/70">
        <CardHeader>
          <CardTitle>원본 데이터 미리보기</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="mapping-excel-index-header border-r border-border px-3 py-2 text-left">#</th>
                  <th className="mapping-excel-header-part border-r border-border px-3 py-2 text-left">품번</th>
                  <th className="mapping-excel-header-part border-r border-border px-3 py-2 text-left">품명</th>
                  <th className="mapping-excel-header-unmapped px-3 py-2 text-left">비고</th>
                </tr>
              </thead>
              <tbody>
                <tr className="mapping-excel-row-hover border-b border-border/60">
                  <td className="mapping-excel-index-header border-r border-border px-3 py-2">1</td>
                  <td className="border-r border-border px-3 py-2">DRV-001</td>
                  <td className="border-r border-border px-3 py-2">구동 브래킷</td>
                  <td className="px-3 py-2">외주 제작</td>
                </tr>
                <tr className="mapping-excel-row-hover">
                  <td className="mapping-excel-index-header border-r border-border px-3 py-2">2</td>
                  <td className="border-r border-border px-3 py-2">SNS-014</td>
                  <td className="border-r border-border px-3 py-2">센서 하우징</td>
                  <td className="px-3 py-2">도면 연결 필요</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>매핑 컬럼</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="mapping-column-part-border mapping-column-part-drop-bg rounded-2xl border px-4 py-3">
              <p className="mapping-column-part-text text-sm font-semibold">Part</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="secondary">part_number</Badge>
                <Badge variant="secondary">part_name</Badge>
              </div>
            </div>
            <div className="mapping-column-unmapped-border mapping-column-unmapped-drop-bg rounded-2xl border px-4 py-3">
              <p className="mapping-column-unmapped-text text-sm font-semibold">Unmapped</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="outline">memo</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>검토 메모</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>품번과 품명은 Part 엔터티로 확정합니다.</p>
            <p>비고 컬럼은 일단 보류 상태로 유지합니다.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PartsTemplateMappingScreenStory({
  confirmDisabledReason,
  emptyState,
  isLoadingBoard = false,
  isSaving = false,
}: {
  confirmDisabledReason?: string;
  emptyState?: {
    onBackClick: () => void;
    onRetryClick?: () => void;
  };
  isLoadingBoard?: boolean;
  isSaving?: boolean;
}) {
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  return (
    <PartsTemplateMappingScreen
      boardContent={<MappingBoardPlaceholder />}
      confirmDisabledReason={confirmDisabledReason}
      emptyState={emptyState}
      fileName="모터_서브어셈블리_템플릿.xlsx"
      isLoadingBoard={isLoadingBoard}
      isSaveDialogOpen={isSaveDialogOpen}
      isSaving={isSaving}
      saveDialogContent={(
        <MappingSaveDialog
          defaultMappingName="부품 마스터 템플릿"
          isLoadingMappings={false}
          isSubmitting={isSaving}
          mappings={[
            { id: "mapping-1", name: "부품 마스터 템플릿", version: 3 },
            { id: "mapping-2", name: "외주 부품 상세 템플릿", version: 1 },
          ]}
          onOpenChange={setIsSaveDialogOpen}
          onConfirm={() => setIsSaveDialogOpen(false)}
        />
      )}
      onCancelClick={() => undefined}
      onConfirmClick={() => setIsSaveDialogOpen(true)}
      onResetClick={() => undefined}
      onSaveDialogOpenChange={setIsSaveDialogOpen}
    />
  );
}

const meta = {
  title: "Components/PartsTemplateMappingScreen",
  component: PartsTemplateMappingScreenStory,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof PartsTemplateMappingScreenStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <PartsTemplateMappingScreenStory />,
};

export const LoadingRules: Story = {
  render: () => <PartsTemplateMappingScreenStory isLoadingBoard />,
};

export const DisabledConfirm: Story = {
  render: () => (
    <PartsTemplateMappingScreenStory confirmDisabledReason="부품 매칭키가 모두 지정되어야 합니다." />
  ),
};

export const EmptyState: Story = {
  render: () => (
    <PartsTemplateMappingScreenStory
      emptyState={{
        onBackClick: () => undefined,
        onRetryClick: () => undefined,
      }}
    />
  ),
};
