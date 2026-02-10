import { Outlet } from "react-router-dom";
import { OnboardingStepBar } from "./OnboardingStepBar";
import { useOnboardingStore } from "@/stores/onboardingStore";

export function OnboardingLayout() {
  const currentStep = useOnboardingStore((s) => s.currentStep);

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc]">
      {/* 상단 헤더 */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#e2e8f0] bg-white px-8">
        {/* 로고 */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6]">
            <svg
              className="h-5 w-5 text-white"
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
          <span className="text-lg font-bold text-[#0f172a]">Fabbit</span>
        </div>

        {/* 스텝 바 */}
        <OnboardingStepBar currentStep={currentStep} />

        {/* 우측 공간 (균형) */}
        <div className="w-[120px]" />
      </header>

      {/* 컨텐츠 영역 */}
      <main className="flex flex-1 items-start justify-center overflow-y-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
