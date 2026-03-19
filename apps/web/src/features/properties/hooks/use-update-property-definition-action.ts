import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { propertiesKeys, propertiesMutations } from "@/features/properties/api/properties.queries";
import type { UpdatePropertyDefinitionRequestDto } from "@/features/properties/api/properties.types";
import type { PropertyMetaModel } from "@/features/properties/types/properties-model";
import { extractApiError } from "@/lib/api-error";

interface UseUpdatePropertyDefinitionActionOptions {
  onSuccess?: (property: PropertyMetaModel) => void;
}

export function useUpdatePropertyDefinitionAction(options?: UseUpdatePropertyDefinitionActionOptions) {
  const queryClient = useQueryClient();
  const updateDefinitionMutation = propertiesMutations.updateDefinition();

  return useMutation({
    mutationKey: updateDefinitionMutation.mutationKey,
    mutationFn: ({
      propertyDefinitionId,
      request,
    }: {
      propertyDefinitionId: string;
      request: UpdatePropertyDefinitionRequestDto;
    }, context) => {
      const mutationFn = updateDefinitionMutation.mutationFn;

      if (!mutationFn) {
        throw new Error("속성 정의 수정 mutationFn이 정의되지 않았습니다.");
      }

      return mutationFn({ propertyDefinitionId, request }, context);
    },
    onSuccess: async (property) => {
      toast.success("커스텀 속성을 수정했습니다.");
      await queryClient.invalidateQueries({ queryKey: propertiesKeys.metaScope(property.ownerType) });
      options?.onSuccess?.(property);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "커스텀 속성 수정에 실패했습니다."));
    },
  });
}
