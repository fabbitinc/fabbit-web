import { UserNotificationsSettingsPanel } from "@fabbit/components";
import { useUserSettingsStore } from "@/features/user-settings/stores/user-settings-store";

export function UserNotificationsSettingsTab() {
  const notifications = useUserSettingsStore((state) => state.notifications);
  const setNotifications = useUserSettingsStore((state) => state.setNotifications);

  return (
    <UserNotificationsSettingsPanel
      digestNotification={notifications.digestNotification}
      emailNotification={notifications.emailNotification}
      mentionNotification={notifications.mentionNotification}
      onDigestNotificationChange={(checked) => setNotifications({ digestNotification: checked })}
      onEmailNotificationChange={(checked) => setNotifications({ emailNotification: checked })}
      onMentionNotificationChange={(checked) => setNotifications({ mentionNotification: checked })}
    />
  );
}
