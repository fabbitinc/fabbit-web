import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Cog,
  Database,
  GitBranch,
  Circle,
  Loader2,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { mockLogMessages } from "@/features/onboarding/mock-data/onboarding-mock";
import { CounterAnimation } from "@/features/onboarding/components/processing/CounterAnimation";
import { LogStream } from "@/features/onboarding/components/processing/LogStream";

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

export function DataProcessingPage() {
  const navigate = useNavigate();
  const {
    setStep,
    processingSteps,
    processingStats,
    processingProgress,
    processingLogs,
    isProcessing,
    startProcessing,
    updateProcessingStep,
    updateProcessingStats,
    setProcessingProgress,
    addLog,
  } = useOnboardingStore();

  useEffect(() => {
    setStep(2);
  }, [setStep]);

  // 시뮬레이션 (개발: ~1초)
  useEffect(() => {
    let logIndex = 0;
    const totalLogs = mockLogMessages.length;

    const interval = setInterval(() => {
      if (logIndex >= totalLogs) {
        clearInterval(interval);
        return;
      }

      const progress = Math.round(((logIndex + 1) / totalLogs) * 100);
      setProcessingProgress(progress);
      addLog(mockLogMessages[logIndex]);

      if (logIndex === 0)
        updateProcessingStep("parsing", "in_progress");
      if (logIndex === 2) {
        updateProcessingStep("parsing", "completed");
        updateProcessingStep("normalizing", "in_progress");
      }
      if (logIndex === 6) {
        updateProcessingStep("normalizing", "completed");
        updateProcessingStep("connecting", "in_progress");
      }
      if (logIndex === 9) {
        updateProcessingStep("connecting", "completed");
        updateProcessingStep("validating", "in_progress");
      }
      if (logIndex === totalLogs - 1)
        updateProcessingStep("validating", "completed");

      const nodeProgress = Math.min(logIndex / totalLogs, 1);
      updateProcessingStats({
        nodesCreated: Math.round(3450 * nodeProgress),
        relationsCreated: Math.round(8920 * nodeProgress),
      });

      logIndex++;
    }, 70);

    startProcessing();

    return () => clearInterval(interval);
  }, []);

  const isCompleted = processingProgress >= 100;

  return (
    <div className="relative flex w-full max-w-[700px] flex-col">
      {/* 워터마크 로고 */}
      <div className="absolute top-[-40px] left-0 flex items-center gap-1.5">
        <div className="flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6]">
          <svg
            className="h-3 w-3 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <span className="text-xs text-gray-300">Fabbit</span>
      </div>

      <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl shadow-gray-200/50">
      {/* 상단 헤더 */}
      <div className="px-8 pt-10 pb-6 text-center lg:px-10">
        <div className="flex justify-center mb-3">
          <Cog
            className={`size-8 text-blue-500 ${isProcessing && !isCompleted ? "animate-spin" : ""}`}
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">데이터 지식화</h1>
        <p className="mt-2 text-sm text-gray-500">
          업로드된 데이터를 분석하여 지식 그래프를 구축합니다
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
            <span>{isCompleted ? "처리 완료" : "처리 중..."}</span>
          </div>
        </div>

        {/* 카운터 영역 */}
        <div className="grid grid-cols-2 gap-4">
          <CounterAnimation
            target={processingStats.nodesCreated}
            label="생성된 노드"
            icon={<Database className="size-6" />}
          />
          <CounterAnimation
            target={processingStats.relationsCreated}
            label="생성된 관계"
            icon={<GitBranch className="size-6" />}
          />
        </div>

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
          onClick={() => navigate("/onboarding/upload")}
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
    </div>
  );
}
