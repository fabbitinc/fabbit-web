import { useState } from "react";
import { Save, FileCheck, MessageCircle, Flag, AlertTriangle, Bell, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { NotificationSettings } from "../../types/settings.types";
import { mockNotificationSettings } from "../../mock-data/settings-mock";

interface NotificationItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function NotificationItem({
  icon,
  title,
  description,
  checked,
  onCheckedChange,
}: NotificationItemProps) {
  return (
    <div className="flex items-start justify-between rounded-lg border border-[#e2e8f0] bg-white p-4">
      <div className="flex gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f1f5f9] text-[#64748b]">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-[#0f172a]">{title}</p>
          <p className="mt-0.5 text-xs text-[#64748b]">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export function NotificationsSettings() {
  const [settings, setSettings] = useState<NotificationSettings>(
    mockNotificationSettings
  );

  const updateSetting = (
    key: keyof Omit<NotificationSettings, "channels">,
    value: boolean
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updateChannel = (
    channel: keyof NotificationSettings["channels"],
    value: boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      channels: { ...prev.channels, [channel]: value },
    }));
  };

  const handleSave = () => {
    // TODO: API 연동
    console.log("알림 설정 저장:", settings);
  };

  return (
    <div className="space-y-6">
      {/* 알림 유형 */}
      <div className="rounded-xl border border-[#e2e8f0] bg-white p-6">
        <h2 className="text-lg font-medium text-[#0f172a]">알림 유형</h2>
        <p className="mt-1 text-sm text-[#64748b]">
          받고 싶은 알림을 선택하세요.
        </p>

        <div className="mt-6 space-y-3">
          <NotificationItem
            icon={<FileCheck className="h-4 w-4" />}
            title="도면 승인"
            description="도면이 승인되거나 반려되었을 때 알림"
            checked={settings.drawingApproved}
            onCheckedChange={(checked) =>
              updateSetting("drawingApproved", checked)
            }
          />
          <NotificationItem
            icon={<MessageCircle className="h-4 w-4" />}
            title="댓글 멘션"
            description="댓글에서 나를 멘션했을 때 알림"
            checked={settings.commentMention}
            onCheckedChange={(checked) =>
              updateSetting("commentMention", checked)
            }
          />
          <NotificationItem
            icon={<Flag className="h-4 w-4" />}
            title="마일스톤 알림"
            description="마일스톤 마감이 임박했을 때 알림"
            checked={settings.milestoneReminder}
            onCheckedChange={(checked) =>
              updateSetting("milestoneReminder", checked)
            }
          />
          <NotificationItem
            icon={<AlertTriangle className="h-4 w-4" />}
            title="충돌 감지"
            description="BOM에서 충돌이 감지되었을 때 알림"
            checked={settings.conflictDetected}
            onCheckedChange={(checked) =>
              updateSetting("conflictDetected", checked)
            }
          />
        </div>
      </div>

      {/* 알림 채널 */}
      <div className="rounded-xl border border-[#e2e8f0] bg-white p-6">
        <h2 className="text-lg font-medium text-[#0f172a]">알림 채널</h2>
        <p className="mt-1 text-sm text-[#64748b]">
          알림을 받을 채널을 선택하세요.
        </p>

        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-[#e2e8f0] bg-white p-4">
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f1f5f9] text-[#64748b]">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#0f172a]">인앱 알림</p>
                <p className="mt-0.5 text-xs text-[#64748b]">
                  앱 내 알림 센터에서 알림을 받습니다
                </p>
              </div>
            </div>
            <Switch
              checked={settings.channels.inApp}
              onCheckedChange={(checked) => updateChannel("inApp", checked)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-[#e2e8f0] bg-white p-4">
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f1f5f9] text-[#64748b]">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#0f172a]">이메일</p>
                <p className="mt-0.5 text-xs text-[#64748b]">
                  등록된 이메일로 알림을 받습니다
                </p>
              </div>
            </div>
            <Switch
              checked={settings.channels.email}
              onCheckedChange={(checked) => updateChannel("email", checked)}
            />
          </div>
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="bg-[#3b82f6] hover:bg-[#2563eb]"
        >
          <Save className="mr-2 h-4 w-4" />
          저장
        </Button>
      </div>
    </div>
  );
}
