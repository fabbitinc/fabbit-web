import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Compass, Rocket, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useAuthStore } from "@/stores/authStore";
import {
  getSynthesisJob,
  healthCheck,
  getStarters,
  queryGraph,
} from "@/api/onboarding";
import { completeOnboarding as completeOnboardingApi } from "@/api/auth";
import type { HealthCheckResponse, StarterQuestionDTO } from "@/api/types/onboarding";
import { HealthCheckReport } from "@/features/onboarding/components/explore/HealthCheckReport";
import { AIQueryInterface } from "@/features/onboarding/components/explore/AIQueryInterface";
import type { ChatMessage, SuggestedQuestion } from "@/features/onboarding/types/onboarding.types";

const POLL_INTERVAL = 3000;

export function ExplorePage() {
  const navigate = useNavigate();
  const { setStep, synthesisJobId, chatMessages, addChatMessage } =
    useOnboardingStore();
  const { completeOnboarding: completeOnboardingLocal } = useAuthStore();

  const [synthesisStatus, setSynthesisStatus] = useState<string>("pending");
  const [synthesisProgress, setSynthesisProgress] = useState(0);
  const [healthCheckData, setHealthCheckData] =
    useState<HealthCheckResponse | null>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>([]);
  const [isQueryLoading, setIsQueryLoading] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializedRef = useRef(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setStep(4);
  }, [setStep]);

  // 합성 완료 후 헬스체크 + 추천 질문 로드
  const loadExploreData = useCallback(async () => {
    try {
      const [hcResponse, startersResponse] = await Promise.all([
        healthCheck(),
        getStarters(),
      ]);

      setHealthCheckData(hcResponse);

      // StarterQuestionDTO → SuggestedQuestion 변환
      const questions: SuggestedQuestion[] = startersResponse.starters.map(
        (s: StarterQuestionDTO, idx: number) => ({
          id: `q-${idx + 1}`,
          question: s.question,
          category: s.description,
        }),
      );
      setSuggestedQuestions(questions);

      // 초기 환영 메시지 (한 번만)
      if (!initializedRef.current) {
        initializedRef.current = true;
        addChatMessage({
          id: `msg-welcome`,
          role: "assistant",
          content: `지식 그래프 구축이 완료되었습니다! 노드 ${hcResponse.total_nodes.toLocaleString()}개, 관계 ${hcResponse.total_relationships.toLocaleString()}개가 생성되었어요. 궁금한 점을 자유롭게 물어보세요!`,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error("Failed to load explore data:", err);
      // 헬스체크 실패해도 AI 대화는 가능하도록 진행
    }
  }, [addChatMessage]);

  // 합성 작업 폴링
  useEffect(() => {
    if (!synthesisJobId) {
      // synthesisJobId가 없으면 직접 explore 데이터 로드 (이전에 이미 완료된 경우)
      setSynthesisStatus("completed");
      setSynthesisProgress(100);
      loadExploreData();
      return;
    }

    const pollStatus = async () => {
      try {
        const job = await getSynthesisJob(synthesisJobId);
        const progress =
          job.total_rows > 0
            ? Math.round((job.processed_rows / job.total_rows) * 100)
            : 0;
        setSynthesisProgress(progress);
        setSynthesisStatus(job.status);

        if (job.status === "completed") {
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
          setSynthesisProgress(100);
          loadExploreData();
        } else if (job.status === "failed") {
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
          const errorMsg =
            job.errors.length > 0
              ? job.errors.join(", ")
              : "데이터 합성에 실패했습니다";
          setError(errorMsg);
          toast.error(errorMsg);
        }
      } catch (err) {
        console.error("Synthesis polling failed:", err);
      }
    };

    // 즉시 한 번 실행
    pollStatus();

    // 폴링 시작
    pollRef.current = setInterval(pollStatus, POLL_INTERVAL);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [synthesisJobId, loadExploreData]);

  // AI 쿼리 핸들러
  const handleSendMessage = useCallback(
    async (content: string) => {
      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      };
      addChatMessage(userMessage);
      setIsQueryLoading(true);

      try {
        const response = await queryGraph({ question: content });
        const aiMessage: ChatMessage = {
          id: `msg-${Date.now()}-ai`,
          role: "assistant",
          content: response.answer,
          timestamp: new Date().toISOString(),
        };
        addChatMessage(aiMessage);
      } catch (err) {
        console.error("Query failed:", err);
        const aiMessage: ChatMessage = {
          id: `msg-${Date.now()}-error`,
          role: "assistant",
          content:
            "죄송합니다. 질문 처리 중 오류가 발생했습니다. 다시 시도해주세요.",
          timestamp: new Date().toISOString(),
        };
        addChatMessage(aiMessage);
      } finally {
        setIsQueryLoading(false);
      }
    },
    [addChatMessage],
  );

  // 온보딩 완료
  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await completeOnboardingApi();
      completeOnboardingLocal();
      navigate("/");
    } catch (err) {
      console.error("Onboarding completion failed:", err);
      toast.error("온보딩 완료 처리에 실패했습니다");
    } finally {
      setIsCompleting(false);
    }
  };

  const isSynthesisRunning =
    synthesisStatus === "pending" || synthesisStatus === "running";

  return (
    <div className="relative flex w-full max-w-[1100px] flex-col">
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
            <Compass className="size-8 text-purple-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">탐색 및 활성화</h1>
          <p className="mt-2 text-sm text-gray-500">
            구축된 지식 그래프를 탐색하고 통찰을 얻어보세요
          </p>
        </div>

        {/* 합성 진행 중 표시 */}
        {isSynthesisRunning && (
          <div className="mx-8 lg:mx-10 mb-6 p-5 rounded-xl border border-blue-200 bg-blue-50/50">
            <div className="flex items-center gap-3 mb-3">
              <Loader2 className="size-5 text-blue-500 animate-spin" />
              <span className="text-sm font-medium text-blue-800">
                데이터 합성 중...
              </span>
            </div>
            <Progress value={synthesisProgress} className="h-2" />
            <p className="text-xs text-blue-600 mt-2">
              지식 그래프를 구축하고 있습니다. 잠시만 기다려주세요.
            </p>
          </div>
        )}

        {/* 에러 표시 */}
        {error && (
          <div className="mx-8 lg:mx-10 mb-6 flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
            <AlertCircle className="size-5 text-red-500 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">{error}</p>
              <p className="text-xs text-red-600 mt-1">
                이전 단계로 돌아가서 다시 시도해주세요
              </p>
            </div>
          </div>
        )}

        {/* 2컬럼 그리드 (합성 완료 후 표시) */}
        {synthesisStatus === "completed" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-8 lg:px-10">
            {/* 좌측: 헬스 체크 */}
            <div className="lg:col-span-2">
              {healthCheckData ? (
                <HealthCheckReport report={healthCheckData} />
              ) : (
                <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 flex items-center justify-center h-[200px]">
                  <Loader2 className="size-6 text-gray-400 animate-spin" />
                </div>
              )}
            </div>

            {/* 우측: AI 채팅 */}
            <div className="lg:col-span-1">
              <AIQueryInterface
                messages={chatMessages}
                suggestedQuestions={suggestedQuestions}
                onSendMessage={handleSendMessage}
                isLoading={isQueryLoading}
              />
            </div>
          </div>
        )}

        {/* 하단 버튼 */}
        <div className="flex items-center justify-between px-8 pb-8 pt-6 lg:px-10">
          <Button
            type="button"
            variant="outline"
            className="h-12 px-8 text-base font-semibold border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
            onClick={() => navigate("/onboarding/mapping")}
          >
            이전
          </Button>
          <Button
            type="button"
            className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-base font-semibold shadow-lg shadow-blue-600/20 transition-all hover:shadow-blue-600/30"
            disabled={isSynthesisRunning || isCompleting}
            onClick={handleComplete}
          >
            {isCompleting ? (
              <>
                <Loader2 className="size-5 mr-1.5 animate-spin" />
                처리 중...
              </>
            ) : (
              <>
                <Rocket className="size-5 mr-1.5" />
                Fabbit 시작하기
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
