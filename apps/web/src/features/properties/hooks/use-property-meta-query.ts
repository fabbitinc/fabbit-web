import { useQuery } from "@tanstack/react-query";
import { propertiesQueries } from "@/features/properties/api/properties.queries";

export function usePropertyMetaQuery(ownerType: string, includeInactive = false, enabled = true) {
  return useQuery({
    ...propertiesQueries.meta(ownerType, includeInactive),
    enabled,
  });
}

