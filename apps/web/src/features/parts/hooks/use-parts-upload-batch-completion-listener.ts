import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { invalidatePartsQueries } from "@/features/parts/lib/invalidate-parts-queries";
import type { PartsUploadBatchSessionModel, PartsUploadBatchStatusModel } from "@/features/parts/types/parts-upload-model";

interface UsePartsUploadBatchCompletionListenerParams {
  batchSession: PartsUploadBatchSessionModel | null;
  batchStatus: PartsUploadBatchStatusModel | null | undefined;
  contextPartId?: string | null;
}

export function usePartsUploadBatchCompletionListener({
  batchSession,
  batchStatus,
  contextPartId,
}: UsePartsUploadBatchCompletionListenerParams) {
  const queryClient = useQueryClient();
  const handledBatchIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!batchSession || !batchStatus) {
      return;
    }

    const isDone =
      batchStatus.pendingCount === 0 && batchStatus.processingCount === 0;

    if (!isDone || handledBatchIdRef.current === batchSession.batchId) {
      return;
    }

    handledBatchIdRef.current = batchSession.batchId;

    void invalidatePartsQueries(
      queryClient,
      contextPartId ?? undefined,
      undefined,
      {
        includeList: true,
      },
    );

    if (batchStatus.failedJobCount > 0 || batchStatus.failed.length > 0) {
      toast.warning("일부 부품 업로드 처리에 실패했습니다.");
      return;
    }

    toast.success("부품 업로드 처리가 완료되었습니다.");
  }, [batchSession, batchStatus, contextPartId, queryClient]);

  return {
    resetHandledBatchId() {
      handledBatchIdRef.current = null;
    },
  };
}
