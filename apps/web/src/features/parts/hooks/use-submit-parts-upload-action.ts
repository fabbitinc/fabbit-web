import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  batchCompleteFileUpload,
  completeFileUpload,
  prepareFileUpload,
  prepareFileUploads,
  uploadFileToPresignedUrl,
} from "@/api/file.api";
import { startPartsSynthesis } from "@/features/parts/api/parts-upload.api";
import type { SynthesisStartRequestDto } from "@/features/parts/api/parts-upload.types";
import type { PartsUploadBatchSessionModel, PartsUploadFileModel } from "@/features/parts/types/parts-upload-model";
import { extractApiError } from "@/lib/api-error";

interface SubmitPartsUploadActionInput {
  mappingId: string;
  overwrite: boolean;
  files: PartsUploadFileModel[];
}

export function useSubmitPartsUploadAction() {
  return useMutation({
    mutationKey: ["parts", "upload", "submit-parts-upload-action"],
    mutationFn: async ({
      mappingId,
      overwrite,
      files,
    }: SubmitPartsUploadActionInput): Promise<PartsUploadBatchSessionModel> => {
      const uploads = await uploadSourceFiles(files);
      const result = await startPartsSynthesis({
        mapping_id: mappingId,
        overwrite,
        uploads,
      });

      if (result.acceptedCount === 0) {
        throw new Error("처리를 시작하지 못했습니다.");
      }

      return {
        ...result,
        fileNames: Object.fromEntries(files.map((file, index) => [uploads[index].file_id, file.name])),
      };
    },
    onSuccess: (result) => {
      toast.success("부품 업로드 처리를 시작했습니다.");

      if (result.failed.length > 0) {
        toast.warning(`${result.failed.length}개 파일은 처리 시작에 실패했습니다.`);
      }
    },
    onError: (error) => {
      toast.error(extractApiError(error, "부품 업로드에 실패했습니다."));
    },
  });
}

async function uploadSourceFiles(files: PartsUploadFileModel[]): Promise<SynthesisStartRequestDto["uploads"]> {
  if (files.length === 0) {
    return [];
  }

  if (files.length === 1) {
    const file = files[0];
    const contentType = file.file.type || "application/octet-stream";
    const created = await prepareFileUpload({
      file: file.file,
      originalName: file.name,
      contentType,
      fileSize: file.size,
    });

    await uploadFileToPresignedUrl(created.upload_url, file.file, contentType);
    await completeFileUpload(created.file_id);

    return [
      {
        file_id: created.file_id,
        root_context: file.rootContext ?? undefined,
      },
    ];
  }

  const created = await prepareFileUploads(
    files.map((file) => ({
      file: file.file,
      originalName: file.name,
      contentType: file.file.type || "application/octet-stream",
      fileSize: file.size,
    })),
  );

  await Promise.all(
    created.items.map((item, index) =>
      uploadFileToPresignedUrl(
        item.upload_url,
        files[index].file,
        files[index].file.type || "application/octet-stream",
      ),
    ),
  );

  const fileIds = created.items.map((item) => item.file_id);
  await batchCompleteFileUpload(fileIds);

  return created.items.map((item, index) => ({
    file_id: item.file_id,
    root_context: files[index].rootContext ?? undefined,
  }));
}
