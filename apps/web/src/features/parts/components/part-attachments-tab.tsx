import { useMemo, useRef } from "react";
import { toast } from "sonner";
import { PartAttachmentsTab as PartAttachmentsTabView } from "@fabbit/components";
import { useAttachPartFilesAction } from "@/features/parts/hooks/use-attach-part-files-action";
import { parsePartRouteId } from "@/features/parts/lib/part-route";
import { useDelayedVisibilityLogic } from "@/hooks/use-delayed-visibility-logic";
import { useDeletePartDrawingItemAction } from "@/features/parts/hooks/use-delete-part-drawing-item-action";
import { useDetachPartFileAction } from "@/features/parts/hooks/use-detach-part-file-action";
import { usePartFilesQuery } from "@/features/parts/hooks/use-part-files-query";
import { useUploadPartDrawingAction } from "@/features/parts/hooks/use-upload-part-drawing-action";

interface PartAttachmentsTabProps {
  partId: string;
}

function formatRejectedDrawingExtensions(files: File[]) {
  const extensions = Array.from(
    new Set(
      files.map((file) => {
        const extension = file.name.split(".").pop()?.trim().toLowerCase();
        return extension ? extension.toUpperCase() : "확장자 없음";
      }),
    ),
  );

  return extensions.slice(0, 3).join(", ");
}

export function PartAttachmentsTab({ partId }: PartAttachmentsTabProps) {
  const partRoute = parsePartRouteId(partId);
  const isEditable =
    partRoute.kind === "draft" || partRoute.kind === "revision-draft";
  const filesQuery = usePartFilesQuery(partId);
  const attachPartFilesAction = useAttachPartFilesAction(partId);
  const uploadPartDrawingAction = useUploadPartDrawingAction(partId);
  const detachPartFileAction = useDetachPartFileAction(partId);
  const deletePartDrawingItemAction = useDeletePartDrawingItemAction(partId);
  const skipDrawingSuccessToastRef = useRef(false);
  const isAttachmentsTabLoading =
    !filesQuery.isFetched && filesQuery.fetchStatus === "fetching";
  const showLoadingIndicator = useDelayedVisibilityLogic(
    isAttachmentsTabLoading,
  );

  const drawings = useMemo(
    () =>
      (filesQuery.data ?? [])
        .filter((item) => item.kind === "drawing")
        .map((item) => ({
          drawingId: item.id,
          originalName: item.originalName,
          contentType: item.contentType,
          fileSize: item.fileSize,
          fileUrl: item.fileUrl,
          createdAt: item.createdAt,
        })),
    [filesQuery.data],
  );

  const files = useMemo(
    () =>
      (filesQuery.data ?? [])
        .filter((item) => item.kind === "file")
        .map((item) => ({
          fileId: item.id,
          originalName: item.originalName,
          contentType: item.contentType,
          fileSize: item.fileSize,
          fileUrl: item.fileUrl,
          createdAt: item.createdAt,
        })),
    [filesQuery.data],
  );

  return (
    <PartAttachmentsTabView
      drawings={drawings}
      files={files}
      isEditable={isEditable}
      isDeleting={detachPartFileAction.isPending || deletePartDrawingItemAction.isPending}
      isDrawingUploading={uploadPartDrawingAction.isPending}
      isFileUploading={attachPartFilesAction.isPending}
      isLoading={isAttachmentsTabLoading}
      showLoadingIndicator={showLoadingIndicator}
      onDeleteDrawing={async (drawingId) => {
        if (!isEditable) {
          return;
        }
        await deletePartDrawingItemAction.mutateAsync(drawingId);
      }}
      onDeleteFile={async (fileId) => {
        if (!isEditable) {
          return;
        }
        await detachPartFileAction.mutateAsync(fileId);
      }}
      onUploadDrawings={async (filesToUpload) => {
        if (!isEditable) {
          return;
        }

        try {
          await uploadPartDrawingAction.mutateAsync({
            files: filesToUpload,
            skipSuccessToast: skipDrawingSuccessToastRef.current,
          });
        } finally {
          skipDrawingSuccessToastRef.current = false;
        }
      }}
      onRejectDrawings={({ acceptedFiles, rejectedFiles }) => {
        const rejectedCount = rejectedFiles.length;
        const acceptedCount = acceptedFiles.length;
        const extensionsLabel = formatRejectedDrawingExtensions(rejectedFiles);
        const suffix =
          extensionsLabel.length > 0 ? ` 지원되지 않는 형식: ${extensionsLabel}` : "";

        if (acceptedCount > 0) {
          skipDrawingSuccessToastRef.current = true;
          toast.warning(
            `${rejectedCount}개 파일을 제외하고 도면 ${acceptedCount}개를 업로드했습니다.${suffix}`,
          );
          return;
        }

        toast.error(`지원되는 도면 형식만 업로드할 수 있습니다.${suffix}`);
      }}
      onUploadFiles={async (filesToUpload) => {
        if (!isEditable) {
          return;
        }
        await attachPartFilesAction.mutateAsync(filesToUpload);
      }}
    />
  );
}
