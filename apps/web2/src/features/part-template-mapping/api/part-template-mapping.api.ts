import { apiClient } from "@/api/client";
import type {
  MappingConfirmRequestDto,
  MappingListResponseDto,
  MappingPreviewRequestDto,
  MappingPreviewResponseDto,
  MappingResponseDto,
  MappingUpdateRequestDto,
  MappingValidateRequestDto,
  MappingValidateResponseDto,
  OntologySchemaResponseDto,
} from "@/features/part-template-mapping/api/part-template-mapping.types";
import { normalizeRelationColumns } from "@/features/part-template-mapping/lib/template-mapping-utils";
import type {
  MappingDefinitionModel,
  MappingPreviewModel,
  MappingRecordModel,
  MappingValidationModel,
  OntologyPropertyModel,
  OntologySchemaModel,
} from "@/features/part-template-mapping/types/part-template-mapping-model";

export async function fetchTemplateOntologySchema(): Promise<OntologySchemaModel> {
  const response = await apiClient.get<OntologySchemaResponseDto>("/api/v1/ontology/schema");
  return toOntologySchemaModel(response.data);
}

export async function previewTemplateMapping(request: MappingPreviewRequestDto): Promise<MappingPreviewModel> {
  const response = await apiClient.post<MappingPreviewResponseDto>("/api/v1/mappings/preview", request, {
    timeout: 120_000,
  });

  return toMappingPreviewModel(response.data);
}

export async function listTemplateMappings(): Promise<MappingRecordModel[]> {
  const response = await apiClient.get<MappingListResponseDto>("/api/v1/mappings");
  return response.data.items.map(toMappingRecordModel);
}

export async function confirmTemplateMapping(request: MappingConfirmRequestDto): Promise<MappingRecordModel> {
  const response = await apiClient.post<MappingResponseDto>("/api/v1/mappings/confirm", request);
  return toMappingRecordModel(response.data);
}

export async function updateTemplateMapping(
  mappingId: string,
  request: MappingUpdateRequestDto,
): Promise<MappingRecordModel> {
  const response = await apiClient.put<MappingResponseDto>(`/api/v1/mappings/${mappingId}`, request);
  return toMappingRecordModel(response.data);
}

export async function validateTemplateMapping(
  request: MappingValidateRequestDto,
): Promise<MappingValidationModel> {
  const response = await apiClient.post<MappingValidateResponseDto>("/api/v1/mappings/validate", request);

  return {
    normalizedMapping: toMappingDefinitionModel(response.data.normalized_mapping),
    errors: (response.data.errors ?? []).map((issue) => ({
      code: issue.code,
      severity: issue.severity,
      message: issue.message,
      path: issue.path ?? undefined,
      dismissedReason: issue.dismissed_reason ?? null,
    })),
    warnings: (response.data.warnings ?? []).map((issue) => ({
      code: issue.code,
      severity: issue.severity,
      message: issue.message,
      path: issue.path ?? undefined,
      dismissedReason: issue.dismissed_reason ?? null,
    })),
    impactSummary: response.data.impact_summary
      ? {
          disabledColumnCount: response.data.impact_summary.disabled_column_count,
        }
      : null,
  };
}

function toMappingPreviewModel(response: MappingPreviewResponseDto): MappingPreviewModel {
  return {
    headers: response.headers,
    sampleRows: response.sample_rows,
    mapping: toMappingDefinitionModel(response.mapping, response.headers),
    sheets: (response.sheets ?? []).map((sheet) => ({
      sheetName: sheet.sheet_name,
      headers: sheet.headers,
      sampleRows: sheet.sample_rows,
      mapping: toMappingDefinitionModel(sheet.mapping, sheet.headers),
    })),
    skippedSheets: (response.skipped_sheets ?? []).map((sheet) => ({
      sheetName: sheet.sheet_name,
      reason: sheet.reason,
    })),
  };
}

function toMappingRecordModel(response: MappingResponseDto): MappingRecordModel {
  return {
    id: response.id,
    fileId: response.file_id,
    name: response.name,
    sheetName: response.sheet_name ?? null,
    originalHeaders: response.original_headers,
    mappedHeaders: response.mapped_headers,
    mapping: toMappingDefinitionModel(response.mapping, response.original_headers),
    scope: response.scope,
    isActive: response.is_active,
    usageCount: response.usage_count,
    version: response.version,
    createdAt: response.created_at,
  };
}

function toMappingDefinitionModel(
  mapping: MappingPreviewResponseDto["mapping"] | MappingResponseDto["mapping"] | MappingValidateResponseDto["normalized_mapping"],
  headers: string[] = [],
): MappingDefinitionModel {
  return {
    propertyMappings: mapping.property_mappings.map((propertyMapping) => ({
      sourceColumn: propertyMapping.source_column,
      targetProperty: propertyMapping.target_property,
      dataType: propertyMapping.data_type,
      confidence: propertyMapping.confidence,
      reason: propertyMapping.reason,
      isExtended: propertyMapping.is_extended,
    })),
    relationMappings: mapping.relation_mappings.map((relationMapping) => ({
      relType: relationMapping.rel_type,
      targetLabel: relationMapping.target_label,
      nodeColumns: relationMapping.node_columns ?? {},
      relColumns: headers.length
        ? normalizeRelationColumns(relationMapping.rel_columns, headers)
        : (relationMapping.rel_columns ?? {}),
      relColumnTypes: relationMapping.rel_column_types ?? {},
      confidence: relationMapping.confidence,
      reason: relationMapping.reason,
    })),
  };
}

function toOntologySchemaModel(response: OntologySchemaResponseDto): OntologySchemaModel {
  return {
    name: response.name,
    description: response.description,
    nodeLabels: response.node_labels.map((nodeLabel) => ({
      label: nodeLabel.label,
      description: nodeLabel.description,
      properties: nodeLabel.properties.map(toOntologyPropertyModel),
      mergeKeys: nodeLabel.merge_keys,
    })),
    relationshipTypes: response.relationship_types.map((relationshipType) => ({
      relType: relationshipType.rel_type,
      description: relationshipType.description,
      fromLabel: relationshipType.from_label,
      toLabel: relationshipType.to_label,
      properties: relationshipType.properties.map(toOntologyPropertyModel),
    })),
  };
}

function toOntologyPropertyModel(
  property: OntologySchemaResponseDto["node_labels"][number]["properties"][number],
): OntologyPropertyModel {
  return {
    name: property.name,
    description: property.description,
    dataType: property.data_type,
    required: property.required,
    isMergeKey: property.is_merge_key,
  };
}
