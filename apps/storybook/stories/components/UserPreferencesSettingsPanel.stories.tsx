import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { UserPreferencesSettingsPanel } from "@fabbit/components";

function UserPreferencesSettingsPanelStory() {
  const [compactMode, setCompactMode] = useState(false);
  const [autoSaveDraft, setAutoSaveDraft] = useState(true);

  return (
    <UserPreferencesSettingsPanel
      autoSaveDraft={autoSaveDraft}
      compactMode={compactMode}
      onAutoSaveDraftChange={setAutoSaveDraft}
      onCompactModeChange={setCompactMode}
    />
  );
}

const meta = {
  title: "Components/UserPreferencesSettingsPanel",
  component: UserPreferencesSettingsPanelStory,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof UserPreferencesSettingsPanelStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
