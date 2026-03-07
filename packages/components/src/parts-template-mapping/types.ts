export type PartsTemplateMappingBoardColumnId =
  | "Part"
  | "parent_part"
  | "Supplier"
  | "Drawing"
  | "Project"
  | "unmapped";

export interface PartsTemplateMappingBoardCard {
  id: string;
  sourceColumn: string;
  targetProperty: string | null;
  confidence: number;
  approved: boolean;
  isExtended: boolean;
  isRelation: boolean;
  relType?: string;
  relNodeProperty?: string;
  relProperty?: string;
  sampleData: string[];
}

export interface PartsTemplateMappingBoardColumn {
  id: PartsTemplateMappingBoardColumnId;
  title: string;
  color: string;
  cards: PartsTemplateMappingBoardCard[];
}

export interface PartsTemplateMappingBoardColumnMapping {
  id: string;
  sourceColumn: string;
  targetProperty: string;
  isExtended: boolean;
}

export interface PartsTemplateMappingBoardRelationMapping {
  id: string;
  relType: string;
  nodeColumns: Record<string, string>;
  relColumns: Record<string, string>;
  dismissed: boolean;
}

export interface PartsTemplateMappingBoardTargetPropertyOption {
  label: string;
  property: string;
}

export interface PartsTemplateMappingBoardRelationTargetInfo {
  targetMergeKeys: string[];
  targetProperties: string[];
}

export interface PartsTemplateMappingBoardProps {
  columns: PartsTemplateMappingBoardColumn[];
  mappingHeaders: string[];
  mappingSampleRows: Record<string, unknown>[];
  effectiveTargetOptions: PartsTemplateMappingBoardTargetPropertyOption[];
  columnMappings: PartsTemplateMappingBoardColumnMapping[];
  propertyLabelByName?: Record<string, string>;
  relationMappings: PartsTemplateMappingBoardRelationMapping[];
  relationPropertyByType: Record<string, string[]>;
  relationTargetInfoByType: Record<string, PartsTemplateMappingBoardRelationTargetInfo>;
  mergeKeysByLabel: Record<string, string[]>;
  issueCountByColumn?: Partial<Record<PartsTemplateMappingBoardColumnId, number>>;
  issueSummaryByColumn?: Partial<Record<PartsTemplateMappingBoardColumnId, string>>;
  onMoveCard: (
    sourceColumn: string,
    fromColumnId: PartsTemplateMappingBoardColumnId,
    toColumnId: PartsTemplateMappingBoardColumnId,
  ) => void;
  onSetPartMapping: (sourceColumn: string, targetProperty: string) => void;
  onSetRelationCardMapping: (
    relType: string,
    sourceColumn: string,
    mappingType: "node" | "rel",
    property: string,
  ) => void;
  onRemoveColumnMapping: (mappingId: string) => void | Promise<void>;
  onRemoveExtendedMapping: (mappingId: string) => void;
  onRemoveRelationCardMapping: (sourceColumn: string) => void;
}

export const COLUMN_TO_REL_TYPE: Record<string, string> = {
  parent_part: "CONSISTS_OF",
  Supplier: "SUPPLIED_BY",
  Drawing: "DEFINED_BY",
  Project: "HAS_ITEM",
};

export const EXTENDED_VALUE = "__extended__";
export const UNSELECTED_VALUE = "__unselected__";

export function formatSampleCellValue(value: unknown) {
  if (value == null) {
    return "";
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return JSON.stringify(value);
}

export function getPropertyDisplayName(
  propertyLabelByName: Record<string, string>,
  property: string,
) {
  return propertyLabelByName[property] || property;
}
