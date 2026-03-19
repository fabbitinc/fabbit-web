import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { propertiesKeys, propertiesMutations } from "@/features/properties/api/properties.queries";
import type { UpsertSystemPropertyOverrideRequestDto } from "@/features/properties/api/properties.types";
import type { PropertyMetaModel } from "@/features/properties/types/properties-model";
import { extractApiError } from "@/lib/api-error";

interface UseUpsertSystemPropertyOverrideActionOptions {
  onSuccess?: (property: PropertyMetaModel) => void;
}

export function useUpsertSystemPropertyOverrideAction(
  options?: UseUpsertSystemPropertyOverrideActionOptions,
) {
  const queryClient = useQueryClient();
  const upsertOverrideMutation = propertiesMutations.upsertSystemOverride();

  return useMutation({
    mutationKey: upsertOverrideMutation.mutationKey,
    mutationFn: ({
      ownerType,
      propertyKey,
      request,
    }: {
      ownerType: string;
      propertyKey: string;
      request: UpsertSystemPropertyOverrideRequestDto;
    }, context) => {
      const mutationFn = upsertOverrideMutation.mutationFn;

      if (!mutationFn) {
        throw new Error("시스템 속성 override 수정 mutationFn이 정의되지 않았습니다.");
      }

      return mutationFn({ ownerType, propertyKey, request }, context);
    },
    onSuccess: async (property) => {
      toast.success("시스템 속성 설정을 저장했습니다.");
      await queryClient.invalidateQueries({ queryKey: propertiesKeys.metaScope(property.ownerType) });
      options?.onSuccess?.(property);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "시스템 속성 설정 저장에 실패했습니다."));
    },
  });
}
