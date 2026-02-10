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
  FolderOpen,
  HardDrive,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useOnboardingStore } from "@/stores/onboardingStore";
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
    selectedPlan,
    uploadedFiles,
    addFiles,
    updateFileProgress,
    removeFile,
  } = useOnboardingStore();

  const [dragOverCategory, setDragOverCategory] = useState<FileCategory | null>(
    null,
  );

  const bomFileRef = useRef<HTMLInputElement>(null);
  const bomFolderRef = useRef<HTMLInputElement>(null);
  const drawingFileRef = useRef<HTMLInputElement>(null);
  const drawingFolderRef = useRef<HTMLInputElement>(null);

  const limits = uploadLimitsByPlan[selectedPlan];

  useEffect(() => {
    setStep(4);
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
      const newFiles: UploadedFile[] = Array.from(fileList)
        .filter((file) => {
          // 숨김 파일 무시
          if (file.name.startsWith(".")) return false;
          // 카테고리별 확장자 체크
          const ext = "." + file.name.split(".").pop()?.toLowerCase();
          const accept = categoryConfig[category].accept.split(",");
          return accept.includes(ext);
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

      if (newFiles.length === 0) return;
      addFiles(newFiles);
      newFiles.forEach((f) => simulateUpload(f.id));
    },
    [addFiles, simulateUpload],
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
    <div className="w-full max-w-5xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6]">
              <Upload className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#0f172a]">데이터 업로드</h1>
          <p className="text-sm text-[#64748b]">
            BOM 파일과 도면 파일을 분류하여 업로드하세요
          </p>
        </div>

        {/* 플랜 업로드 제한 안내 */}
        <div className="flex items-center justify-center gap-6 text-xs text-[#64748b]">
          <div className="flex items-center gap-1.5">
            <HardDrive className="size-3.5" />
            <span>
              스토리지: <strong className="text-[#334155]">{limits.storageLabel}</strong>
            </span>
          </div>
          <span className="text-[#e2e8f0]">|</span>
          <div className="flex items-center gap-1.5">
            <FileSpreadsheet className="size-3.5" />
            <span>
              BOM: <strong className="text-[#334155]">{limits.bomLabel}</strong>
            </span>
          </div>
          <span className="text-[#e2e8f0]">|</span>
          <div className="flex items-center gap-1.5">
            <FileImage className="size-3.5" />
            <span>
              도면: <strong className="text-[#334155]">{limits.drawingLabel}</strong>
            </span>
          </div>
          <span className="text-[#e2e8f0]">|</span>
          <span className="text-[#94a3b8]">
            {selectedPlan.toUpperCase()} 플랜
          </span>
        </div>

        {/* 2컬럼: BOM / 도면 업로드 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {(["bom", "drawing"] as const).map((category) => {
            const config = categoryConfig[category];
            const Icon = config.icon;
            const files =
              category === "bom" ? bomFiles : drawingFiles;
            const isDragOver = dragOverCategory === category;
            const fileRef =
              category === "bom" ? bomFileRef : drawingFileRef;
            const folderRef =
              category === "bom" ? bomFolderRef : drawingFolderRef;
            const limitReached =
              category === "bom" ? bomLimitReached : drawingLimitReached;
            const limitCount =
              category === "bom" ? limits.bomFiles : limits.drawingFiles;

            return (
              <div key={category} className="space-y-3">
                {/* 제목 + 파일 수 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: config.color + "15" }}
                    >
                      <Icon className="size-4" style={{ color: config.color }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#0f172a]">
                        {config.title}
                      </h3>
                      <p className="text-xs text-[#94a3b8]">
                        {config.description}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-[#64748b]">
                    {files.length}건
                    {limitCount !== null && (
                      <span className="text-[#94a3b8]"> / {limitCount}건</span>
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
                    "border-2 border-dashed rounded-xl p-8 text-center transition-all",
                    limitReached
                      ? "border-[#e2e8f0] bg-[#f8fafc] cursor-not-allowed opacity-60"
                      : isDragOver
                        ? "border-[#3b82f6] bg-[#3b82f6]/5 cursor-pointer"
                        : "border-[#e2e8f0] bg-white hover:border-[#94a3b8] cursor-pointer",
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
                  <input
                    ref={folderRef}
                    type="file"
                    accept={config.accept}
                    className="hidden"
                    onChange={(e) => handleFileInputChange(e, category)}
                    {...({ webkitdirectory: "", directory: "" } as React.InputHTMLAttributes<HTMLInputElement>)}
                  />

                  <div className="flex flex-col items-center gap-2">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full"
                      style={{ backgroundColor: config.color + "10" }}
                    >
                      <Upload className="h-5 w-5" style={{ color: config.color }} />
                    </div>
                    {limitReached ? (
                      <p className="text-sm text-[#94a3b8]">
                        업로드 제한에 도달했습니다
                      </p>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-[#334155]">
                          파일을 드래그하거나 클릭하여 업로드
                        </p>
                        <p className="text-xs text-[#94a3b8]">
                          {config.formats} 지원
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* 폴더 업로드 버튼 */}
                {!limitReached && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      folderRef.current?.click();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-[#e2e8f0] bg-white text-xs text-[#64748b] hover:border-[#94a3b8] hover:text-[#334155] transition-colors"
                  >
                    <FolderOpen className="size-3.5" />
                    폴더 선택하여 일괄 업로드
                  </button>
                )}

                {/* 파일 목록 */}
                {files.length > 0 && (
                  <div className="space-y-1.5 max-h-[240px] overflow-y-auto">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="bg-white rounded-lg border border-[#e2e8f0] px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <FileIcon category={file.category} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-medium text-[#0f172a] truncate">
                                {file.relativePath || file.name}
                              </p>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[10px] text-[#94a3b8]">
                                  {formatFileSize(file.size)}
                                </span>
                                {file.status === "uploading" && (
                                  <Loader2 className="h-3.5 w-3.5 text-[#3b82f6] animate-spin" />
                                )}
                                {file.status === "completed" && (
                                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                )}
                                {file.status === "failed" && (
                                  <XCircle className="h-3.5 w-3.5 text-red-500" />
                                )}
                                <button
                                  type="button"
                                  onClick={() => removeFile(file.id)}
                                  className="text-[#94a3b8] hover:text-[#64748b]"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                            {file.status === "uploading" && (
                              <Progress
                                value={file.progress}
                                className="mt-1 h-1"
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
          <div className="flex items-center justify-center gap-4 text-xs text-[#64748b]">
            <span>
              총 {uploadedFiles.length}개 파일 ({formatFileSize(totalSize)})
            </span>
            <span className="text-[#e2e8f0]">|</span>
            <span>
              BOM {bomFiles.length}건, 도면 {drawingFiles.length}건
            </span>
          </div>
        )}

        {/* 하단 버튼 영역 */}
        <div className="flex justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/onboarding/plan")}
          >
            <ArrowLeft className="size-4" />
            이전
          </Button>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              className="text-[#64748b] hover:text-[#334155]"
              onClick={() => navigate("/onboarding/mapping")}
            >
              건너뛰기
            </Button>
            <Button
              type="button"
              className="h-12 px-8 bg-[#3b82f6] hover:bg-[#2563eb] text-base font-medium"
              disabled={!allCompleted}
              onClick={() => navigate("/onboarding/mapping")}
            >
              다음
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
    </div>
  );
}
