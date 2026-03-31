import {
  mappingConfirm as confirmMappingApiV1MappingsConfirmPost,
  mappingList as listMappingsApiV1MappingsGet,
  mappingPreview as previewMappingApiV1MappingsPreviewPost,
  mappingUpdate as updateMappingApiV1MappingsMappingIdPut,
  mappingValidate as validateMappingApiV1MappingsValidatePost,
} from "@/api/generated/orval/mappings/mappings";
import { ontologyGetOntologySchema as getOntologySchemaApiV1OntologySchemaGet } from "@/api/generated/orval/ontology/ontology";
import type {
  MappingConfirmRequestDto,
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
  const response = await getOntologySchemaApiV1OntologySchemaGet();
  return toOntologySchemaModel(response as OntologySchemaResponseDto);
}

export async function previewTemplateMapping(request: MappingPreviewRequestDto): Promise<MappingPreviewModel> {
  const response = await previewMappingApiV1MappingsPreviewPost(request, {
    timeout: 120_000,
  });

  return toMappingPreviewModel(response as MappingPreviewResponseDto);
}

export async function listTemplateMappings(): Promise<MappingRecordModel[]> {
  const response = await listMappingsApiV1MappingsGet();
  return ((response.items ?? []) as MappingResponseDto[]).map(toMappingRecordModel);
}

export async function confirmTemplateMapping(request: MappingConfirmRequestDto): Promise<MappingRecordModel> {
  const response = await confirmMappingApiV1MappingsConfirmPost(request);
  return toMappingRecordModel(response as MappingResponseDto);
}

export async function updateTemplateMapping(
  mappingId: string,
  request: MappingUpdateRequestDto,
): Promise<MappingRecordModel> {
  const response = await updateMappingApiV1MappingsMappingIdPut(mappingId, request);
  return toMappingRecordModel(response as MappingResponseDto);
}

export async function validateTemplateMapping(
  request: MappingValidateRequestDto,
): Promise<MappingValidationModel> {
  const response = await validateMappingApiV1MappingsValidatePost(request);
  const validation = response as MappingValidateResponseDto;
  const sourceColumns = collectSourceColumnsFromMappingRequest(request.mapping);

  return {
    normalizedMapping: toMappingDefinitionModel(validation.normalized_mapping, sourceColumns),
    errors: (validation.errors ?? []).map((issue) => ({
      code: issue.code,
      severity: issue.severity,
      message: issue.message,
      path: issue.path ?? undefined,
      dismissedReason: issue.dismissed_reason ?? null,
    })),
    warnings: (validation.warnings ?? []).map((issue) => ({
      code: issue.code,
      severity: issue.severity,
      message: issue.message,
      path: issue.path ?? undefined,
      dismissedReason: issue.dismissed_reason ?? null,
    })),
    impactSummary: validation.impact_summary
      ? {
          disabledColumnCount: validation.impact_summary.disabled_column_count,
        }
      : null,
  };
}

function collectSourceColumnsFromMappingRequest(
  mapping: MappingValidateRequestDto["mapping"],
): string[] {
  const sourceColumns = new Set<string>();

  for (const nodeMapping of mapping.nodes ?? []) {
    for (const sourceColumn of Object.values(nodeMapping.property_columns ?? {})) {
      if (sourceColumn) {
        sourceColumns.add(sourceColumn);
      }
    }

    for (const extendedProperty of nodeMapping.extended_properties ?? []) {
      if (extendedProperty.source_column) {
        sourceColumns.add(extendedProperty.source_column);
      }
    }
  }

  for (const relationMapping of mapping.relations ?? []) {
    for (const sourceColumn of Object.values(relationMapping.property_columns ?? {})) {
      if (sourceColumn) {
        sourceColumns.add(sourceColumn);
      }
    }

    for (const extendedProperty of relationMapping.extended_properties ?? []) {
      if (extendedProperty.source_column) {
        sourceColumns.add(extendedProperty.source_column);
      }
    }

    for (const sourceColumn of Object.keys(relationMapping.property_columns ?? {})) {
      if (sourceColumn) {
        sourceColumns.add(sourceColumn);
      }
    }
  }

  return Array.from(sourceColumns);
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
    id: response.id ?? "",
    fileId: response.file_id ?? "",
    name: response.name ?? "",
    sheetName: response.sheet_name ?? null,
    originalHeaders: response.original_headers ?? [],
    mappedHeaders: response.mapped_headers ?? [],
    mapping: toMappingDefinitionModel(response.mapping, response.original_headers ?? []),
    scope: "organization",
    isActive: response.active ?? false,
    usageCount: response.usage_count ?? 0,
    version: response.version ?? 1,
    createdAt: response.created_at ?? "",
  };
}

function toMappingDefinitionModel(
  mapping: MappingPreviewResponseDto["mapping"] | MappingResponseDto["mapping"] | MappingValidateResponseDto["normalized_mapping"],
  headers: string[] = [],
): MappingDefinitionModel {
  const safeMapping = mapping ?? {};
  const relationMappings = (safeMapping.relations ?? []).map((relationMapping) => {
    return {
      relType: relationMapping.rel_type,
      targetLabel: relationMapping.to_node_id ?? "",
      nodeColumns: {},
      relColumns: headers.length
        ? normalizeRelationColumns(relationMapping.property_columns ?? {}, headers)
        : (relationMapping.property_columns ?? {}),
      relColumnTypes: relationMapping.property_column_types ?? {},
      confidence: relationMapping.confidence ?? 0,
      reason: relationMapping.reason ?? "",
    };
  });

  return {
    propertyMappings: (safeMapping.nodes ?? []).flatMap((nodeMapping) => {
      const directProperties = Object.entries(nodeMapping.property_columns ?? {}).map(([targetProperty, sourceColumn]) => ({
        sourceColumn,
        targetProperty,
        dataType: "string" as const,
        confidence: nodeMapping.confidence ?? 0,
        reason: nodeMapping.reason ?? "",
        isExtended: false,
      }));

      const extendedProperties = (nodeMapping.extended_properties ?? []).map((propertyMapping) => ({
        sourceColumn: propertyMapping.source_column ?? "",
        targetProperty: propertyMapping.generated_key ?? "",
        dataType: propertyMapping.data_type ?? "string",
        confidence: nodeMapping.confidence ?? 0,
        reason: nodeMapping.reason ?? "",
        isExtended: true,
      }));

      return [...directProperties, ...extendedProperties];
    }),
    relationMappings,
  };
}

function toOntologySchemaModel(response: OntologySchemaResponseDto): OntologySchemaModel {
  return {
    name: response.name,
    description: response.description,
    nodeLabels: (response.node_labels ?? []).map((nodeLabel) => ({
      label: nodeLabel.label,
      description: nodeLabel.description,
      properties: (nodeLabel.properties ?? []).map(toOntologyPropertyModel),
      mergeKeys: nodeLabel.merge_keys,
    })),
    relationshipTypes: (response.relationship_types ?? []).map((relationshipType) => ({
      relType: relationshipType.rel_type,
      description: relationshipType.description,
      fromLabel: relationshipType.from_label,
      toLabel: relationshipType.to_label,
      properties: (relationshipType.properties ?? []).map(toOntologyPropertyModel),
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
