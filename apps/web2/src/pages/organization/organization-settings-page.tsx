import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { type UsageSubTab } from "@/features/billing";
import {
  OrganizationSettingsScreen,
  type OrganizationChangeSubTab,
  type OrganizationMembersSubTab,
  type OrganizationPartsSubTab,
  type OrganizationSettingsTab,
} from "@/features/organization-settings";

const validTabs = new Set<OrganizationSettingsTab>([
  "general",
  "members",
  "parts",
  "change",
  "billing",
  "usage",
  "security",
  "logs",
  "advanced",
]);

export function OrganizationSettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const menuParam = searchParams.get("menu");
  const activeTab: OrganizationSettingsTab =
    menuParam && validTabs.has(menuParam as OrganizationSettingsTab)
      ? (menuParam as OrganizationSettingsTab)
      : "general";

  const memberTab: OrganizationMembersSubTab =
    activeTab === "members" && searchParams.get("tab") === "teams" ? "teams" : "users";
  const partsTab: OrganizationPartsSubTab =
    activeTab === "parts" && searchParams.get("tab") === "assignment" ? "assignment" : "categories";
  const changeTab: OrganizationChangeSubTab = "labels";
  const usageTab: UsageSubTab = activeTab === "usage" && searchParams.get("tab") === "ai" ? "ai" : "storage";

  const setActiveTab = useCallback(
    (tab: OrganizationSettingsTab) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (tab === "general") {
          next.delete("menu");
        } else {
          next.set("menu", tab);
        }
        next.delete("tab");
        return next;
      });
    },
    [setSearchParams],
  );

  const setSubTab = useCallback(
    (tab: string, defaultTab: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (tab === defaultTab) {
          next.delete("tab");
        } else {
          next.set("tab", tab);
        }
        return next;
      });
    },
    [setSearchParams],
  );

  return (
    <OrganizationSettingsScreen
      activeTab={activeTab}
      changeTab={changeTab}
      memberTab={memberTab}
      partsTab={partsTab}
      usageTab={usageTab}
      onActiveTabChange={setActiveTab}
      onChangeTabChange={(tab) => setSubTab(tab, "labels")}
      onMemberTabChange={(tab) => setSubTab(tab, "users")}
      onPartsTabChange={(tab) => setSubTab(tab, "categories")}
      onUsageTabChange={(tab) => setSubTab(tab, "storage")}
    />
  );
}
