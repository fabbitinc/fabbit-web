import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PartsTemplateProcessingScreen as PartsTemplateProcessingScreenView,
  type PartsTemplateProcessingStep,
} from "@fabbit/components";
import { usePartTemplateMappingStore } from "@/features/part-template-mapping/stores/template-mapping-store";
import { useTemplateUploadStore } from "@/features/part-template-mapping/stores/template-upload-store";
import { useProcessTemplateMappingAction } from "@/features/part-template-mapping/hooks/use-process-template-mapping-action";
import { buildPartTemplateMappingPath } from "@/features/parts/lib/part-route";

type StepStatus = "pending" | "in_progress" | "completed";

interface ProcessingStep extends PartsTemplateProcessingStep {
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
  { message: "AI 매핑 분석을 시작합니다..." },
  { message: "원본 컬럼-대상 속성 매핑 추론 중..." },
  { message: "관계 매핑 추론 중..." },
  { message: "템플릿 버전을 생성합니다...", phase: "finalizing" },
];

const MIN_PROCESSING_ANIMATION_MS = 6_500;

function waitFor(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

interface PartsTemplateProcessingScreenProps {
  partId?: string;
  revisionId?: string;
  fileName?: string;
}

export function PartsTemplateProcessingScreen({
  partId,
  revisionId,
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
    () => (partId && revisionId ? buildPartTemplateMappingPath(partId, revisionId) : "/parts/templates/mapping"),
    [partId, revisionId],
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
        updateStep("parsing", "in_progress");

        if (retryToken > 0) {
          setLogs((previous) => [...previous, "기존 업로드를 재사용해 분석을 다시 시작합니다..."]);
          updateStep("parsing", "completed");
          setProgress(20);
        } else {
          setLogs((previous) => [...previous, "업로드된 파일을 확인합니다..."]);
          await waitFor(500);
          updateStep("parsing", "completed");
          setProgress(20);
          setLogs((previous) => [...previous, "파일 업로드 확인 완료"]);
        }

        const startedAt = Date.now();
        const processPromise = processAction.mutateAsync({
          uploadId: primaryUploadId,
          retryPreviewOnly: retryToken > 0,
        });

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

          const nextProgress = 20 + Math.min(Math.round((logIndex / PROCESSING_LOGS.length) * 70), 70);
          setProgress(nextProgress);
        }, 3000);

        await processPromise;

        const elapsed = Date.now() - startedAt;
        if (elapsed < MIN_PROCESSING_ANIMATION_MS) {
          await waitFor(MIN_PROCESSING_ANIMATION_MS - elapsed);
        }

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
    <PartsTemplateProcessingScreenView
      canProceed={isCompleted}
      canRetry={Boolean(primaryUploadId)}
      error={error}
      fileName={effectiveFileName}
      hasUpload={Boolean(primaryUploadId)}
      logs={logs}
      progress={progress}
      steps={steps}
      onProceed={() =>
        navigate(mappingPath, {
          state: { fileName: effectiveFileName },
        })
      }
      onRetry={handleRetry}
    />
  );
}
