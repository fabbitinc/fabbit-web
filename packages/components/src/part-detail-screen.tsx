import type { ComponentType, ReactNode } from "react";
import { ArrowLeft, Building2, Clock, FolderKanban, Network, Package, Paperclip, User } from "lucide-react";
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
  onBackClick: () => void;
  onRetry?: () => void;
  onTabChange: (tab: PartDetailScreenTab) => void;
}

const detailTabs: { id: PartDetailScreenTab; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: "properties", label: "속성", icon: Package },
  { id: "bom", label: "BOM", icon: Network },
  { id: "attachments", label: "첨부 파일", icon: Paperclip },
  { id: "suppliers", label: "공급사", icon: Building2 },
  { id: "projects", label: "프로젝트", icon: FolderKanban },
  { id: "owner", label: "담당", icon: User },
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
    <div className="space-y-6">
      <Button type="button" variant="ghost" onClick={onBackClick}>
        <ArrowLeft className="size-4" />
        부품 목록
      </Button>

      <PartHeaderCard part={part} />

      <section className="app-panel rounded-[32px] p-2">
        <div className="flex flex-wrap gap-2">
          {detailTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                className={
                  `inline-flex cursor-pointer items-center gap-2 rounded-[20px] px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  }`
                }
                onClick={() => onTabChange(tab.id)}
              >
                <Icon className="size-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

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
