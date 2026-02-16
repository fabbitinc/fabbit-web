import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileText, Lightbulb, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type TemplateScope } from "@/pages/parts/partsTemplateStore";
import { createUpload } from "@/api/onboarding";
import { useUploadStore } from "@/stores/onboarding";
import type { UploadedFile } from "@/features/onboarding/types/onboarding.types";

const ANALYSIS_ACCEPT = ".xlsx,.xls,.csv";

const PART_LIST_EXAMPLE = [
  { part_number: "BLT-001", part_name: "육각 볼트 M8x25", material: "SUS304", revision: "A" },
  { part_number: "NUT-001", part_name: "육각 너트 M8", material: "SUS304", revision: "A" },
];

const PARENT_CHILD_BOM_EXAMPLE = [
  {
    parent_part_number: "ASM-100",
    parent_part_name: "모터 어셈블리",
    child_part_number: "BLT-001",
    quantity: 4,
  },
  {
    parent_part_number: "ASM-100",
    parent_part_name: "모터 어셈블리",
    child_part_number: "BRK-002",
    quantity: 1,
  },
];

const ROOT_SPECIFIED_BOM_EXAMPLE = [
  { part_number: "BLT-001", part_name: "육각 볼트 M8x25", quantity: 4, unit: "EA" },
  { part_number: "BRK-002", part_name: "브라켓 B", quantity: 1, unit: "EA" },
];

export function PartsTemplateAnalysisPage() {
  const navigate = useNavigate();
  const { partNumber } = useParams<{ partNumber: string }>();
  const scope: TemplateScope = partNumber ? "part_detail" : "master";
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const addFiles = useUploadStore((s) => s.addFiles);
  const addUploadId = useUploadStore((s) => s.addUploadId);
  const setPrimaryUploadId = useUploadStore((s) => s.setPrimaryUploadId);
  const updateFileProgress = useUploadStore((s) => s.updateFileProgress);

  function isSupportedFile(file: File) {
    const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
    return ANALYSIS_ACCEPT.split(",").includes(ext);
  }

  async function handleFiles(files: File[]) {
    if (files.length === 0) return;

    if (files.length > 1) {
      toast.warning("속성 분석은 파일 1개만 업로드할 수 있습니다", {
        description: "파일 하나만 선택한 뒤 다시 업로드해 주세요.",
      });
      return;
    }

    const validFiles = files.filter(isSupportedFile);
    const invalidCount = files.length - validFiles.length;

    if (invalidCount > 0) {
      toast.warning("지원하지 않는 파일 형식이 포함되어 제외되었습니다", {
        description: "Excel(.xlsx, .xls) 또는 CSV 파일만 업로드 가능합니다.",
      });
    }

    if (validFiles.length === 0) {
      return;
    }

    await handleFile(validFiles[0]);
  }

  async function handleFile(file: File) {
    if (!isSupportedFile(file)) {
      toast.warning("지원하지 않는 파일 형식입니다", {
        description: "Excel(.xlsx, .xls) 또는 CSV 파일만 업로드 가능합니다.",
      });
      return;
    }

    const fileId = `parts-file-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const fileEntry: UploadedFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
      category: "bom",
      status: "pending",
      progress: 0,
    };

    addFiles([fileEntry]);
    setIsUploading(true);

    try {
      updateFileProgress(fileId, 15, "uploading");
      const uploadInfo = await createUpload({
        original_name: file.name,
        content_type: file.type || "application/octet-stream",
        file_size: file.size,
      });

      addUploadId(fileId, uploadInfo.upload_id);
      setPrimaryUploadId(uploadInfo.upload_id);

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadInfo.upload_url);
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
        xhr.upload.onprogress = (event) => {
          if (!event.lengthComputable) return;
          const ratio = event.loaded / event.total;
          const nextProgress = Math.min(95, Math.max(20, Math.round(ratio * 100)));
          updateFileProgress(fileId, nextProgress, "uploading");
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed: ${xhr.status}`));
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.send(file);
      });

      updateFileProgress(fileId, 100, "completed");
    } catch (error) {
      console.error("Template file upload failed:", error);
      updateFileProgress(fileId, 0, "failed");
      toast.error("파일 업로드에 실패했습니다");
      setIsUploading(false);
      return;
    }

    setIsUploading(false);
    const nextPath = scope === "master" ? "/parts/templates/processing" : `/parts/${partNumber}/templates/processing`;
    navigate(nextPath, { state: { fileName: file.name } });
  }

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="dev-page-container space-y-4">
        <div className="flex items-start justify-between gap-2 rounded-lg border bg-card p-5">
          <div>
            <h1 className="text-xl font-bold text-foreground">속성 분석</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {scope === "master"
                ? "업로드 파일을 분석해 Part 속성 템플릿을 생성합니다."
                : `부품(${partNumber}) 기준으로 상세 속성 템플릿을 생성합니다.`}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate(scope === "master" ? "/parts" : `/parts/${partNumber}`)}
          >
            <ArrowLeft className="h-4 w-4" />
            돌아가기
          </Button>
        </div>

        <section className="rounded-lg border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground">분석 파일 업로드</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            BOM/Part List 파일 헤더를 기준으로 속성 후보를 추출합니다.
          </p>

          <div
            onDragOver={(e) => {
              if (isUploading) return;
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={(e) => {
              if (isUploading) return;
              e.preventDefault();
              setIsDragOver(false);
            }}
            onDrop={(e) => {
              if (isUploading) return;
              e.preventDefault();
              setIsDragOver(false);
              void handleFiles(Array.from(e.dataTransfer.files));
            }}
            onClick={() => !isUploading && fileRef.current?.click()}
            className={cn(
              "mt-3 rounded-lg border-2 border-dashed p-10 text-center transition-colors",
              isUploading
                ? "cursor-not-allowed border-border bg-muted/20 opacity-70"
                : isDragOver
                ? "border-primary bg-primary/5"
                : "cursor-pointer border-border bg-muted/20 hover:border-primary/40",
            )}
          >
            <input
              ref={fileRef}
              type="file"
              aria-label="속성 분석 파일 업로드"
              accept={ANALYSIS_ACCEPT}
              className="hidden"
              onChange={(e) => {
                const files = e.target.files ? Array.from(e.target.files) : [];
                void handleFiles(files);
                e.target.value = "";
              }}
              disabled={isUploading}
            />

            <div className="flex flex-col items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">파일을 드래그하거나 클릭하여 선택</p>
              <p className="text-xs text-muted-foreground">Excel(.xlsx, .xls), CSV 지원</p>
            </div>
          </div>
        </section>

        <section className="rounded-lg border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground">파일 형식 예시</h2>

          <div className="mt-3 space-y-4">
            <div className="rounded-md border p-3">
              <p className="text-sm font-medium text-foreground">1) Part List (가능)</p>
              <p className="mt-1 text-xs text-muted-foreground">Part 정보만 담긴 파일</p>
              <div className="mt-2 overflow-hidden rounded-md border">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">part_number</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">part_name</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">material</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">revision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PART_LIST_EXAMPLE.map((row) => (
                      <tr key={row.part_number} className="border-b last:border-b-0">
                        <td className="px-3 py-2">{row.part_number}</td>
                        <td className="px-3 py-2">{row.part_name}</td>
                        <td className="px-3 py-2">{row.material}</td>
                        <td className="px-3 py-2">{row.revision}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-md border p-3">
              <p className="text-sm font-medium text-foreground">2) Parent/Child BOM (가능)</p>
              <p className="mt-1 text-xs text-muted-foreground">파일 내 상위 칼럼 있음 (Flat Parent, Hierarchical Parent)</p>
              <div className="mt-2 overflow-hidden rounded-md border">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">parent_part_number</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">parent_part_name</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">child_part_number</th>
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground">quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PARENT_CHILD_BOM_EXAMPLE.map((row, idx) => (
                      <tr key={`${row.child_part_number}-${idx}`} className="border-b last:border-b-0">
                        <td className="px-3 py-2">{row.parent_part_number}</td>
                        <td className="px-3 py-2">{row.parent_part_name}</td>
                        <td className="px-3 py-2">{row.child_part_number}</td>
                        <td className="px-3 py-2 text-right">{row.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-md border border-red-200 bg-red-50 p-3">
              <p className="text-sm font-medium text-red-700">3) Root-Specified BOM (불가능 예시)</p>
              <p className="mt-1 text-xs text-red-600">
                파일 내 상위 칼럼이 없는 Root-Specified BOM은 현재 이 화면에서 지원하지 않습니다.
              </p>
              <p className="mt-1 text-xs text-red-600">
                아이템 상세 화면에서 상위 아이템 클릭 후 BOM 탭 업로드를 사용하세요.
              </p>
              <div className="mt-2 overflow-hidden rounded-md border border-red-200 bg-white">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-red-50">
                      <th className="px-3 py-2 text-left font-medium text-red-700">part_number</th>
                      <th className="px-3 py-2 text-left font-medium text-red-700">part_name</th>
                      <th className="px-3 py-2 text-right font-medium text-red-700">quantity</th>
                      <th className="px-3 py-2 text-left font-medium text-red-700">unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ROOT_SPECIFIED_BOM_EXAMPLE.map((row) => (
                      <tr key={row.part_number} className="border-b last:border-b-0">
                        <td className="px-3 py-2">{row.part_number}</td>
                        <td className="px-3 py-2">{row.part_name}</td>
                        <td className="px-3 py-2 text-right">{row.quantity}</td>
                        <td className="px-3 py-2">{row.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
            <p className="flex items-center gap-1.5"><FileText className="h-3 w-3" />지원 포맷: Excel(.xlsx, .xls), CSV</p>
            <p className="flex items-center gap-1.5"><Lightbulb className="h-3 w-3" />컬럼 헤더가 포함된 파일일수록 분석 정확도가 높습니다.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
