import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Sparkles, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMappingStore, useUploadStore, useProcessingStore } from "@/stores/onboarding";
import { KanbanBoard } from "@/features/onboarding/components/kanban/KanbanBoard";
import { useMappingKanban } from "@/features/onboarding/hooks/useMappingKanban";

export function AIMappingPage() {
  const { t } = useTranslation(["common", "mapping"]);
  const navigate = useNavigate();

  const setStep = useMappingStore((s) => s.setStep);
  const { stats, isSubmitting, handleSubmit, handleResetMappings } = useMappingKanban();

  useEffect(() => {
    setStep(3);
  }, [setStep]);

  return (
    <div className="w-full max-w-[1200px] space-y-4">

      {/* 상단 헤더 */}
      <div className="px-8 pb-2 pt-6 text-center lg:px-10">
          <div className="mb-3 flex justify-center">
            <Sparkles className="size-8 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-3xl">
            {t("mapping:title")}
          </h1>
          <p className="mt-5 text-xl font-semibold leading-tight text-gray-500 md:text-xl">
            {t("mapping:description")}
          </p>
        </div>

      {/* 메인 영역: 칸반보드 */}
      <div className="px-8 lg:px-10">
        <KanbanBoard />
      </div>

      {/* 하단 버튼 */}
      <div className="flex items-center justify-between px-8 pb-8 pt-6 lg:px-10">
          <Button
            type="button"
            variant="outline"
            className="h-12 px-8 text-base font-semibold border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
            onClick={() => {
              if (!window.confirm("이전 단계로 돌아가면 현재 매핑 데이터가 삭제됩니다. 계속하시겠습니까?")) return;
              useUploadStore.getState().reset();
              useProcessingStore.getState().reset();
              useMappingStore.getState().reset();
              navigate("/onboarding/upload");
            }}
          >
            {t("common:prev")}
          </Button>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-12 px-6 gap-1.5 text-base font-semibold border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all"
              onClick={handleResetMappings}
            >
              <RotateCcw className="size-4" />
              초기화
            </Button>
            <Button
              type="button"
              className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-base font-semibold shadow-lg shadow-blue-600/20 transition-all hover:shadow-blue-600/30"
              disabled={!stats.hasMappings || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  처리 중...
                </>
              ) : (
                t("common:next")
              )}
            </Button>
          </div>
      </div>
    </div>
  );
}
