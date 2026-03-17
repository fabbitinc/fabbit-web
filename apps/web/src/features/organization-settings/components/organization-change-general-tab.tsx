import { Switch } from "@fabbit/ui";
import { useSettingsQuery, useUpdatePartWorkflowPolicyAction } from "@/features/settings";

export function OrganizationChangeGeneralTab() {
  const settingsQuery = useSettingsQuery();
  const updatePartWorkflowPolicyAction = useUpdatePartWorkflowPolicyAction();

  const partWorkflowMode = settingsQuery.data?.partWorkflowMode ?? "DIRECT";
  const usesEngineeringChangeWorkflow = partWorkflowMode === "ENGINEERING_CHANGE_REQUIRED";

  return (
    <section className="space-y-4 rounded-lg border border-border/70 bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-foreground">변경 관리 사용</h2>
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
    </section>
  );
}
