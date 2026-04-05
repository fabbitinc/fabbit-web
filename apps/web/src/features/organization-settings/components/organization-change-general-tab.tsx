import { Switch } from "@fabbit/ui";
import { useSettingsQuery, useUpdatePartWorkflowPolicyAction } from "@/features/settings";

export function OrganizationChangeGeneralTab() {
  const settingsQuery = useSettingsQuery();
  const updatePartWorkflowPolicyAction = useUpdatePartWorkflowPolicyAction();

  const partWorkflowMode = settingsQuery.data?.partWorkflowMode ?? "DIRECT";
  const usesEngineeringChangeWorkflow = partWorkflowMode === "ENGINEERING_CHANGE_REQUIRED";

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
            onCheckedChange={(checked) =>
              updatePartWorkflowPolicyAction.updatePartWorkflowMode(
                checked ? "ENGINEERING_CHANGE_REQUIRED" : "DIRECT",
              )
            }
          />
        </div>
      </div>
    </section>
  );
}
