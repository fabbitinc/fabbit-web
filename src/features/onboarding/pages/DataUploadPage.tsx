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
  } = useOnboardingStore();
  const selectedPlan = useAuthStore((s) => s.selectedPlan);

  const [dragOverCategory, setDragOverCategory] = useState<FileCategory | null>(
    null,
  );

  const bomFileRef = useRef<HTMLInputElement>(null);
  const drawingFileRef = useRef<HTMLInputElement>(null);

  const limits = uploadLimitsByPlan[selectedPlan] ?? uploadLimitsByPlan.starter;

  useEffect(() => {
    setStep(1);
  }, [setStep]);


  const bomFiles = uploadedFiles.filter((f) => f.category === "bom");
  const drawingFiles = uploadedFiles.filter((f) => f.category === "drawing");
  const totalSize = uploadedFiles.reduce((sum, f) => sum + f.size, 0);

  // mock 업로드 시뮬레이션
  const simulateUpload = useCallback(
    (fileId: string) => {
      const interval = setInterval(() => {
        const file = useOnboardingStore
          .getState()
          .uploadedFiles.find((f) => f.id === fileId);
        if (!file) {
          clearInterval(interval);
          return;
        }

        const newProgress = Math.min(file.progress + Math.random() * 15 + 5, 100);
        if (newProgress >= 100) {
          updateFileProgress(fileId, 100, "completed");
          clearInterval(interval);
        } else {
          updateFileProgress(fileId, Math.round(newProgress), "uploading");
        }
      }, 150);
    },
    [updateFileProgress],
  );

  const handleFiles = useCallback(
    (fileList: FileList, category: FileCategory) => {
      const accept = categoryConfig[category].accept.split(",");
      const existingNames = new Set(
        uploadedFiles.filter((f) => f.category === category).map((f) => f.name),
      );

      const skippedExt: string[] = [];
      const skippedDup: string[] = [];

      const newFiles: UploadedFile[] = Array.from(fileList)
        .filter((file) => {
          if (file.name.startsWith(".")) return false;

          const ext = "." + file.name.split(".").pop()?.toLowerCase();
          if (!accept.includes(ext)) {
            skippedExt.push(file.name);
            return false;
          }

          if (existingNames.has(file.name)) {
            skippedDup.push(file.name);
            return false;
          }
          existingNames.add(file.name);

          return true;
        })
        .map((file) => ({
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          category,
          relativePath: (file as File & { webkitRelativePath?: string }).webkitRelativePath || undefined,
          status: "uploading" as const,
          progress: 0,
        }));

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

      if (newFiles.length === 0) return;
      addFiles(newFiles);
      newFiles.forEach((f) => simulateUpload(f.id));
    },
    [addFiles, simulateUpload, uploadedFiles],
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

  // 제한 체크
  const bomLimitReached =
    limits.bomFiles !== null && bomFiles.length >= limits.bomFiles;
  const drawingLimitReached =
    limits.drawingFiles !== null && drawingFiles.length >= limits.drawingFiles;

  return (
    <div className="relative flex w-full max-w-[960px] flex-col">
      {/* 워터마크 로고 */}
      <div className="absolute top-[-40px] left-0 flex items-center gap-1.5">
        <div className="flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6]">
          <svg
            className="h-3 w-3 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <span className="text-xs text-gray-300">Fabbit</span>
      </div>

      <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl shadow-gray-200/50">
        {/* 상단 헤더 */}
        <div className="px-8 pt-10 pb-6 text-center lg:px-10">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-8 lg:px-10">
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
                            {file.status === "uploading" && (
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
          <div className="flex gap-3 items-center">
            <Button
              type="button"
              variant="outline"
              className="h-12 px-8 text-base font-semibold border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
              onClick={() => navigate("/onboarding/processing")}
            >
              건너뛰기
            </Button>
            <Button
              type="button"
              className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-base font-semibold shadow-lg shadow-blue-600/20 transition-all hover:shadow-blue-600/30"
              disabled={!allCompleted}
              onClick={() => navigate("/onboarding/processing")}
            >
              다음
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
