import {
  getSettings,
  updatePartWorkflowPolicy,
} from "@/api/generated/orval/settings/settings";
import type { SettingsPartWorkflowPolicyRequest } from "@/api/generated/orval/model/settingsPartWorkflowPolicyRequest";
import type {
  FetchSettingsResponse,
  UpdatePartWorkflowPolicyRequest,
  UpdatePartWorkflowPolicyResponse,
} from "@/features/settings/api/settings.types";
import type {
  PartWorkflowMode,
  SettingsModel,
} from "@/features/settings/types/settings-model";

function normalizePartWorkflowMode(
  mode:
    | FetchSettingsResponse["part_workflow_mode"]
    | UpdatePartWorkflowPolicyResponse["mode"],
): PartWorkflowMode {
  return mode === "ENGINEERING_CHANGE_REQUIRED"
    ? "ENGINEERING_CHANGE_REQUIRED"
    : "DIRECT";
}

function serializePartWorkflowMode(
  mode: PartWorkflowMode,
): SettingsPartWorkflowPolicyRequest["mode"] {
  return mode === "ENGINEERING_CHANGE_REQUIRED"
    ? "ENGINEERING_CHANGE_REQUIRED"
    : "DIRECT";
}

export function toSettingsModel(
  response: FetchSettingsResponse | UpdatePartWorkflowPolicyResponse,
): SettingsModel {
  return {
    partWorkflowMode: normalizePartWorkflowMode(
      "part_workflow_mode" in response
        ? response.part_workflow_mode
        : response.mode,
    ),
  };
}

export async function fetchSettings(): Promise<FetchSettingsResponse> {
  return getSettings();
}

export async function updatePartsWorkflowPolicy(
  request: UpdatePartWorkflowPolicyRequest,
): Promise<UpdatePartWorkflowPolicyResponse> {
  return updatePartWorkflowPolicy({
    ...request,
    mode: serializePartWorkflowMode(request.mode),
  });
}
