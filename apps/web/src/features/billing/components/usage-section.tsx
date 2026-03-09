import { UsageSection as UsageSectionView, type UsageSubTab } from "@fabbit/components";
import { AIUsageTab } from "@/features/billing/components/ai-usage-tab";
import { StorageUsageTab } from "@/features/billing/components/storage-usage-tab";

export type { UsageSubTab } from "@fabbit/components";

interface UsageSectionProps {
  activeSubTab: UsageSubTab;
  onSubTabChange: (tab: UsageSubTab) => void;
}

export function UsageSection({ activeSubTab, onSubTabChange }: UsageSectionProps) {
  return (
    <UsageSectionView
      activeSubTab={activeSubTab}
      aiContent={<AIUsageTab />}
      storageContent={<StorageUsageTab />}
      onSubTabChange={onSubTabChange}
    />
  );
}
