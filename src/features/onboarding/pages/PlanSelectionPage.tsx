import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  Check,
  Sparkles,
  ArrowLeft,
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
    // 생성 중에는 닫기 방지
    if (dialogPhase === "creating") return;
    setDialogPhase("idle");
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* 헤더 */}
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6]">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-[#0f172a]">요금제 선택</h1>
        <p className="text-sm text-[#64748b]">
          팀에 맞는 플랜을 선택하세요. 언제든 변경할 수 있습니다.
        </p>
      </div>

      {/* 플랜 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {planOptions.map((plan) => {
          const isSelected = selectedPlan === plan.tier;

          return (
            <button
              key={plan.tier}
              type="button"
              onClick={() => handleSelect(plan.tier)}
              className={cn(
                "relative text-left bg-white rounded-2xl border-2 p-6 transition-all hover:shadow-md",
                isSelected
                  ? "border-[#3b82f6] shadow-md ring-2 ring-[#3b82f6]/20"
                  : "border-[#e2e8f0] hover:border-[#94a3b8]",
                plan.highlighted && !isSelected && "border-[#8b5cf6]/30",
              )}
            >
              {/* 배지 */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold",
                      plan.highlighted
                        ? "bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] text-white"
                        : "bg-[#0f172a] text-white",
                    )}
                  >
                    {plan.highlighted && <Sparkles className="size-3" />}
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="space-y-4">
                {/* 플랜명 + 가격 */}
                <div className="space-y-1 pt-1">
                  <h3 className="text-lg font-bold text-[#0f172a]">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-[#0f172a]">
                      {plan.price === 0
                        ? "무료"
                        : `₩${plan.price.toLocaleString()}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-sm text-[#64748b]">/월</span>
                    )}
                  </div>
                  <p className="text-sm text-[#64748b]">{plan.description}</p>
                </div>

                {/* 구분선 */}
                <div className="h-px bg-[#e2e8f0]" />

                {/* 기능 목록 */}
                <ul className="space-y-2.5">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-[#334155]"
                    >
                      <Check
                        className={cn(
                          "size-4 shrink-0 mt-0.5",
                          plan.highlighted
                            ? "text-[#8b5cf6]"
                            : "text-[#3b82f6]",
                        )}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 선택 표시 */}
              {isSelected && (
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 rounded-full bg-[#3b82f6] flex items-center justify-center">
                    <Check className="size-3.5 text-white" />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 하단 버튼 */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => navigate("/onboarding/workspace")}
        >
          <ArrowLeft className="size-4" />
          이전
        </Button>
        <Button
          className="h-12 px-8 bg-[#3b82f6] hover:bg-[#2563eb] text-base font-medium"
          onClick={handleContinue}
        >
          다음
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
                <div className="flex items-center justify-between rounded-lg border border-[#e2e8f0] px-4 py-3">
                  <span className="text-sm text-[#64748b]">조직명</span>
                  <span className="text-sm font-medium text-[#0f172a]">
                    {workspaceData.organizationName || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-[#e2e8f0] px-4 py-3">
                  <span className="text-sm text-[#64748b]">이메일</span>
                  <span className="text-sm font-medium text-[#0f172a]">
                    {signupData.email || "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-[#e2e8f0] px-4 py-3">
                  <span className="text-sm text-[#64748b]">
                    워크스페이스 주소
                  </span>
                  <span className="text-sm font-medium text-[#0f172a]">
                    {workspaceData.slug
                      ? `${workspaceData.slug}.fabbitinc.com`
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-[#e2e8f0] px-4 py-3">
                  <span className="text-sm text-[#64748b]">선택 플랜</span>
                  <span className="text-sm font-medium text-[#0f172a]">
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
                  className="bg-[#3b82f6] hover:bg-[#2563eb]"
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
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#22c55e]">
                          <Check className="size-3 text-white" />
                        </div>
                      ) : isActive ? (
                        <Loader2 className="size-5 text-[#3b82f6] animate-spin" />
                      ) : (
                        <CircleDot className="size-5 text-[#cbd5e1]" />
                      )}
                      <span
                        className={cn(
                          "text-sm",
                          isCompleted && "text-[#0f172a] font-medium",
                          isActive && "text-[#3b82f6] font-medium",
                          !isCompleted && !isActive && "text-[#94a3b8]",
                        )}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="text-center text-sm text-[#3b82f6] font-medium">
                서버에서 조직을 생성하고 있습니다...
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
