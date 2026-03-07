import type {
  PartsTemplateMappingBoardColumnId,
  PartsTemplateMappingBoardColumnMapping,
  PartsTemplateMappingBoardRelationMapping,
} from "./types";

export function removeExistingMapping(
  sourceColumn: string,
  fromColumnId: PartsTemplateMappingBoardColumnId,
  columnMappings: PartsTemplateMappingBoardColumnMapping[],
  relationMappings: PartsTemplateMappingBoardRelationMapping[],
  onRemoveColumnMapping: (mappingId: string) => void | Promise<void>,
  onRemoveExtendedMapping: (mappingId: string) => void,
  onRemoveRelationCardMapping: (sourceColumn: string) => void,
) {
  if (fromColumnId === "unmapped") {
    return;
  }

  if (fromColumnId === "Part") {
    const columnMapping = columnMappings.find((mapping) => mapping.sourceColumn === sourceColumn);
    if (!columnMapping) {
      return;
    }

    if (columnMapping.isExtended) {
      onRemoveExtendedMapping(columnMapping.id);
    } else {
      void onRemoveColumnMapping(columnMapping.id);
    }

    return;
  }

  const relationMapping = relationMappings.find(
    (mapping) =>
      !mapping.dismissed &&
      (Object.keys(mapping.relColumns).includes(sourceColumn) ||
        Object.values(mapping.nodeColumns).includes(sourceColumn)),
  );

  if (relationMapping) {
    onRemoveRelationCardMapping(sourceColumn);
  }
}
