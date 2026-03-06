import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { UserNotificationsSettingsPanel } from "@fabbit/components";

function UserNotificationsSettingsPanelStory() {
  const [emailNotification, setEmailNotification] = useState(true);
  const [mentionNotification, setMentionNotification] = useState(true);
  const [digestNotification, setDigestNotification] = useState(false);

  return (
    <UserNotificationsSettingsPanel
      digestNotification={digestNotification}
      emailNotification={emailNotification}
      mentionNotification={mentionNotification}
      onDigestNotificationChange={setDigestNotification}
      onEmailNotificationChange={setEmailNotification}
      onMentionNotificationChange={setMentionNotification}
    />
  );
}

const meta = {
  title: "Components/UserNotificationsSettingsPanel",
  component: UserNotificationsSettingsPanelStory,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof UserNotificationsSettingsPanelStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
