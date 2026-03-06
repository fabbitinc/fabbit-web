import { Badge, Switch } from "@fabbit/ui";

export interface UserPreferencesSettingsPanelProps {
  compactMode: boolean;
  autoSaveDraft: boolean;
  onCompactModeChange: (checked: boolean) => void;
  onAutoSaveDraftChange: (checked: boolean) => void;
}

export function UserPreferencesSettingsPanel({
  compactMode,
  autoSaveDraft,
  onCompactModeChange,
  onAutoSaveDraftChange,
}: UserPreferencesSettingsPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">사용 환경</h2>
          <p className="mt-1 text-sm text-muted-foreground">현재는 클라이언트 환경 설정만 지원하며 브라우저에 저장됩니다.</p>
        </div>
        <Badge variant="secondary">브라우저 저장</Badge>
      </div>

      <div className="space-y-4 rounded-[24px] border border-border/70 bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">컴팩트 모드</p>
            <p className="text-xs text-muted-foreground">리스트와 테이블의 행 간격을 줄여 더 많은 정보를 표시합니다.</p>
          </div>
          <Switch checked={compactMode} onCheckedChange={onCompactModeChange} />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-foreground">작성 중 자동 저장</p>
            <p className="text-xs text-muted-foreground">폼 입력 중 임시 저장을 자동으로 유지합니다.</p>
          </div>
          <Switch checked={autoSaveDraft} onCheckedChange={onAutoSaveDraftChange} />
        </div>
      </div>
    </div>
  );
}
