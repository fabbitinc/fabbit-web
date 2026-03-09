import { useTemplateMappingListQuery } from "@/features/part-template-mapping/hooks/use-template-mapping-list-query";

export function usePartsUploadTemplateMappingListQuery(enabled = true) {
  return useTemplateMappingListQuery(enabled);
}
