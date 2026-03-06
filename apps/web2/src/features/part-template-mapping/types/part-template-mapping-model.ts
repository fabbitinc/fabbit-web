export type FileCategory = "bom" | "drawing";

export type MappingSampleRowModel = Record<string, unknown>;

export interface UploadedTemplateFileModel {
  id: string;
  name: string;
  size: number;
  type: string;
  category: FileCategory;
  status: "pending" | "uploading" | "completed" | "failed";
  progress: number;
  uploadId?: string;
  error?: string;
}

export interface ColumnMappingModel {
  id: string;
  sourceColumn: string;
  targetProperty: string;
  dataType: string;
  confidence: number;
  reason: string;
  approved: boolean;
  isExtended: boolean;
}

export interface RelationMappingModel {
  id: string;
  relType: string;
  targetLabel: string;
  nodeColumns: Record<string, string>;
  relColumns: Record<string, string>;
  relColumnTypes: Record<string, string>;
  confidence: number;
  reason: string;
  approved: boolean;
  dismissed: boolean;
  dismissedReason?: string | null;
}

export interface TargetPropertyOptionModel {
  label: string;
  property: string;
  description: string;
  required: boolean;
  dataType: string;
  isMergeKey: boolean;
}

export interface RelationTargetInfoModel {
  targetLabel: string;
  targetMergeKeys: string[];
  targetColumnOptions: string[];
  targetProperties: string[];
}

export interface MappingPropertyModel {
  sourceColumn: string;
  targetProperty: string;
  dataType: string;
  confidence: number;
  reason: string;
  isExtended: boolean;
}

export interface MappingRelationModel {
  relType: string;
  targetLabel: string;
  nodeColumns: Record<string, string>;
  relColumns: Record<string, string>;
  relColumnTypes: Record<string, string>;
  confidence: number;
  reason: string;
}

export interface MappingDefinitionModel {
  propertyMappings: MappingPropertyModel[];
  relationMappings: MappingRelationModel[];
}

export interface SheetPreviewModel {
  sheetName: string;
  headers: string[];
  sampleRows: MappingSampleRowModel[];
  mapping: MappingDefinitionModel;
}

export interface SkippedSheetModel {
  sheetName: string;
  reason: string;
}

export interface MappingPreviewModel {
  headers: string[];
  sampleRows: MappingSampleRowModel[];
  mapping: MappingDefinitionModel;
  sheets: SheetPreviewModel[];
  skippedSheets: SkippedSheetModel[];
}

export interface MappingRecordModel {
  id: string;
  fileId: string;
  name: string;
  sheetName: string | null;
  originalHeaders: string[];
  mappedHeaders: string[];
  mapping: MappingDefinitionModel;
  scope: string;
  isActive: boolean;
  usageCount: number;
  version: number;
  createdAt: string;
}

export interface ValidationIssueModel {
  code: string;
  severity: "error" | "warning";
  message: string;
  path?: string;
  dismissedReason?: string | null;
}

export interface MappingImpactSummaryModel {
  disabledColumnCount?: number;
}

export interface MappingValidationModel {
  normalizedMapping: MappingDefinitionModel;
  errors: ValidationIssueModel[];
  warnings: ValidationIssueModel[];
  impactSummary: MappingImpactSummaryModel | null;
}

export interface OntologyPropertyModel {
  name: string;
  description: string;
  dataType: string;
  required: boolean;
  isMergeKey: boolean;
}

export interface OntologyNodeLabelModel {
  label: string;
  description: string;
  properties: OntologyPropertyModel[];
  mergeKeys: string[];
}

export interface OntologyRelationshipTypeModel {
  relType: string;
  description: string;
  fromLabel: string;
  toLabel: string;
  properties: OntologyPropertyModel[];
}

export interface OntologySchemaModel {
  name: string;
  description: string;
  nodeLabels: OntologyNodeLabelModel[];
  relationshipTypes: OntologyRelationshipTypeModel[];
}
