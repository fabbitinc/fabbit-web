import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PartDetailScreen as PartDetailScreenView } from "@fabbit/components";
import type { PartDrawingPreviewDrawing } from "@fabbit/components";
import { useNavigate } from "react-router-dom";
import { PartHistoryTab, PartPropertiesTab } from "@fabbit/components";
import { partsKeys } from "@/features/parts/api/parts.queries";
import { PartAttachmentsTab } from "@/features/parts/components/part-attachments-tab";
import { PartBomTab } from "@/features/parts/components/part-bom-tab";
import { PartOwnerTab } from "@/features/parts/components/part-owner-tab";
import { PartProjectsTab } from "@/features/parts/components/part-projects-tab";
import { PartSuppliersTab } from "@/features/parts/components/part-suppliers-tab";
import { useDeletePartDrawingAction } from "@/features/parts/hooks/use-delete-part-drawing-action";
import { usePartDrawingProcessingQuery } from "@/features/parts/hooks/use-part-drawing-processing-query";
import { usePartDetailQuery } from "@/features/parts/hooks/use-part-detail-query";
import { useUploadPartDrawingAction } from "@/features/parts/hooks/use-upload-part-drawing-action";
import { useUploadPartDrawingRenderSourceAction } from "@/features/parts/hooks/use-upload-part-drawing-render-source-action";
import { usePendingNavigationGuard } from "@/hooks/use-pending-navigation-guard";
import { DEFAULT_PART_DRAWING_FAILURE_MESSAGE } from "@/features/parts/lib/part-drawing-failure";
import type {
  PartDetailModel,
  PartDetailTab,
  PartDrawingProcessingModel,
  PartDrawingWebViewRequirementModel,
} from "@/features/parts/types/parts-model";

interface PartDetailScreenProps {
  activeTab: PartDetailTab;
  onTabChange: (tab: PartDetailTab) => void;
  partId: string;
}

type PartDrawingStatus = NonNullable<PartDetailModel["drawing"]>["conversionStatus"];

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

export function PartDetailScreen({ activeTab, onTabChange, partId }: PartDetailScreenProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const partQuery = usePartDetailQuery(partId);
  const uploadPartDrawingAction = useUploadPartDrawingAction(partId);
  const deletePartDrawingAction = useDeletePartDrawingAction(partId);
  const currentDrawingId = partQuery.data?.drawing?.id ?? null;
  const currentDrawingStatus = partQuery.data?.drawing?.conversionStatus ?? null;
  const shouldQueryDrawingProcessing =
    currentDrawingStatus === "PENDING" ||
    currentDrawingStatus === "PROCESSING" ||
    currentDrawingStatus === "ACTION_REQUIRED";
  const refetchPartDetail = partQuery.refetch;
  const drawingProcessingQuery = usePartDrawingProcessingQuery(
    currentDrawingId,
    shouldQueryDrawingProcessing,
  );
  const uploadPartDrawingRenderSourceAction =
    useUploadPartDrawingRenderSourceAction({
      drawingId: currentDrawingId,
      partId,
    });
  const isDrawingUploading =
    uploadPartDrawingAction.isPending ||
    uploadPartDrawingRenderSourceAction.isPending;
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
  const shouldUploadRenderSource = Boolean(
    resolvedPart?.drawing?.id && resolvedPart.drawing.webViewRequirement,
  );
  const handledProcessingStateRef = useRef<string | null>(null);

  usePendingNavigationGuard({
    when: isDrawingUploading,
  });

  function handleOpenDrawingViewer(drawing: PartDrawingPreviewDrawing) {
    if (drawing.viewerType !== "GLB" || !drawing.viewerUrl) {
      return;
    }

    const searchParams = new URLSearchParams();
    const part = partQuery.data;
    const title =
      part?.name?.trim() ||
      part?.partNumber ||
      drawing.drawingNumber ||
      drawing.name ||
      "3D 모델";

    searchParams.set("src", drawing.viewerUrl);
    searchParams.set("title", title);

    if (part?.partNumber) {
      searchParams.set("partNumber", part.partNumber);
    } else if (drawing.drawingNumber) {
      searchParams.set("partNumber", drawing.drawingNumber);
    }

    if (part?.revision) {
      searchParams.set("revision", part.revision);
    }

    if (part?.category) {
      searchParams.set("category", part.category);
    }

    if (drawing.name) {
      searchParams.set("fileName", drawing.name);
    } else if (drawing.drawingNumber) {
      searchParams.set("fileName", drawing.drawingNumber);
    }

    window.open(
      `/parts/drawing-viewer?${searchParams.toString()}`,
      "_blank",
      "noopener,noreferrer",
    );
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
    <PartDetailScreenView
      activeTab={activeTab}
      attachmentsContent={<PartAttachmentsTab partId={partId} />}
      bomContent={<PartBomTab partId={partId} />}
      historyContent={<PartHistoryTab />}
      isError={partQuery.isError || !partQuery.data}
      isLoading={partQuery.isLoading}
      ownerContent={<PartOwnerTab partId={partId} />}
      part={resolvedPart}
      projectsContent={<PartProjectsTab partId={partId} />}
      propertiesContent={resolvedPart ? (
        <PartPropertiesTab
          drawingActivityState={drawingActivityState}
          isDeletingDrawing={deletePartDrawingAction.isPending}
          onOpenDrawingViewer={handleOpenDrawingViewer}
          part={resolvedPart}
          onDeleteDrawing={() => deletePartDrawingAction.mutate()}
          onUploadDrawing={async (file) => {
            if (shouldUploadRenderSource && resolvedPart.drawing?.id) {
              await uploadPartDrawingRenderSourceAction.mutateAsync(file);
              return;
            }

            await uploadPartDrawingAction.mutateAsync(file);
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
  );
}
