import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PartDetailScreen as PartDetailScreenView } from "@fabbit/components";
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
import type { PartDetailModel, PartDetailTab } from "@/features/parts/types/parts-model";

interface PartDetailScreenProps {
  activeTab: PartDetailTab;
  onTabChange: (tab: PartDetailTab) => void;
  partId: string;
}

export function PartDetailScreen({ activeTab, onTabChange, partId }: PartDetailScreenProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const partQuery = usePartDetailQuery(partId);
  const uploadPartDrawingAction = useUploadPartDrawingAction(partId);
  const deletePartDrawingAction = useDeletePartDrawingAction(partId);
  const currentDrawingId = partQuery.data?.drawing?.id ?? null;
  const currentDrawingStatus = partQuery.data?.drawing?.conversionStatus ?? null;
  const refetchPartDetail = partQuery.refetch;
  const drawingProcessingQuery = usePartDrawingProcessingQuery(
    currentDrawingId,
    currentDrawingStatus === "PENDING" || currentDrawingStatus === "PROCESSING",
  );
  const handledProcessingStateRef = useRef<string | null>(null);

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
      queryClient.setQueryData<PartDetailModel | undefined>(partsKeys.detail(partId), (current) => {
        if (!current?.drawing || current.drawing.id !== currentDrawingId) {
          return current;
        }

        return {
          ...current,
          drawing: {
            ...current.drawing,
            conversionStatus: "FAILED",
          },
        };
      });
      toast.error(
        drawingProcessingQuery.data?.failureReason ?? "도면 처리에 실패했습니다.",
      );
      return;
    }

    void refetchPartDetail();
  }, [
    currentDrawingId,
    drawingProcessingQuery.data?.failureReason,
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
      part={partQuery.data}
      projectsContent={<PartProjectsTab partId={partId} />}
      propertiesContent={partQuery.data ? (
        <PartPropertiesTab
          isDeletingDrawing={deletePartDrawingAction.isPending}
          isUploadingDrawing={uploadPartDrawingAction.isPending}
          part={partQuery.data}
          onDeleteDrawing={() => deletePartDrawingAction.mutate()}
          onUploadDrawing={async (file) => {
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
