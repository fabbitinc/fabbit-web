import { Badge, Switch } from "@fabbit/ui";
import { useUserSettingsStore } from "@/features/user-settings/stores/user-settings-store";

export function UserNotificationsSettingsTab() {
  const notifications = useUserSettingsStore((state) => state.notifications);
  const setNotifications = useUserSettingsStore((state) => state.setNotifications);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">알림 채널</h2>
          <p className="mt-1 text-sm text-muted-foreground">사용자별 알림 저장 API가 없어 현재는 기기 로컬 설정으로 관리합니다.</p>
        </div>
        <Badge variant="secondary">로컬 설정</Badge>
      </div>

      <div className="space-y-4 rounded-[24px] border border-border/70 bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">이메일 알림</p>
            <p className="text-xs text-muted-foreground">중요 공지와 보안 이벤트를 이메일로 수신합니다.</p>
          </div>
          <Switch
            checked={notifications.emailNotification}
            onCheckedChange={(checked) => setNotifications({ emailNotification: checked })}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">멘션 알림</p>
            <p className="text-xs text-muted-foreground">댓글과 작업에서 @멘션되면 즉시 알림을 표시합니다.</p>
          </div>
          <Switch
            checked={notifications.mentionNotification}
            onCheckedChange={(checked) => setNotifications({ mentionNotification: checked })}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">일일 요약 리포트</p>
            <p className="text-xs text-muted-foreground">하루 활동 요약을 오전 9시에 수신하도록 저장합니다.</p>
          </div>
          <Switch
            checked={notifications.digestNotification}
            onCheckedChange={(checked) => setNotifications({ digestNotification: checked })}
          />
        </div>
      </div>
    </div>
  );
}
