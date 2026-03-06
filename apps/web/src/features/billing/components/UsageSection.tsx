import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { StorageUsageTab } from "./StorageUsageTab";
import { AIUsageTab } from "./AIUsageTab";
import type { UsageSubTab } from "../types/billing.types";

const VALID_SUB_TABS = new Set<string>(["storage", "ai"]);

const subTabs: Array<{ key: UsageSubTab; label: string }> = [
  { key: "storage", label: "스토리지" },
  { key: "ai", label: "AI 사용량" },
];

export function UsageSection() {
  const [searchParams, setSearchParams] = useSearchParams();

  const rawTab = searchParams.get("tab") ?? "storage";
  const activeSubTab: UsageSubTab = VALID_SUB_TABS.has(rawTab)
    ? (rawTab as UsageSubTab)
    : "storage";

  function handleSubTabChange(key: UsageSubTab) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (key === "storage") {
        next.delete("tab");
      } else {
        next.set("tab", key);
      }
      return next;
    });
  }

  return (
    <div className="space-y-6">
      {/* 서브탭 네비게이션 */}
      <div className="flex gap-1 border-b">
        {subTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={cn(
              "relative cursor-pointer px-3 py-2 text-sm font-medium transition-colors",
              activeSubTab === tab.key
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => handleSubTabChange(tab.key)}
          >
            {tab.label}
            {activeSubTab === tab.key && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-foreground" />
            )}
          </button>
        ))}
      </div>

      {/* 서브탭 콘텐츠 */}
      {activeSubTab === "storage" && <StorageUsageTab />}
      {activeSubTab === "ai" && <AIUsageTab />}
    </div>
  );
}
