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
import { BillingSection, type UsageSubTab, UsageSection } from "@/features/billing";
import { SettingsShell, type SettingsNavItem } from "@/components/settings-shell";
import { cn } from "@/lib/utils";
import { OrganizationAdvancedTab } from "@/features/organization-settings/components/organization-advanced-tab";
import { OrganizationGeneralSettingsTab } from "@/features/organization-settings/components/organization-general-settings-tab";
import { OrganizationLabelsTab } from "@/features/organization-settings/components/organization-labels-tab";
import { OrganizationLogsTab } from "@/features/organization-settings/components/organization-logs-tab";
import { OrganizationMembersUsersTab } from "@/features/organization-settings/components/organization-members-users-tab";
import { OrganizationPartsCategoriesTab } from "@/features/organization-settings/components/organization-parts-categories-tab";
import { OrganizationPartsDefaultAssignmentTab } from "@/features/organization-settings/components/organization-parts-default-assignment-tab";
import { OrganizationSecuritySettingsTab } from "@/features/organization-settings/components/organization-security-settings-tab";
import { OrganizationTeamsTab } from "@/features/organization-settings/components/organization-teams-tab";
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
    <SettingsShell
      activeTab={activeTab}
      description="조직 멤버, 부품 운영 규칙, 라벨, 과금과 사용량을 관리합니다."
      tabs={tabs}
      title="조직 설정"
      onTabChange={(tabId) => onActiveTabChange(tabId as OrganizationSettingsTab)}
    >
      {activeTab === "general" ? <OrganizationGeneralSettingsTab /> : null}
      {activeTab === "members" ? (
        <div className="space-y-6">
          <InlineSubTabs
            activeKey={memberTab}
            items={[
              { key: "users", label: "사용자" },
              { key: "teams", label: "팀" },
            ]}
            onChange={(tab) => onMemberTabChange(tab as OrganizationMembersSubTab)}
          />
          {memberTab === "users" ? <OrganizationMembersUsersTab /> : <OrganizationTeamsTab />}
        </div>
      ) : null}
      {activeTab === "parts" ? (
        <div className="space-y-6">
          <InlineSubTabs
            activeKey={partsTab}
            items={[
              { key: "categories", label: "카테고리" },
              { key: "assignment", label: "담당 설정" },
            ]}
            onChange={(tab) => onPartsTabChange(tab as OrganizationPartsSubTab)}
          />
          {partsTab === "categories" ? <OrganizationPartsCategoriesTab /> : <OrganizationPartsDefaultAssignmentTab />}
        </div>
      ) : null}
      {activeTab === "change" ? (
        <div className="space-y-6">
          <InlineSubTabs
            activeKey={changeTab}
            items={[{ key: "labels", label: "라벨" }]}
            onChange={(tab) => onChangeTabChange(tab as OrganizationChangeSubTab)}
          />
          <OrganizationLabelsTab />
        </div>
      ) : null}
      {activeTab === "billing" ? <BillingSection /> : null}
      {activeTab === "usage" ? <UsageSection activeSubTab={usageTab} onSubTabChange={onUsageTabChange} /> : null}
      {activeTab === "security" ? <OrganizationSecuritySettingsTab /> : null}
      {activeTab === "logs" ? <OrganizationLogsTab /> : null}
      {activeTab === "advanced" ? <OrganizationAdvancedTab /> : null}
    </SettingsShell>
  );
}

function InlineSubTabs({
  items,
  activeKey,
  onChange,
}: {
  items: Array<{ key: string; label: string }>;
  activeKey: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="flex gap-1 border-b border-border/70">
      {items.map((item) => (
        <button
          key={item.key}
          className={cn(
            "relative px-3 py-2 text-sm font-medium transition-colors",
            activeKey === item.key ? "text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
          type="button"
          onClick={() => onChange(item.key)}
        >
          {item.label}
          {activeKey === item.key ? <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-foreground" /> : null}
        </button>
      ))}
    </div>
  );
}
