import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AlertCircle, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useMappingStore } from "@/stores/onboarding";
import { type TemplateScope } from "@/pages/parts/partsTemplateStore";
import {
  mockColumnMappings,
  mockMappingHeaders,
  mockMappingSampleRows,
  mockRelationMappings,
} from "@/features/onboarding/mock-data/onboarding-mock";

type StepStatus = "pending" | "in_progress" | "completed";

interface ProcessingStep {
  key: "parsing" | "normalizing" | "analyzing" | "finalizing";
  label: string;
  status: StepStatus;
}

interface LocationState {
  fileName?: string;
}

const INITIAL_STEPS: ProcessingStep[] = [
  { key: "parsing", label: "파일 구조 파싱", status: "pending" },
  { key: "normalizing", label: "헤더/컬럼 정규화", status: "pending" },
  { key: "analyzing", label: "속성 후보 분석", status: "pending" },
  { key: "finalizing", label: "템플릿 버전 생성", status: "pending" },
];

const WAIT_MS = 900;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getStepIcon(status: StepStatus) {
  if (status === "completed") return <CheckCircle2 className="h-4 w-4 text-green-600" />;
  if (status === "in_progress") return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
  return <Circle className="h-4 w-4 text-muted-foreground" />;
}

export function PartsTemplateProcessingPage() {
  const navigate = useNavigate();
  const { partNumber } = useParams<{ partNumber: string }>();
  const location = useLocation();
  const { fileName } = (location.state as LocationState | null) ?? {};

  const scope: TemplateScope = partNumber ? "part_detail" : "master";
  const [steps, setSteps] = useState<ProcessingStep[]>(INITIAL_STEPS);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setMappingPreviewData = useMappingStore((s) => s.setMappingPreviewData);

  const mappingPath = useMemo(
    () => (scope === "master" ? "/parts/templates/mapping" : `/parts/${partNumber}/templates/mapping`),
    [scope, partNumber],
  );

  useEffect(() => {
    if (!fileName) return;

    let cancelled = false;

    async function run() {
      try {
        setLogs([`분석 대상 파일 확인: ${fileName}`]);

        for (let i = 0; i < INITIAL_STEPS.length; i += 1) {
          if (cancelled) return;

          setSteps((prev) =>
            prev.map((step, idx) => {
              if (idx < i) return { ...step, status: "completed" };
              if (idx === i) return { ...step, status: "in_progress" };
              return step;
            }),
          );

          if (i === 0) setLogs((prev) => [...prev, "파일 구조와 시트를 파싱하고 있습니다..."]);
          if (i === 1) setLogs((prev) => [...prev, "컬럼명 표준화를 진행합니다..."]);
          if (i === 2) setLogs((prev) => [...prev, "속성 후보와 데이터 타입을 추론합니다..."]);

          setProgress((i + 1) * 22);
          await sleep(WAIT_MS);
        }

        const mockMapping = {
          column_mappings: mockColumnMappings.map((cm) => ({
            source_column: cm.source_column,
            target_label: cm.target_label,
            target_property: cm.target_property,
            data_type: cm.data_type,
            confidence: cm.confidence,
            reason: cm.reason,
          })),
          relation_mappings: mockRelationMappings.map((rm) => ({
            from_label: rm.from_label,
            to_label: rm.to_label,
            rel_type: rm.rel_type,
            from_columns: rm.from_columns,
            to_columns: rm.to_columns,
            properties: rm.properties,
            property_types: rm.property_types,
          })),
          extended_properties: [],
        };

        if (cancelled) return;

        setMappingPreviewData(mockMappingHeaders, mockMappingSampleRows, mockMapping);

        setSteps((prev) => prev.map((step) => ({ ...step, status: "completed" })));
        setProgress(100);
        setLogs((prev) => [...prev, "속성 분석이 완료되었습니다. 매핑 검토 단계로 이동할 수 있습니다."]);
        setIsCompleted(true);
      } catch {
        if (cancelled) return;
        setError("속성 분석 처리 중 오류가 발생했습니다.");
        setLogs((prev) => [...prev, "오류가 발생해 처리를 중단했습니다."]);
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [fileName, setMappingPreviewData]);

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="dev-page-container space-y-4">
        <div className="rounded-lg border bg-card p-5">
          <h1 className="text-xl font-bold text-foreground">속성 분석 처리</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {fileName ? `${fileName} 파일을 분석 중입니다.` : "분석 파일 정보가 없습니다."}
          </p>

          {!fileName && (
            <div className="mt-4 flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
              <AlertCircle className="h-4 w-4" />
              파일을 먼저 선택한 뒤 다시 시도해 주세요.
            </div>
          )}

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">진행률</span>
              <span className="font-medium text-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <section className="rounded-lg border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground">처리 단계</h2>
          <div className="mt-3 space-y-2">
            {steps.map((step) => (
              <div key={step.key} className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm">
                {getStepIcon(step.status)}
                <span className="text-foreground">{step.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground">처리 로그</h2>
          <div className="mt-3 space-y-2 rounded-md bg-muted/30 p-3">
            {logs.map((log, idx) => (
              <p key={`${log}-${idx}`} className="text-xs text-muted-foreground">{log}</p>
            ))}
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <div className="mt-4 flex items-center justify-end">
            <Button disabled={!isCompleted} onClick={() => navigate(mappingPath, { state: { fileName } })}>
              매핑 확인
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
