import { OrganizationSettingsScreen as OrganizationSettingsScreenView } from "@fabbit/components";
import { BillingSection, type UsageSubTab } from "@/features/billing";
import { OrganizationChangeGeneralTab } from "@/features/organization-settings/components/organization-change-general-tab";
import { AIUsageTab } from "@/features/billing/components/ai-usage-tab";
import { StorageUsageTab } from "@/features/billing/components/storage-usage-tab";
import { OrganizationGeneralSettingsTab } from "@/features/organization-settings/components/organization-general-settings-tab";
import { OrganizationLabelsTab } from "@/features/organization-settings/components/organization-labels-tab";
import { OrganizationMembersUsersTab } from "@/features/organization-settings/components/organization-members-users-tab";
import { OrganizationPartsSettingsTab } from "@/features/organization-settings/components/organization-parts-settings-tab";
import { OrganizationSecuritySettingsTab } from "@/features/organization-settings/components/organization-security-settings-tab";
import { OrganizationTeamsTab } from "@/features/organization-settings/components/organization-teams-tab";
import { mockActivityLogs } from "@/features/organization-settings/mock-data/activity-logs";
import type {
  OrganizationChangeSubTab,
  OrganizationMembersSubTab,
  OrganizationSettingsTab,
} from "@/features/organization-settings/types/organization-settings-model";

interface OrganizationSettingsScreenProps {
  activeTab: OrganizationSettingsTab;
  changeTab: OrganizationChangeSubTab;
  memberTab: OrganizationMembersSubTab;
  usageTab: UsageSubTab;
  onActiveTabChange: (tab: OrganizationSettingsTab) => void;
  onChangeTabChange: (tab: OrganizationChangeSubTab) => void;
  onMemberTabChange: (tab: OrganizationMembersSubTab) => void;
  onUsageTabChange: (tab: UsageSubTab) => void;
}

export function OrganizationSettingsScreen({
  activeTab,
  changeTab,
  memberTab,
  usageTab,
  onActiveTabChange,
  onChangeTabChange,
  onMemberTabChange,
  onUsageTabChange,
}: OrganizationSettingsScreenProps) {
  return (
    <OrganizationSettingsScreenView
      activeTab={activeTab}
      changeTab={changeTab}
      memberTab={memberTab}
      usageTab={usageTab}
      generalContent={<OrganizationGeneralSettingsTab />}
      membersUsersContent={<OrganizationMembersUsersTab />}
      membersTeamsContent={<OrganizationTeamsTab />}
      partsCategoriesContent={<OrganizationPartsSettingsTab />}
      changeGeneralContent={<OrganizationChangeGeneralTab />}
      labelsContent={<OrganizationLabelsTab />}
      billingContent={<BillingSection />}
      usageStorageContent={<StorageUsageTab />}
      usageAiContent={<AIUsageTab />}
      securityContent={<OrganizationSecuritySettingsTab />}
      logs={mockActivityLogs}
      onActiveTabChange={(tab) => onActiveTabChange(tab as OrganizationSettingsTab)}
      onChangeTabChange={(tab) => onChangeTabChange(tab as OrganizationChangeSubTab)}
      onMemberTabChange={(tab) => onMemberTabChange(tab as OrganizationMembersSubTab)}
      onUsageTabChange={onUsageTabChange}
    />
  );
}
