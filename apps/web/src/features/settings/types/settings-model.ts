export type PartWorkflowMode = "DIRECT" | "ENGINEERING_CHANGE_REQUIRED";

export interface SettingsModel {
  partWorkflowMode: PartWorkflowMode;
}
