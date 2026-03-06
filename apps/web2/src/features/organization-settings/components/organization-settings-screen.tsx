import { OrganizationSettingsScreen as OrganizationSettingsScreenView } from "@fabbit/components";
import { BillingSection, type UsageSubTab } from "@/features/billing";
import { AIUsageTab } from "@/features/billing/components/ai-usage-tab";
import { StorageUsageTab } from "@/features/billing/components/storage-usage-tab";
import { OrganizationGeneralSettingsTab } from "@/features/organization-settings/components/organization-general-settings-tab";
import { OrganizationLabelsTab } from "@/features/organization-settings/components/organization-labels-tab";
import { OrganizationMembersUsersTab } from "@/features/organization-settings/components/organization-members-users-tab";
import { OrganizationPartsCategoriesTab } from "@/features/organization-settings/components/organization-parts-categories-tab";
import { OrganizationPartsDefaultAssignmentTab } from "@/features/organization-settings/components/organization-parts-default-assignment-tab";
import { OrganizationSecuritySettingsTab } from "@/features/organization-settings/components/organization-security-settings-tab";
import { OrganizationTeamsTab } from "@/features/organization-settings/components/organization-teams-tab";
import { mockActivityLogs } from "@/features/organization-settings/mock-data/activity-logs";
import type {
  OrganizationChangeSubTab,
  OrganizationMembersSubTab,
  OrganizationPartsSubTab,
  OrganizationSettingsTab,
} from "@/features/organization-settings/types/organization-settings-model";

interface OrganizationSettingsScreenProps {
  activeTab: OrganizationSettingsTab;
  changeTab: OrganizationChangeSubTab;
  memberTab: OrganizationMembersSubTab;
  partsTab: OrganizationPartsSubTab;
  usageTab: UsageSubTab;
  onActiveTabChange: (tab: OrganizationSettingsTab) => void;
  onChangeTabChange: (tab: OrganizationChangeSubTab) => void;
  onMemberTabChange: (tab: OrganizationMembersSubTab) => void;
  onPartsTabChange: (tab: OrganizationPartsSubTab) => void;
  onUsageTabChange: (tab: UsageSubTab) => void;
}

export function OrganizationSettingsScreen({
  activeTab,
  changeTab,
  memberTab,
  partsTab,
  usageTab,
  onActiveTabChange,
  onChangeTabChange,
  onMemberTabChange,
  onPartsTabChange,
  onUsageTabChange,
}: OrganizationSettingsScreenProps) {
  return (
    <OrganizationSettingsScreenView
      activeTab={activeTab}
      changeTab={changeTab}
      memberTab={memberTab}
      partsTab={partsTab}
      usageTab={usageTab}
      generalContent={<OrganizationGeneralSettingsTab />}
      membersUsersContent={<OrganizationMembersUsersTab />}
      membersTeamsContent={<OrganizationTeamsTab />}
      partsCategoriesContent={<OrganizationPartsCategoriesTab />}
      partsAssignmentContent={<OrganizationPartsDefaultAssignmentTab />}
      labelsContent={<OrganizationLabelsTab />}
      billingContent={<BillingSection />}
      usageStorageContent={<StorageUsageTab />}
      usageAiContent={<AIUsageTab />}
      securityContent={<OrganizationSecuritySettingsTab />}
      logs={mockActivityLogs}
      onActiveTabChange={(tab) => onActiveTabChange(tab as OrganizationSettingsTab)}
      onChangeTabChange={(tab) => onChangeTabChange(tab as OrganizationChangeSubTab)}
      onMemberTabChange={(tab) => onMemberTabChange(tab as OrganizationMembersSubTab)}
      onPartsTabChange={(tab) => onPartsTabChange(tab as OrganizationPartsSubTab)}
      onUsageTabChange={onUsageTabChange}
    />
  );
}
