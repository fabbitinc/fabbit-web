import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PartDetailScreen as PartDetailScreenView } from "@fabbit/components";
import type { PartDrawingPreviewDrawing } from "@fabbit/components";
import { useNavigate } from "react-router-dom";
import {
  PartHistoryTab,
  type PartHistoryDraft,
  PartPropertiesTab,
  PartRevisionDiff,
  type PartHistoryRevision,
  type PartHistoryRevisionStatus,
  type PartRevisionDiffData,
  type PartRevisionDiffRevisionOption,
} from "@fabbit/components";
import { usePartHistoryQuery } from "@/features/parts/hooks/use-part-history-query";
import { usePartRevisionDiffQuery } from "@/features/parts/hooks/use-part-revision-diff-query";
import type {
  PartRevisionHistoryDraftModel,
  PartRevisionHistoryItemModel,
} from "@/features/parts/types/parts-model";
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle } from "@fabbit/ui";
import { partsKeys } from "@/features/parts/api/parts.queries";
import { PartAttachmentsTab } from "@/features/parts/components/part-attachments-tab";
import { PartBomTab } from "@/features/parts/components/part-bom-tab";
import { PartDirectWorkflowActions } from "@/features/parts/components/part-direct-workflow-actions";
import { PartProjectsTab } from "@/features/parts/components/part-projects-tab";
import { PartSuppliersTab } from "@/features/parts/components/part-suppliers-tab";
import { useClearPartPreviewAction } from "@/features/parts/hooks/use-clear-part-preview-action";
import { useDeletePartPreviewFileAction } from "@/features/parts/hooks/use-delete-part-preview-file-action";
import { usePartDrawingProcessingQuery } from "@/features/parts/hooks/use-part-drawing-processing-query";
import { usePartDetailQuery } from "@/features/parts/hooks/use-part-detail-query";
import { usePartPreviewSourcesQuery } from "@/features/parts/hooks/use-part-preview-sources-query";
import { useSelectPartPreviewSourceAction } from "@/features/parts/hooks/use-select-part-preview-source-action";
import { useUploadPartPreviewFileAction } from "@/features/parts/hooks/use-upload-part-preview-file-action";
import { useCreatePartDraftFromRevisionAction } from "@/features/parts/hooks/use-create-part-draft-from-revision-action";
import { usePendingNavigationGuard } from "@/hooks/use-pending-navigation-guard";
import { DEFAULT_PART_DRAWING_FAILURE_MESSAGE } from "@/features/parts/lib/part-drawing-failure";
import {
  buildPartDetailPath,
  buildPartEditPath,
  parsePartRouteId,
} from "@/features/parts/lib/part-route";
import { openPartDrawingViewer } from "@/features/parts/lib/open-part-drawing-viewer";
import { useSettingsQuery } from "@/features/settings";
import type {
  PartDetailModel,
  PartDetailTab,
  PartDrawingProcessingModel,
  PartDrawingWebViewRequirementModel,
  PartRevisionDiffModel,
} from "@/features/parts/types/parts-model";

interface PartDetailScreenProps {
  activeTab: PartDetailTab;
  availableTabs?: PartDetailTab[];
  onTabChange: (tab: PartDetailTab) => void;
  partId: string;
}

type PartDrawingStatus = NonNullable<PartDetailModel["drawing"]>["conversionStatus"];

const REVISION_STATUS_MAP: Record<string, PartHistoryRevisionStatus> = {
  DRAFT: "draft",
  RELEASED: "released",
  SUPERSEDED: "superseded",
  CANCELED: "canceled",
};

function toHistoryDraft(
  draft: PartRevisionHistoryDraftModel,
): PartHistoryDraft {
  return {
    id: draft.revisionId,
    label: "초안 생성",
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
    changeSummary: item.summary
      ? {
          property: item.summary.attributeChanges,
          file: item.summary.fileChanges,
          bom: item.summary.bomChanges,
        }
      : undefined,
    drafts: item.drafts.map((draft) => toHistoryDraft(draft)),
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

function toDiffRevisionOptions(
  revisions: PartHistoryRevision[],
): PartRevisionDiffRevisionOption[] {
  return revisions.map((revision) => ({
    value: revision.revisionLabel,
    label: revision.revisionTitle,
    status: toRevisionStatusLabel(revision.status),
  }));
}

function toPartRevisionDiffData(
  diff: PartRevisionDiffModel | undefined,
): PartRevisionDiffData | null {
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
      partNumber:
        item.afterPartNumber ??
        item.beforePartNumber ??
        item.lineNumber ??
        "-",
      name: item.afterName ?? item.beforeName ?? undefined,
      changeType: item.changeType.toLowerCase() as PartRevisionDiffData["bom"][number]["changeType"],
      field:
        item.beforeQuantity != null || item.afterQuantity != null
          ? "수량"
          : undefined,
      fromValue:
        item.beforeQuantity != null ? String(item.beforeQuantity) : undefined,
      toValue:
        item.afterQuantity != null ? String(item.afterQuantity) : undefined,
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
}: PartDetailScreenProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const settingsQuery = useSettingsQuery();
  const partQuery = usePartDetailQuery(partId);
  const currentDrawingId = partQuery.data?.drawing?.id ?? null;
  const currentDrawingStatus = partQuery.data?.drawing?.conversionStatus ?? null;
  const [isPreviewSettingsOpen, setIsPreviewSettingsOpen] = useState(false);
  const shouldQueryDrawingProcessing =
    currentDrawingStatus === "PENDING" ||
    currentDrawingStatus === "PROCESSING" ||
    currentDrawingStatus === "ACTION_REQUIRED";
  const refetchPartDetail = partQuery.refetch;
  const drawingProcessingQuery = usePartDrawingProcessingQuery(
    partId,
    currentDrawingId,
    shouldQueryDrawingProcessing,
  );
  const partNumber = partQuery.data?.partNumber ?? null;
  const partRoute = useMemo(() => parsePartRouteId(partId), [partId]);
  const historyQuery = usePartHistoryQuery(
    partNumber ?? "",
    partNumber != null && activeTab === "history",
  );
  const historyRevisions = useMemo(
    () =>
      historyQuery.data
        ? toHistoryRevisions(historyQuery.data)
        : undefined,
    [historyQuery.data],
  );
  const [isRevisionDiffOpen, setIsRevisionDiffOpen] = useState(false);
  const [selectedBaseRevisionCode, setSelectedBaseRevisionCode] = useState<string | null>(null);
  const [selectedTargetRevisionCode, setSelectedTargetRevisionCode] = useState<string | null>(null);
  const diffRevisionOptions = useMemo(
    () => toDiffRevisionOptions(historyRevisions ?? []),
    [historyRevisions],
  );
  const revisionDiffQuery = usePartRevisionDiffQuery(
    partNumber ?? "",
    selectedTargetRevisionCode,
    selectedBaseRevisionCode,
    isRevisionDiffOpen,
  );
  const revisionDiffData = useMemo(
    () => toPartRevisionDiffData(revisionDiffQuery.data),
    [revisionDiffQuery.data],
  );
  const canEditDraft =
    partRoute.kind === "draft" || partRoute.kind === "revision-draft";
  const canCreateRevisionDraft = partRoute.kind === "revision";
  const draftCount = partQuery.data?.draftCount ?? 0;
  const canManagePreview = canEditDraft;
  const previewSourcesQuery = usePartPreviewSourcesQuery(
    partId,
    canManagePreview && isPreviewSettingsOpen,
  );
  const selectPartPreviewSourceAction = useSelectPartPreviewSourceAction(partId);
  const clearPartPreviewAction = useClearPartPreviewAction(partId);
  const uploadPartPreviewFileAction = useUploadPartPreviewFileAction(partId);
  const deletePartPreviewFileAction = useDeletePartPreviewFileAction(partId);
  const isDrawingUploading = uploadPartPreviewFileAction.isPending;
  const resolvedPart = partQuery.data
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
    : undefined;
  const drawingActivityState =
    isDrawingUploading
      ? "uploading"
      : resolvedPart?.drawing?.conversionStatus === "PENDING" ||
          resolvedPart?.drawing?.conversionStatus === "PROCESSING"
        ? "processing"
        : "idle";
  const isPreviewMutationPending =
    selectPartPreviewSourceAction.isPending ||
    clearPartPreviewAction.isPending ||
    uploadPartPreviewFileAction.isPending ||
    deletePartPreviewFileAction.isPending;
  const handledProcessingStateRef = useRef<string | null>(null);
  const isDirectWorkflowMode = settingsQuery.data?.partWorkflowMode === "DIRECT";
  const canUseDirectWorkflowActions =
    isDirectWorkflowMode &&
    canEditDraft;
  const createPartDraftFromRevisionAction = useCreatePartDraftFromRevisionAction(
    partId,
    {
      onSuccess: (nextPart) => {
        navigate(buildPartDetailPath(nextPart.routeId));
      },
    },
  );
  const headerActions =
    canCreateRevisionDraft || canEditDraft || canUseDirectWorkflowActions ? (
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
            onClick={() => navigate(buildPartEditPath(partId))}
          >
            속성 편집
          </Button>
        ) : null}
        {canUseDirectWorkflowActions ? (
          <PartDirectWorkflowActions
            className="w-full"
            partId={partId}
            onCanceled={() => navigate("/parts", { replace: true })}
            onReleased={(nextPart) => navigate(buildPartDetailPath(nextPart.routeId), { replace: true })}
          />
        ) : null}
      </div>
    ) : undefined;

  usePendingNavigationGuard({
    when: uploadPartPreviewFileAction.isPending,
  });

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
    const currentIndex = revisions.findIndex(
      (item) => item.id === revision.id,
    );
    const defaultBaseRevision =
      currentIndex >= 0 ? revisions[currentIndex + 1]?.revisionLabel ?? null : null;

    setSelectedTargetRevisionCode(revision.revisionLabel);
    setSelectedBaseRevisionCode(defaultBaseRevision);
    setIsRevisionDiffOpen(true);
  }

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

      queryClient.setQueryData<PartDetailModel | undefined>(partsKeys.detail(partId), (current) => {
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
      });
      toast.error(failureMessage);
      return;
    }

    void refetchPartDetail();
  }, [
    currentDrawingId,
    drawingProcessingQuery.data?.failureCode,
    drawingProcessingQuery.data?.failureMessage,
    drawingProcessingQuery.data?.status,
    partId,
    queryClient,
    refetchPartDetail,
  ]);

  return (
    <>
      <PartDetailScreenView
        activeTab={activeTab}
        availableTabs={availableTabs}
        attachmentsContent={<PartAttachmentsTab partId={partId} />}
        bomContent={<PartBomTab partId={partId} />}
        historyContent={(
          <PartHistoryTab
            diffLoadingRevisionId={
              revisionDiffQuery.isFetching
                ? historyRevisions?.find(
                    (revision) => revision.revisionLabel === selectedTargetRevisionCode,
                  )?.id ?? null
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
        projectsContent={<PartProjectsTab partId={partId} />}
        propertiesContent={resolvedPart ? (
          <PartPropertiesTab
            drawingActivityState={drawingActivityState}
            onOpenDrawingViewer={handleOpenDrawingViewer}
            part={resolvedPart}
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
          />
        ) : null}
        suppliersContent={<PartSuppliersTab partId={partId} />}
        onBackClick={() => navigate("/parts")}
        onRetry={() => {
          void partQuery.refetch();
        }}
        onTabChange={onTabChange}
      />
      <Dialog
        open={isRevisionDiffOpen}
        onOpenChange={(open) => {
          setIsRevisionDiffOpen(open);
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>리비전 변경 상세</DialogTitle>
          </DialogHeader>
          <PartRevisionDiff
            diff={revisionDiffData}
            fromRevision={selectedBaseRevisionCode}
            revisions={diffRevisionOptions}
            toRevision={selectedTargetRevisionCode}
            onFromChange={setSelectedBaseRevisionCode}
            onToChange={setSelectedTargetRevisionCode}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
