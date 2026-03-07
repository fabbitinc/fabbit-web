import { useCallback } from "react";
import {
  PartsTemplateMappingBoard,
  type PartsTemplateMappingBoardColumnId,
} from "@fabbit/components";
import { usePartTemplateMappingStore } from "@/features/part-template-mapping/stores/template-mapping-store";
import type { OntologySchemaModel } from "@/features/part-template-mapping/types/part-template-mapping-model";
import { COLUMN_TO_REL_TYPE } from "@/features/part-template-mapping/types/template-mapping-kanban";
import { useTemplateMappingKanban } from "@/features/part-template-mapping/hooks/use-template-mapping-kanban";
import { TEMPLATE_MAPPING_PROPERTY_LABELS } from "@/features/part-template-mapping/lib/template-mapping-property-labels";
import { removeExistingMapping } from "./kanban-utils";

interface KanbanBoardProps {
  ontologySchema?: OntologySchemaModel;
}

export function KanbanBoard({ ontologySchema }: KanbanBoardProps) {
  const kanban = useTemplateMappingKanban(ontologySchema);
  const mappingHeaders = usePartTemplateMappingStore((state) => state.mappingHeaders);
  const mappingSampleRows = usePartTemplateMappingStore((state) => state.mappingSampleRows);

  const handleMoveCard = useCallback(
    (
      sourceColumn: string,
      fromColumnId: PartsTemplateMappingBoardColumnId,
      toColumnId: PartsTemplateMappingBoardColumnId,
    ) => {
      if (toColumnId === "unmapped") {
        removeExistingMapping(
          sourceColumn,
          fromColumnId,
          kanban.columnMappings,
          kanban.relationMappings,
          kanban.handleRemoveColumnMapping,
          kanban.handleRemoveExtendedMapping,
          kanban.handleRemoveRelationCardMapping,
        );
        return;
      }

      if (fromColumnId !== "unmapped") {
        removeExistingMapping(
          sourceColumn,
          fromColumnId,
          kanban.columnMappings,
          kanban.relationMappings,
          kanban.handleRemoveColumnMapping,
          kanban.handleRemoveExtendedMapping,
          kanban.handleRemoveRelationCardMapping,
        );
      }

      if (toColumnId === "Part") {
        kanban.handleSetPartMapping(sourceColumn, "");
        return;
      }

      const relType = COLUMN_TO_REL_TYPE[toColumnId];
      if (!relType) {
        return;
      }

      const existingRelation = kanban.relationMappings.find(
        (mapping) => !mapping.dismissed && mapping.relType === relType,
      );

      kanban.handleCreateRelationMapping(
        relType,
        existingRelation ? { ...existingRelation.nodeColumns } : {},
        { [sourceColumn]: "" },
        existingRelation ? { ...existingRelation.relColumnTypes } : {},
      );
    },
    [kanban],
  );

  return (
    <PartsTemplateMappingBoard
      columns={kanban.columns}
      mappingHeaders={mappingHeaders}
      mappingSampleRows={mappingSampleRows}
      effectiveTargetOptions={kanban.effectiveTargetOptions}
      columnMappings={kanban.columnMappings}
      propertyLabelByName={TEMPLATE_MAPPING_PROPERTY_LABELS}
      relationMappings={kanban.relationMappings}
      relationPropertyByType={kanban.relationPropertyByType}
      relationTargetInfoByType={kanban.relationTargetInfoByType}
      mergeKeysByLabel={kanban.mergeKeysByLabel}
      issueCountByColumn={kanban.issueCountByColumn}
      issueSummaryByColumn={kanban.issueSummaryByColumn}
      onMoveCard={handleMoveCard}
      onSetPartMapping={kanban.handleSetPartMapping}
      onSetRelationCardMapping={kanban.handleSetRelationCardMapping}
      onRemoveColumnMapping={kanban.handleRemoveColumnMapping}
      onRemoveExtendedMapping={kanban.handleRemoveExtendedMapping}
      onRemoveRelationCardMapping={kanban.handleRemoveRelationCardMapping}
    />
  );
}
