import type { ColumnMappingModel, RelationMappingModel } from "@/features/part-template-mapping/types/part-template-mapping-model";

export function cloneRelationMappingModel(relation: RelationMappingModel): RelationMappingModel {
  return {
    ...relation,
    nodeColumns: { ...relation.nodeColumns },
    relColumns: { ...relation.relColumns },
    relColumnTypes: { ...relation.relColumnTypes },
  };
}

export function isRelationValid(
  relation: RelationMappingModel,
  columnMappings: ColumnMappingModel[],
  mappingHeaders: string[],
) {
  const isNodeColumnsValid = Object.values(relation.nodeColumns).every((sourceColumn) =>
    columnMappings.some((mapping) => mapping.sourceColumn === sourceColumn),
  );

  const isRelationColumnsValid = Object.keys(relation.relColumns).every((sourceColumn) =>
    mappingHeaders.includes(sourceColumn),
  );

  return isNodeColumnsValid && isRelationColumnsValid;
}
