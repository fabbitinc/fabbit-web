import { mutationOptions, queryOptions } from "@tanstack/react-query";
import {
  confirmTemplateMapping,
  fetchTemplateOntologySchema,
  listTemplateMappings,
  previewTemplateMapping,
  updateTemplateMapping,
  validateTemplateMapping,
} from "@/features/part-template-mapping/api/part-template-mapping.api";
import type {
  MappingConfirmRequestDto,
  MappingPreviewRequestDto,
  MappingUpdateRequestDto,
  MappingValidateRequestDto,
} from "@/features/part-template-mapping/api/part-template-mapping.types";

export const partTemplateMappingKeys = {
  all: ["part-template-mapping"] as const,
  ontologySchema: () => ["part-template-mapping", "ontology-schema"] as const,
  mappingList: () => ["part-template-mapping", "mapping-list"] as const,
  mappingRecord: (mappingId: string) => ["part-template-mapping", "mapping-record", mappingId] as const,
};

export const partTemplateMappingQueries = {
  ontologySchema: () =>
    queryOptions({
      queryKey: partTemplateMappingKeys.ontologySchema(),
      queryFn: fetchTemplateOntologySchema,
      staleTime: 5 * 60_000,
    }),
  mappingList: () =>
    queryOptions({
      queryKey: partTemplateMappingKeys.mappingList(),
      queryFn: listTemplateMappings,
      staleTime: 60_000,
    }),
};

export const partTemplateMappingMutations = {
  preview: () =>
    mutationOptions({
      mutationKey: ["part-template-mapping", "preview"],
      mutationFn: (request: MappingPreviewRequestDto) => previewTemplateMapping(request),
    }),
  confirm: () =>
    mutationOptions({
      mutationKey: ["part-template-mapping", "confirm"],
      mutationFn: (request: MappingConfirmRequestDto) => confirmTemplateMapping(request),
    }),
  update: (mappingId: string) =>
    mutationOptions({
      mutationKey: ["part-template-mapping", "update", mappingId],
      mutationFn: (request: MappingUpdateRequestDto) => updateTemplateMapping(mappingId, request),
    }),
  validate: () =>
    mutationOptions({
      mutationKey: ["part-template-mapping", "validate"],
      mutationFn: (request: MappingValidateRequestDto) => validateTemplateMapping(request),
    }),
};
