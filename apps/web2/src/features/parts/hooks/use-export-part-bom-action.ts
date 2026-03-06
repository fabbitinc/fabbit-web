import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { exportPartBomTree } from "@/features/parts/api/parts.api";
import type { ExportPartBomTreeQueryDto } from "@/features/parts/api/parts.types";
import { extractApiError } from "@/lib/api-error";

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

export function useExportPartBomAction(partId: string) {
  return useMutation({
    mutationFn: async (query: ExportPartBomTreeQueryDto) => {
      const blob = await exportPartBomTree(partId, query);
      downloadBlob(blob, `bom-${new Date().toISOString().slice(0, 10)}.xlsx`);
      return blob;
    },
    onSuccess: () => {
      toast.success("BOM 내보내기를 시작했습니다.");
    },
    onError: (error) => {
      toast.error(extractApiError(error, "BOM 내보내기에 실패했습니다."));
    },
  });
}
