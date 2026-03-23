import {
  createPropertyDefinition as createPropertyDefinitionApi,
  deletePropertyDefinition as deletePropertyDefinitionApi,
  listMeta as listMetaApi,
  reorder as reorderApi,
  updatePropertyDefinition as updatePropertyDefinitionApi,
} from "@/api/generated/orval/properties/properties";
import type {
  CreatePropertyDefinitionRequestDto,
  CreatePropertyDefinitionResponseDto,
  ListPropertyMetaQueryDto,
  PropertyMetaListResponseDto,
  PropertyMetaResponseDto,
  ReorderPropertyRequestDto,
  UpdatePropertyDefinitionRequestDto,
  UpdatePropertyDefinitionResponseDto,
} from "@/features/properties/api/properties.types";
import type { PropertyMetaModel, PropertyOptionModel } from "@/features/properties/types/properties-model";

function toPropertyOptionModel(option: NonNullable<PropertyMetaResponseDto["options"]>[number]): PropertyOptionModel {
  return {
    value: option.value ?? "",
    label: option.label ?? option.value ?? "",
    displayOrder: option.display_order ?? 0,
    active: option.active ?? true,
  };
}

function toPropertyMetaModel(property: PropertyMetaResponseDto): PropertyMetaModel {
  return {
    activeConfigurable: property.active_configurable ?? true,
    definitionId: property.definition_id ?? null,
    ownerType: property.owner_type ?? "",
    propertyKey: property.property_key ?? "",
    system: property.system ?? false,
    partSystemPropertyKind: property.part_system_property_kind ?? null,
    columnName: property.column_name ?? null,
    displayName: property.display_name ?? property.property_key ?? "",
    description: property.description ?? null,
    valueType: property.value_type ?? "STRING",
    optionMode: property.option_mode ?? null,
    options: (property.options ?? []).map(toPropertyOptionModel),
    displayOrder: property.display_order ?? 0,
    required: property.required ?? false,
    active: property.active ?? true,
  };
}

export async function fetchPropertyMeta(query: ListPropertyMetaQueryDto) {
  const response = await listMetaApi(query);
  return ((response as PropertyMetaListResponseDto).items ?? [])
    .map(toPropertyMetaModel)
    .filter((property) => property.propertyKey.trim().length > 0);
}

export async function createPropertyDefinition(request: CreatePropertyDefinitionRequestDto) {
  const response = await createPropertyDefinitionApi(request);
  return toPropertyMetaModel(response as CreatePropertyDefinitionResponseDto);
}

export async function updatePropertyDefinition(
  ownerType: string,
  propertyKey: string,
  request: UpdatePropertyDefinitionRequestDto,
) {
  const response = await updatePropertyDefinitionApi(ownerType, propertyKey, request);
  return toPropertyMetaModel(response as UpdatePropertyDefinitionResponseDto);
}

export async function deletePropertyDefinition(ownerType: string, propertyKey: string) {
  await deletePropertyDefinitionApi(ownerType, propertyKey);
}

export async function reorderProperties(request: ReorderPropertyRequestDto) {
  await reorderApi(request);
}
