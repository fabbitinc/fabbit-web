import { useMemo } from "react";
import {
  BomExploreScreen as BomExploreScreenView,
  type BomExploreDisplayNode,
} from "@fabbit/components";
import { useExportPartBomAction } from "@/features/parts/hooks/use-export-part-bom-action";
import { usePartBomTreeQuery } from "@/features/parts/hooks/use-part-bom-tree-query";
import type {
  PartBomDirection,
  PartBomExploreView,
  PartBomTreeNodeModel,
} from "@/features/parts/types/parts-model";

interface BomExploreScreenProps {
  partId: string;
  revisionId: string;
  direction: PartBomDirection;
  viewType: PartBomExploreView;
  searchQuery: string;
  singleLevelRootKey: string;
  onDirectionChange: (direction: PartBomDirection) => void;
  onViewTypeChange: (viewType: PartBomExploreView) => void;
  onSearchChange: (query: string) => void;
  onSingleLevelRootKeyChange: (nodeKey: string) => void;
}

export function BomExploreScreen({
  partId,
  revisionId,
  direction,
  viewType,
  searchQuery,
  singleLevelRootKey,
  onDirectionChange,
  onViewTypeChange,
  onSearchChange,
  onSingleLevelRootKeyChange,
}: BomExploreScreenProps) {
  const bomTreeQuery = usePartBomTreeQuery(partId, revisionId, direction);
  const exportBomAction = useExportPartBomAction(partId, revisionId);

  const tree = useMemo<BomExploreDisplayNode | null>(() => {
    if (!bomTreeQuery.data) {
      return null;
    }

    return toBomDisplayNode(bomTreeQuery.data.root);
  }, [bomTreeQuery.data]);

  return (
    <BomExploreScreenView
      direction={direction}
      isError={bomTreeQuery.isError}
      isExporting={exportBomAction.isPending}
      isLoading={bomTreeQuery.isLoading}
      partId={partId}
      searchQuery={searchQuery}
      singleLevelRootKey={singleLevelRootKey}
      totalCount={bomTreeQuery.data?.totalCount ?? 0}
      tree={tree}
      viewType={viewType}
      onDirectionChange={onDirectionChange}
      onExport={() => exportBomAction.mutate({ direction })}
      onNavigateBom={() => {}}
      onNavigateDetail={() => {}}
      onSearchChange={onSearchChange}
      onSingleLevelRootKeyChange={onSingleLevelRootKeyChange}
      onViewTypeChange={onViewTypeChange}
    />
  );
}

function toBomDisplayNode(node: PartBomTreeNodeModel, keyPrefix = "root"): BomExploreDisplayNode {
  return {
    nodeKey: keyPrefix,
    partId: node.id,
    partNumber: node.partNumber,
    name: node.name,
    quantity: node.quantity,
    material: node.material,
    revision: node.revision,
    lifecycleState: node.lifecycleState,
    unit: node.unit,
    category: node.category,
    children: node.children.map((child, index) => toBomDisplayNode(child, `${keyPrefix}.${index}`)),
  };
}
