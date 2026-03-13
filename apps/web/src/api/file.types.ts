import type { DeepDefined } from "@/api/types";
import type { components } from "@/api/generated/schema";

export interface FileUploadSource {
  file: File;
  originalName?: string;
  contentType?: string;
  fileSize?: number;
}

export type BatchCreateFileRequestDto = components["schemas"]["BatchCreateFileRequest"];
export type BatchCreateFileResponseDto = DeepDefined<components["schemas"]["BatchCreateFileResponse"]>;
export type BatchCompleteFileRequestDto = components["schemas"]["BatchCompleteRequest"];
export type BatchCompleteFileResponseDto = DeepDefined<components["schemas"]["BatchCompleteResponse"]>;
export type CreateFileRequestDto = components["schemas"]["CreateFileRequest"];
export type CreateFileResponseDto = DeepDefined<components["schemas"]["CreateFileResponse"]>;
export type FileCompleteResponseDto = DeepDefined<components["schemas"]["FileCompleteResponse"]>;
