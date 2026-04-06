import type { ReactNode } from "react";
import {
  BarChart3,
  Building2,
  GitPullRequestArrow,
  Package,
  Users,
} from "lucide-react";
import { InlineTabs } from "@fabbit/ui";
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
  partsPropertiesContent: ReactNode;
  partsCategoriesContent: ReactNode;
  changeGeneralContent: ReactNode;
  labelsContent: ReactNode;
  usageStorageContent: ReactNode;
  usageAiContent: ReactNode;
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
  { id: "usage", label: "사용량", icon: BarChart3 },
];

const memberTabs = [
  { key: "users", label: "사용자" },
  { key: "teams", label: "팀" },
] as const;

const partsTabs = [
  { key: "properties", label: "부품 항목" },
  { key: "categories", label: "카테고리" },
] as const;

const changeTabs = [
  { key: "general", label: "일반" },
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
  partsPropertiesContent,
  partsCategoriesContent,
  changeGeneralContent,
  labelsContent,
  usageStorageContent,
  usageAiContent,
  onActiveTabChange,
  onChangeTabChange,
  onMemberTabChange,
  onPartsTabChange,
  onUsageTabChange,
}: OrganizationSettingsScreenProps) {
  return (
    <SettingsShell
      activeTab={activeTab}
      description="조직 멤버, 부품 운영 규칙, 라벨, 사용량을 관리합니다."
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
          {partsTab === "properties" ? partsPropertiesContent : partsCategoriesContent}
        </div>
      ) : null}
      {activeTab === "change" ? (
        <div className="space-y-6">
          <InlineTabs activeKey={changeTab} items={changeTabs} onChange={onChangeTabChange} />
          {changeTab === "general" ? changeGeneralContent : labelsContent}
        </div>
      ) : null}
      {activeTab === "usage" ? (
        <UsageSection
          activeSubTab={usageTab}
          aiContent={usageAiContent}
          storageContent={usageStorageContent}
          onSubTabChange={onUsageTabChange}
        />
      ) : null}
    </SettingsShell>
  );
}
