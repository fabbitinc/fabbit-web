import { type ComponentType, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, FolderKanban, Network, Package, Paperclip, Building2, User } from "lucide-react";
import { Button } from "@fabbit/ui";
import { uploadFiles } from "@/api/file.api";
import { PartAttachmentsTab } from "@/features/parts/components/part-attachments-tab";
import { PartBomTab } from "@/features/parts/components/part-bom-tab";
import { PartHeaderCard } from "@/features/parts/components/part-header-card";
import { PartHistoryTab } from "@/features/parts/components/part-history-tab";
import { PartOwnerTab } from "@/features/parts/components/part-owner-tab";
import { PartProjectsTab } from "@/features/parts/components/part-projects-tab";
import { PartPropertiesTab } from "@/features/parts/components/part-properties-tab";
import { PartSuppliersTab } from "@/features/parts/components/part-suppliers-tab";
import { useDeletePartDrawingAction } from "@/features/parts/hooks/use-delete-part-drawing-action";
import { usePartDetailQuery } from "@/features/parts/hooks/use-part-detail-query";
import { useRegisterPartDrawingAction } from "@/features/parts/hooks/use-register-part-drawing-action";
import type { PartDetailTab } from "@/features/parts/types/parts-model";

const detailTabs: { id: PartDetailTab; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: "properties", label: "속성", icon: Package },
  { id: "bom", label: "BOM", icon: Network },
  { id: "attachments", label: "첨부 파일", icon: Paperclip },
  { id: "suppliers", label: "공급사", icon: Building2 },
  { id: "projects", label: "프로젝트", icon: FolderKanban },
  { id: "owner", label: "담당", icon: User },
  { id: "history", label: "이력", icon: Clock },
];

interface PartDetailScreenProps {
  activeTab: PartDetailTab;
  onTabChange: (tab: PartDetailTab) => void;
  partId: string;
}

export function PartDetailScreen({ activeTab, onTabChange, partId }: PartDetailScreenProps) {
  const navigate = useNavigate();
  const partQuery = usePartDetailQuery(partId);
  const registerPartDrawingAction = useRegisterPartDrawingAction(partId);
  const deletePartDrawingAction = useDeletePartDrawingAction(partId);

  const part = partQuery.data;

  const activeTabContent = useMemo(() => {
    if (!part) {
      return null;
    }

    if (activeTab === "properties") {
      return (
        <PartPropertiesTab
          isDeletingDrawing={deletePartDrawingAction.isPending}
          isUploadingDrawing={registerPartDrawingAction.isPending}
          part={part}
          onDeleteDrawing={() => deletePartDrawingAction.mutate()}
          onUploadDrawing={async (file) => {
            const fileIds = await uploadFiles([file]);
            if (fileIds.length > 0) {
              await registerPartDrawingAction.mutateAsync({ file_id: fileIds[0] });
            }
          }}
        />
      );
    }

    if (activeTab === "bom") {
      return <PartBomTab partId={partId} />;
    }

    if (activeTab === "attachments") {
      return <PartAttachmentsTab partId={partId} />;
    }

    if (activeTab === "suppliers") {
      return <PartSuppliersTab partId={partId} />;
    }

    if (activeTab === "projects") {
      return <PartProjectsTab partId={partId} />;
    }

    if (activeTab === "owner") {
      return <PartOwnerTab partId={partId} />;
    }

    return <PartHistoryTab />;
  }, [
    activeTab,
    deletePartDrawingAction,
    part,
    partId,
    registerPartDrawingAction,
  ]);

  if (partQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
        부품 정보를 불러오는 중입니다.
      </div>
    );
  }

  if (partQuery.isError || !part) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted-foreground">부품을 불러오지 못했습니다.</p>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => navigate("/parts")}>
              목록으로
            </Button>
            <Button type="button" onClick={() => void partQuery.refetch()}>
              다시 시도
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button type="button" variant="ghost" onClick={() => navigate("/parts")}>
        <ArrowLeft className="size-4" />
        부품 목록
      </Button>

      <PartHeaderCard part={part} />

      <section className="app-panel rounded-[32px] p-2">
        <div className="flex flex-wrap gap-2">
          {detailTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                className={`inline-flex cursor-pointer items-center gap-2 rounded-[20px] px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                }`}
                onClick={() => onTabChange(tab.id)}
              >
                <Icon className="size-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {activeTabContent}
    </div>
  );
}
