import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  PartDetailScreen as PartDetailScreenView,
  PartHistoryTab,
  PartPropertiesTab,
  PartRevisionDiff,
  type PartDrawingPreviewDrawing,
  type PartHistoryDraft,
  type PartHistoryRevision,
  type PartHistoryRevisionStatus,
  type PartRevisionDiffData,
  type PartRevisionDiffRevisionOption,
  type PartPropertiesTableRow,
} from "@fabbit/components";
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from "@fabbit/ui";
import { partsKeys } from "@/features/parts/api/parts.queries";
import { PartAttachmentsTab } from "@/features/parts/components/part-attachments-tab";
import { PartBomTab } from "@/features/parts/components/part-bom-tab";
import { PartDirectWorkflowActions } from "@/features/parts/components/part-direct-workflow-actions";
import { PartEcWorkflowActions } from "@/features/parts/components/part-ec-workflow-actions";
import { PartLifecycleActions } from "@/features/parts/components/part-lifecycle-actions";
import { PartProjectsTab } from "@/features/parts/components/part-projects-tab";
import { PartSuppliersTab } from "@/features/parts/components/part-suppliers-tab";
import { useClearPartPreviewAction } from "@/features/parts/hooks/use-clear-part-preview-action";
import { useCreatePartDraftFromRevisionAction } from "@/features/parts/hooks/use-create-part-draft-from-revision-action";
import { useDeletePartPreviewFileAction } from "@/features/parts/hooks/use-delete-part-preview-file-action";
import { usePartDetailQuery } from "@/features/parts/hooks/use-part-detail-query";
import { usePartDrawingProcessingQuery } from "@/features/parts/hooks/use-part-drawing-processing-query";
import { usePartHistoryQuery } from "@/features/parts/hooks/use-part-history-query";
import { usePartPreviewSourcesQuery } from "@/features/parts/hooks/use-part-preview-sources-query";
import { usePartRevisionDiffQuery } from "@/features/parts/hooks/use-part-revision-diff-query";
import { useSelectPartPreviewSourceAction } from "@/features/parts/hooks/use-select-part-preview-source-action";
import { useUploadPartPreviewFileAction } from "@/features/parts/hooks/use-upload-part-preview-file-action";
import { buildPartCustomPropertyRows } from "@/features/parts/lib/part-custom-properties";
import { DEFAULT_PART_DRAWING_FAILURE_MESSAGE } from "@/features/parts/lib/part-drawing-failure";
import { buildPartSystemFields } from "@/features/parts/lib/part-property-meta";
import { getAvailablePartActions } from "@/features/parts/lib/part-actions";
import { buildPartDetailPath, buildPartEditPath } from "@/features/parts/lib/part-route";
import { openPartDrawingViewer } from "@/features/parts/lib/open-part-drawing-viewer";
import type {
  PartDetailModel,
  PartDetailTab,
  PartDrawingProcessingModel,
  PartDrawingWebViewRequirementModel,
  PartRevisionDiffModel,
  PartRevisionHistoryDraftModel,
  PartRevisionHistoryItemModel,
} from "@/features/parts/types/parts-model";
import { usePropertyMetaQuery } from "@/features/properties/hooks/use-property-meta-query";
import { useSettingsQuery } from "@/features/settings";
import { usePendingNavigationGuard } from "@/hooks/use-pending-navigation-guard";

interface PartDetailScreenProps {
  activeTab: PartDetailTab;
  availableTabs?: PartDetailTab[];
  onTabChange: (tab: PartDetailTab) => void;
  partId: string;
  revisionId: string;
}

type PartDrawingStatus = NonNullable<PartDetailModel["drawing"]>["conversionStatus"];

const REVISION_STATUS_MAP: Record<string, PartHistoryRevisionStatus> = {
  DRAFT: "draft",
  RELEASED: "released",
  SUPERSEDED: "superseded",
  CANCELED: "canceled",
};

function toHistoryDraft(draft: PartRevisionHistoryDraftModel): PartHistoryDraft {
  return {
    id: draft.revisionId,
    creationSourceType: draft.creationSourceType ?? undefined,
    status: REVISION_STATUS_MAP[draft.status] ?? "draft",
    createdAt: draft.createdAt ?? undefined,
    createdBy: draft.createdByName ?? undefined,
    completedAt: draft.completedAt ?? undefined,
    completedBy: draft.completedByName ?? undefined,
    releasedRevisionLabel: draft.releasedRevisionCode ?? undefined,
    reason: draft.reason ?? undefined,
  };
}

function toHistoryRevisions(items: PartRevisionHistoryItemModel[]): PartHistoryRevision[] {
  return items.map((item) => ({
    id: item.revisionId,
    revisionLabel: item.revisionCode,
    revisionTitle: `Rev ${item.revisionCode}`,
    author: item.releasedByName ?? undefined,
    timestamp: item.releasedAt ?? undefined,
    status: REVISION_STATUS_MAP[item.status] ?? "draft",
    releaseReason: item.releaseReason ?? undefined,
    releaseWorkflowType: item.releaseWorkflowType ?? undefined,
    releaseSourceNumber: item.releaseSourceNumber ?? undefined,
    releaseSourceTitle: item.releaseSourceTitle ?? undefined,
    changeSummary: item.summary
      ? {
          property: item.summary.attributeChanges,
          file: item.summary.fileChanges,
          bom: item.summary.bomChanges,
        }
      : undefined,
    drafts: item.drafts.map(toHistoryDraft),
  }));
}

function toRevisionStatusLabel(status: PartHistoryRevisionStatus) {
  if (status === "draft") {
    return "초안";
  }
  if (status === "released") {
    return "배포됨";
  }
  if (status === "superseded") {
    return "대체됨";
  }
  return "취소됨";
}

function toDiffRevisionOptions(revisions: PartHistoryRevision[]): PartRevisionDiffRevisionOption[] {
  return revisions.map((revision) => ({
    value: revision.id,
    label: revision.revisionTitle,
    status: toRevisionStatusLabel(revision.status),
  }));
}

function toPartRevisionDiffData(diff: PartRevisionDiffModel | undefined): PartRevisionDiffData | null {
  if (!diff) {
    return null;
  }

  return {
    properties: diff.attributes.map((attribute) => ({
      label: attribute.fieldLabel,
      fromValue: attribute.beforeValue,
      toValue: attribute.afterValue,
      changeType: attribute.changeType.toLowerCase() as PartRevisionDiffData["properties"][number]["changeType"],
    })),
    files: diff.files.map((file) => ({
      fileName: file.displayName,
      changeType: file.changeType.toLowerCase() as PartRevisionDiffData["files"][number]["changeType"],
    })),
    bom: diff.bom.map((item) => ({
      partNumber: item.afterPartNumber ?? item.beforePartNumber ?? item.lineNumber ?? "-",
      name: item.afterName ?? item.beforeName ?? undefined,
      changeType: item.changeType.toLowerCase() as PartRevisionDiffData["bom"][number]["changeType"],
      field: item.beforeQuantity != null || item.afterQuantity != null ? "수량" : undefined,
      fromValue: item.beforeQuantity != null ? String(item.beforeQuantity) : undefined,
      toValue: item.afterQuantity != null ? String(item.afterQuantity) : undefined,
    })),
  };
}

function formatRenderSourceExtensions(extensions: string[]) {
  return extensions
    .map((extension) => extension.replace(/^\./, "").toUpperCase())
    .filter(Boolean)
    .join(", ");
}

function buildWebViewRequirement(
  currentDrawingStatus: PartDrawingStatus | null,
  processing: PartDrawingProcessingModel | undefined,
): PartDrawingWebViewRequirementModel | null {
  const isActionRequired =
    currentDrawingStatus === "ACTION_REQUIRED" ||
    processing?.status === "ACTION_REQUIRED";

  if (!isActionRequired) {
    return null;
  }

  const formattedExtensions = formatRenderSourceExtensions(
    processing?.allowedRenderSourceExtensions ?? [],
  );

  return {
    title: "웹에서 보기 위한 파일이 필요합니다.",
    description: formattedExtensions
      ? `원본 파일은 저장되었습니다. 웹에서 확인하려면 ${formattedExtensions} 형식 파일을 올려 주세요.`
      : "원본 파일은 저장되었습니다. 웹에서 확인하려면 추가 파일을 올려 주세요.",
  };
}

export function PartDetailScreen({
  activeTab,
  availableTabs,
  onTabChange,
  partId,
  revisionId,
}: PartDetailScreenProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const settingsQuery = useSettingsQuery();
  const partQuery = usePartDetailQuery(partId, revisionId);
  const propertyMetaQuery = usePropertyMetaQuery("PART", false);
  const currentDrawingId = partQuery.data?.drawing?.id ?? null;
  const currentDrawingStatus = partQuery.data?.drawing?.conversionStatus ?? null;
  const [isPreviewSettingsOpen, setIsPreviewSettingsOpen] = useState(false);
  const [isRevisionDiffOpen, setIsRevisionDiffOpen] = useState(false);
  const [selectedBaseRevisionId, setSelectedBaseRevisionId] = useState<string | null>(null);
  const [selectedTargetRevisionId, setSelectedTargetRevisionId] = useState<string | null>(null);
  const historyQuery = usePartHistoryQuery(partId, activeTab === "history" || isRevisionDiffOpen);
  const shouldQueryDrawingProcessing =
    currentDrawingStatus === "PENDING" ||
    currentDrawingStatus === "PROCESSING" ||
    currentDrawingStatus === "ACTION_REQUIRED";
  const drawingProcessingQuery = usePartDrawingProcessingQuery(
    partId,
    revisionId,
    currentDrawingId,
    shouldQueryDrawingProcessing,
  );
  const currentRevisionStatus = partQuery.data?.revisionStatus ?? null;
  const historyRevisions = useMemo(
    () => (historyQuery.data ? toHistoryRevisions(historyQuery.data) : undefined),
    [historyQuery.data],
  );
  const diffRevisionOptions = useMemo(
    () => toDiffRevisionOptions(historyRevisions ?? []),
    [historyRevisions],
  );
  const revisionDiffQuery = usePartRevisionDiffQuery(
    partId,
    selectedTargetRevisionId,
    selectedBaseRevisionId,
    isRevisionDiffOpen,
  );
  const revisionDiffData = useMemo(
    () => toPartRevisionDiffData(revisionDiffQuery.data),
    [revisionDiffQuery.data],
  );
  const canEditDraft = currentRevisionStatus === "DRAFT";
  const canCreateRevisionDraft = currentRevisionStatus === "RELEASED";
  const canManagePreview = canEditDraft;
  const previewSourcesQuery = usePartPreviewSourcesQuery(
    partId,
    revisionId,
    canManagePreview && isPreviewSettingsOpen,
  );
  const selectPartPreviewSourceAction = useSelectPartPreviewSourceAction(partId, revisionId);
  const clearPartPreviewAction = useClearPartPreviewAction(partId, revisionId);
  const uploadPartPreviewFileAction = useUploadPartPreviewFileAction(partId, revisionId);
  const deletePartPreviewFileAction = useDeletePartPreviewFileAction(partId, revisionId);
  const createPartDraftFromRevisionAction = useCreatePartDraftFromRevisionAction(partId, revisionId, {
    onSuccess: (nextPart) => {
      navigate(buildPartDetailPath(nextPart.partId, nextPart.revisionId));
    },
  });
  const isDrawingUploading = uploadPartPreviewFileAction.isPending;
  const isPreviewMutationPending =
    selectPartPreviewSourceAction.isPending ||
    clearPartPreviewAction.isPending ||
    uploadPartPreviewFileAction.isPending ||
    deletePartPreviewFileAction.isPending;
  const draftCount = partQuery.data?.draftCount ?? 0;
  const handledProcessingStateRef = useRef<string | null>(null);
  const resolvedPart = useMemo(
    () =>
      partQuery.data
        ? {
            ...partQuery.data,
            drawing: partQuery.data.drawing
              ? {
                  ...partQuery.data.drawing,
                  conversionStatus:
                    drawingProcessingQuery.data?.status === "ACTION_REQUIRED"
                      ? "ACTION_REQUIRED"
                      : partQuery.data.drawing.conversionStatus,
                  failureCode:
                    drawingProcessingQuery.data?.status === "FAILED"
                      ? drawingProcessingQuery.data.failureCode
                      : partQuery.data.drawing.failureCode,
                  failureMessage:
                    drawingProcessingQuery.data?.status === "FAILED"
                      ? drawingProcessingQuery.data.failureMessage
                      : partQuery.data.drawing.failureMessage,
                  webViewRequirement: buildWebViewRequirement(
                    partQuery.data.drawing.conversionStatus,
                    drawingProcessingQuery.data,
                  ),
                }
              : null,
          }
        : undefined,
    [drawingProcessingQuery.data, partQuery.data],
  );
  const drawingActivityState =
    isDrawingUploading
      ? "uploading"
      : resolvedPart?.drawing?.conversionStatus === "PENDING" ||
          resolvedPart?.drawing?.conversionStatus === "PROCESSING"
        ? "processing"
        : "idle";
  const partActions = getAvailablePartActions({
    workflowMode: settingsQuery.data?.partWorkflowMode ?? null,
    revisionStatus: currentRevisionStatus,
    lifecycleState: partQuery.data?.lifecycleState ?? null,
  });
  const canUseDirectWorkflowActions = partActions.canRelease || partActions.canCancel;
  const systemFields = useMemo(
    () => buildPartSystemFields(propertyMetaQuery.data),
    [propertyMetaQuery.data],
  );
  const customPropertyRows = useMemo(
    () =>
      resolvedPart
        ? buildPartCustomPropertyRows(propertyMetaQuery.data ?? [], resolvedPart.extendedProperties)
        : [],
    [propertyMetaQuery.data, resolvedPart],
  );
  const propertyRows = useMemo<PartPropertiesTableRow[]>(
    () => {
      if (!resolvedPart) {
        return [];
      }

      const rowByKey: Record<string, PartPropertiesTableRow> = {
        partNumber: {
          label: "품번",
          value: <span className="font-mono text-xs">{resolvedPart.partNumber}</span>,
        },
        name: {
          label: "품명",
          value: resolvedPart.name ?? <span className="text-muted-foreground/40">—</span>,
        },
        revision: {
          label: "리비전",
          value: resolvedPart.revision || <span className="text-muted-foreground/40">—</span>,
        },
        lifecycleState: {
          label: "상태",
          value: resolvedPart.lifecycleState ? (
            <PartLifecycleActions
              currentState={resolvedPart.lifecycleState}
              partId={partId}
              revisionId={revisionId}
              partNumber={resolvedPart.partNumber}
              partName={resolvedPart.name}
              transitions={partActions.lifecycleTransitions}
              disabledReason={partActions.disabledReason}
            />
          ) : (
            <span className="text-muted-foreground/40">—</span>
          ),
        },
        category: {
          label: "카테고리",
          value: resolvedPart.category ?? <span className="text-muted-foreground/40">—</span>,
        },
        material: {
          label: "재질",
          value: resolvedPart.material ?? <span className="text-muted-foreground/40">—</span>,
        },
        unit: {
          label: "단위",
          value: resolvedPart.unit ?? <span className="text-muted-foreground/40">—</span>,
        },
        leadTimeDays: {
          label: "리드타임",
          value:
            resolvedPart.leadTimeDays != null ? `${resolvedPart.leadTimeDays}일` : <span className="text-muted-foreground/40">—</span>,
        },
        isPhantom: {
          label: "팬텀",
          value:
            resolvedPart.isPhantom == null
              ? <span className="text-muted-foreground/40">—</span>
              : resolvedPart.isPhantom
                ? "예"
                : "아니오",
        },
        description: {
          alignTop: true,
          label: "설명",
          value: resolvedPart.description ? (
            <p className="whitespace-pre-wrap leading-6 text-foreground/80">{resolvedPart.description}</p>
          ) : (
            <span className="text-muted-foreground/40">—</span>
          ),
        },
      };

      return systemFields
        .filter((field) => field.active !== false)
        .sort((left, right) => (left.displayOrder ?? 0) - (right.displayOrder ?? 0))
        .map((field) => {
          const row = rowByKey[field.key];
          return row ? { ...row, label: field.label } : null;
        })
        .filter((row): row is PartPropertiesTableRow => row !== null);
    },
    [resolvedPart, systemFields],
  );

  usePendingNavigationGuard({
    when: uploadPartPreviewFileAction.isPending,
  });

  useEffect(() => {
    if (!currentDrawingId) {
      handledProcessingStateRef.current = null;
      return;
    }

    const processingStatus = drawingProcessingQuery.data?.status;

    if (processingStatus !== "COMPLETED" && processingStatus !== "FAILED") {
      handledProcessingStateRef.current = null;
      return;
    }

    const handledKey = `${currentDrawingId}:${processingStatus}`;

    if (handledProcessingStateRef.current === handledKey) {
      return;
    }

    handledProcessingStateRef.current = handledKey;

    if (processingStatus === "FAILED") {
      const failureCode = drawingProcessingQuery.data?.failureCode ?? null;
      const failureMessage =
        drawingProcessingQuery.data?.failureMessage ??
        DEFAULT_PART_DRAWING_FAILURE_MESSAGE;

      queryClient.setQueryData<PartDetailModel | undefined>(
        partsKeys.detail(partId, revisionId),
        (current) => {
          if (!current?.drawing || current.drawing.id !== currentDrawingId) {
            return current;
          }

          return {
            ...current,
            drawing: {
              ...current.drawing,
              conversionStatus: "FAILED",
              failureCode,
              failureMessage,
            },
          };
        },
      );
      toast.error(failureMessage);
      return;
    }

    void partQuery.refetch();
  }, [
    currentDrawingId,
    drawingProcessingQuery.data?.failureCode,
    drawingProcessingQuery.data?.failureMessage,
    drawingProcessingQuery.data?.status,
    partId,
    partQuery,
    queryClient,
    revisionId,
  ]);

  function handleOpenDrawingViewer(drawing: PartDrawingPreviewDrawing) {
    if (!drawing.viewerType || !drawing.viewerUrl) {
      return;
    }

    const part = partQuery.data;
    const title =
      part?.name?.trim() ||
      part?.partNumber ||
      drawing.drawingNumber ||
      drawing.name ||
      (drawing.viewerType === "PDF" ? "2D 도면" : "3D 모델");

    openPartDrawingViewer({
      category: part?.category,
      description: part?.description,
      drawing,
      partNumber: part?.partNumber ?? drawing.drawingNumber,
      revision: part?.revision,
      title,
    });
  }

  function handleOpenRevisionDiff(revision: PartHistoryRevision) {
    const revisions = historyRevisions ?? [];
    const currentIndex = revisions.findIndex((item) => item.id === revision.id);
    const defaultBaseRevisionId =
      currentIndex >= 0 ? revisions[currentIndex + 1]?.id ?? null : null;

    setSelectedTargetRevisionId(revision.id);
    setSelectedBaseRevisionId(defaultBaseRevisionId);
    setIsRevisionDiffOpen(true);
  }

  const showEcDisabledActions = canEditDraft && partActions.disabledReason !== null;
  const headerActions =
    canCreateRevisionDraft || canEditDraft || canUseDirectWorkflowActions || showEcDisabledActions ? (
      <div className="flex w-full flex-col items-stretch gap-2 sm:w-[90px]">
        {canCreateRevisionDraft ? (
          <>
            <Button
              className="w-full"
              disabled={createPartDraftFromRevisionAction.isPending}
              size="sm"
              type="button"
              variant="outline"
              onClick={() => {
                void createPartDraftFromRevisionAction.mutateAsync();
              }}
            >
              개정
            </Button>
            {draftCount > 0 && partQuery.data?.partNumber ? (
              <Button
                className="h-auto w-full px-0 py-0 text-xs font-medium text-muted-foreground"
                size="xs"
                type="button"
                variant="link"
                onClick={() => {
                  const searchParams = new URLSearchParams({
                    menu: "workbench",
                    q: partQuery.data.partNumber,
                  });

                  navigate(`/parts?${searchParams.toString()}`);
                }}
              >
                진행 중 초안 {draftCount}개 보기
              </Button>
            ) : null}
          </>
        ) : null}
        {canEditDraft ? (
          <Button
            className="w-full"
            size="sm"
            type="button"
            variant="outline"
            onClick={() => navigate(buildPartEditPath(partId, revisionId))}
          >
            속성 편집
          </Button>
        ) : null}
        {canUseDirectWorkflowActions ? (
          <PartDirectWorkflowActions
            className="w-full"
            partId={partId}
            revisionId={revisionId}
            onCanceled={() => navigate("/parts", { replace: true })}
            onReleased={(nextPart) =>
              navigate(buildPartDetailPath(nextPart.partId, nextPart.revisionId), { replace: true })
            }
          />
        ) : null}
        {canEditDraft && partActions.disabledReason ? (
          <PartEcWorkflowActions
            className="w-full"
            disabledReason={partActions.disabledReason}
          />
        ) : null}
      </div>
    ) : undefined;

  return (
    <>
      <PartDetailScreenView
        activeTab={activeTab}
        availableTabs={availableTabs}
        attachmentsContent={(
          <PartAttachmentsTab
            isEditable={canEditDraft}
            partId={partId}
            revisionId={revisionId}
          />
        )}
        bomContent={<PartBomTab partId={partId} revisionId={revisionId} canEditDraft={canEditDraft} />}
        historyContent={(
          <PartHistoryTab
            diffLoadingRevisionId={
              revisionDiffQuery.isFetching
                ? historyRevisions?.find((revision) => revision.id === selectedTargetRevisionId)?.id ?? null
                : null
            }
            revisions={historyRevisions}
            onOpenDiff={handleOpenRevisionDiff}
          />
        )}
        isError={partQuery.isError || !partQuery.data}
        isLoading={partQuery.isLoading}
        headerActions={headerActions}
        part={resolvedPart}
        projectsContent={<PartProjectsTab partId={partId} revisionId={revisionId} />}
        propertiesContent={resolvedPart ? (
          <PartPropertiesTab
            drawingActivityState={drawingActivityState}
            extendedRows={customPropertyRows}
            onOpenDrawingViewer={handleOpenDrawingViewer}
            part={{
              drawing: resolvedPart.drawing,
              partNumber: resolvedPart.partNumber,
            }}
            previewSettings={{
              isAvailable: canManagePreview,
              isLoading: previewSourcesQuery.isLoading && !previewSourcesQuery.data,
              isSubmitting: isPreviewMutationPending,
              isUploading: uploadPartPreviewFileAction.isPending,
              open: isPreviewSettingsOpen,
              sources: previewSourcesQuery.data ?? [],
              onClearSelection: async () => {
                await clearPartPreviewAction.mutateAsync();
              },
              onDeletePreviewFile: async (previewFileId) => {
                await deletePartPreviewFileAction.mutateAsync(previewFileId);
              },
              onOpenChange: setIsPreviewSettingsOpen,
              onSelectSource: async ({ sourceId, sourceType }) => {
                await selectPartPreviewSourceAction.mutateAsync({
                  sourceId,
                  sourceType,
                });
                setIsPreviewSettingsOpen(false);
              },
              onUploadPreviewFile: async (file) => {
                await uploadPartPreviewFileAction.mutateAsync(file);
                setIsPreviewSettingsOpen(false);
              },
            }}
            rows={propertyRows}
          />
        ) : null}
        suppliersContent={<PartSuppliersTab partId={partId} revisionId={revisionId} />}
        onBackClick={() => navigate("/parts")}
        onRetry={() => {
          void partQuery.refetch();
        }}
        onTabChange={onTabChange}
      />
      <Dialog open={isRevisionDiffOpen} onOpenChange={setIsRevisionDiffOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>리비전 변경 상세</DialogTitle>
          </DialogHeader>
          <PartRevisionDiff
            diff={revisionDiffData}
            fromRevision={selectedBaseRevisionId}
            revisions={diffRevisionOptions}
            toRevision={selectedTargetRevisionId}
            onFromChange={setSelectedBaseRevisionId}
            onToChange={setSelectedTargetRevisionId}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
