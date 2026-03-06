import { toast } from "sonner";
import { cloneRelationMappingModel } from "@/features/part-template-mapping/lib/template-mapping-helpers";
import { toExtendedPropertyName } from "@/features/part-template-mapping/lib/template-mapping-utils";
import { usePartTemplateMappingStore } from "@/features/part-template-mapping/stores/template-mapping-store";
import type { ColumnMappingModel, RelationMappingModel, RelationTargetInfoModel } from "@/features/part-template-mapping/types/part-template-mapping-model";

const AUTO_APPROVE_CONFIDENCE_THRESHOLD = 90;

function normalizeRelationMappings(
  relations: RelationMappingModel[],
  mappingHeaders: string[],
): RelationMappingModel[] {
  const seenSources = new Set<string>();
  const normalizedReversed: RelationMappingModel[] = [];

  for (let index = relations.length - 1; index >= 0; index -= 1) {
    const relation = relations[index];
    const trackSourceUniqueness = !relation.dismissed;

    const nodeEntries = Object.entries(relation.nodeColumns).filter(([, sourceColumn]) => {
      if (!sourceColumn || !mappingHeaders.includes(sourceColumn)) {
        return false;
      }

      if (trackSourceUniqueness) {
        if (seenSources.has(sourceColumn)) {
          return false;
        }

        seenSources.add(sourceColumn);
      }

      return true;
    });

    const relationEntries = Object.entries(relation.relColumns).filter(([sourceColumn]) => {
      if (!sourceColumn || !mappingHeaders.includes(sourceColumn)) {
        return false;
      }

      if (trackSourceUniqueness) {
        if (seenSources.has(sourceColumn)) {
          return false;
        }

        seenSources.add(sourceColumn);
      }

      return true;
    });

    const nextNodeColumns = Object.fromEntries(nodeEntries);
    const nextRelationColumns = Object.fromEntries(relationEntries);
    const referencedRelationProperties = new Set(
      Object.values(nextRelationColumns).filter((property) => Boolean(String(property || "").trim())),
    );
    const nextRelationColumnTypes = Object.fromEntries(
      Object.entries(relation.relColumnTypes).filter(([property]) => referencedRelationProperties.has(property)),
    );

    const shouldDismiss =
      Object.keys(nextNodeColumns).length === 0 && Object.keys(nextRelationColumns).length === 0;

    normalizedReversed.push({
      ...relation,
      nodeColumns: nextNodeColumns,
      relColumns: nextRelationColumns,
      relColumnTypes: nextRelationColumnTypes,
      dismissed: shouldDismiss || relation.dismissed,
      dismissedReason: shouldDismiss ? (relation.dismissedReason || "missing_source_column") : relation.dismissedReason,
    });
  }

  return normalizedReversed.reverse();
}

function buildManualColumnMapping(
  sourceColumn: string,
  targetProperty: string,
  isExtended: boolean,
): ColumnMappingModel {
  return {
    id: `cm-${Date.now()}`,
    sourceColumn,
    targetProperty,
    dataType: "string",
    confidence: isExtended ? 100 : 100,
    reason: isExtended ? "사용자 확장 속성 추가" : "사용자 수동 매핑",
    approved: isExtended || 100 >= AUTO_APPROVE_CONFIDENCE_THRESHOLD,
    isExtended,
  };
}

export function useTemplateMappingActions(
  relationTargetInfoByType: Record<string, RelationTargetInfoModel>,
) {
  const columnMappings = usePartTemplateMappingStore((state) => state.columnMappings);
  const relationMappings = usePartTemplateMappingStore((state) => state.relationMappings);
  const mappingHeaders = usePartTemplateMappingStore((state) => state.mappingHeaders);
  const setMappings = usePartTemplateMappingStore((state) => state.setMappings);
  const resetMappings = usePartTemplateMappingStore((state) => state.resetMappings);

  const applyValidatedState = (
    nextColumnMappings: ColumnMappingModel[],
    nextRelationMappings: RelationMappingModel[],
  ) => {
    const normalizedRelations = normalizeRelationMappings(nextRelationMappings, mappingHeaders);
    setMappings(nextColumnMappings, normalizedRelations);
  };

  const handleResetMappings = () => {
    resetMappings();
    toast.success("초기 매핑 상태로 되돌렸습니다.");
  };

  const handleRemoveColumnMapping = (mappingId: string) => {
    const removedMapping = columnMappings.find((mapping) => mapping.id === mappingId);
    if (!removedMapping) {
      return;
    }

    const nextColumnMappings = columnMappings.filter((mapping) => mapping.id !== mappingId);
    const nextRelationMappings = relationMappings.map((relation) => {
      const usedInNodeColumns = Object.values(relation.nodeColumns).includes(removedMapping.sourceColumn);
      const usedInRelationColumns = Object.keys(relation.relColumns).includes(removedMapping.sourceColumn);

      if (!usedInNodeColumns && !usedInRelationColumns) {
        return relation;
      }

      return {
        ...relation,
        dismissed: true,
        approved: false,
        dismissedReason: usedInNodeColumns ? "missing_node_column" : "missing_rel_column",
      };
    });

    applyValidatedState(nextColumnMappings, nextRelationMappings);
  };

  const handleCreateExtendedMapping = (sourceColumn: string, propertyName?: string) => {
    const nextPropertyName =
      propertyName && propertyName.startsWith("_ext_") ? propertyName : toExtendedPropertyName(sourceColumn);

    applyValidatedState(
      [
        ...columnMappings,
        {
          ...buildManualColumnMapping(sourceColumn, nextPropertyName, true),
          approved: true,
        },
      ],
      relationMappings,
    );
  };

  const handleCreateRelationMapping = (
    relType: string,
    nodeColumns: Record<string, string>,
    relColumns: Record<string, string>,
    relColumnTypes: Record<string, string>,
  ) => {
    const latestState = usePartTemplateMappingStore.getState();
    const targetInfo = relationTargetInfoByType[relType];
    const targetLabel = targetInfo?.targetLabel || "";

    if (!targetLabel) {
      toast.error("선택한 관계 타입 정의를 찾을 수 없습니다.");
      return;
    }

    const existingIndex = latestState.relationMappings.findIndex(
      (relation) =>
        relation.relType === relType &&
        relation.targetLabel === targetLabel &&
        JSON.stringify(relation.nodeColumns) === JSON.stringify(nodeColumns),
    );

    const existingRelation = existingIndex >= 0 ? latestState.relationMappings[existingIndex] : null;
    const hasRelationColumns = Object.keys(relColumns).length > 0;

    if (!hasRelationColumns) {
      if (existingRelation) {
        if (existingRelation.dismissed) {
          const nextRelations = latestState.relationMappings.map((relation, index) =>
            index === existingIndex
              ? {
                  ...relation,
                  dismissed: false,
                  dismissedReason: null,
                  approved: false,
                }
              : relation,
          );
          applyValidatedState(latestState.columnMappings, nextRelations);
          return;
        }

        toast.info("이미 동일한 관계가 존재합니다.");
        return;
      }

      applyValidatedState(latestState.columnMappings, [
        ...latestState.relationMappings,
        {
          id: `rm-${Date.now()}`,
          relType,
          targetLabel,
          nodeColumns,
          relColumns: {},
          relColumnTypes: {},
          confidence: 100,
          reason: "사용자 수동 추가",
          approved: false,
          dismissed: false,
          dismissedReason: null,
        },
      ]);
      return;
    }

    const nextRelations =
      existingIndex >= 0
        ? latestState.relationMappings.map((relation, index) =>
            index === existingIndex
              ? {
                  ...relation,
                  dismissed: false,
                  dismissedReason: null,
                  approved: false,
                  relColumns: {
                    ...relation.relColumns,
                    ...relColumns,
                  },
                  relColumnTypes: {
                    ...relation.relColumnTypes,
                    ...relColumnTypes,
                  },
                }
              : relation,
          )
        : [
            ...latestState.relationMappings,
            {
              id: `rm-${Date.now()}`,
              relType,
              targetLabel,
              nodeColumns,
              relColumns,
              relColumnTypes,
              confidence: 100,
              reason: "사용자 수동 추가",
              approved: false,
              dismissed: false,
              dismissedReason: null,
            },
          ];

    applyValidatedState(latestState.columnMappings, nextRelations);
  };

  const handleRemoveExtendedMapping = (mappingId: string) => {
    const state = usePartTemplateMappingStore.getState();
    applyValidatedState(
      state.columnMappings.filter((mapping) => mapping.id !== mappingId),
      state.relationMappings,
    );
  };

  const handleRemoveRelationMapping = (mappingId: string) => {
    const state = usePartTemplateMappingStore.getState();
    applyValidatedState(
      state.columnMappings,
      state.relationMappings.filter((mapping) => mapping.id !== mappingId),
    );
  };

  const handleRemoveRelationCardMapping = (sourceColumn: string) => {
    const state = usePartTemplateMappingStore.getState();
    let changed = false;

    const nextRelations = state.relationMappings.map((relation) => {
      if (relation.dismissed) {
        return relation;
      }

      const hasNode = Object.values(relation.nodeColumns).includes(sourceColumn);
      const hasRelationProperty = Object.keys(relation.relColumns).includes(sourceColumn);
      if (!hasNode && !hasRelationProperty) {
        return relation;
      }

      changed = true;

      const nextNodeColumns = Object.fromEntries(
        Object.entries(relation.nodeColumns).filter(([, value]) => value !== sourceColumn),
      );

      const nextRelationColumns = { ...relation.relColumns };
      const removedRelationProperty = nextRelationColumns[sourceColumn];
      delete nextRelationColumns[sourceColumn];

      const nextRelationColumnTypes = { ...relation.relColumnTypes };
      if (
        removedRelationProperty &&
        !Object.values(nextRelationColumns).includes(removedRelationProperty)
      ) {
        delete nextRelationColumnTypes[removedRelationProperty];
      }

      const shouldDismiss =
        Object.keys(nextNodeColumns).length === 0 && Object.keys(nextRelationColumns).length === 0;

      return {
        ...relation,
        nodeColumns: nextNodeColumns,
        relColumns: nextRelationColumns,
        relColumnTypes: nextRelationColumnTypes,
        approved: false,
        dismissed: shouldDismiss,
        dismissedReason: shouldDismiss ? "missing_source_column" : null,
      };
    });

    if (!changed) {
      return;
    }

    applyValidatedState(state.columnMappings, nextRelations);
  };

  const handleApproveAll = () => {
    applyValidatedState(
      columnMappings.map((mapping) => ({ ...mapping, approved: true })),
      relationMappings.map((relation) =>
        relation.dismissed ? relation : { ...relation, approved: true },
      ),
    );
  };

  const handleChangeColumnMappingTarget = (sourceColumn: string, newTargetProperty: string) => {
    const duplicate = columnMappings.find(
      (mapping) =>
        !mapping.isExtended &&
        mapping.targetProperty === newTargetProperty &&
        mapping.sourceColumn !== sourceColumn,
    );

    if (duplicate) {
      toast.error(`"${newTargetProperty}" 속성은 이미 "${duplicate.sourceColumn}" 컬럼에 매핑되어 있습니다.`);
      return;
    }

    const nextColumnMappings = columnMappings.map((mapping) =>
      mapping.sourceColumn === sourceColumn && !mapping.isExtended
        ? {
            ...mapping,
            targetProperty: newTargetProperty,
            confidence: 100,
            reason: "사용자 수동 변경",
            approved: false,
          }
        : mapping,
    );

    applyValidatedState(nextColumnMappings, relationMappings);
  };

  const handleSetPartMapping = (sourceColumn: string, targetProperty: string) => {
    const state = usePartTemplateMappingStore.getState();
    const isExtended = targetProperty === "__extended__";
    const isEmpty = !targetProperty;
    const existingMapping = state.columnMappings.find((mapping) => mapping.sourceColumn === sourceColumn);

    if (isEmpty) {
      const nextColumnMappings = existingMapping
        ? state.columnMappings.map((mapping) =>
            mapping.sourceColumn === sourceColumn
              ? {
                  ...mapping,
                  targetProperty: "",
                  isExtended: false,
                  confidence: 0,
                  reason: "",
                  approved: false,
                }
              : mapping,
          )
        : [
            ...state.columnMappings,
            {
              id: `cm-${Date.now()}`,
              sourceColumn,
              targetProperty: "",
              dataType: "string",
              confidence: 0,
              reason: "",
              approved: false,
              isExtended: false,
            },
          ];

      applyValidatedState(nextColumnMappings, state.relationMappings);
      return;
    }

    if (isExtended) {
      const extendedPropertyName = toExtendedPropertyName(sourceColumn);
      const nextColumnMappings = existingMapping
        ? state.columnMappings.map((mapping) =>
            mapping.sourceColumn === sourceColumn
              ? {
                  ...mapping,
                  targetProperty: extendedPropertyName,
                  isExtended: true,
                  confidence: 100,
                  reason: "사용자 확장 속성 변경",
                  approved: true,
                }
              : mapping,
          )
        : [
            ...state.columnMappings,
            {
              ...buildManualColumnMapping(sourceColumn, extendedPropertyName, true),
              approved: true,
            },
          ];

      applyValidatedState(nextColumnMappings, state.relationMappings);
      return;
    }

    const duplicate = state.columnMappings.find(
      (mapping) =>
        !mapping.isExtended &&
        mapping.targetProperty === targetProperty &&
        mapping.sourceColumn !== sourceColumn,
    );

    if (duplicate) {
      toast.error(`"${targetProperty}" 속성은 이미 "${duplicate.sourceColumn}" 컬럼에 매핑되어 있습니다.`);
      return;
    }

    const nextColumnMappings = existingMapping
      ? state.columnMappings.map((mapping) =>
          mapping.sourceColumn === sourceColumn
            ? {
                ...mapping,
                targetProperty,
                isExtended: false,
                confidence: 100,
                reason: "사용자 수동 변경",
                approved: false,
              }
            : mapping,
        )
      : [...state.columnMappings, buildManualColumnMapping(sourceColumn, targetProperty, false)];

    applyValidatedState(nextColumnMappings, state.relationMappings);
  };

  const handleSetRelationCardMapping = (
    relType: string,
    sourceColumn: string,
    mappingType: "node" | "rel",
    property: string,
  ) => {
    const state = usePartTemplateMappingStore.getState();
    const relationIndex = state.relationMappings.findIndex(
      (relation) =>
        !relation.dismissed &&
        relation.relType === relType &&
        (Object.values(relation.nodeColumns).includes(sourceColumn) ||
          Object.keys(relation.relColumns).includes(sourceColumn)),
    );

    if (relationIndex < 0) {
      return;
    }

    const targetRelation = state.relationMappings[relationIndex];
    const nextNodeColumns = Object.fromEntries(
      Object.entries(targetRelation.nodeColumns).filter(([, value]) => value !== sourceColumn),
    );
    const nextRelationColumns = { ...targetRelation.relColumns };
    const removedRelationProperty = nextRelationColumns[sourceColumn];
    delete nextRelationColumns[sourceColumn];

    const nextRelationColumnTypes = { ...targetRelation.relColumnTypes };
    if (removedRelationProperty && !Object.values(nextRelationColumns).includes(removedRelationProperty)) {
      delete nextRelationColumnTypes[removedRelationProperty];
    }

    if (mappingType === "node") {
      const existingSource = nextNodeColumns[property];
      if (existingSource && existingSource !== sourceColumn) {
        toast.error(`"${property}" 매칭키는 이미 "${existingSource}" 컬럼에 할당되어 있습니다.`);
        return;
      }

      nextNodeColumns[property] = sourceColumn;
    } else {
      nextRelationColumns[sourceColumn] = property;
      if (!nextRelationColumnTypes[property]) {
        nextRelationColumnTypes[property] = "string";
      }
    }

    const nextRelations = state.relationMappings.map((relation, index) =>
      index === relationIndex
        ? {
            ...relation,
            nodeColumns: nextNodeColumns,
            relColumns: nextRelationColumns,
            relColumnTypes: nextRelationColumnTypes,
            approved: false,
            dismissed: false,
            dismissedReason: null,
          }
        : cloneRelationMappingModel(relation),
    );

    applyValidatedState(state.columnMappings, nextRelations);
  };

  return {
    handleResetMappings,
    handleRemoveColumnMapping,
    handleCreateExtendedMapping,
    handleCreateRelationMapping,
    handleRemoveExtendedMapping,
    handleRemoveRelationMapping,
    handleRemoveRelationCardMapping,
    handleApproveAll,
    handleChangeColumnMappingTarget,
    handleSetPartMapping,
    handleSetRelationCardMapping,
  };
}
