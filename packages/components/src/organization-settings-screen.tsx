import type { ReactNode } from "react";
import {
  BarChart3,
  Building2,
  CreditCard,
  GitPullRequestArrow,
  History,
  ListChecks,
  Package,
  ShieldCheck,
  Users,
} from "lucide-react";
import { InlineTabs } from "@fabbit/ui";
import { OrganizationAdvancedTab, type OrganizationAdvancedPolicyCard } from "./organization-advanced-tab";
import { OrganizationLogsTab, type OrganizationLogsTabItem } from "./organization-logs-tab";
import { SettingsShell, type SettingsNavItem } from "./settings-shell";
import { UsageSection, type UsageSubTab } from "./usage-section";

export interface OrganizationSettingsScreenProps {
  activeTab: string;
  changeTab: string;
  memberTab: string;
  partsTab: string;
  usageTab: UsageSubTab;
  generalContent: ReactNode;
  membersUsersContent: ReactNode;
  membersTeamsContent: ReactNode;
  partsCategoriesContent: ReactNode;
  partsAssignmentContent: ReactNode;
  labelsContent: ReactNode;
  billingContent: ReactNode;
  usageStorageContent: ReactNode;
  usageAiContent: ReactNode;
  securityContent: ReactNode;
  logs: OrganizationLogsTabItem[];
  logsCaption?: string;
  advancedPolicies?: OrganizationAdvancedPolicyCard[];
  onActiveTabChange: (tab: string) => void;
  onChangeTabChange: (tab: string) => void;
  onMemberTabChange: (tab: string) => void;
  onPartsTabChange: (tab: string) => void;
  onUsageTabChange: (tab: UsageSubTab) => void;
}

const tabs: SettingsNavItem[] = [
  { id: "general", label: "일반", icon: Building2 },
  { id: "members", label: "멤버", icon: Users },
  { id: "parts", label: "부품", icon: Package },
  { id: "change", label: "변경 관리", icon: GitPullRequestArrow },
  { id: "billing", label: "결제 관리", icon: CreditCard },
  { id: "usage", label: "사용량", icon: BarChart3 },
  { id: "security", label: "보안", icon: ShieldCheck },
  { id: "logs", label: "로그 기록", icon: History },
  { id: "advanced", label: "기타 설정", icon: ListChecks },
];

const memberTabs = [
  { key: "users", label: "사용자" },
  { key: "teams", label: "팀" },
] as const;

const partsTabs = [
  { key: "categories", label: "카테고리" },
  { key: "assignment", label: "담당 설정" },
] as const;

const changeTabs = [
  { key: "labels", label: "라벨" },
] as const;

export function OrganizationSettingsScreen({
  activeTab,
  changeTab,
  memberTab,
  partsTab,
  usageTab,
  generalContent,
  membersUsersContent,
  membersTeamsContent,
  partsCategoriesContent,
  partsAssignmentContent,
  labelsContent,
  billingContent,
  usageStorageContent,
  usageAiContent,
  securityContent,
  logs,
  logsCaption,
  advancedPolicies,
  onActiveTabChange,
  onChangeTabChange,
  onMemberTabChange,
  onPartsTabChange,
  onUsageTabChange,
}: OrganizationSettingsScreenProps) {
  return (
    <SettingsShell
      activeTab={activeTab}
      description="조직 멤버, 부품 운영 규칙, 라벨, 과금과 사용량을 관리합니다."
      tabs={tabs}
      title="조직 설정"
      onTabChange={onActiveTabChange}
    >
      {activeTab === "general" ? generalContent : null}
      {activeTab === "members" ? (
        <div className="space-y-6">
          <InlineTabs activeKey={memberTab} items={memberTabs} onChange={onMemberTabChange} />
          {memberTab === "users" ? membersUsersContent : membersTeamsContent}
        </div>
      ) : null}
      {activeTab === "parts" ? (
        <div className="space-y-6">
          <InlineTabs activeKey={partsTab} items={partsTabs} onChange={onPartsTabChange} />
          {partsTab === "categories" ? partsCategoriesContent : partsAssignmentContent}
        </div>
      ) : null}
      {activeTab === "change" ? (
        <div className="space-y-6">
          <InlineTabs activeKey={changeTab} items={changeTabs} onChange={onChangeTabChange} />
          {labelsContent}
        </div>
      ) : null}
      {activeTab === "billing" ? billingContent : null}
      {activeTab === "usage" ? (
        <UsageSection
          activeSubTab={usageTab}
          aiContent={usageAiContent}
          storageContent={usageStorageContent}
          onSubTabChange={onUsageTabChange}
        />
      ) : null}
      {activeTab === "security" ? securityContent : null}
      {activeTab === "logs" ? <OrganizationLogsTab caption={logsCaption} logs={logs} /> : null}
      {activeTab === "advanced" ? <OrganizationAdvancedTab cards={advancedPolicies} /> : null}
    </SettingsShell>
  );
}
