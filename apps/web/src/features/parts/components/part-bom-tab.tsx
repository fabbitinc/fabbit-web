import { useMemo, useState } from "react";
import { PartBomTab as PartBomTabView } from "@fabbit/components";
import type { PartBomRevisionStatus, PartBomTabItem } from "@fabbit/components";
import { useNavigate } from "react-router-dom";
import { usePartBomQuery } from "@/features/parts/hooks/use-part-bom-query";
import { buildPartBomPath, buildPartDetailPath } from "@/features/parts/lib/part-route";
import { useDelayedVisibilityLogic } from "@/hooks/use-delayed-visibility-logic";
import { BomItemAddDialog } from "@/features/parts/components/bom-item-add-dialog";
import { BomItemBatchAddDialog } from "@/features/parts/components/bom-item-batch-add-dialog";
import { BomItemEditDialog } from "@/features/parts/components/bom-item-edit-dialog";
import { BomItemDeleteConfirm } from "@/features/parts/components/bom-item-delete-confirm";

interface PartBomTabProps {
  partId: string;
  revisionId: string;
  canEditDraft?: boolean;
}

export function PartBomTab({ partId, revisionId, canEditDraft = false }: PartBomTabProps) {
  const navigate = useNavigate();
  const bomQuery = usePartBomQuery(partId, revisionId);
  const isBomTabLoading = !bomQuery.isFetched && bomQuery.fetchStatus === "fetching";
  const showLoadingIndicator = useDelayedVisibilityLogic(isBomTabLoading);

  const childrenItems = useMemo<PartBomTabItem[]>(
    () => (bomQuery.data?.children ?? []).map((item) => ({
      ...item,
      revisionCode: item.revisionCode ?? null,
      revisionStatus: (item.revisionStatus as PartBomRevisionStatus) ?? null,
    })),
    [bomQuery.data?.children],
  );

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [batchAddDialogOpen, setBatchAddDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<PartBomTabItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<PartBomTabItem | null>(null);

  return (
    <>
      <PartBomTabView
        childrenItems={childrenItems}
        isLoading={isBomTabLoading}
        showLoadingIndicator={showLoadingIndicator}
        canEdit={canEditDraft}
        onPartClick={(clickedPartId, clickedRevisionId) => navigate(buildPartDetailPath(clickedPartId, clickedRevisionId))}
        onExploreBom={() => navigate(buildPartBomPath(partId, revisionId))}
        onAddItem={() => setAddDialogOpen(true)}
        onBatchAddItems={() => setBatchAddDialogOpen(true)}
        onEditItem={(item) => setEditItem(item)}
        onDeleteItem={(item) => setDeleteItem(item)}
      />

      {canEditDraft ? (
        <>
          <BomItemAddDialog
            open={addDialogOpen}
            onOpenChange={setAddDialogOpen}
            partId={partId}
            revisionId={revisionId}
          />
          <BomItemBatchAddDialog
            open={batchAddDialogOpen}
            onOpenChange={setBatchAddDialogOpen}
            partId={partId}
            revisionId={revisionId}
          />
          {editItem ? (
            <BomItemEditDialog
              open={!!editItem}
              onOpenChange={(open) => { if (!open) setEditItem(null); }}
              partId={partId}
              revisionId={revisionId}
              bomItem={editItem}
            />
          ) : null}
          {deleteItem ? (
            <BomItemDeleteConfirm
              open={!!deleteItem}
              onOpenChange={(open) => { if (!open) setDeleteItem(null); }}
              partId={partId}
              revisionId={revisionId}
              bomItem={deleteItem}
            />
          ) : null}
        </>
      ) : null}
    </>
  );
}
