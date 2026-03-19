import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createPart } from "@/features/parts/api/parts.api";
import { partsKeys } from "@/features/parts/api/parts.queries";
import type { CreatePartRequestDto } from "@/features/parts/api/parts.types";
import type { PartDetailModel } from "@/features/parts/types/parts-model";
import { extractApiError } from "@/lib/api-error";

export interface CreatePartActionInput {
  category: string;
  description: string;
  extendedProperties: Record<string, unknown>;
  isPhantom: boolean;
  leadTimeDays: string;
  lifecycleState: CreatePartRequestDto["lifecycle_state"] | null;
  material: string;
  name: string;
  partNumber: string;
  unit: string;
}

interface UseCreatePartActionOptions {
  onSuccess?: (part: PartDetailModel) => void;
}

function toOptionalString(value: string) {
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function toOptionalInteger(value: string) {
  const trimmed = value.trim();

  if (trimmed === "") {
    return undefined;
  }

  const parsed = Number(trimmed);

  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error("리드타임은 0 이상의 정수만 입력할 수 있습니다.");
  }

  return parsed;
}

export function useCreatePartAction(options?: UseCreatePartActionOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["parts", "create-part-action"],
    mutationFn: (input: CreatePartActionInput) =>
      createPart({
        part_number: input.partNumber.trim(),
        name: toOptionalString(input.name),
        material: toOptionalString(input.material),
        unit: toOptionalString(input.unit),
        description: toOptionalString(input.description),
        category: toOptionalString(input.category),
        is_phantom: input.isPhantom,
        lifecycle_state: input.lifecycleState ?? undefined,
        lead_time_days: toOptionalInteger(input.leadTimeDays),
        extended_properties: input.extendedProperties,
      }),
    onSuccess: async (part) => {
      toast.success("부품을 생성했습니다.");
      await queryClient.invalidateQueries({ queryKey: partsKeys.lists() });
      options?.onSuccess?.(part);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "부품 생성에 실패했습니다."));
    },
  });
}
