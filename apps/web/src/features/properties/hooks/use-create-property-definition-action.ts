import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { propertiesKeys, propertiesMutations } from "@/features/properties/api/properties.queries";
import type { CreatePropertyDefinitionRequestDto } from "@/features/properties/api/properties.types";
import type { PropertyMetaModel } from "@/features/properties/types/properties-model";
import { extractApiError } from "@/lib/api-error";

interface UseCreatePropertyDefinitionActionOptions {
  onSuccess?: (property: PropertyMetaModel) => void;
}

export function useCreatePropertyDefinitionAction(options?: UseCreatePropertyDefinitionActionOptions) {
  const queryClient = useQueryClient();
  const createDefinitionMutation = propertiesMutations.createDefinition();

  return useMutation({
    mutationKey: createDefinitionMutation.mutationKey,
    mutationFn: (request: CreatePropertyDefinitionRequestDto, context) => {
      const mutationFn = createDefinitionMutation.mutationFn;

      if (!mutationFn) {
        throw new Error("속성 정의 생성 mutationFn이 정의되지 않았습니다.");
      }

      return mutationFn(request, context);
    },
    onSuccess: async (property) => {
      toast.success("커스텀 속성을 생성했습니다.");
      await queryClient.invalidateQueries({ queryKey: propertiesKeys.metaScope(property.ownerType) });
      options?.onSuccess?.(property);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "커스텀 속성 생성에 실패했습니다."));
    },
  });
}
