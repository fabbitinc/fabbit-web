import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PartsTemplateMappingWorkspace } from "@fabbit/components";
import { resetTemplateMappingFlow } from "@/features/part-template-mapping/lib/reset-template-mapping-flow";
import { useTemplateMappingDerivedState } from "@/features/part-template-mapping/hooks/use-template-mapping-derived-state";
import { useTemplateMappingBoardLogic } from "@/features/part-template-mapping/hooks/use-template-mapping-board-logic";
import { useTemplateMappingListQuery } from "@/features/part-template-mapping/hooks/use-template-mapping-list-query";
import { useTemplateOntologySchemaQuery } from "@/features/part-template-mapping/hooks/use-template-ontology-schema-query";
import { useSaveTemplateMappingAction } from "@/features/part-template-mapping/hooks/use-save-template-mapping-action";
import { useTemplateMappingActions } from "@/features/part-template-mapping/hooks/use-template-mapping-actions";
import { usePartTemplateMappingStore } from "@/features/part-template-mapping/stores/template-mapping-store";
import { useTemplateUploadStore } from "@/features/part-template-mapping/stores/template-upload-store";
import {
  buildPartDetailPath,
  buildPartTemplateProcessingPath,
} from "@/features/parts/lib/part-route";

interface PartsTemplateMappingScreenProps {
  partId?: string;
  revisionId?: string;
  fileName?: string;
}

export function PartsTemplateMappingScreen({
  partId,
  revisionId,
  fileName,
}: PartsTemplateMappingScreenProps) {
  const navigate = useNavigate();
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const mappingHeaders = usePartTemplateMappingStore((state) => state.mappingHeaders);
  const primaryUploadId = useTemplateUploadStore((state) => state.primaryUploadId);
  const uploadedFiles = useTemplateUploadStore((state) => state.uploadedFiles);
  const ontologyQuery = useTemplateOntologySchemaQuery(mappingHeaders.length > 0);
  const boardProps = useTemplateMappingBoardLogic({ ontologySchema: ontologyQuery.data });
  const derived = useTemplateMappingDerivedState(ontologyQuery.data);
  const mappingActions = useTemplateMappingActions(derived.relationTargetInfoByType);
  const mappingListQuery = useTemplateMappingListQuery(isSaveDialogOpen);
  const saveAction = useSaveTemplateMappingAction();
  const effectiveFileName = fileName || uploadedFiles[0]?.name || "분석 결과";
  const defaultMappingName = partId ? "부품 상세 템플릿" : "부품 마스터 템플릿";
  const returnPath =
    partId && revisionId ? buildPartDetailPath(partId, revisionId) : "/parts";
  const processingPath =
    partId && revisionId ? buildPartTemplateProcessingPath(partId, revisionId) : "/parts/templates/processing";

  const handleExit = () => {
    resetTemplateMappingFlow();
    navigate(returnPath);
  };

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

    handleExit();
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

  return (
    <PartsTemplateMappingWorkspace
      boardProps={mappingHeaders.length > 0 ? boardProps : undefined}
      confirmDisabledReason={confirmDisabledReason || undefined}
      emptyState={mappingHeaders.length === 0
        ? {
            onBackClick: handleExit,
            onRetryClick: primaryUploadId
              ? () => navigate(processingPath, { state: { fileName: effectiveFileName } })
              : undefined,
          }
        : undefined}
      fileName={effectiveFileName}
      isLoadingBoard={ontologyQuery.isLoading}
      isSaveDialogOpen={isSaveDialogOpen}
      isSaving={saveAction.isPending}
      saveDialogKey={`${defaultMappingName}:${mappingListQuery.data?.[0]?.id ?? "new"}:${mappingListQuery.data?.length ?? 0}:${isSaveDialogOpen ? "open" : "closed"}`}
      saveDialogProps={{
        defaultMappingName,
        isLoadingMappings: mappingListQuery.isLoading,
        isSubmitting: saveAction.isPending,
        mappings: mappingListQuery.data ?? [],
        onOpenChange: setIsSaveDialogOpen,
        onConfirm: (payload) => {
          void handleConfirm(payload);
        },
      }}
      onCancelClick={handleExit}
      onConfirmClick={handleOpenSaveDialog}
      onResetClick={mappingActions.handleResetMappings}
      onSaveDialogOpenChange={setIsSaveDialogOpen}
    />
  );
}
