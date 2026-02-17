import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Cog,
  Circle,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useMappingStore, useUploadStore, useProcessingStore } from "@/stores/onboarding";
import { completeUpload, previewMapping } from "@/api/onboarding";
import { LogStream } from "@/features/onboarding/components/processing/LogStream";
import { MAPPING_TERMS } from "@/features/onboarding/constants/mappingTerminology";
import type { LogEntry } from "@/features/onboarding/types/onboarding.types";

const stepStatusConfig = {
  pending: {
    icon: Circle,
    className: "text-gray-400",
  },
  in_progress: {
    icon: Loader2,
    className: "text-blue-500 font-medium",
    animate: true,
  },
  completed: {
    icon: CheckCircle2,
    className: "text-green-500",
  },
} as const;

// 로그와 단계 전환을 함께 정의: phase가 지정된 항목에서 해당 단계를 in_progress로 전환
const animationSteps: (LogEntry & { phase?: string })[] = [
  { id: "p1", timestamp: "00:02", message: "파일 구조를 파싱 중...", type: "info", phase: "parsing" },
  { id: "p2", timestamp: "00:05", message: "데이터 행과 컬럼을 분석합니다...", type: "info" },
  { id: "p3", timestamp: "00:08", message: "데이터 정규화 시작...", type: "info", phase: "normalizing" },
  { id: "p4", timestamp: "00:10", message: "원본 컬럼 헤더 추출 완료", type: "success" },
  { id: "p5", timestamp: "00:14", message: "샘플 데이터 추출 중...", type: "info" },
  { id: "p6", timestamp: "00:18", message: "AI 매핑 분석을 시작합니다...", type: "info", phase: "connecting" },
  { id: "p7", timestamp: "00:28", message: "원본 컬럼-대상 속성 매핑 추론 중...", type: "info" },
  { id: "p8", timestamp: "00:40", message: "관계 매핑 추론 중...", type: "info" },
  { id: "p9", timestamp: "00:50", message: "매핑 결과 검증 중...", type: "info", phase: "validating" },
];

const PHASES = ["uploading", "parsing", "normalizing", "connecting", "validating"] as const;

export function DataProcessingPage() {
  const navigate = useNavigate();
  const { setStep, setMappingPreviewData } = useMappingStore();
  const { primaryUploadId } = useUploadStore();
  const {
    processingSteps,
    processingProgress,
    processingLogs,
    isProcessing,
    startProcessing,
    updateProcessingStep,
    setProcessingProgress,
    addLog,
  } = useProcessingStore();

  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const apiCalledRef = useRef(false);

  const handleGoBack = () => {
    if (!window.confirm("이전 단계로 돌아가면 현재 진행 중인 분석 데이터가 삭제됩니다. 계속하시겠습니까?")) return;
    useUploadStore.getState().reset();
    useProcessingStore.getState().reset();
    useMappingStore.getState().reset();
    navigate("/onboarding/upload");
  };

  useEffect(() => {
    setStep(2);
  }, [setStep]);

  useEffect(() => {
    if (apiCalledRef.current || !primaryUploadId) return;
    apiCalledRef.current = true;

    startProcessing();

    let animationInterval: ReturnType<typeof setInterval> | null = null;
    let stepIndex = 0;
    let lastPhase: string | null = null;
    let done = false;

    const run = async () => {
      try {
        // ── 1단계: 업로드 확인 (20%) ──
        updateProcessingStep("uploading", "in_progress");
        addLog({ id: `log-u-${Date.now()}`, timestamp: "00:00", message: "업로드된 파일을 확인합니다...", type: "info" });

        await completeUpload(primaryUploadId);

        updateProcessingStep("uploading", "completed");
        setProcessingProgress(20);
        addLog({ id: `log-u-done-${Date.now()}`, timestamp: "00:01", message: "파일 업로드 확인 완료", type: "success" });

        // ── 2단계: AI 분석 (20% → 100%) ──
        // 로그 애니메이션으로 단계를 순차 전환
        animationInterval = setInterval(() => {
          if (done || stepIndex >= animationSteps.length) return;

          const step = animationSteps[stepIndex];

          // phase가 지정된 항목: 이전 단계 완료 + 새 단계 시작
          if (step.phase) {
            if (lastPhase) updateProcessingStep(lastPhase, "completed");
            updateProcessingStep(step.phase, "in_progress");
            lastPhase = step.phase;
          }

          addLog({ ...step, id: `log-a-${Date.now()}-${stepIndex}` });
          stepIndex++;

          const progress = 20 + Math.min(Math.round((stepIndex / animationSteps.length) * 70), 70);
          setProcessingProgress(progress);
        }, 3000);

        const response = await previewMapping({ upload_id: primaryUploadId });

        done = true;
        if (animationInterval) clearInterval(animationInterval);
        animationInterval = null;

        // 모든 단계 완료
        PHASES.forEach((phase) => updateProcessingStep(phase, "completed"));
        setProcessingProgress(100);

        const basePropCount = response.mapping.property_mappings.filter((pm) => !pm.is_extended).length;
        const extPropCount = response.mapping.property_mappings.filter((pm) => pm.is_extended).length;

        addLog({
          id: `log-done-${Date.now()}`,
          timestamp: "완료",
          message: `매핑 분석 완료: ${MAPPING_TERMS.baseMapping} ${basePropCount}건, ${MAPPING_TERMS.relationMapping} ${response.mapping.relation_mappings.length}건, ${MAPPING_TERMS.extendedMapping} ${extPropCount}건`,
          type: "success",
        });

        const extendedProps = response.mapping.property_mappings.filter((pm) => pm.is_extended);
        if (extendedProps.length > 0) {
          addLog({
            id: `log-ext-summary-${Date.now()}`,
            timestamp: "완료",
            message: `${MAPPING_TERMS.sourceColumn}이 ${MAPPING_TERMS.extendedMapping}으로 ${extendedProps.length}건 반영되었습니다.`,
            type: "info",
          });

          extendedProps.slice(0, 8).forEach((ep, idx) => {
            addLog({
              id: `log-ext-${Date.now()}-${idx}`,
              timestamp: "완료",
              message: `[${MAPPING_TERMS.extendedMapping}] ${ep.source_column} -> Part.${ep.target_property}`,
              type: "info",
            });
          });

          if (extendedProps.length > 8) {
            addLog({
              id: `log-ext-more-${Date.now()}`,
              timestamp: "완료",
              message: `외 ${extendedProps.length - 8}건은 매핑 단계에서 확인할 수 있습니다.`,
              type: "info",
            });
          }
        }

        setMappingPreviewData(
          response.headers,
          response.sample_rows,
          response.mapping,
          response.editable_constraints,
        );

        setIsCompleted(true);
      } catch (err: unknown) {
        done = true;
        if (animationInterval) clearInterval(animationInterval);

        const axiosErr = err as { response?: { data?: { detail?: string } } };
        const errorMsg =
          axiosErr?.response?.data?.detail || "처리에 실패했습니다";
        console.error("Processing failed:", err);
        setError(errorMsg);
        toast.error(errorMsg);

        addLog({
          id: `log-error-${Date.now()}`,
          timestamp: "오류",
          message: `오류: ${errorMsg}`,
          type: "error",
        });
      }
    };

    run();

    return () => {
      if (animationInterval) clearInterval(animationInterval);
    };
  }, [primaryUploadId]);

  return (
    <div className="w-full max-w-[700px] space-y-6">
      {/* 상단 헤더 */}
      <div className="px-8 pb-6 pt-2 text-center lg:px-10">
          <div className="flex justify-center mb-3">
            <Cog
              className={`size-8 text-blue-500 ${isProcessing && !isCompleted ? "animate-spin" : ""}`}
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">데이터 지식화</h1>
          <p className="mt-2 text-sm text-gray-500">
            업로드된 데이터를 분석하여 AI 매핑을 생성합니다
          </p>
      </div>

      {/* 콘텐츠 */}
      <div className="px-8 lg:px-10 space-y-6">
          {/* 전체 Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">전체 진행률</span>
              <span className="font-medium text-gray-900">
                {processingProgress}%
              </span>
            </div>
            <Progress value={processingProgress} className="h-2" />
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="size-3" />
              <span>
                {error
                  ? "오류 발생"
                  : isCompleted
                    ? "분석 완료"
                    : "AI 분석 중... (1~2분 소요)"}
              </span>
            </div>
          </div>

          {/* 에러 표시 */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
              <AlertCircle className="size-5 text-red-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">{error}</p>
                <p className="text-xs text-red-600 mt-1">
                  이전 단계로 돌아가서 다시 시도해주세요
                </p>
              </div>
            </div>
          )}

          {/* 처리 단계 체크리스트 */}
          <div className="rounded-xl border border-gray-200 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">처리 단계</h3>
            <div className="space-y-1.5">
              {processingSteps.map((step) => {
                const config = stepStatusConfig[step.status];
                const Icon = config.icon;
                const shouldAnimate =
                  "animate" in config && config.animate;

                return (
                  <div
                    key={step.phase}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg ${config.className}`}
                  >
                    <Icon
                      className={`size-4 shrink-0 ${shouldAnimate ? "animate-spin" : ""}`}
                    />
                    <span className="text-sm">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 로그 스트리밍 */}
          <div className="bg-gray-900 rounded-xl p-4">
            <LogStream logs={processingLogs} />
          </div>
      </div>

      {/* 하단 버튼 */}
      <div className="flex items-center justify-between px-8 pb-8 pt-6 lg:px-10">
          <Button
            type="button"
            variant="outline"
            className="h-12 px-8 text-base font-semibold border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
            onClick={handleGoBack}
          >
            이전
          </Button>
          <Button
            type="button"
            className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-base font-semibold shadow-lg shadow-blue-600/20 transition-all hover:shadow-blue-600/30"
            disabled={!isCompleted}
            onClick={() => navigate("/onboarding/mapping")}
          >
            다음
          </Button>
      </div>
    </div>
  );
}
