import type { ReactNode } from "react";
import { Loader2, RotateCcw, Sparkles } from "lucide-react";
import {
  Button,
  Dialog,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@fabbit/ui";
import "./parts-template-mapping-screen.css";

export interface PartsTemplateMappingEmptyStateProps {
  onBackClick: () => void;
  onRetryClick?: () => void;
}

export interface PartsTemplateMappingScreenProps {
  fileName: string;
  boardContent?: ReactNode;
  saveDialogContent?: ReactNode;
  confirmDisabledReason?: string;
  emptyState?: PartsTemplateMappingEmptyStateProps;
  isLoadingBoard?: boolean;
  isSaveDialogOpen?: boolean;
  isSaving?: boolean;
  onCancelClick: () => void;
  onConfirmClick: () => void;
  onResetClick: () => void;
  onSaveDialogOpenChange: (open: boolean) => void;
}

export function PartsTemplateMappingScreen({
  fileName,
  boardContent,
  saveDialogContent,
  confirmDisabledReason,
  emptyState,
  isLoadingBoard = false,
  isSaveDialogOpen = false,
  isSaving = false,
  onCancelClick,
  onConfirmClick,
  onResetClick,
  onSaveDialogOpenChange,
}: PartsTemplateMappingScreenProps) {
  if (emptyState) {
    return (
      <section className="app-panel rounded-[32px] p-8 text-center">
        <h1 className="text-xl font-semibold text-foreground">매핑 데이터가 없습니다</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          분석 단계를 먼저 완료해야 매핑 보드를 구성할 수 있습니다.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Button variant="outline" onClick={emptyState.onBackClick}>
            목록으로 돌아가기
          </Button>
          {emptyState.onRetryClick ? <Button onClick={emptyState.onRetryClick}>분석 다시 실행</Button> : null}
        </div>
      </section>
    );
  }

  return (
    <div className="parts-template-mapping-theme space-y-6">
      <section className="app-panel rounded-[32px] p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="size-3.5" />
              Mapping
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">부품 템플릿 매핑 검토</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              {fileName} 분석 결과를 검토하고, 부품 속성과 관계 속성을 최종 확정합니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onResetClick}>
              <RotateCcw className="size-4" />
              초기화
            </Button>
          </div>
        </div>
      </section>

      {isLoadingBoard ? (
        <section className="app-panel rounded-[32px] p-8 text-center text-sm text-muted-foreground">
          <Loader2 className="mx-auto mb-3 size-5 animate-spin" />
          매핑 규칙을 불러오는 중입니다.
        </section>
      ) : (
        boardContent
      )}

      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={onCancelClick}>
          취소
        </Button>

        {confirmDisabledReason ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button disabled>최종 승인 완료</Button>
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={8} className="max-w-[320px] text-xs">
              {confirmDisabledReason}
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button disabled={isSaving} onClick={onConfirmClick}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                저장 중...
              </>
            ) : (
              "최종 승인 완료"
            )}
          </Button>
        )}
      </div>

      {saveDialogContent ? (
        <Dialog open={isSaveDialogOpen} onOpenChange={onSaveDialogOpenChange}>
          {saveDialogContent}
        </Dialog>
      ) : null}
    </div>
  );
}
