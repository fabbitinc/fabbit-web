import { useQuery } from "@tanstack/react-query";
import { partTemplateMappingQueries } from "@/features/part-template-mapping/api/part-template-mapping.queries";

export function useTemplateOntologySchemaQuery(enabled = true) {
  return useQuery({
    ...partTemplateMappingQueries.ontologySchema(),
    enabled,
  });
}
