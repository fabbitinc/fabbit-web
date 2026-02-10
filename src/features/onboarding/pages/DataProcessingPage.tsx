import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Cog,
  Database,
  GitBranch,
  Circle,
  Loader2,
  CheckCircle2,
  ArrowRight,
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
    className: "text-[#94a3b8]",
  },
  in_progress: {
    icon: Loader2,
    className: "text-[#3b82f6] font-medium",
    animate: true,
  },
  completed: {
    icon: CheckCircle2,
    className: "text-[#22c55e]",
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
    setStep(6);
  }, [setStep]);

  // 시뮬레이션
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

      // 단계 업데이트
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

      // 스탯 업데이트
      const nodeProgress = Math.min(logIndex / totalLogs, 1);
      updateProcessingStats({
        nodesCreated: Math.round(3450 * nodeProgress),
        relationsCreated: Math.round(8920 * nodeProgress),
      });

      logIndex++;
    }, 1500);

    startProcessing();

    return () => clearInterval(interval);
  }, []);

  const isCompleted = processingProgress >= 100;

  return (
    <div className="max-w-2xl mx-auto w-full space-y-6">
      {/* 헤더 */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-[#3b82f6]/10 flex items-center justify-center">
            <Cog
              className={`size-6 text-[#3b82f6] ${isProcessing && !isCompleted ? "animate-spin" : ""}`}
            />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-[#0f172a]">데이터 지식화</h1>
        <p className="text-[#64748b]">
          업로드된 데이터를 분석하여 지식 그래프를 구축합니다
        </p>
      </div>

      {/* 전체 Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#64748b]">전체 진행률</span>
          <span className="font-medium text-[#0f172a]">
            {processingProgress}% 완료
          </span>
        </div>
        <Progress value={processingProgress} className="h-2" />
        <div className="flex items-center gap-1 text-xs text-[#94a3b8]">
          <Clock className="size-3" />
          <span>예상 소요 시간: 약 2분</span>
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
      <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 space-y-3">
        <h3 className="text-sm font-semibold text-[#0f172a]">처리 단계</h3>
        <div className="space-y-2">
          {processingSteps.map((step) => {
            const config = stepStatusConfig[step.status];
            const Icon = config.icon;
            const shouldAnimate =
              "animate" in config && config.animate;

            return (
              <div
                key={step.phase}
                className={`flex items-center gap-3 p-2 rounded-lg ${config.className}`}
              >
                <Icon
                  className={`size-5 shrink-0 ${shouldAnimate ? "animate-spin" : ""}`}
                />
                <span className="text-sm">{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 로그 스트리밍 */}
      <div className="bg-[#0f172a] rounded-xl p-4">
        <LogStream logs={processingLogs} />
      </div>

      {/* 다음 버튼 */}
      <Button
        className="w-full h-12 text-base font-semibold rounded-xl"
        disabled={!isCompleted}
        onClick={() => navigate("/onboarding/explore")}
      >
        다음
        <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}
