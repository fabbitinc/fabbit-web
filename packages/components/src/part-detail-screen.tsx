import type { ComponentType, ReactNode } from "react";
import { Building2, Clock, FolderKanban, Network, Package, Paperclip, User } from "lucide-react";
import { Button } from "@fabbit/ui";
import { PartHeaderCard, type PartHeaderCardPart } from "./part-header-card";

export type PartDetailScreenTab = "properties" | "bom" | "attachments" | "suppliers" | "projects" | "owner" | "history";

export interface PartDetailScreenProps {
  activeTab: PartDetailScreenTab;
  attachmentsContent: ReactNode;
  bomContent: ReactNode;
  historyContent: ReactNode;
  ownerContent: ReactNode;
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
  { id: "attachments", label: "첨부 파일", icon: Paperclip, count: (part) => part.filesCount },
  { id: "owner", label: "담당", icon: User },
  { id: "suppliers", label: "공급사", icon: Building2, count: (part) => part.suppliersCount },
  { id: "projects", label: "프로젝트", icon: FolderKanban, count: (part) => part.projectsCount },
  { id: "history", label: "이력", icon: Clock },
];

export function PartDetailScreen({
  activeTab,
  attachmentsContent,
  bomContent,
  historyContent,
  ownerContent,
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
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
        부품 정보를 불러오는 중입니다.
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
          {detailTabs.map((tab) => {
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
      {activeTab === "owner" ? ownerContent : null}
      {activeTab === "history" ? historyContent : null}
    </div>
  );
}
