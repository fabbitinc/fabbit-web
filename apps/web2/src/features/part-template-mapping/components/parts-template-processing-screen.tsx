import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { Button, Progress } from "@fabbit/ui";
import { usePartTemplateMappingStore } from "@/features/part-template-mapping/stores/template-mapping-store";
import { useTemplateUploadStore } from "@/features/part-template-mapping/stores/template-upload-store";
import { useProcessTemplateMappingAction } from "@/features/part-template-mapping/hooks/use-process-template-mapping-action";

type StepStatus = "pending" | "in_progress" | "completed";

interface ProcessingStep {
  key: "parsing" | "normalizing" | "analyzing" | "finalizing";
  label: string;
  status: StepStatus;
}

const INITIAL_STEPS: ProcessingStep[] = [
  { key: "parsing", label: "파일 구조 파싱", status: "pending" },
  { key: "normalizing", label: "헤더/컬럼 정규화", status: "pending" },
  { key: "analyzing", label: "속성 후보 분석", status: "pending" },
  { key: "finalizing", label: "템플릿 버전 생성", status: "pending" },
];

const PROCESSING_LOGS: Array<{ message: string; phase?: ProcessingStep["key"] }> = [
  { message: "파일 구조와 시트를 파싱하고 있습니다...", phase: "parsing" },
  { message: "데이터 행과 컬럼을 분석합니다..." },
  { message: "컬럼명 표준화를 진행합니다...", phase: "normalizing" },
  { message: "원본 컬럼 헤더 추출 완료" },
  { message: "속성 후보와 데이터 타입을 추론합니다...", phase: "analyzing" },
  { message: "관계 매핑 후보를 구성합니다..." },
  { message: "템플릿 버전을 생성합니다...", phase: "finalizing" },
];

interface PartsTemplateProcessingScreenProps {
  partId?: string;
  fileName?: string;
}

export function PartsTemplateProcessingScreen({
  partId,
  fileName,
}: PartsTemplateProcessingScreenProps) {
  const navigate = useNavigate();
  const primaryUploadId = useTemplateUploadStore((state) => state.primaryUploadId);
  const uploadedFiles = useTemplateUploadStore((state) => state.uploadedFiles);
  const setStep = usePartTemplateMappingStore((state) => state.setStep);
  const processAction = useProcessTemplateMappingAction();
  const processingStartedRef = useRef(false);
  const [steps, setSteps] = useState<ProcessingStep[]>(INITIAL_STEPS);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  const effectiveFileName = fileName || uploadedFiles[0]?.name || "업로드된 파일";
  const mappingPath = useMemo(
    () => (partId ? `/parts/${partId}/templates/mapping` : "/parts/templates/mapping"),
    [partId],
  );

  useEffect(() => {
    setStep(2);
  }, [setStep]);

  useEffect(() => {
    if (processingStartedRef.current || !primaryUploadId) {
      return;
    }

    processingStartedRef.current = true;

    let animationInterval: ReturnType<typeof setInterval> | null = null;
    let logIndex = 0;
    let lastPhase: ProcessingStep["key"] | null = null;
    let finished = false;

    const updateStep = (phase: ProcessingStep["key"], status: StepStatus) => {
      setSteps((previous) =>
        previous.map((step) => (step.key === phase ? { ...step, status } : step)),
      );
    };

    const run = async () => {
      try {
        setLogs([`분석 대상 파일 확인: ${effectiveFileName}`]);

        animationInterval = setInterval(() => {
          if (finished || logIndex >= PROCESSING_LOGS.length) {
            return;
          }

          const entry = PROCESSING_LOGS[logIndex];
          if (entry.phase) {
            if (lastPhase) {
              updateStep(lastPhase, "completed");
            }

            updateStep(entry.phase, "in_progress");
            lastPhase = entry.phase;
          }

          setLogs((previous) => [...previous, entry.message]);
          logIndex += 1;

          const nextProgress = 15 + Math.min(Math.round((logIndex / PROCESSING_LOGS.length) * 75), 75);
          setProgress(nextProgress);
        }, 2000);

        await processAction.mutateAsync({
          uploadId: primaryUploadId,
          retryPreviewOnly: retryToken > 0,
        });

        finished = true;
        if (animationInterval) {
          clearInterval(animationInterval);
        }

        INITIAL_STEPS.forEach((step) => updateStep(step.key, "completed"));
        setProgress(100);
        setLogs((previous) => [...previous, "속성 분석이 완료되었습니다. 매핑 검토 단계로 이동할 수 있습니다."]);
        setError(null);
        setIsCompleted(true);
      } catch (caughtError) {
        finished = true;
        if (animationInterval) {
          clearInterval(animationInterval);
        }

        const message = caughtError instanceof Error ? caughtError.message : "속성 분석 처리 중 오류가 발생했습니다.";
        setError(message);
        setLogs((previous) => [...previous, `오류: ${message}`]);
        setIsCompleted(false);
      }
    };

    void run();

    return () => {
      if (animationInterval) {
        clearInterval(animationInterval);
      }
    };
  }, [effectiveFileName, partId, primaryUploadId, processAction, retryToken]);

  const handleRetry = () => {
    processingStartedRef.current = false;
    setSteps(INITIAL_STEPS);
    setProgress(0);
    setLogs(["재시도를 시작합니다..."]);
    setError(null);
    setIsCompleted(false);
    setRetryToken((previous) => previous + 1);
  };

  return (
    <div className="space-y-6">
      <section className="app-panel rounded-[32px] p-6 sm:p-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">부품 템플릿 처리</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {effectiveFileName} 파일을 분석해 속성과 관계 매핑 후보를 구성합니다.
        </p>

        {!primaryUploadId && (
          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] px-4 py-3 text-sm text-[var(--status-warning)]">
            <AlertCircle className="size-4" />
            업로드 정보가 없습니다. 파일을 먼저 업로드한 뒤 다시 시도해주세요.
          </div>
        )}

        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">진행률</span>
            <span className="font-medium text-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <section className="app-panel rounded-[32px] p-5">
          <h2 className="text-sm font-semibold text-foreground">처리 단계</h2>
          <div className="mt-4 space-y-2">
            {steps.map((step) => (
              <div key={step.key} className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-3 text-sm">
                {getStepIcon(step.status)}
                <span className="text-foreground">{step.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="app-panel rounded-[32px] p-5">
          <h2 className="text-sm font-semibold text-foreground">처리 로그</h2>
          <div className="mt-4 space-y-2 rounded-[24px] bg-muted/30 p-4">
            {logs.map((log, index) => (
              <p key={`${log}-${index}`} className="text-xs text-muted-foreground">
                {log}
              </p>
            ))}
          </div>

          {error && <p className="mt-4 text-sm text-[var(--status-danger)]">{error}</p>}

          <div className="mt-5 flex items-center justify-end gap-2">
            {error ? (
              <Button onClick={handleRetry} disabled={!primaryUploadId}>
                재시도
              </Button>
            ) : (
              <Button
                disabled={!isCompleted}
                onClick={() =>
                  navigate(mappingPath, {
                    state: { fileName: effectiveFileName },
                  })
                }
              >
                매핑 확인
              </Button>
            )}
          </div>
        </section>
      </section>
    </div>
  );
}

function getStepIcon(status: StepStatus) {
  if (status === "completed") {
    return <CheckCircle2 className="size-4 text-[var(--status-success)]" />;
  }

  if (status === "in_progress") {
    return <Loader2 className="size-4 animate-spin text-primary" />;
  }

  return <Circle className="size-4 text-muted-foreground" />;
}
