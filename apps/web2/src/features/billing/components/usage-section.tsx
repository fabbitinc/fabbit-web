import { cn } from "@/lib/utils";
import { AIUsageTab } from "@/features/billing/components/ai-usage-tab";
import { StorageUsageTab } from "@/features/billing/components/storage-usage-tab";

export type UsageSubTab = "storage" | "ai";

interface UsageSectionProps {
  activeSubTab: UsageSubTab;
  onSubTabChange: (tab: UsageSubTab) => void;
}

const subTabs: Array<{ key: UsageSubTab; label: string }> = [
  { key: "storage", label: "스토리지" },
  { key: "ai", label: "AI 사용량" },
];

export function UsageSection({ activeSubTab, onSubTabChange }: UsageSectionProps) {
  return (
    <div className="space-y-6">
      <div className="flex gap-1 border-b border-border/70">
        {subTabs.map((tab) => (
          <button
            key={tab.key}
            className={cn(
              "relative px-3 py-2 text-sm font-medium transition-colors",
              activeSubTab === tab.key ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
            type="button"
            onClick={() => onSubTabChange(tab.key)}
          >
            {tab.label}
            {activeSubTab === tab.key ? (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-foreground" />
            ) : null}
          </button>
        ))}
      </div>

      {activeSubTab === "storage" ? <StorageUsageTab /> : <AIUsageTab />}
    </div>
  );
}
