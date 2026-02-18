import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Loader2, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useMappingStore, useUploadStore } from "@/stores/onboarding";
import { validateMapping, confirmMapping } from "@/api/onboarding";
import { extractApiErrorMessage } from "@/features/onboarding/utils/mappingUtils";
import { type TemplateScope } from "@/pages/parts/partsTemplateStore";
import { useMappingDerivedState } from "@/features/onboarding/hooks/useMappingDerivedState";
import { useMappingActions } from "@/features/onboarding/hooks/useMappingActions";
import { KanbanBoard } from "@/features/onboarding/components/kanban/KanbanBoard";
import "@/pages/parts/parts-template-mapping.css";

interface LocationState {
  fileName?: string;
}

export function PartsTemplateMappingPage() {
  const navigate = useNavigate();
  const { partNumber } = useParams<{ partNumber: string }>();
  const location = useLocation();
  const { fileName } = (location.state as LocationState | null) ?? {};

  const scope: TemplateScope = partNumber ? "part_detail" : "master";
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setStep = useMappingStore((s) => s.setStep);
  const getMappingResult = useMappingStore((s) => s.getMappingResult);
  const setMappingId = useMappingStore((s) => s.setMappingId);
  const primaryUploadId = useUploadStore((s) => s.primaryUploadId);

  const derived = useMappingDerivedState();
  const { hasMappings, hasUnselectedPartMappings } = derived;
  const { handleResetMappings } = useMappingActions(
    derived.relationTargetInfoByType,
  );

  useEffect(() => {
    setStep(3);
  }, [setStep]);

  const handleConfirm = async () => {
    if (!primaryUploadId) {
      toast.error("업로드 정보가 없습니다. 이전 단계를 다시 진행해주세요.");
      return;
    }

    if (hasUnselectedPartMappings) {
      toast.error(
        "속성을 선택하지 않은 Part 매핑이 있습니다. 모든 카드의 속성을 선택해주세요.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const draftMapping = getMappingResult();

      const validation = await validateMapping({
        upload_id: primaryUploadId,
        mapping: draftMapping,
      });

      const validationErrors = validation.errors || [];
      const validationWarnings = validation.warnings || [];

      if (validationErrors.length > 0) {
        toast.error(validationErrors[0].message || "매핑 검증에 실패했습니다.");
        return;
      }

      if (validationWarnings.length > 0) {
        toast.warning(
          validationWarnings[0].message || "매핑 검증 경고가 있습니다.",
        );
      }

      const normalizedMapping = validation.normalized_mapping || draftMapping;

      const confirmResponse = await confirmMapping({
        upload_id: primaryUploadId,
        name: `mapping-${Date.now()}`,
        mapping: normalizedMapping,
        scope,
      });
      setMappingId(confirmResponse.id);

      toast.success("매핑이 확정되었습니다");
      navigate(partNumber ? `/parts/${partNumber}` : "/parts");
    } catch (err) {
      console.error("Mapping confirmation failed:", err);
      toast.error(extractApiErrorMessage(err, "매핑 확정에 실패했습니다"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="dev-page-container parts-template-mapping-theme space-y-4">
        {/* 헤더 */}
        <div className="rounded-lg border bg-card px-6 py-5">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">매핑 확인</h1>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto gap-1.5"
              onClick={handleResetMappings}
            >
              <RotateCcw className="size-3.5" />
              초기화
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {fileName
              ? `${fileName} 분석 결과를 검토하고 최종 매핑을 확정하세요.`
              : "분석 결과를 검토하고 최종 매핑을 확정하세요."}
          </p>
        </div>

        {/* 칸반보드 (요약바 포함) */}
        <KanbanBoard />

        {/* 확정 버튼 */}
        <div className="flex items-center justify-end">
          <Button
            disabled={!hasMappings || hasUnselectedPartMappings || isSubmitting}
            onClick={handleConfirm}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                확정 중...
              </>
            ) : (
              "최종 승인 완료"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
