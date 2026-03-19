import { mutationOptions, queryOptions } from "@tanstack/react-query";
import {
  createPropertyDefinition,
  fetchPropertyMeta,
  updatePropertyDefinition,
  upsertSystemPropertyOverride,
} from "@/features/properties/api/properties.api";
import type {
  CreatePropertyDefinitionRequestDto,
  UpdatePropertyDefinitionRequestDto,
  UpsertSystemPropertyOverrideRequestDto,
} from "@/features/properties/api/properties.types";

export const propertiesKeys = {
  all: ["properties"] as const,
  metaRoot: ["properties", "meta"] as const,
  metaScope: (ownerType: string) => ["properties", "meta", ownerType] as const,
  meta: (ownerType: string, includeInactive: boolean) =>
    ["properties", "meta", ownerType, { includeInactive }] as const,
};

export const propertiesQueries = {
  meta: (ownerType: string, includeInactive: boolean) =>
    queryOptions({
      queryKey: propertiesKeys.meta(ownerType, includeInactive),
      queryFn: () => fetchPropertyMeta({ owner_type: ownerType, include_inactive: includeInactive }),
      staleTime: 30_000,
    }),
};

export const propertiesMutations = {
  createDefinition: () =>
    mutationOptions({
      mutationKey: ["properties", "create-definition"],
      mutationFn: (request: CreatePropertyDefinitionRequestDto) => createPropertyDefinition(request),
    }),
  updateDefinition: () =>
    mutationOptions({
      mutationKey: ["properties", "update-definition"],
      mutationFn: ({
        propertyDefinitionId,
        request,
      }: {
        propertyDefinitionId: string;
        request: UpdatePropertyDefinitionRequestDto;
      }) => updatePropertyDefinition(propertyDefinitionId, request),
    }),
  upsertSystemOverride: () =>
    mutationOptions({
      mutationKey: ["properties", "upsert-system-override"],
      mutationFn: ({
        ownerType,
        propertyKey,
        request,
      }: {
        ownerType: string;
        propertyKey: string;
        request: UpsertSystemPropertyOverrideRequestDto;
      }) => upsertSystemPropertyOverride(ownerType, propertyKey, request),
    }),
};

