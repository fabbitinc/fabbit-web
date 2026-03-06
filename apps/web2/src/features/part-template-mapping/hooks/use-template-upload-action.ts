import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { createFileUpload, uploadFileToPresignedUrl } from "@/api/file.api";
import { extractTemplateMappingError } from "@/features/part-template-mapping/lib/template-mapping-utils";
import { usePartTemplateMappingStore } from "@/features/part-template-mapping/stores/template-mapping-store";
import { useTemplateUploadStore } from "@/features/part-template-mapping/stores/template-upload-store";
import type { FileCategory, UploadedTemplateFileModel } from "@/features/part-template-mapping/types/part-template-mapping-model";

interface UploadTemplateFileActionInput {
  file: File;
  category?: FileCategory;
}

interface UploadTemplateFileActionResult {
  fileName: string;
  uploadId: string;
}

export function useTemplateUploadAction() {
  return useMutation({
    mutationKey: ["part-template-mapping", "upload-template-file-action"],
    mutationFn: async ({
      file,
      category = "bom",
    }: UploadTemplateFileActionInput): Promise<UploadTemplateFileActionResult> => {
      const uploadStore = useTemplateUploadStore.getState();
      const mappingStore = usePartTemplateMappingStore.getState();

      uploadStore.resetUploadState();
      mappingStore.resetTemplateMappingState();

      const localFileId = `template-file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const contentType = file.type || "application/octet-stream";
      const uploadedFile: UploadedTemplateFileModel = {
        id: localFileId,
        name: file.name,
        size: file.size,
        type: contentType,
        category,
        status: "pending",
        progress: 0,
      };

      uploadStore.setUploadedFiles([uploadedFile]);
      mappingStore.setStep(1);

      try {
        uploadStore.updateUploadedFile(localFileId, {
          status: "uploading",
          progress: 15,
        });

        const created = await createFileUpload({
          original_name: file.name,
          content_type: contentType,
          file_size: file.size,
        });

        uploadStore.updateUploadedFile(localFileId, {
          uploadId: created.file_id,
          progress: 35,
        });

        await uploadFileToPresignedUrl(created.upload_url, file, contentType);

        uploadStore.updateUploadedFile(localFileId, {
          status: "completed",
          progress: 100,
        });
        uploadStore.setPrimaryUploadId(created.file_id);
        uploadStore.setPrimaryUploadCompleted(false);

        return {
          fileName: file.name,
          uploadId: created.file_id,
        };
      } catch (error) {
        uploadStore.updateUploadedFile(localFileId, {
          status: "failed",
          progress: 0,
          error: extractTemplateMappingError(error, "파일 업로드에 실패했습니다."),
        });
        throw error;
      }
    },
    onError: (error) => {
      toast.error(extractTemplateMappingError(error, "파일 업로드에 실패했습니다."));
    },
  });
}
