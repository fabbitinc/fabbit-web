import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Upload } from "lucide-react";
import { Button } from "@fabbit/ui";
import { cn } from "@/lib/utils";
import { useTemplateUploadAction } from "@/features/part-template-mapping/hooks/use-template-upload-action";

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

interface PartsTemplateAnalysisScreenProps {
  partId?: string;
}

export function PartsTemplateAnalysisScreen({ partId }: PartsTemplateAnalysisScreenProps) {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const uploadAction = useTemplateUploadAction();
  const templatePathBase = partId ? `/parts/${partId}/templates` : "/parts/templates";

  const isSupportedFile = (file: File) => {
    const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    return ANALYSIS_ACCEPT.split(",").includes(extension);
  };

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) {
      return;
    }

    const validFile = files.find(isSupportedFile);
    if (!validFile) {
      return;
    }

    const result = await uploadAction.mutateAsync({ file: validFile });
    navigate(`${templatePathBase}/processing`, {
      state: { fileName: result.fileName },
    });
  };

  return (
    <div className="space-y-6">
      <section className="app-panel rounded-[32px] p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              Templates
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">부품 템플릿 분석</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              업로드 파일의 헤더를 분석해 부품 속성 템플릿을 생성합니다.
              {partId ? ` 현재는 부품 ${partId} 기준 상세 템플릿으로 저장됩니다.` : ""}
            </p>
          </div>

          <Button variant="outline" onClick={() => navigate(partId ? `/parts/${partId}` : "/parts")}>
            <ArrowLeft className="size-4" />
            돌아가기
          </Button>
        </div>
      </section>

      <section className="app-panel rounded-[32px] p-6">
        <h2 className="text-lg font-semibold text-foreground">분석 파일 업로드</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          BOM 또는 부품 목록 파일의 헤더를 읽어 속성 후보와 관계 후보를 추출합니다.
        </p>

        <div
          className={cn(
            "mt-5 rounded-[28px] border-2 border-dashed p-10 text-center transition-colors",
            uploadAction.isPending
              ? "cursor-not-allowed border-border bg-muted/30 opacity-70"
              : isDragOver
                ? "border-primary bg-primary/5"
                : "cursor-pointer border-border bg-muted/20 hover:border-primary/40",
          )}
          onClick={() => !uploadAction.isPending && fileRef.current?.click()}
          onDragOver={(event) => {
            if (uploadAction.isPending) {
              return;
            }
            event.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={(event) => {
            if (uploadAction.isPending) {
              return;
            }
            event.preventDefault();
            setIsDragOver(false);
          }}
          onDrop={(event) => {
            if (uploadAction.isPending) {
              return;
            }
            event.preventDefault();
            setIsDragOver(false);
            void handleFiles(Array.from(event.dataTransfer.files));
          }}
        >
          <input
            ref={fileRef}
            type="file"
            accept={ANALYSIS_ACCEPT}
            className="hidden"
            disabled={uploadAction.isPending}
            onChange={(event) => {
              const files = event.target.files ? Array.from(event.target.files) : [];
              void handleFiles(files);
              event.target.value = "";
            }}
          />

          <div className="flex flex-col items-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
              <Upload className="size-5 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">
              {uploadAction.isPending ? "파일을 업로드하는 중입니다" : "파일을 드래그하거나 클릭해서 선택하세요"}
            </p>
            <p className="text-xs text-muted-foreground">Excel(.xlsx, .xls), CSV 파일만 지원합니다.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <TemplateExampleCard
          title="부품 목록 파일"
          description="품번, 품명, 재질처럼 부품 자체 속성이 정리된 파일"
          rows={PART_LIST_EXAMPLE}
        />
        <TemplateExampleCard
          title="부모-자식 BOM"
          description="상위 부품과 하위 부품이 같은 행에 같이 있는 구조"
          rows={PARENT_CHILD_BOM_EXAMPLE}
        />
        <TemplateExampleCard
          title="루트 지정 BOM"
          description="특정 부품을 기준으로 자식 목록만 정리된 구조"
          rows={ROOT_SPECIFIED_BOM_EXAMPLE}
        />
      </section>
    </div>
  );
}

function TemplateExampleCard({
  title,
  description,
  rows,
}: {
  title: string;
  description: string;
  rows: Array<Record<string, string | number>>;
}) {
  const headers = Object.keys(rows[0] ?? {});

  return (
    <section className="app-panel rounded-[32px] p-5">
      <div className="flex items-center gap-2">
        <FileText className="size-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{description}</p>

      <div className="mt-4 overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-xs">
          <thead className="bg-muted/30">
            <tr>
              {headers.map((header) => (
                <th key={header} className="border-b border-border px-3 py-2 text-left font-medium text-foreground">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-border/60 last:border-b-0">
                {headers.map((header) => (
                  <td key={header} className="px-3 py-2 text-muted-foreground">
                    {String(row[header])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
