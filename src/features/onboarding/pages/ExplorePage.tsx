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
    setStep(7);
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
    <div className="max-w-6xl mx-auto w-full space-y-6">
      {/* 헤더 */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-[#8b5cf6]/10 flex items-center justify-center">
            <Compass className="size-6 text-[#8b5cf6]" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-[#0f172a]">탐색 및 활성화</h1>
        <p className="text-[#64748b]">
          구축된 지식 그래프를 탐색하고 통찰을 얻어보세요
        </p>
      </div>

      {/* 2컬럼 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

      {/* 하단: Fabbit 시작하기 버튼 */}
      <Button
        className="w-full bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:from-[#2563eb] hover:to-[#7c3aed] text-white h-14 text-lg font-semibold rounded-xl"
        onClick={handleComplete}
      >
        <Rocket className="size-5" />
        Fabbit 시작하기
      </Button>
    </div>
  );
}
