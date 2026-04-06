import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Switch,
} from "@fabbit/ui";
import { Loader2 } from "lucide-react";
import { useSettingsQuery, useUpdatePartWorkflowPolicyAction } from "@/features/settings";

export function OrganizationChangeGeneralTab() {
  const settingsQuery = useSettingsQuery();
  const updatePartWorkflowPolicyAction = useUpdatePartWorkflowPolicyAction();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const partWorkflowMode = settingsQuery.data?.partWorkflowMode ?? "DIRECT";
  const usesEngineeringChangeWorkflow = partWorkflowMode === "ENGINEERING_CHANGE_REQUIRED";
  const nextMode = usesEngineeringChangeWorkflow ? "DIRECT" : "ENGINEERING_CHANGE_REQUIRED";
  const isEnabling = nextMode === "ENGINEERING_CHANGE_REQUIRED";

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">변경 관리</h2>
        <p className="mt-1 text-sm text-muted-foreground">부품 변경 시 엔지니어링 변경(EC) 워크플로우를 거치도록 설정합니다.</p>
      </div>

      <div className="rounded-lg border border-border/70 bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">변경 관리 사용</p>
            <p className="text-xs text-muted-foreground">
              {usesEngineeringChangeWorkflow
                ? "부품 수정 시 엔지니어링 변경 승인이 필요합니다."
                : "부품을 직접 수정할 수 있습니다. 변경 이력이 기록되지 않습니다."}
            </p>
          </div>
          <Switch
            checked={usesEngineeringChangeWorkflow}
            disabled={updatePartWorkflowPolicyAction.isPending}
            onCheckedChange={() => setConfirmOpen(true)}
          />
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isEnabling ? "변경 관리를 활성화하시겠습니까?" : "변경 관리를 비활성화하시겠습니까?"}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                {isEnabling ? (
                  <>
                    <p>활성화하면 부품 수정 시 엔지니어링 변경(EC) 요청과 승인 절차가 필요합니다.</p>
                    <p>이미 진행 중인 작업에는 영향을 주지 않습니다.</p>
                  </>
                ) : (
                  <>
                    <p>비활성화하면 부품을 직접 수정할 수 있게 됩니다.</p>
                    <p className="font-medium text-destructive">변경 이력이 더 이상 기록되지 않습니다.</p>
                  </>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              disabled={updatePartWorkflowPolicyAction.isPending}
              onClick={() =>
                updatePartWorkflowPolicyAction.updatePartWorkflowMode(nextMode, {
                  onSuccess: () => setConfirmOpen(false),
                })
              }
            >
              {updatePartWorkflowPolicyAction.isPending ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : null}
              {isEnabling ? "활성화" : "비활성화"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
