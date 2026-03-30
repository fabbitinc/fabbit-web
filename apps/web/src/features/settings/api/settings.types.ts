import type { SettingsPartWorkflowPolicyRequest } from "@/api/generated/orval/model/settingsPartWorkflowPolicyRequest";
import type {
  SettingsGetResult as GetSettingsResult,
  SettingsUpdatePartWorkflowPolicyResult as UpdatePartWorkflowPolicyResult,
} from "@/api/generated/orval/settings/settings";
import type { PartWorkflowMode } from "@/features/settings/types/settings-model";

export interface FetchSettingsResponse extends GetSettingsResult {}

export interface UpdatePartWorkflowPolicyRequest extends Omit<SettingsPartWorkflowPolicyRequest, "mode"> {
  mode: PartWorkflowMode;
}

export interface UpdatePartWorkflowPolicyResponse extends UpdatePartWorkflowPolicyResult {}
