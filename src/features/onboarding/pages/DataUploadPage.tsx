import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  FileSpreadsheet,
  FileImage,
  Loader2,
  CheckCircle2,
  XCircle,
  X,
  HardDrive,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useAuthStore } from "@/stores/authStore";
import { uploadLimitsByPlan } from "@/features/onboarding/mock-data/onboarding-mock";
import { cn } from "@/lib/utils";
import { batchCreateUploads, batchCompleteUploads } from "@/api/onboarding";
import type {
  UploadedFile,
  FileCategory,
} from "@/features/onboarding/types/onboarding.types";

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) {
    return (bytes / 1024 / 1024 / 1024).toFixed(1) + "GB";
  }
  if (bytes >= 1024 * 1024) {
    return (bytes / 1024 / 1024).toFixed(1) + "MB";
  }
  return (bytes / 1024).toFixed(1) + "KB";
}

const BOM_ACCEPT = ".xlsx,.xls,.csv";
const DRAWING_ACCEPT = ".pdf,.dwg,.dxf,.png,.jpg,.jpeg,.tiff,.tif";

const categoryConfig = {
  bom: {
    title: "BOM 파일",
    description: "부품표, BOM 데이터",
    accept: BOM_ACCEPT,
    formats: "Excel, CSV",
    icon: FileSpreadsheet,
    color: "#3b82f6",
  },
  drawing: {
    title: "도면 파일",
    description: "설계 도면, 이미지",
    accept: DRAWING_ACCEPT,
    formats: "PDF, DWG, DXF, PNG, JPG, TIFF",
    icon: FileImage,
    color: "#8b5cf6",
  },
} as const;

function FileIcon({ category }: { category: FileCategory }) {
  if (category === "bom") {
    return <FileSpreadsheet className="h-5 w-5 text-[#3b82f6] shrink-0" />;
  }
  return <FileImage className="h-5 w-5 text-[#8b5cf6] shrink-0" />;
}

export function DataUploadPage() {
  const navigate = useNavigate();
  const {
    setStep,
    uploadedFiles,
    addFiles,
    updateFileProgress,
    removeFile,
    addUploadId,
    setPrimaryUploadId,
  } = useOnboardingStore();
  const selectedPlan = useAuthStore((s) => s.selectedPlan);

  const [dragOverCategory, setDragOverCategory] = useState<FileCategory | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 원본 File 객체를 별도 Map으로 관리 (store에 넣지 않음)
  const fileMapRef = useRef<Map<string, File>>(new Map());

  const bomFileRef = useRef<HTMLInputElement>(null);
  const drawingFileRef = useRef<HTMLInputElement>(null);

  const limits = uploadLimitsByPlan[selectedPlan] ?? uploadLimitsByPlan.starter;

  useEffect(() => {
    setStep(1);
  }, [setStep]);

  const bomFiles = uploadedFiles.filter((f) => f.category === "bom");
  const drawingFiles = uploadedFiles.filter((f) => f.category === "drawing");
  const totalSize = uploadedFiles.reduce((sum, f) => sum + f.size, 0);

  const uploadSingleFile = useCallback(
    async (fileEntry: UploadedFile, uploadUrl: string) => {
      const file = fileMapRef.current.get(fileEntry.id);
      if (!file) {
        updateFileProgress(fileEntry.id, 0, "failed");
        return;
      }

      try {
        // XMLHttpRequest로 진행률 추적
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", uploadUrl);
          xhr.setRequestHeader("Content-Type", file.type);

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const progress = Math.round((e.loaded / e.total) * 100);
              updateFileProgress(fileEntry.id, progress, "uploading");
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              updateFileProgress(fileEntry.id, 100, "completed");
              resolve();
            } else {
              reject(new Error(`Upload failed: ${xhr.status}`));
            }
          };

          xhr.onerror = () => reject(new Error("Upload failed"));
          xhr.send(file);
        });
      } catch {
        updateFileProgress(fileEntry.id, 0, "failed");
      }
    },
    [updateFileProgress],
  );

  const handleFiles = useCallback(
    async (fileList: FileList, category: FileCategory) => {
      const accept = categoryConfig[category].accept.split(",");
      const existingNames = new Set(
        uploadedFiles.filter((f) => f.category === category).map((f) => f.name),
      );

      const skippedExt: string[] = [];
      const skippedDup: string[] = [];

      const validFiles: { file: File; entry: UploadedFile }[] = [];

      Array.from(fileList).forEach((file) => {
        if (file.name.startsWith(".")) return;

        const ext = "." + file.name.split(".").pop()?.toLowerCase();
        if (!accept.includes(ext)) {
          skippedExt.push(file.name);
          return;
        }

        if (existingNames.has(file.name)) {
          skippedDup.push(file.name);
          return;
        }
        existingNames.add(file.name);

        const id = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const entry: UploadedFile = {
          id,
          name: file.name,
          size: file.size,
          type: file.type || "application/octet-stream",
          category,
          relativePath: (file as File & { webkitRelativePath?: string }).webkitRelativePath || undefined,
          status: "pending",
          progress: 0,
        };

        fileMapRef.current.set(id, file);
        validFiles.push({ file, entry });
      });

      if (skippedExt.length > 0 || skippedDup.length > 0) {
        const formatNames = (names: string[]) =>
          names.length <= 2
            ? names.join(", ")
            : `${names.slice(0, 2).join(", ")} 외 ${names.length - 2}개`;

        toast.warning("일부 파일이 제외되었습니다", {
          description: (
            <div className="mt-1.5 flex flex-col gap-2">
              {skippedExt.length > 0 && (
                <div>
                  <p className="text-xs font-medium">지원하지 않는 형식</p>
                  <p className="text-xs opacity-70">{formatNames(skippedExt)}</p>
                </div>
              )}
              {skippedDup.length > 0 && (
                <div>
                  <p className="text-xs font-medium">중복 파일</p>
                  <p className="text-xs opacity-70">{formatNames(skippedDup)}</p>
                </div>
              )}
            </div>
          ),
        });
      }

      if (validFiles.length === 0) return;

      // 1. 스토어에 파일 항목 추가
      addFiles(validFiles.map((v) => v.entry));

      // 2. 배치 presigned URL 발급
      try {
        const batchResponse = await batchCreateUploads({
          items: validFiles.map((v) => ({
            original_name: v.file.name,
            content_type: v.file.type || "application/octet-stream",
            file_size: v.file.size,
          })),
        });

        // 3. 각 파일을 presigned URL로 업로드
        for (let i = 0; i < batchResponse.items.length; i++) {
          const uploadInfo = batchResponse.items[i];
          const fileEntry = validFiles[i].entry;

          addUploadId(fileEntry.id, uploadInfo.upload_id);
          updateFileProgress(fileEntry.id, 0, "uploading");

          // 비동기로 업로드 시작 (병렬)
          uploadSingleFile(fileEntry, uploadInfo.upload_url);
        }
      } catch (error) {
        toast.error("파일 업로드 준비에 실패했습니다");
        console.error("Batch upload creation failed:", error);
        // 실패한 파일들 상태 업데이트
        validFiles.forEach((v) => {
          updateFileProgress(v.entry.id, 0, "failed");
        });
      }
    },
    [addFiles, uploadSingleFile, uploadedFiles, addUploadId, updateFileProgress],
  );

  const handleDragOver = (e: React.DragEvent, category: FileCategory) => {
    e.preventDefault();
    setDragOverCategory(category);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverCategory(null);
  };

  const handleDrop = (e: React.DragEvent, category: FileCategory) => {
    e.preventDefault();
    setDragOverCategory(null);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files, category);
    }
  };

  const handleFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    category: FileCategory,
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files, category);
      e.target.value = "";
    }
  };

  const hasAnyFiles = uploadedFiles.length > 0;
  const allCompleted =
    hasAnyFiles && uploadedFiles.every((f) => f.status === "completed");
  const hasBomFiles = bomFiles.some((f) => f.status === "completed");

  // 제한 체크
  const bomLimitReached =
    limits.bomFiles !== null && bomFiles.length >= limits.bomFiles;
  const drawingLimitReached =
    limits.drawingFiles !== null && drawingFiles.length >= limits.drawingFiles;

  const handleNext = async () => {
    if (!allCompleted || !hasBomFiles) return;

    setIsSubmitting(true);
    try {
      // 완료된 파일들의 upload_id 수집
      const completedUploadIds = uploadedFiles
        .filter((f) => f.status === "completed" && f.uploadId)
        .map((f) => f.uploadId!);

      if (completedUploadIds.length === 0) {
        toast.error("업로드된 파일이 없습니다");
        return;
      }

      // 배치 완료 확인
      await batchCompleteUploads({ upload_ids: completedUploadIds });

      // 첫 번째 BOM 파일의 upload_id를 primary로 설정
      const firstBom = uploadedFiles.find(
        (f) => f.category === "bom" && f.status === "completed" && f.uploadId,
      );
      if (firstBom?.uploadId) {
        setPrimaryUploadId(firstBom.uploadId);
      }

      navigate("/onboarding/processing");
    } catch (error) {
      console.error("Upload completion failed:", error);
      toast.error("업로드 완료 처리에 실패했습니다");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[960px] space-y-4">
      {/* 상단 헤더 */}
      <div className="px-8 pb-6 pt-2 text-center lg:px-10">
          <h1 className="text-2xl font-bold text-gray-900">데이터 업로드</h1>
          <p className="mt-2 text-sm text-gray-500">
            BOM 파일과 도면 파일을 분류하여 업로드하세요
          </p>

          {/* 플랜 업로드 제한 안내 */}
          <div className="mt-4 flex items-center justify-center gap-5 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <HardDrive className="size-3.5 text-blue-500" />
              <span>
                스토리지 <strong className="text-gray-700">{limits.storageLabel}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileSpreadsheet className="size-3.5 text-blue-500" />
              <span>
                BOM <strong className="text-gray-700">{limits.bomLabel}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileImage className="size-3.5 text-blue-500" />
              <span>
                도면 <strong className="text-gray-700">{limits.drawingLabel}</strong>
              </span>
            </div>
          </div>
      </div>

      {/* 2컬럼: BOM / 도면 업로드 영역 */}
      <div className="grid grid-cols-1 gap-6 px-8 lg:grid-cols-2 lg:px-10">
          {(["bom", "drawing"] as const).map((category) => {
            const config = categoryConfig[category];
            const Icon = config.icon;
            const files =
              category === "bom" ? bomFiles : drawingFiles;
            const isDragOver = dragOverCategory === category;
            const fileRef =
              category === "bom" ? bomFileRef : drawingFileRef;
            const limitReached =
              category === "bom" ? bomLimitReached : drawingLimitReached;
            const limitCount =
              category === "bom" ? limits.bomFiles : limits.drawingFiles;

            return (
              <div key={category} className="space-y-4">
                {/* 제목 + 파일 수 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: config.color + "15" }}
                    >
                      <Icon className="size-4" style={{ color: config.color }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        {config.title}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {config.description}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {files.length}건
                    {limitCount !== null && (
                      <span className="text-gray-400"> / {limitCount}건</span>
                    )}
                  </span>
                </div>

                {/* 드래그앤드롭 영역 */}
                <div
                  onDragOver={(e) => handleDragOver(e, category)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, category)}
                  onClick={() => !limitReached && fileRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-10 text-center transition-all",
                    limitReached
                      ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                      : isDragOver
                        ? "border-blue-500 bg-blue-50/50 cursor-pointer"
                        : "border-gray-200 bg-gray-50/50 hover:border-gray-300 cursor-pointer",
                  )}
                >
                  {/* hidden file inputs */}
                  <input
                    ref={fileRef}
                    type="file"
                    accept={config.accept}
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileInputChange(e, category)}
                  />
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-full"
                      style={{ backgroundColor: config.color + "12" }}
                    >
                      <Upload className="h-5 w-5" style={{ color: config.color }} />
                    </div>
                    {limitReached ? (
                      <p className="text-sm text-gray-400">
                        업로드 제한에 도달했습니다
                      </p>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-gray-700">
                          파일을 드래그하거나 클릭하여 업로드
                        </p>
                        <p className="text-xs text-gray-400">
                          {config.formats} 지원
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* 파일 목록 */}
                {files.length > 0 && (
                  <div className="space-y-1.5 max-h-[240px] overflow-y-auto">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="bg-white rounded-lg border border-gray-200 px-3 py-2.5"
                      >
                        <div className="flex items-center gap-2.5">
                          <FileIcon category={file.category} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm text-gray-900 truncate">
                                {file.relativePath || file.name}
                              </p>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs text-gray-400">
                                  {formatFileSize(file.size)}
                                </span>
                                {file.status === "uploading" && (
                                  <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                                )}
                                {file.status === "completed" && (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                )}
                                {file.status === "failed" && (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )}
                                <button
                                  type="button"
                                  onClick={() => removeFile(file.id)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            {(file.status === "uploading" || file.status === "pending") && (
                              <Progress
                                value={file.progress}
                                className="mt-1.5 h-1"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 총 용량 표시 */}
        {hasAnyFiles && (
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mt-4 px-8 lg:px-10">
            <span>
              총 {uploadedFiles.length}개 파일 ({formatFileSize(totalSize)})
            </span>
            <span className="text-gray-200">|</span>
            <span>
              BOM {bomFiles.length}건, 도면 {drawingFiles.length}건
            </span>
          </div>
        )}

        {/* 하단 버튼 영역 */}
        <div className="flex items-center justify-between px-8 pb-8 pt-6 lg:px-10">
          <Button
            type="button"
            variant="outline"
            className="h-12 px-8 text-base font-semibold border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
            onClick={() => navigate("/onboarding/plan")}
          >
            이전
          </Button>
          <Button
            type="button"
            className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-base font-semibold shadow-lg shadow-blue-600/20 transition-all hover:shadow-blue-600/30"
            disabled={!allCompleted || !hasBomFiles || isSubmitting}
            onClick={handleNext}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                처리 중...
              </>
            ) : (
              "다음"
            )}
          </Button>
        </div>
    </div>
  );
}
