import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Compass, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useAuthStore } from "@/stores/authStore";
import {
  mockHealthCheckReport,
  mockSuggestedQuestions,
  mockInitialChatMessages,
  mockAIResponses,
} from "@/features/onboarding/mock-data/onboarding-mock";
import { HealthCheckReport } from "@/features/onboarding/components/explore/HealthCheckReport";
import { AIQueryInterface } from "@/features/onboarding/components/explore/AIQueryInterface";
import type { ChatMessage } from "@/features/onboarding/types/onboarding.types";

export function ExplorePage() {
  const navigate = useNavigate();
  const { setStep, chatMessages, addChatMessage } = useOnboardingStore();
  const { completeOnboarding } = useAuthStore();
  const initializedRef = useRef(false);

  useEffect(() => {
    setStep(4);
  }, [setStep]);

  // 초기 메시지 추가 (한 번만)
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    for (const msg of mockInitialChatMessages) {
      addChatMessage(msg);
    }
  }, [addChatMessage]);

  const handleSendMessage = (content: string) => {
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };
    addChatMessage(userMessage);

    // Mock AI 응답 (1.5초 후)
    setTimeout(() => {
      const response =
        mockAIResponses[content] ||
        "흥미로운 질문이네요! 해당 데이터를 분석 중입니다. 지식 그래프에서 관련 정보를 찾고 있습니다...";
      const aiMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: response,
        timestamp: new Date().toISOString(),
      };
      addChatMessage(aiMessage);
    }, 1500);
  };

  const handleComplete = () => {
    completeOnboarding();
    navigate("/");
  };

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

      {/* 2컬럼 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-8 lg:px-10">
        {/* 좌측: 헬스 체크 */}
        <div className="lg:col-span-2">
          <HealthCheckReport report={mockHealthCheckReport} />
        </div>

        {/* 우측: AI 채팅 (추천 질문 통합) */}
        <div className="lg:col-span-1">
          <AIQueryInterface
            messages={chatMessages}
            suggestedQuestions={mockSuggestedQuestions}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>

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
          onClick={handleComplete}
        >
          <Rocket className="size-5 mr-1.5" />
          Fabbit 시작하기
        </Button>
      </div>
      </div>
    </div>
  );
}
