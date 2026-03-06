import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { UserSettingsScreen, type UserSettingsTab } from "@/features/user-settings";

const validTabs = new Set<UserSettingsTab>(["profile", "security", "notifications", "preferences"]);

export function UserSettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const menuParam = searchParams.get("menu");
  const activeTab: UserSettingsTab =
    menuParam && validTabs.has(menuParam as UserSettingsTab)
      ? (menuParam as UserSettingsTab)
      : "profile";

  const setActiveTab = useCallback(
    (tab: UserSettingsTab) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (tab === "profile") {
          next.delete("menu");
        } else {
          next.set("menu", tab);
        }
        return next;
      });
    },
    [setSearchParams],
  );

  return <UserSettingsScreen activeTab={activeTab} onTabChange={setActiveTab} />;
}
