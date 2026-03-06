import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { exportParts } from "@/features/parts/api/parts.api";
import type { ExportPartsQueryDto } from "@/features/parts/api/parts.types";
import { extractApiError } from "@/lib/api-error";

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

export function useExportPartsAction() {
  return useMutation({
    mutationFn: async (query: ExportPartsQueryDto) => {
      const blob = await exportParts(query);
      downloadBlob(blob, `parts-${new Date().toISOString().slice(0, 10)}.xlsx`);
      return blob;
    },
    onSuccess: () => {
      toast.success("부품 내보내기를 시작했습니다.");
    },
    onError: (error) => {
      toast.error(extractApiError(error, "부품 내보내기에 실패했습니다."));
    },
  });
}
