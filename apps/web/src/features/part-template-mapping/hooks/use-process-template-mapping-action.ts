import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { completeFileUpload } from "@/api/file.api";
import { previewTemplateMapping } from "@/features/part-template-mapping/api/part-template-mapping.api";
import { extractTemplateMappingError } from "@/features/part-template-mapping/lib/template-mapping-utils";
import { usePartTemplateMappingStore } from "@/features/part-template-mapping/stores/template-mapping-store";
import { useTemplateUploadStore } from "@/features/part-template-mapping/stores/template-upload-store";

interface ProcessTemplateMappingActionInput {
  uploadId: string;
  retryPreviewOnly?: boolean;
}

export function useProcessTemplateMappingAction() {
  return useMutation({
    mutationKey: ["part-template-mapping", "process-template-mapping-action"],
    mutationFn: async ({
      uploadId,
      retryPreviewOnly = false,
    }: ProcessTemplateMappingActionInput) => {
      const uploadStore = useTemplateUploadStore.getState();

      if (!retryPreviewOnly && !uploadStore.isPrimaryUploadCompleted) {
        await completeFileUpload(uploadId);
        uploadStore.setPrimaryUploadCompleted(true);
      }

      return previewTemplateMapping({ file_id: uploadId });
    },
    onSuccess: (preview) => {
      const mappingStore = usePartTemplateMappingStore.getState();
      mappingStore.setMappingPreview(preview);
      mappingStore.setStep(3);
    },
    onError: (error) => {
      toast.error(extractTemplateMappingError(error, "속성 분석 처리 중 오류가 발생했습니다."));
    },
  });
}
