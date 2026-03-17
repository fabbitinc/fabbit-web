import { Button, InlineTabs } from "@fabbit/ui";

export type PartsListScreenMode = "change-managed" | "direct";
export type PartsListScreenPrimaryTab = "master" | "workbench";
export type PartsListScreenWorkbenchFilter = "draft";

export interface PartsListModeTabsProps {
  activePrimaryTab: PartsListScreenPrimaryTab;
  activeWorkbenchFilter: PartsListScreenWorkbenchFilter;
  isMineOnly?: boolean;
  mode: PartsListScreenMode;
  onMineOnlyChange?: (mineOnly: boolean) => void;
  onPrimaryTabChange: (tab: PartsListScreenPrimaryTab) => void;
  onWorkbenchFilterChange: (filter: PartsListScreenWorkbenchFilter) => void;
}

const primaryTabItems = [
  { key: "master", label: "마스터" },
  { key: "workbench", label: "작업함" },
] satisfies ReadonlyArray<{
  key: PartsListScreenPrimaryTab;
  label: string;
}>;

const workbenchFilterItems = [
  { key: "draft", label: "초안" },
] satisfies ReadonlyArray<{
  key: PartsListScreenWorkbenchFilter;
  label: string;
}>;

export function PartsListModeTabs({
  activePrimaryTab,
  activeWorkbenchFilter,
  isMineOnly = false,
  onMineOnlyChange,
  onPrimaryTabChange,
  onWorkbenchFilterChange,
}: PartsListModeTabsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <InlineTabs
        activeKey={activePrimaryTab}
        items={primaryTabItems}
        onChange={(tab) => onPrimaryTabChange(tab as PartsListScreenPrimaryTab)}
      />
      {activePrimaryTab === "workbench" ? (
        <Button
          aria-pressed={isMineOnly}
          className={
            isMineOnly
              ? "border-primary/50 bg-primary/5 text-primary hover:bg-primary/10"
              : "text-muted-foreground"
          }
          size="sm"
          type="button"
          variant="outline"
          onClick={() => onMineOnlyChange?.(!isMineOnly)}
        >
          내 작업만
        </Button>
      ) : null}
      {activePrimaryTab === "workbench" && workbenchFilterItems.length > 1 ? (
        <div className="flex items-center gap-1 rounded-full border border-border/70 bg-muted/35 p-1">
          {workbenchFilterItems.map((item) => {
            const isActive = item.key === activeWorkbenchFilter;

            return (
              <button
                key={item.key}
                className={`cursor-pointer rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                type="button"
                onClick={() => onWorkbenchFilterChange(item.key)}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
