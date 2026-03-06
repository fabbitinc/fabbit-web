import { UserPreferencesSettingsPanel } from "@fabbit/components";
import { useUserSettingsStore } from "@/features/user-settings/stores/user-settings-store";

export function UserPreferencesSettingsTab() {
  const preferences = useUserSettingsStore((state) => state.preferences);
  const setPreferences = useUserSettingsStore((state) => state.setPreferences);

  return (
    <UserPreferencesSettingsPanel
      autoSaveDraft={preferences.autoSaveDraft}
      compactMode={preferences.compactMode}
      onAutoSaveDraftChange={(checked) => setPreferences({ autoSaveDraft: checked })}
      onCompactModeChange={(checked) => setPreferences({ compactMode: checked })}
    />
  );
}
