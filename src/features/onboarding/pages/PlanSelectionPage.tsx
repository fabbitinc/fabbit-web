import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  Sparkles,
  Loader2,
  Rocket,
  CircleDot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useAuthStore } from "@/stores/authStore";
import { createOrganization } from "@/api";
import { planOptions } from "@/features/onboarding/mock-data/onboarding-mock";
import { cn } from "@/lib/utils";
import type { PlanTier } from "@/features/onboarding/types/onboarding.types";

type DialogPhase = "idle" | "confirming" | "creating";

const creationSteps = [
  "워크스페이스 생성 중...",
  "데이터베이스 초기화 중...",
  "사이트 배포 중...",
  "초기 설정 완료",
];

function toApiPlanTier(plan: PlanTier) {
  switch (plan) {
    case "free":
      return "FREE_TIER" as const;
    case "pro":
      return "PROFESSIONAL" as const;
    case "elite":
      return "ELITE" as const;
  }
}

export function PlanSelectionPage() {
  const navigate = useNavigate();
  const { setStep, selectedPlan, setSelectedPlan, workspaceData, signupData } =
    useOnboardingStore();
  const { signup } = useAuthStore();

  const [dialogPhase, setDialogPhase] = useState<DialogPhase>("idle");
  const [completedSteps, setCompletedSteps] = useState<number>(0);
  const [createError, setCreateError] = useState<string>("");

  useEffect(() => {
    setStep(3);
  }, [setStep]);

  const selectedPlanInfo = planOptions.find((p) => p.tier === selectedPlan);

  const handleSelect = (tier: PlanTier) => {
    setSelectedPlan(tier);
  };

  const handleContinue = () => {
    if (!signupData.name || !signupData.email || !signupData.password) {
      navigate("/onboarding/signup");
      return;
    }

    if (!workspaceData.organizationName.trim() || !workspaceData.slug.trim()) {
      navigate("/onboarding/workspace");
      return;
    }

    setCreateError("");
    setDialogPhase("confirming");
  };

  const handleConfirm = useCallback(async () => {
    setDialogPhase("creating");
    setCompletedSteps(0);
    setCreateError("");

    try {
      await createOrganization({
        organizationName: workspaceData.organizationName.trim(),
        subdomain: workspaceData.slug.trim(),
        planTier: toApiPlanTier(selectedPlan),
        ownerEmail: signupData.email,
        ownerPassword: signupData.password,
        ownerName: signupData.name,
      });

      setCompletedSteps(creationSteps.length);
      await signup(signupData.name, signupData.email, signupData.password);
      navigate("/onboarding/upload");
    } catch (error) {
      setCompletedSteps(0);
      setDialogPhase("confirming");
      setCreateError(error instanceof Error ? error.message : "조직 생성에 실패했습니다.");
    }
  }, [navigate, selectedPlan, signup, signupData, workspaceData]);

  const handleDialogClose = () => {
    if (dialogPhase === "creating") return;
    setDialogPhase("idle");
  };

  return (
    <div className="flex w-full max-w-[960px] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl shadow-gray-200/50">
      {/* 상단 헤더 */}
      <div className="px-8 pt-10 pb-6 text-center lg:px-10">
        <h1 className="text-2xl font-bold text-gray-900">요금제 선택</h1>
        <p className="mt-2 text-sm text-gray-500">
          팀 규모와 필요에 맞는 플랜을 선택하세요. 언제든 변경할 수 있습니다.
        </p>
        <div className="mt-4 flex items-center justify-center gap-6">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Check className="size-3.5 text-blue-500" />
            무료로 시작
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Check className="size-3.5 text-blue-500" />
            언제든 업그레이드
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Check className="size-3.5 text-blue-500" />
            카드 없이 시작
          </div>
        </div>
      </div>

      {/* 플랜 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-8 lg:px-10 mb-8">
        {planOptions.map((plan) => {
          const isSelected = selectedPlan === plan.tier;

          return (
            <button
              key={plan.tier}
              type="button"
              onClick={() => handleSelect(plan.tier)}
              className={cn(
                "relative text-left rounded-xl border-2 p-5 transition-all hover:shadow-md",
                isSelected
                  ? "border-blue-500 shadow-md ring-2 ring-blue-500/20 bg-blue-50/30"
                  : "border-gray-200 hover:border-gray-300 bg-gray-50/50",
                plan.highlighted && !isSelected && "border-purple-200 bg-purple-50/20",
              )}
            >
              {/* 배지 */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold",
                      plan.highlighted
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        : "bg-gray-900 text-white",
                    )}
                  >
                    {plan.highlighted && <Sparkles className="size-3" />}
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="space-y-3">
                {/* 플랜명 + 가격 */}
                <div className="space-y-1 pt-1">
                  <h3 className="text-base font-bold text-gray-900">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-gray-900">
                      {plan.price === 0
                        ? "무료"
                        : `₩${plan.price.toLocaleString()}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-xs text-gray-500">/월</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{plan.description}</p>
                </div>

                {/* 구분선 */}
                <div className="h-px bg-gray-200" />

                {/* 기능 목록 */}
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-xs text-gray-600"
                    >
                      <Check
                        className={cn(
                          "size-3.5 shrink-0 mt-0.5",
                          plan.highlighted
                            ? "text-purple-500"
                            : "text-blue-500",
                        )}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 선택 표시 */}
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                    <Check className="size-3 text-white" />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 하단 버튼 */}
      <div className="flex items-center justify-between px-8 pb-8 pt-2 lg:px-10">
        <Button
          type="button"
          variant="outline"
          className="h-12 px-8 text-base font-semibold border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
          onClick={() => navigate("/onboarding/workspace")}
        >
          이전
        </Button>
        <Button
          className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-base font-semibold shadow-lg shadow-blue-600/20 transition-all hover:shadow-blue-600/30"
          onClick={handleContinue}
        >
          시작하기
        </Button>
      </div>

      {/* 확인 / 생성 다이얼로그 */}
      <Dialog
        open={dialogPhase !== "idle"}
        onOpenChange={(open) => {
          if (!open) handleDialogClose();
        }}
      >
        <DialogContent
          showCloseButton={dialogPhase !== "creating"}
          onPointerDownOutside={(e) => {
            if (dialogPhase === "creating") e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (dialogPhase === "creating") e.preventDefault();
          }}
        >
          {dialogPhase === "confirming" && (
            <>
              <DialogHeader>
                <DialogTitle>워크스페이스 생성 확인</DialogTitle>
                <DialogDescription>
                  아래 정보로 워크스페이스를 생성합니다.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-2">
                {createError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {createError}
                  </div>
                )}
                <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
                  <span className="text-sm text-gray-500">조직명</span>
                  <span className="text-sm font-medium text-gray-900">
                    {workspaceData.organizationName || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
                  <span className="text-sm text-gray-500">이메일</span>
                  <span className="text-sm font-medium text-gray-900">
                    {signupData.email || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
                  <span className="text-sm text-gray-500">
                    워크스페이스 주소
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {workspaceData.slug
                      ? `${workspaceData.slug}.fabbit.app`
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
                  <span className="text-sm text-gray-500">선택 플랜</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedPlanInfo?.name} —{" "}
                    {selectedPlanInfo?.price === 0
                      ? "무료"
                      : `₩${selectedPlanInfo?.price.toLocaleString()}/월`}
                  </span>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleDialogClose}>
                  취소
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleConfirm}
                >
                  <Rocket className="size-4" />
                  확인
                </Button>
              </DialogFooter>
            </>
          )}

          {dialogPhase === "creating" && (
            <>
              <DialogHeader>
                <DialogTitle>워크스페이스를 생성하고 있습니다</DialogTitle>
                <DialogDescription>
                  잠시만 기다려 주세요. 곧 완료됩니다.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-4">
                {creationSteps.map((step, index) => {
                  const isCompleted = index < completedSteps;
                  const isActive =
                    index === completedSteps && completedSteps < creationSteps.length;

                  return (
                    <div
                      key={step}
                      className="flex items-center gap-3 px-2"
                    >
                      {isCompleted ? (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
                          <Check className="size-3 text-white" />
                        </div>
                      ) : isActive ? (
                        <Loader2 className="size-5 text-blue-600 animate-spin" />
                      ) : (
                        <CircleDot className="size-5 text-gray-300" />
                      )}
                      <span
                        className={cn(
                          "text-sm",
                          isCompleted && "text-gray-900 font-medium",
                          isActive && "text-blue-600 font-medium",
                          !isCompleted && !isActive && "text-gray-400",
                        )}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="text-center text-sm text-blue-600 font-medium">
                서버에서 조직을 생성하고 있습니다...
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
