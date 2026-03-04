import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AlertCircle, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useMappingStore, useUploadStore } from "@/stores/mapping";
import { type TemplateType } from "@/pages/parts/partsTemplateStore";
import { completeFileUpload as completeUpload } from "@/api/file";
import { previewMapping } from "@/api/mapping";

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

const PHASES = ["parsing", "normalizing", "analyzing", "finalizing"] as const;

const animationLogs: { message: string; phase?: string }[] = [
  { message: "파일 구조와 시트를 파싱하고 있습니다...", phase: "parsing" },
  { message: "데이터 행과 컬럼을 분석합니다..." },
  { message: "컬럼명 표준화를 진행합니다...", phase: "normalizing" },
  { message: "원본 컬럼 헤더 추출 완료" },
  { message: "속성 후보와 데이터 타입을 추론합니다...", phase: "analyzing" },
  { message: "AI 매핑 분석을 시작합니다..." },
  { message: "원본 컬럼-대상 속성 매핑 추론 중..." },
  { message: "관계 매핑 추론 중..." },
  { message: "템플릿 버전을 생성합니다...", phase: "finalizing" },
];

function getStepIcon(status: StepStatus) {
  if (status === "completed") return <CheckCircle2 className="h-4 w-4 text-green-600" />;
  if (status === "in_progress") return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
  return <Circle className="h-4 w-4 text-muted-foreground" />;
}

export function PartsTemplateProcessingPage() {
  const navigate = useNavigate();
  const { partId } = useParams<{ partId: string }>();
  const location = useLocation();
  const { fileName } = (location.state as LocationState | null) ?? {};

  const templateType: TemplateType = partId ? "part_detail" : "master";
  const [steps, setSteps] = useState<ProcessingStep[]>(INITIAL_STEPS);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const setMappingPreviewData = useMappingStore((s) => s.setMappingPreviewData);
  const primaryUploadId = useUploadStore((s) => s.primaryUploadId);
  const apiCalledRef = useRef(false);
  const retryPreviewOnlyRef = useRef(false);

  const mappingPath = useMemo(
    () => (templateType === "master" ? "/parts/templates/mapping" : `/parts/${partId}/templates/mapping`),
    [templateType, partId],
  );

  useEffect(() => {
    if (apiCalledRef.current || !primaryUploadId) return;
    apiCalledRef.current = true;

    let animationInterval: ReturnType<typeof setInterval> | null = null;
    let stepIndex = 0;
    let lastPhase: string | null = null;
    let done = false;

    const updateStep = (phase: string, status: StepStatus) => {
      setSteps((prev) =>
        prev.map((step) => (step.key === phase ? { ...step, status } : step)),
      );
    };

    const run = async () => {
      try {
        setLogs([`분석 대상 파일 확인: ${fileName ?? "업로드된 파일"}`]);

        // 1단계: 업로드 완료 확인 (재시도 시 스킵)
        updateStep("parsing", "in_progress");
        if (retryPreviewOnlyRef.current) {
          setLogs((prev) => [...prev, "기존 업로드를 재사용해 분석을 다시 시작합니다..."]);
          updateStep("parsing", "completed");
          setProgress(20);
        } else {
          setLogs((prev) => [...prev, "업로드된 파일을 확인합니다..."]);
          await completeUpload(primaryUploadId);
          updateStep("parsing", "completed");
          setProgress(20);
          setLogs((prev) => [...prev, "파일 업로드 확인 완료"]);
        }

        // 2단계: AI 분석 (애니메이션 병렬 실행)
        animationInterval = setInterval(() => {
          if (done || stepIndex >= animationLogs.length) return;

          const entry = animationLogs[stepIndex];

          if (entry.phase) {
            if (lastPhase) updateStep(lastPhase, "completed");
            updateStep(entry.phase, "in_progress");
            lastPhase = entry.phase;
          }

          setLogs((prev) => [...prev, entry.message]);
          stepIndex++;

          const p = 20 + Math.min(Math.round((stepIndex / animationLogs.length) * 70), 70);
          setProgress(p);
        }, 3000);

        const response = await previewMapping({ file_id: primaryUploadId });

        done = true;
        if (animationInterval) clearInterval(animationInterval);
        animationInterval = null;

        // 모든 단계 완료
        PHASES.forEach((phase) => updateStep(phase, "completed"));
        setProgress(100);

        setLogs((prev) => [...prev, "속성 분석이 완료되었습니다. 매핑 검토 단계로 이동할 수 있습니다."]);

        setMappingPreviewData(
          response.headers,
          response.sample_rows,
          response.mapping,
        );

        setIsCompleted(true);
        retryPreviewOnlyRef.current = false;
      } catch (err) {
        done = true;
        if (animationInterval) clearInterval(animationInterval);

        const axiosErr = err as { response?: { data?: { detail?: string } } };
        const errorMsg = axiosErr?.response?.data?.detail || "속성 분석 처리 중 오류가 발생했습니다.";
        console.error("Processing failed:", err);
        setError(errorMsg);
        toast.error(errorMsg);
        setLogs((prev) => [...prev, `오류: ${errorMsg}`]);
      }
    };

    run();

    return () => {
      if (animationInterval) clearInterval(animationInterval);
    };
  }, [primaryUploadId, fileName, setMappingPreviewData, retryToken]);

  const handleRetry = () => {
    if (!primaryUploadId) {
      toast.error("업로드 정보가 없습니다. 파일을 다시 업로드해주세요.");
      return;
    }

    apiCalledRef.current = false;
    retryPreviewOnlyRef.current = true;
    setError(null);
    setIsCompleted(false);
    setProgress(0);
    setSteps(INITIAL_STEPS);
    setLogs(["재시도를 시작합니다..."]);
    setRetryToken((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="dev-page-container space-y-4">
        <div className="rounded-lg border bg-card p-5">
          <h1 className="text-xl font-bold text-foreground">속성 분석 처리</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {fileName ? `${fileName} 파일을 분석 중입니다.` : "파일을 분석 중입니다."}
          </p>

          {!primaryUploadId && (
            <div className="mt-4 flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
              <AlertCircle className="h-4 w-4" />
              업로드 정보가 없습니다. 파일을 먼저 업로드한 뒤 다시 시도해 주세요.
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
            {error ? (
              <Button onClick={handleRetry}>재시도</Button>
            ) : (
              <Button disabled={!isCompleted} onClick={() => navigate(mappingPath, { state: { fileName } })}>
                매핑 확인
              </Button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
