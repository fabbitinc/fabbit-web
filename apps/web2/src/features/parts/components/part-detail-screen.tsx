import { PartDetailScreen as PartDetailScreenView } from "@fabbit/components";
import { useNavigate } from "react-router-dom";
import { PartHistoryTab, PartPropertiesTab } from "@fabbit/components";
import { PartAttachmentsTab } from "@/features/parts/components/part-attachments-tab";
import { PartBomTab } from "@/features/parts/components/part-bom-tab";
import { PartOwnerTab } from "@/features/parts/components/part-owner-tab";
import { PartProjectsTab } from "@/features/parts/components/part-projects-tab";
import { PartSuppliersTab } from "@/features/parts/components/part-suppliers-tab";
import { useDeletePartDrawingAction } from "@/features/parts/hooks/use-delete-part-drawing-action";
import { usePartDetailQuery } from "@/features/parts/hooks/use-part-detail-query";
import { useUploadPartDrawingAction } from "@/features/parts/hooks/use-upload-part-drawing-action";
import type { PartDetailTab } from "@/features/parts/types/parts-model";

interface PartDetailScreenProps {
  activeTab: PartDetailTab;
  onTabChange: (tab: PartDetailTab) => void;
  partId: string;
}

export function PartDetailScreen({ activeTab, onTabChange, partId }: PartDetailScreenProps) {
  const navigate = useNavigate();
  const partQuery = usePartDetailQuery(partId);
  const uploadPartDrawingAction = useUploadPartDrawingAction(partId);
  const deletePartDrawingAction = useDeletePartDrawingAction(partId);

  return (
    <PartDetailScreenView
      activeTab={activeTab}
      attachmentsContent={<PartAttachmentsTab partId={partId} />}
      bomContent={<PartBomTab partId={partId} />}
      historyContent={<PartHistoryTab />}
      isError={partQuery.isError || !partQuery.data}
      isLoading={partQuery.isLoading}
      ownerContent={<PartOwnerTab partId={partId} />}
      part={partQuery.data}
      projectsContent={<PartProjectsTab partId={partId} />}
      propertiesContent={partQuery.data ? (
        <PartPropertiesTab
          isDeletingDrawing={deletePartDrawingAction.isPending}
          isUploadingDrawing={uploadPartDrawingAction.isPending}
          part={partQuery.data}
          onDeleteDrawing={() => deletePartDrawingAction.mutate()}
          onUploadDrawing={async (file) => {
            await uploadPartDrawingAction.mutateAsync(file);
          }}
        />
      ) : null}
      suppliersContent={<PartSuppliersTab partId={partId} />}
      onBackClick={() => navigate("/parts")}
      onRetry={() => {
        void partQuery.refetch();
      }}
      onTabChange={onTabChange}
    />
  );
}
