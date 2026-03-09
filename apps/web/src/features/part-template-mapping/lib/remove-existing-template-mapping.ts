export function removeExistingTemplateMapping(
  sourceColumn: string,
  fromColumnId: string,
  columnMappings: Array<{ id: string; sourceColumn: string; isExtended: boolean }>,
  relationMappings: Array<{
    id: string;
    relColumns: Record<string, string>;
    nodeColumns: Record<string, string>;
    dismissed: boolean;
  }>,
  onRemoveColumnMapping: (mappingId: string) => void,
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
      return;
    }

    onRemoveColumnMapping(columnMapping.id);
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
