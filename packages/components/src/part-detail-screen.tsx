import type { ComponentType, ReactNode } from "react";
import { Building2, Clock, FolderKanban, Network, Package, Paperclip } from "lucide-react";
import { Button, Skeleton } from "@fabbit/ui";
import { PartHeaderCard, type PartHeaderCardPart } from "./part-header-card";

export type PartDetailScreenTab = "properties" | "bom" | "attachments" | "suppliers" | "projects" | "history";

export interface PartDetailScreenProps {
  activeTab: PartDetailScreenTab;
  availableTabs?: PartDetailScreenTab[];
  attachmentsContent: ReactNode;
  bomContent: ReactNode;
  historyContent: ReactNode;
  projectsContent: ReactNode;
  propertiesContent: ReactNode;
  suppliersContent: ReactNode;
  isError?: boolean;
  isLoading?: boolean;
  part?: PartHeaderCardPart;
  headerActions?: ReactNode;
  onBackClick: () => void;
  onRetry?: () => void;
  onTabChange: (tab: PartDetailScreenTab) => void;
}

const detailTabs: Array<{
  id: PartDetailScreenTab;
  label: string;
  icon: ComponentType<{ className?: string }>;
  count?: (part: PartHeaderCardPart) => number;
}> = [
  { id: "properties", label: "속성", icon: Package },
  { id: "bom", label: "BOM", icon: Network, count: (part) => part.childrenCount + part.parentsCount },
  { id: "attachments", label: "파일", icon: Paperclip, count: (part) => part.filesCount },
  { id: "suppliers", label: "공급사", icon: Building2, count: (part) => part.suppliersCount },
  { id: "projects", label: "프로젝트", icon: FolderKanban, count: (part) => part.projectsCount },
  { id: "history", label: "이력", icon: Clock },
];

export function PartDetailScreen({
  activeTab,
  availableTabs,
  attachmentsContent,
  bomContent,
  historyContent,
  projectsContent,
  propertiesContent,
  suppliersContent,
  isError = false,
  isLoading = false,
  part,
  headerActions,
  onBackClick,
  onRetry,
  onTabChange,
}: PartDetailScreenProps) {
  if (isLoading) {
    return (
      <div className="min-h-full">
        <div className="mb-4 flex items-center gap-1.5 text-sm">
          <Skeleton className="h-4 w-16" />
          <span className="text-muted-foreground/40">/</span>
          <Skeleton className="h-4 w-28" />
        </div>

        <div className="mb-5 rounded-2xl border border-border/70 bg-card p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-4 w-56" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-20 rounded-md" />
              <Skeleton className="h-9 w-24 rounded-md" />
            </div>
          </div>
        </div>

        <div className="mb-5 border-b">
          <div className="flex flex-wrap gap-2 pb-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-9 w-24 rounded-md" />
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border/70 bg-card p-4">
          <div className="space-y-3">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-4 w-72" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !part) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted-foreground">부품을 불러오지 못했습니다.</p>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={onBackClick}>
              목록으로
            </Button>
            {onRetry ? (
              <Button type="button" onClick={onRetry}>
                다시 시도
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  const visibleTabs = detailTabs.filter((tab) => !availableTabs || availableTabs.includes(tab.id));

  return (
    <div className="min-h-full">
      <div className="mb-4 flex items-center gap-1.5 text-sm">
        <button
          className="cursor-pointer text-muted-foreground transition-colors hover:text-primary"
          type="button"
          onClick={onBackClick}
        >
          부품 관리
        </button>
        <span className="text-muted-foreground/40">/</span>
        <span className="font-semibold text-foreground">{part.partNumber}</span>
      </div>

      <div className="mb-5">
        <PartHeaderCard actions={headerActions} part={part} />
      </div>

      <div className="mb-5 border-b">
        <div className="flex flex-wrap">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const count = tab.count ? tab.count(part) : null;

            return (
              <button
                key={tab.id}
                type="button"
                className={`relative flex cursor-pointer items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => onTabChange(tab.id)}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
                {count != null && count > 0 ? (
                  <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-muted px-1 text-[10px] font-medium text-muted-foreground">
                    {count}
                  </span>
                ) : null}
                {isActive ? <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" /> : null}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "properties" ? propertiesContent : null}
      {activeTab === "bom" ? bomContent : null}
      {activeTab === "attachments" ? attachmentsContent : null}
      {activeTab === "suppliers" ? suppliersContent : null}
      {activeTab === "projects" ? projectsContent : null}
      {activeTab === "history" ? historyContent : null}
    </div>
  );
}
