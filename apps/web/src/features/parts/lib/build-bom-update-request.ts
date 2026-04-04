import type { UpdateBomItemRequest } from "@/api/generated/orval/model/updateBomItemRequest";

export interface BomItemFormValues {
  childPartRevisionId: string;
  lineNumber: string;
  quantity: number;
}

export function buildBomUpdateRequest(
  current: BomItemFormValues,
  initial: BomItemFormValues,
): UpdateBomItemRequest | null {
  const request: UpdateBomItemRequest = {};
  let hasChanges = false;

  if (current.quantity !== initial.quantity) {
    request.quantity = current.quantity;
    request.quantity_set = true;
    hasChanges = true;
  }

  if (current.lineNumber !== initial.lineNumber) {
    request.line_number = current.lineNumber;
    request.line_number_set = true;
    hasChanges = true;
  }

  if (current.childPartRevisionId !== initial.childPartRevisionId) {
    request.child_part_revision_id = current.childPartRevisionId;
    request.child_part_revision_id_set = true;
    hasChanges = true;
  }

  return hasChanges ? request : null;
}
