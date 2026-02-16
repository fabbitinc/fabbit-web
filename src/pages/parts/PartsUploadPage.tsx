import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, FileUp, Sparkles, Upload, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { getLatestTemplate, getTemplates, normalizeColumns, type TemplateScope } from "@/pages/parts/partsTemplateStore";

type UploadType = "part_list" | "parent_child_bom" | "root_specified_bom";
type PageStep = "upload" | "mapping" | "result";

interface UploadedFile {
  id: string;
  name: string;
  columns: string[];
  type: UploadType | "invalid";
}

interface FileGroup {
  id: string;
  representativeColumns: string[];
  files: UploadedFile[];
}

const GROUP_SIMILARITY_THRESHOLD = 0.72;
const FILE_SCHEMA_MATCH_THRESHOLD = 0.5;

const EXISTING_COLUMNS = [
  "part_number",
  "part_name",
  "material",
  "revision",
  "quantity",
  "unit",
  "parent_part_number",
  "child_part_number",
  "description",
];

const SAMPLE_FILES: Omit<UploadedFile, "id">[] = [
  {
    name: "part_list_v1.xlsx",
    columns: ["part_number", "part_name", "material", "revision", "unit"],
    type: "part_list",
  },
  {
    name: "motor_bom_parent_child.xlsx",
    columns: ["parent_part_number", "child_part_number", "quantity", "unit"],
    type: "parent_child_bom",
  },
  {
    name: "assy_without_parent.csv",
    columns: ["part_number", "part_name", "quantity", "unit"],
    type: "root_specified_bom",
  },
  {
    name: "vendor_quote_sheet.xlsx",
    columns: ["vendor", "quote_price", "currency", "delivery_days"],
    type: "invalid",
  },
  {
    name: "cost_tracking.csv",
    columns: ["item", "maker", "cost", "stock"],
    type: "invalid",
  },
];

function setSimilarity(a: string[], b: string[]) {
  const setA = new Set(normalizeColumns(a));
  const setB = new Set(normalizeColumns(b));
  const intersection = [...setA].filter((key) => setB.has(key)).length;
  const union = new Set([...setA, ...setB]).size;
  if (union === 0) return 0;
  return intersection / union;
}

function groupFilesBySimilarity(files: UploadedFile[]): FileGroup[] {
  const groups: FileGroup[] = [];

  for (const file of files) {
    let bestGroupIndex = -1;
    let bestScore = 0;

    for (let i = 0; i < groups.length; i += 1) {
      const score = setSimilarity(file.columns, groups[i].representativeColumns);
      if (score > bestScore) {
        bestScore = score;
        bestGroupIndex = i;
      }
    }

    if (bestGroupIndex >= 0 && bestScore >= GROUP_SIMILARITY_THRESHOLD) {
      groups[bestGroupIndex].files.push(file);
      continue;
    }

    groups.push({
      id: file.id,
      representativeColumns: file.columns,
      files: [file],
    });
  }

  return groups;
}

function getFileSchemaMatchRatio(file: UploadedFile) {
  if (file.columns.length === 0) return 0;
  const normalizedExisting = new Set(EXISTING_COLUMNS.map((value) => value.toLowerCase()));
  const matched = file.columns.filter((column) => normalizedExisting.has(column.toLowerCase())).length;
  return matched / file.columns.length;
}

function toTypeLabel(type: UploadType) {
  if (type === "part_list") return "Part List";
  if (type === "parent_child_bom") return "Parent/Child BOM";
  return "Root-Specified BOM";
}

export function PartsUploadPage() {
  const navigate = useNavigate();
  const { partNumber } = useParams<{ partNumber: string }>();
  const scope: TemplateScope = partNumber ? "part_detail" : "master";

  const [step, setStep] = useState<PageStep>("upload");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [uploadType, setUploadType] = useState<UploadType>(
    scope === "master" ? "part_list" : "root_specified_bom"
  );
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [columnApproval, setColumnApproval] = useState<Record<string, string>>({});
  const [isMappingApproved, setIsMappingApproved] = useState(false);
  const [forceRevisionUpdate, setForceRevisionUpdate] = useState(true);
  const [openNew, setOpenNew] = useState(true);
  const [openChanged, setOpenChanged] = useState(true);

  const scopedTemplates = useMemo(
    () => getTemplates().filter((template) => template.scope === scope),
    [scope]
  );

  const latestTemplate = useMemo(() => getLatestTemplate(scope), [scope]);
  const selectedTemplate =
    scopedTemplates.find((template) => template.id === selectedTemplateId) ?? latestTemplate;

  const allowTypes: UploadType[] =
    scope === "master"
      ? ["part_list", "parent_child_bom"]
      : ["root_specified_bom"];

  const { acceptedFiles, rejectedFiles } = useMemo(() => {
    const accepted: UploadedFile[] = [];
    const rejected: UploadedFile[] = [];

    for (const file of uploadedFiles) {
      const schemaOk = getFileSchemaMatchRatio(file) >= FILE_SCHEMA_MATCH_THRESHOLD;
      const typeOk = file.type === uploadType;
      if (schemaOk && typeOk && file.type !== "invalid") {
        accepted.push(file);
      } else {
        rejected.push(file);
      }
    }

    return { acceptedFiles: accepted, rejectedFiles: rejected };
  }, [uploadedFiles, uploadType]);

  const groupedFiles = useMemo(
    () => groupFilesBySimilarity(acceptedFiles),
    [acceptedFiles]
  );

  const allColumns = useMemo(() => {
    const bucket = new Set<string>();
    for (const file of acceptedFiles) {
      for (const column of file.columns) bucket.add(column);
    }
    return [...bucket];
  }, [acceptedFiles]);

  const fingerprintMatchOk = useMemo(() => {
    if (!selectedTemplate) return false;
    if (acceptedFiles.length === 0) return true;
    const templateSet = new Set(selectedTemplate.fingerprint.split("|"));
    return acceptedFiles.every((file) => {
      const fileSet = new Set(normalizeColumns(file.columns));
      const common = [...fileSet].filter((key) => templateSet.has(key)).length;
      const ratio = fileSet.size === 0 ? 0 : common / fileSet.size;
      return ratio >= 0.4;
    });
  }, [acceptedFiles, selectedTemplate]);

  const resultSummary = {
    newCount: 45,
    changedCount: 12,
    existingCount: 103,
    newItems: ["PRT-001", "PRT-003", "PRT-007", "PRT-010", "PRT-011"],
    changedItems: [
      "PRT-001: material SS400 -> AL6061",
      "PRT-003: unit EA -> SET",
      "PRT-007: name 브라켓 -> 브래킷",
    ],
  };

  function addMockFiles(type: "single" | "batch") {
    const target = type === "single" ? [SAMPLE_FILES[0]] : SAMPLE_FILES;
    setUploadedFiles((prev) => [
      ...prev,
      ...target.map((source) => ({
        ...source,
        id: `preview-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      })),
    ]);
  }

  function removeFile(fileId: string) {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  }

  if (!latestTemplate) {
    return (
      <div className="min-h-screen bg-background px-6 py-8">
        <div className="dev-page-container space-y-4">
          <section className="rounded-lg border bg-card p-6">
            <h1 className="text-xl font-bold text-foreground">데이터 업로드</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              현재 스코프에 속성 템플릿이 없습니다. 외부에서 속성 분석을 먼저 실행해 주세요.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <Button
                variant="outline"
                className="ai-outline-btn ai-theme-1"
                onClick={() =>
                  navigate(
                    scope === "master"
                      ? "/parts/templates?scope=master"
                      : `/parts/${partNumber}/templates?scope=detail`
                  )
                }
              >
                <Sparkles className="ai-outline-btn__icon h-4 w-4" />
                속성 분석으로 이동
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(scope === "master" ? "/parts" : `/parts/${partNumber}`)}
              >
                <ArrowLeft className="h-4 w-4" />
                돌아가기
              </Button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="dev-page-container space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-foreground">데이터 업로드</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {scope === "master"
                ? "Part Master 화면: Part List, Parent/Child BOM 지원"
                : `Part 상세화면 (${partNumber}): Root-Specified BOM 지원`}
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

        <section className="rounded-lg border bg-card p-4">
          <p className="text-sm font-semibold text-foreground">용어 정리</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>- Part List: Part 정보만 담긴 파일</li>
            <li>- Parent/Child BOM: 파일 내 상위 칼럼 있음 (Flat Parent, Hierarchical Parent)</li>
            <li>- Root-Specified BOM: 파일 내 상위 칼럼 없음 (Manual Root, 파일명 추천/사용자 입력)</li>
          </ul>
        </section>

        {step === "upload" && (
          <section className="space-y-4 rounded-lg border bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground">파일 업로드</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-xs">속성 선택 (최신 자동 선택)</Label>
                <Select
                  value={selectedTemplate?.id ?? ""}
                  onValueChange={setSelectedTemplateId}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="템플릿 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {scopedTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} (v{template.version})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">업로드 타입</Label>
                <Select
                  value={uploadType}
                  onValueChange={(value) => setUploadType(value as UploadType)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allowTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {toTypeLabel(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border p-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">업데이트 옵션</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">기존 Part 재활용</span>
                  <Switch
                    checked={forceRevisionUpdate}
                    onCheckedChange={setForceRevisionUpdate}
                  />
                  <span className="text-xs text-muted-foreground">리비전 강제 생성</span>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {forceRevisionUpdate
                  ? "켜짐: 기존 Part가 있어도 update된 리비전 생성"
                  : "꺼짐: 기존 Part 정보를 활용"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={() => addMockFiles("single")}>
                <Upload className="h-4 w-4" />
                샘플 1개 추가
              </Button>
              <Button variant="outline" onClick={() => addMockFiles("batch")}>
                <FileUp className="h-4 w-4" />
                샘플 배치 추가
              </Button>
            </div>

            {uploadedFiles.length === 0 ? (
              <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                단일/배치 파일을 추가해 주세요.
              </div>
            ) : (
              <div className="space-y-3">
                {groupedFiles.map((group, index) => (
                  <div key={group.id} className="rounded-lg border p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">그룹 {index + 1}</span>
                      <span className="text-xs text-muted-foreground">{group.files.length}개 파일</span>
                    </div>
                    <div className="mt-2 space-y-2">
                      {group.files.map((file) => (
                        <div key={file.id} className="flex items-center justify-between rounded-md border bg-background p-2">
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{toTypeLabel(file.type as UploadType)}</p>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            aria-label={`${file.name} 제거`}
                            onClick={() => removeFile(file.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {rejectedFiles.length > 0 && (
                  <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-amber-900">허용되지 않는 그룹 목록</p>
                      <Badge variant="outline">{rejectedFiles.length}개 파일</Badge>
                    </div>
                    <p className="mt-1 text-xs text-amber-800">컬럼 구조가 올바르지 않거나 업로드 타입과 맞지 않는 파일</p>
                    <div className="mt-2 space-y-2">
                      {rejectedFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between rounded-md border border-amber-200 bg-white p-2">
                          <p className="text-sm font-medium">{file.name}</p>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            aria-label={`${file.name} 제거`}
                            onClick={() => removeFile(file.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                className="ai-outline-btn ai-theme-1"
                onClick={() =>
                  navigate(
                    scope === "master"
                      ? "/parts/templates?scope=master"
                      : `/parts/${partNumber}/templates?scope=detail`
                  )
                }
              >
                <Sparkles className="ai-outline-btn__icon h-4 w-4" />
                속성 분석으로 이동
              </Button>
              <Button disabled={!selectedTemplate || acceptedFiles.length === 0} onClick={() => setStep("mapping")}>
                칼럼 매칭으로 이동
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </section>
        )}

        {step === "mapping" && (
          <section className="space-y-4 rounded-lg border bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground">칼럼 매칭 (LLM 추천 기반)</h2>

            {!fingerprintMatchOk && (
              <div className="rounded-md border border-red-300 bg-red-50 p-3 text-xs text-red-700">
                선택한 템플릿 fingerprint와 업로드 헤더가 맞지 않아 진행할 수 없습니다. 속성 분석을 다시 실행해 주세요.
              </div>
            )}

            <div className="space-y-2">
              {allColumns.map((column) => {
                const normalized = column.toLowerCase();
                const recommended = EXISTING_COLUMNS.find((candidate) => candidate === normalized);
                const defaultValue = columnApproval[column] ?? recommended ?? "__new";
                const confidence = recommended ? "96%" : "74%";

                return (
                  <div key={column} className="grid gap-2 rounded-md border p-2 md:grid-cols-[160px_1fr_220px] md:items-center">
                    <div className="text-xs font-medium">{column}</div>
                    <div className="text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        LLM 추천 {recommended ?? "신규 속성"} ({confidence})
                      </span>
                    </div>
                    <Select
                      value={defaultValue}
                      onValueChange={(value) => {
                        setColumnApproval((prev) => ({
                          ...prev,
                          [column]: value,
                        }));
                      }}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__new">신규 속성 생성</SelectItem>
                        {EXISTING_COLUMNS.map((candidate) => (
                          <SelectItem key={candidate} value={candidate}>
                            {candidate}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>

            <div className="inline-flex items-center gap-2 text-sm">
              <input
                id="mapping-approval"
                type="checkbox"
                aria-label="컬럼 매칭 최종 승인"
                className="h-4 w-4 rounded border-border"
                checked={isMappingApproved}
                onChange={(e) => setIsMappingApproved(e.target.checked)}
              />
              <Label htmlFor="mapping-approval">LLM 추천 결과와 내 수정값을 최종 승인합니다.</Label>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setStep("upload")}>이전</Button>
              <Button
                disabled={!isMappingApproved || !fingerprintMatchOk}
                onClick={() => setStep("result")}
              >
                확인 및 업데이트 실행
              </Button>
            </div>
          </section>
        )}

        {step === "result" && (
          <section className="space-y-4 rounded-lg border bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground">업로드 요약 화면</h2>

            <div className="rounded-md border bg-muted/20 p-3 text-sm">
              <p>
                신규: <strong>{resultSummary.newCount}건</strong> / 변경 감지: <strong>{resultSummary.changedCount}건</strong> / 기존 데이터: <strong>{resultSummary.existingCount}건</strong>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                적재 job payload: template_id={selectedTemplate?.id ?? "-"}, scope={scope}, update_option={String(forceRevisionUpdate)}
              </p>
            </div>

            <Collapsible open={openNew} onOpenChange={setOpenNew}>
              <CollapsibleTrigger className="w-full rounded-md border px-3 py-2 text-left text-sm font-medium">
                신규 목록: {resultSummary.newItems.length}건 (접이식)
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 rounded-md border bg-background p-3 text-sm">
                <ul className="space-y-1">
                  {resultSummary.newItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible open={openChanged} onOpenChange={setOpenChanged}>
              <CollapsibleTrigger className="w-full rounded-md border px-3 py-2 text-left text-sm font-medium">
                변경 목록: {resultSummary.changedItems.length}건 (접이식)
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 rounded-md border bg-background p-3 text-sm">
                <ul className="space-y-1">
                  {resultSummary.changedItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setStep("upload")}>다시 업로드</Button>
              <Button onClick={() => navigate(scope === "master" ? "/parts" : `/parts/${partNumber}`)}>
                <Check className="h-4 w-4" />
                완료
              </Button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
