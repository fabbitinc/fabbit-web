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
      <div className="min-h-screen bg-background px-6 py-8">
        <div className="dev-page-container parts-template-mapping-theme space-y-4">
          <section className="rounded-lg border bg-card px-6 py-5 text-center">
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="dev-page-container parts-template-mapping-theme space-y-4">
        <div className="rounded-lg border bg-card px-6 py-5">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">매핑 확인</h1>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto gap-1.5"
              onClick={onResetClick}
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

        {isLoadingBoard ? (
          <section className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
            <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin" />
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
                  <Button disabled onClick={onConfirmClick}>
                    최종 승인 완료
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                sideOffset={8}
                hideArrow
                className="max-w-[320px] rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-white"
              >
                {confirmDisabledReason}
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button disabled={isSaving} onClick={onConfirmClick}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
    </div>
  );
}
