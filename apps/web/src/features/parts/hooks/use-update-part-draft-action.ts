import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updatePartDraft } from "@/features/parts/api/parts.api";
import { partsKeys } from "@/features/parts/api/parts.queries";
import type { PartDetailModel } from "@/features/parts/types/parts-model";
import { extractApiError } from "@/lib/api-error";

export interface UpdatePartDraftActionInput {
  category: string;
  description: string;
  extendedProperties: Record<string, unknown>;
  isPhantom: boolean;
  leadTimeDays: string;
  material: string;
  name: string;
  unit: string;
}

interface UseUpdatePartDraftActionOptions {
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

export function useUpdatePartDraftAction(
  partId: string,
  revisionId: string,
  options?: UseUpdatePartDraftActionOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["parts", partId, "revisions", revisionId, "update-draft-action"],
    mutationFn: (input: UpdatePartDraftActionInput) =>
      updatePartDraft(partId, revisionId, {
        name: toOptionalString(input.name),
        name_set: true,
        material: toOptionalString(input.material),
        material_set: true,
        unit: toOptionalString(input.unit),
        unit_set: true,
        description: toOptionalString(input.description),
        description_set: true,
        category: toOptionalString(input.category),
        category_set: true,
        is_phantom: input.isPhantom,
        phantom_set: true,
        lead_time_days: toOptionalInteger(input.leadTimeDays),
        lead_time_days_set: true,
        extended_properties: input.extendedProperties,
        extended_properties_set: true,
      }),
    onSuccess: async (part) => {
      toast.success("부품 초안을 저장했습니다.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: partsKeys.detail(partId, revisionId) }),
        queryClient.invalidateQueries({ queryKey: partsKeys.lists() }),
      ]);
      options?.onSuccess?.(part);
    },
    onError: (error) => {
      toast.error(extractApiError(error, "부품 초안 저장에 실패했습니다."));
    },
  });
}
