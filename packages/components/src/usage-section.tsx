import type { ReactNode } from "react";
import { InlineTabs } from "@fabbit/ui";

export type UsageSubTab = "storage" | "ai";

export interface UsageSectionProps {
  activeSubTab: UsageSubTab;
  onSubTabChange: (tab: UsageSubTab) => void;
  storageContent: ReactNode;
  aiContent: ReactNode;
}

const subTabs = [
  { key: "storage", label: "스토리지" },
  { key: "ai", label: "AI 사용량" },
] as const;

export function UsageSection({
  activeSubTab,
  onSubTabChange,
  storageContent,
  aiContent,
}: UsageSectionProps) {
  return (
    <div className="space-y-6">
      <InlineTabs
        activeKey={activeSubTab}
        items={subTabs}
        onChange={(tab) => onSubTabChange(tab as UsageSubTab)}
      />

      {activeSubTab === "storage" ? storageContent : aiContent}
    </div>
  );
}
