import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { useMappingStore, useUploadStore } from "@/stores/onboarding";
import { cn } from "@/lib/utils";
import { createUpload } from "@/api/onboarding";
import type { UploadedFile } from "@/features/onboarding/types/onboarding.types";

const BOM_ACCEPT = ".xlsx,.xls,.csv";

export function DataUploadPage() {
  const navigate = useNavigate();
  const { setStep } = useMappingStore();
  const { addFiles, addUploadId, setPrimaryUploadId } = useUploadStore();

  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const bomFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setStep(1);
  }, [setStep]);

  const handleFile = useCallback(
    async (file: File) => {
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      const accept = BOM_ACCEPT.split(",");
      if (!accept.includes(ext)) {
        toast.warning("지원하지 않는 파일 형식입니다", {
          description: "Excel(.xlsx, .xls) 또는 CSV 파일만 업로드 가능합니다.",
        });
        return;
      }

      setIsUploading(true);

      const id = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const entry: UploadedFile = {
        id,
        name: file.name,
        size: file.size,
        type: file.type || "application/octet-stream",
        category: "bom",
        status: "pending",
        progress: 0,
      };

      addFiles([entry]);

      try {
        // 1. presigned URL 발급
        const uploadInfo = await createUpload({
          original_name: file.name,
          content_type: file.type || "application/octet-stream",
          file_size: file.size,
        });

        addUploadId(id, uploadInfo.upload_id);
        setPrimaryUploadId(uploadInfo.upload_id);

        // 2. presigned URL로 파일 업로드
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", uploadInfo.upload_url);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve();
            else reject(new Error(`Upload failed: ${xhr.status}`));
          };
          xhr.onerror = () => reject(new Error("Upload failed"));
          xhr.send(file);
        });

        // 3. 즉시 processing으로 이동
        navigate("/onboarding/processing");
      } catch (error) {
        console.error("File upload failed:", error);
        toast.error("파일 업로드에 실패했습니다");
        setIsUploading(false);
      }
    },
    [addFiles, addUploadId, setPrimaryUploadId, navigate],
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  return (
    <div className="w-full max-w-[700px] space-y-4">
      {/* 상단 헤더 */}
      <div className="px-8 pb-6 pt-2 text-center lg:px-10">
        <h1 className="text-2xl font-bold text-gray-900">데이터 업로드</h1>
        <p className="mt-2 text-sm text-gray-500">
          BOM 파일을 업로드하세요
        </p>
      </div>

      {/* BOM 업로드 영역 */}
      <div className="px-8 lg:px-10">
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
          onDrop={handleDrop}
          onClick={() => !isUploading && bomFileRef.current?.click()}
          className={cn(
            "rounded-xl border-2 border-dashed p-14 text-center transition-all",
            isUploading
              ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-60"
              : isDragOver
                ? "cursor-pointer border-blue-500 bg-blue-50/50"
                : "cursor-pointer border-gray-200 bg-gray-50/50 hover:border-gray-300",
          )}
        >
          <input
            ref={bomFileRef}
            type="file"
            accept={BOM_ACCEPT}
            className="hidden"
            onChange={handleFileInputChange}
            disabled={isUploading}
          />
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
              {isUploading ? (
                <FileSpreadsheet className="h-6 w-6 animate-pulse text-blue-500" />
              ) : (
                <Upload className="h-6 w-6 text-blue-500" />
              )}
            </div>
            {isUploading ? (
              <p className="text-sm font-medium text-gray-500">
                업로드 중...
              </p>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-700">
                  파일을 드래그하거나 클릭하여 업로드
                </p>
                <p className="text-xs text-gray-400">Excel(.xlsx, .xls), CSV 지원</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
