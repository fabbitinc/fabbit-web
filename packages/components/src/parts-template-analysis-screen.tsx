import { useRef, useState } from "react";
import { ArrowLeft, FileText, Lightbulb, Upload } from "lucide-react";
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  cn,
} from "@fabbit/ui";
import "./parts-template-mapping-screen.css";

export interface PartsTemplateAnalysisScreenProps {
  accept?: string;
  description?: string;
  isUploading?: boolean;
  onBackClick: () => void;
  onFilesSelect: (files: File[]) => void | Promise<void>;
}

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
  className,
  required = false,
}: {
  ko: string;
  className?: string;
  required?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {ko}
      {required ? (
        <span aria-label="식별자 칼럼" className="text-[10px] font-semibold text-red-500">
          *
        </span>
      ) : null}
    </span>
  );
}

export function PartsTemplateAnalysisScreen({
  accept = ANALYSIS_ACCEPT,
  description = "업로드 파일을 분석해 부품 속성 템플릿을 생성합니다.",
  isUploading = false,
  onBackClick,
  onFilesSelect,
}: PartsTemplateAnalysisScreenProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="dev-page-container parts-template-mapping-theme space-y-4">
        <div className="flex items-start justify-between gap-2 rounded-lg border bg-card p-5">
          <div>
            <h1 className="text-xl font-bold text-foreground">속성 분석</h1>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          <Button variant="outline" onClick={onBackClick}>
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
            className={cn(
              "mt-3 rounded-lg border-2 border-dashed p-10 text-center transition-colors",
              isUploading
                ? "cursor-not-allowed border-border bg-muted/20 opacity-70"
                : isDragOver
                  ? "border-primary bg-primary/5"
                  : "cursor-pointer border-border bg-muted/20 hover:border-primary/40",
            )}
            onClick={() => {
              if (!isUploading) {
                fileRef.current?.click();
              }
            }}
            onDragLeave={(event) => {
              if (isUploading) {
                return;
              }

              event.preventDefault();
              setIsDragOver(false);
            }}
            onDragOver={(event) => {
              if (isUploading) {
                return;
              }

              event.preventDefault();
              setIsDragOver(true);
            }}
            onDrop={(event) => {
              if (isUploading) {
                return;
              }

              event.preventDefault();
              setIsDragOver(false);
              void onFilesSelect(Array.from(event.dataTransfer.files));
            }}
          >
            <input
              ref={fileRef}
              accept={accept}
              aria-label="속성 분석 파일 업로드"
              className="hidden"
              disabled={isUploading}
              type="file"
              onChange={(event) => {
                const files = event.target.files ? Array.from(event.target.files) : [];
                void onFilesSelect(files);
                event.target.value = "";
              }}
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
            용어 기준: 부품(part), 조립품(상위 부품)(Assy/Parent Part)
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
                        <HeaderLabel ko="품번" required />
                      </th>
                      <th className="mapping-excel-header-part px-3 py-2 text-left font-medium">
                        <HeaderLabel ko="품명" />
                      </th>
                      <th className="mapping-excel-header-part px-3 py-2 text-left font-medium">
                        <HeaderLabel ko="재질" />
                      </th>
                      <th className="mapping-excel-header-part px-3 py-2 text-left font-medium">
                        <HeaderLabel ko="리비전" />
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
                        <HeaderLabel ko="조립품(상위 부품) 품번" required />
                      </th>
                      <th className="mapping-excel-header-parent-part px-3 py-2 text-left font-medium">
                        <HeaderLabel ko="조립품(상위 부품) 품명" />
                      </th>
                      <th className="mapping-excel-header-part px-3 py-2 text-left font-medium">
                        <HeaderLabel ko="하위 품번" required />
                      </th>
                      <th className="mapping-excel-header-parent-part px-3 py-2 text-right font-medium">
                        <HeaderLabel className="inline-block" ko="수량" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {PARENT_CHILD_BOM_EXAMPLE.map((row, index) => (
                      <tr key={`${row.child_part_number}-${index}`} className="border-b last:border-b-0">
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
                        <HeaderLabel ko="품번" required />
                      </th>
                      <th className="mapping-excel-header-part px-3 py-2 text-left font-medium">
                        <HeaderLabel ko="품명" />
                      </th>
                      <th className="mapping-excel-header-parent-part px-3 py-2 text-right font-medium">
                        <HeaderLabel className="inline-block" ko="수량" />
                      </th>
                      <th className="mapping-excel-header-part px-3 py-2 text-left font-medium">
                        <HeaderLabel ko="단위" />
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
            <p className="flex items-center gap-1.5">
              <FileText className="h-3 w-3" />
              지원 포맷: Excel(.xlsx, .xls), CSV
            </p>
            <p className="flex items-center gap-1.5">
              <Lightbulb className="h-3 w-3" />
              컬럼 헤더를 명확하게 넣어주실수록 자동 매핑 정확도가 더 좋아져요.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
