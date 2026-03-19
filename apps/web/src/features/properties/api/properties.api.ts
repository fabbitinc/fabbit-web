import {
  createPropertyDefinition as createPropertyDefinitionApiV1PropertiesDefinitionsPost,
  listMeta as listMetaApiV1PropertiesMetaGet,
  updatePropertyDefinition as updatePropertyDefinitionApiV1PropertiesDefinitionsPropertyDefinitionIdPatch,
  upsertSystemPropertyOverride as upsertSystemPropertyOverrideApiV1PropertiesSystemOverridesOwnerTypePropertyKeyPatch,
} from "@/api/generated/orval/properties/properties";
import type {
  CreatePropertyDefinitionRequestDto,
  CreatePropertyDefinitionResponseDto,
  ListPropertyMetaQueryDto,
  PropertyMetaListResponseDto,
  PropertyMetaResponseDto,
  UpdatePropertyDefinitionRequestDto,
  UpdatePropertyDefinitionResponseDto,
  UpsertSystemPropertyOverrideRequestDto,
  UpsertSystemPropertyOverrideResponseDto,
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
  const response = await listMetaApiV1PropertiesMetaGet(query);
  return ((response as PropertyMetaListResponseDto).items ?? [])
    .map(toPropertyMetaModel)
    .filter((property) => property.propertyKey.trim().length > 0);
}

export async function createPropertyDefinition(request: CreatePropertyDefinitionRequestDto) {
  const response = await createPropertyDefinitionApiV1PropertiesDefinitionsPost(request);
  return toPropertyMetaModel(response as CreatePropertyDefinitionResponseDto);
}

export async function updatePropertyDefinition(
  propertyDefinitionId: string,
  request: UpdatePropertyDefinitionRequestDto,
) {
  const response = await updatePropertyDefinitionApiV1PropertiesDefinitionsPropertyDefinitionIdPatch(
    propertyDefinitionId,
    request,
  );

  return toPropertyMetaModel(response as UpdatePropertyDefinitionResponseDto);
}

export async function upsertSystemPropertyOverride(
  ownerType: string,
  propertyKey: string,
  request: UpsertSystemPropertyOverrideRequestDto,
) {
  const response =
    await upsertSystemPropertyOverrideApiV1PropertiesSystemOverridesOwnerTypePropertyKeyPatch(
      ownerType,
      propertyKey,
      request,
    );

  return toPropertyMetaModel(response as UpsertSystemPropertyOverrideResponseDto);
}
