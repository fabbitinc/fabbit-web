import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileText, Lightbulb, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { type TemplateType } from "@/pages/parts/partsTemplateStore";
import { PARTS_TERMS } from "@/pages/parts/partsTerminology";
import { createUpload } from "@/api/onboarding";
import { useUploadStore } from "@/stores/onboarding";
import type { UploadedFile } from "@/features/onboarding/types/onboarding.types";
import "@/pages/parts/parts-template-mapping.css";

const ANALYSIS_ACCEPT = ".xlsx,.xls,.csv";

const PART_LIST_EXAMPLE = [
  { part_number: "BLT-001", part_name: "Hex Bolt M8x25", material: "SUS304", revision: "A" },
  { part_number: "NUT-001", part_name: "Hex Nut M8", material: "SUS304", revision: "A" },
];

const PARENT_CHILD_BOM_EXAMPLE = [
  {
    parent_part_number: "ASM-100",
    parent_part_name: "Motor Assembly",
    child_part_number: "BLT-001",
    quantity: 4,
  },
  {
    parent_part_number: "ASM-100",
    parent_part_name: "Motor Assembly",
    child_part_number: "BRK-002",
    quantity: 1,
  },
];

const ROOT_SPECIFIED_BOM_EXAMPLE = [
  { part_number: "BLT-001", part_name: "Hex Bolt M8x25", quantity: 4, unit: "EA" },
  { part_number: "BRK-002", part_name: "Bracket B", quantity: 1, unit: "EA" },
];

function HeaderLabel({
  ko,
  aliases,
  raw,
  className,
  required = false,
}: {
  ko: string;
  aliases: string;
  raw: string;
  className?: string;
  required?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn("inline-flex items-center gap-1 cursor-help", className)}>
          {ko}
          {required && (
            <span className="text-[10px] font-semibold text-red-500" aria-label="식별자 칼럼">
              *
            </span>
          )}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs">
        <p>{aliases}</p>
        <p className="mt-1 text-[11px] opacity-80">원문 키: {raw}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function PartsTemplateAnalysisPage() {
  const navigate = useNavigate();
  const { partNumber } = useParams<{ partNumber: string }>();
  const templateType: TemplateType = partNumber ? "part_detail" : "master";
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
    const nextPath = templateType === "master" ? "/parts/templates/processing" : `/parts/${partNumber}/templates/processing`;
    navigate(nextPath, { state: { fileName: file.name } });
  }

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="dev-page-container parts-template-mapping-theme space-y-4">
        <div className="flex items-start justify-between gap-2 rounded-lg border bg-card p-5">
          <div>
            <h1 className="text-xl font-bold text-foreground">속성 분석</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {templateType === "master"
                ? "업로드 파일을 분석해 부품 속성 템플릿을 생성합니다."
                : `부품(${partNumber}) 기준으로 상세 속성 템플릿을 생성합니다.`}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate(templateType === "master" ? "/parts" : `/parts/${partNumber}`)}
          >
            <ArrowLeft className="h-4 w-4" />
            돌아가기
          </Button>
        </div>

        <section className="rounded-lg border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground">분석 파일 업로드</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            BOM/부품 목록 파일 헤더를 기준으로 속성 후보를 추출해요.
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
          <p className="mt-1 text-xs text-muted-foreground">
            화면에는 이해하기 쉬운 설명만 보여드리고, 내부 분류 코드는 툴팁으로 확인하실 수 있어요.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            용어 기준: {PARTS_TERMS.part.label}({PARTS_TERMS.part.aliases.join("/")}), {PARTS_TERMS.assemblyParentPart.label}(Assy/Parent Part)
          </p>

          <div className="mt-3 space-y-4">
            <div className="rounded-md border p-3">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">1) 부품 목록형</p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-[11px] text-muted-foreground underline underline-offset-2" type="button">
                      내부 코드
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">PART_LIST (part_list)</TooltipContent>
                </Tooltip>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                부품 속성만 있는 형식이에요. 관계 정보가 없어서 파일만 올려도 바로 합성할 수 있어요.
              </p>
              <div className="mt-2 overflow-hidden rounded-md border">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="mapping-excel-header-part px-3 py-2 text-left font-medium">
                        <HeaderLabel ko="품번" aliases="Part No. / 品番 / 零件编号" raw="part_number" required />
                      </th>
                      <th className="mapping-excel-header-part px-3 py-2 text-left font-medium">
                        <HeaderLabel ko="품명" aliases="Part Name / Description / 品名 / 名称" raw="part_name" />
                      </th>
                      <th className="mapping-excel-header-part px-3 py-2 text-left font-medium">
                        <HeaderLabel ko="재질" aliases="Material / 材質 / 材料" raw="material" />
                      </th>
                      <th className="mapping-excel-header-part px-3 py-2 text-left font-medium">
                        <HeaderLabel ko="리비전" aliases="Revision / Rev / 改訂 / 版本" raw="revision" />
                      </th>
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
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">2) 완전 BOM형</p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-[11px] text-muted-foreground underline underline-offset-2" type="button">
                      내부 코드
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">FULL_BOM (full_bom)</TooltipContent>
                </Tooltip>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                관계 정보가 있고, 대상 노드를 찾는 데 필요한 키가 파일 컬럼에 모두 매핑된 형식이에요.
                이 경우도 파일 업로드만으로 합성할 수 있어요.
              </p>
              <div className="mt-2 overflow-hidden rounded-md border">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="mapping-excel-header-parent-part px-3 py-2 text-left font-medium">
                        <HeaderLabel ko="조립품(상위 부품) 품번" aliases="Assembly Part No. / Parent Part No. / 親品番 / 上位件号" raw="parent_part_number" required />
                      </th>
                      <th className="mapping-excel-header-parent-part px-3 py-2 text-left font-medium">
                        <HeaderLabel ko="조립품(상위 부품) 품명" aliases="Assembly Part Name / Parent Part Name / 親品名 / 上位件名称" raw="parent_part_name" />
                      </th>
                      <th className="mapping-excel-header-part px-3 py-2 text-left font-medium">
                        <HeaderLabel ko="하위 품번" aliases="Child Part No. / 子品番 / 下位件号" raw="child_part_number" required />
                      </th>
                      <th className="mapping-excel-header-parent-part px-3 py-2 text-right font-medium">
                        <HeaderLabel ko="수량" aliases="Qty / Quantity / 数量" raw="quantity" className="inline-block" />
                      </th>
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

            <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-amber-700">3) 루트 지정 BOM형</p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-[11px] text-amber-700 underline underline-offset-2" type="button">
                      내부 코드
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">ROOT_BOM (root_bom)</TooltipContent>
                </Tooltip>
              </div>
              <div className="mt-1 space-y-1 text-xs text-amber-700">
                <p>
                  이 형식은 관계 정보는 있지만,
                  어떤 조립품(상위 부품)을 구성하는 수량인지 파일만으로는 알기 어려워요.
                </p>
                <p>
                  그래서 업로드할 때마다 상위 부품 정보를 함께 지정해주셔야 해요.
                  기존 부품에 연결하거나 새 부품을 만들면서 업로드해야 정확하게 합성할 수 있어요.
                </p>
              </div>
              <div className="mt-2 overflow-hidden rounded-md border border-amber-200 bg-white">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">업로드 파일 예시</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">연결할 조립품(상위 부품)</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">처리 방식</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-3 py-2">motor_bom_root.csv</td>
                      <td className="px-3 py-2">ASM-100 (모터 어셈블리)</td>
                      <td className="px-3 py-2">기존 부품에 연결</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2">pump_bom_root.xlsx</td>
                      <td className="px-3 py-2">ASM-220 (펌프 어셈블리)</td>
                      <td className="px-3 py-2">새 부품 생성 후 연결</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-2 overflow-hidden rounded-md border border-amber-200 bg-white">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="mapping-excel-header-part px-3 py-2 text-left font-medium">
                        <HeaderLabel ko="품번" aliases="Part No. / 品番 / 零件编号" raw="part_number" required />
                      </th>
                      <th className="mapping-excel-header-part px-3 py-2 text-left font-medium">
                        <HeaderLabel ko="품명" aliases="Part Name / Description / 品名 / 名称" raw="part_name" />
                      </th>
                      <th className="mapping-excel-header-parent-part px-3 py-2 text-right font-medium">
                        <HeaderLabel ko="수량" aliases="Qty / Quantity / 数量" raw="quantity" className="inline-block" />
                      </th>
                      <th className="mapping-excel-header-part px-3 py-2 text-left font-medium">
                        <HeaderLabel ko="단위" aliases="UoM / Unit / 単位 / 单位" raw="unit" />
                      </th>
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
            <p className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-red-500">*</span>
              표시는 식별자 칼럼이에요. 매핑/병합 기준으로 우선 확인해 주세요.
            </p>
            <p className="flex items-center gap-1.5"><FileText className="h-3 w-3" />지원 포맷: Excel(.xlsx, .xls), CSV</p>
            <p className="flex items-center gap-1.5"><Lightbulb className="h-3 w-3" />컬럼 헤더를 명확하게 넣어주실수록 자동 매핑 정확도가 더 좋아져요.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
