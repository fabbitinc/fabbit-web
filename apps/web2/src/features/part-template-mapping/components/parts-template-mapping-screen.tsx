import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, RotateCcw, Sparkles } from "lucide-react";
import {
  Button,
  Dialog,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@fabbit/ui";
import { KanbanBoard } from "@/features/part-template-mapping/components/kanban/kanban-board";
import { MappingSaveDialog } from "@/features/part-template-mapping/components/mapping-save-dialog";
import { useTemplateMappingDerivedState } from "@/features/part-template-mapping/hooks/use-template-mapping-derived-state";
import { useTemplateMappingListQuery } from "@/features/part-template-mapping/hooks/use-template-mapping-list-query";
import { useTemplateOntologySchemaQuery } from "@/features/part-template-mapping/hooks/use-template-ontology-schema-query";
import { useSaveTemplateMappingAction } from "@/features/part-template-mapping/hooks/use-save-template-mapping-action";
import { useTemplateMappingActions } from "@/features/part-template-mapping/hooks/use-template-mapping-actions";
import { usePartTemplateMappingStore } from "@/features/part-template-mapping/stores/template-mapping-store";
import { useTemplateUploadStore } from "@/features/part-template-mapping/stores/template-upload-store";
import "@/features/part-template-mapping/components/parts-template-mapping.css";

interface PartsTemplateMappingScreenProps {
  partId?: string;
  fileName?: string;
}

export function PartsTemplateMappingScreen({
  partId,
  fileName,
}: PartsTemplateMappingScreenProps) {
  const navigate = useNavigate();
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const mappingHeaders = usePartTemplateMappingStore((state) => state.mappingHeaders);
  const primaryUploadId = useTemplateUploadStore((state) => state.primaryUploadId);
  const uploadedFiles = useTemplateUploadStore((state) => state.uploadedFiles);
  const ontologyQuery = useTemplateOntologySchemaQuery(mappingHeaders.length > 0);
  const derived = useTemplateMappingDerivedState(ontologyQuery.data);
  const mappingActions = useTemplateMappingActions(derived.relationTargetInfoByType);
  const mappingListQuery = useTemplateMappingListQuery(isSaveDialogOpen);
  const saveAction = useSaveTemplateMappingAction();
  const effectiveFileName = fileName || uploadedFiles[0]?.name || "분석 결과";
  const defaultMappingName = partId ? "부품 상세 템플릿" : "부품 마스터 템플릿";
  const returnPath = partId ? `/parts/${partId}` : "/parts";
  const processingPath = partId ? `/parts/${partId}/templates/processing` : "/parts/templates/processing";

  const handleOpenSaveDialog = () => {
    if (!primaryUploadId) {
      return;
    }

    if (!derived.hasRequiredPartMergeKeys) {
      return;
    }

    if (derived.hasRelationMergeKeyIssues) {
      return;
    }

    if (derived.hasUnselectedMappings) {
      return;
    }

    setIsSaveDialogOpen(true);
  };

  const handleConfirm = async (payload: {
    saveMode: "existing" | "new";
    selectedMappingId: string;
    mappingName: string;
    duplicateNameExists: boolean;
  }) => {
    if (!primaryUploadId) {
      return;
    }

    await saveAction.mutateAsync({
      mode: payload.saveMode,
      uploadId: primaryUploadId,
      mappingId: payload.selectedMappingId || undefined,
      mappingName: payload.mappingName,
    });

    useTemplateUploadStore.getState().resetUploadState();
    usePartTemplateMappingStore.getState().resetTemplateMappingState();
    navigate(returnPath);
  };

  const confirmDisabledReason = !derived.hasMappings
    ? "매핑된 카드가 없습니다."
    : !primaryUploadId
      ? "업로드 정보가 없습니다."
      : derived.hasUnselectedMappings
        ? "속성을 선택하지 않은 카드가 있습니다."
        : !derived.hasRequiredPartMergeKeys
          ? "부품 매칭키가 모두 지정되어야 합니다."
          : derived.hasRelationMergeKeyIssues
            ? "관계 매핑의 매칭키를 확인해주세요."
            : "";

  if (mappingHeaders.length === 0) {
    return (
      <section className="app-panel rounded-[32px] p-8 text-center">
        <h1 className="text-xl font-semibold text-foreground">매핑 데이터가 없습니다</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          분석 단계를 먼저 완료해야 매핑 보드를 구성할 수 있습니다.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Button variant="outline" onClick={() => navigate(returnPath)}>
            목록으로 돌아가기
          </Button>
          {primaryUploadId && (
            <Button onClick={() => navigate(processingPath, { state: { fileName: effectiveFileName } })}>
              분석 다시 실행
            </Button>
          )}
        </div>
      </section>
    );
  }

  return (
    <div className="parts-template-mapping-theme space-y-6">
      <section className="app-panel rounded-[32px] p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="size-3.5" />
              Mapping
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">부품 템플릿 매핑 검토</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              {effectiveFileName} 분석 결과를 검토하고, 부품 속성과 관계 속성을 최종 확정합니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={mappingActions.handleResetMappings}>
              <RotateCcw className="size-4" />
              초기화
            </Button>
          </div>
        </div>
      </section>

      {ontologyQuery.isLoading ? (
        <section className="app-panel rounded-[32px] p-8 text-center text-sm text-muted-foreground">
          <Loader2 className="mx-auto mb-3 size-5 animate-spin" />
          매핑 규칙을 불러오는 중입니다.
        </section>
      ) : (
        <KanbanBoard ontologySchema={ontologyQuery.data} />
      )}

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => {
            useTemplateUploadStore.getState().resetUploadState();
            usePartTemplateMappingStore.getState().resetTemplateMappingState();
            navigate(returnPath);
          }}
        >
          취소
        </Button>

        {confirmDisabledReason ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button disabled>최종 승인 완료</Button>
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={8} className="max-w-[320px] text-xs">
              {confirmDisabledReason}
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button disabled={saveAction.isPending} onClick={handleOpenSaveDialog}>
            {saveAction.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                저장 중...
              </>
            ) : (
              "최종 승인 완료"
            )}
          </Button>
        )}
      </div>

      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <MappingSaveDialog
          open={isSaveDialogOpen}
          defaultMappingName={defaultMappingName}
          isLoadingMappings={mappingListQuery.isLoading}
          isSubmitting={saveAction.isPending}
          mappings={mappingListQuery.data ?? []}
          onOpenChange={setIsSaveDialogOpen}
          onConfirm={(payload) => {
            void handleConfirm(payload);
          }}
        />
      </Dialog>
    </div>
  );
}
