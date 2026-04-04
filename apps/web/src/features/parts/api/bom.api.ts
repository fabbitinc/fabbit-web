import {
  bomItemCommandAddBomItem as addBomItem,
  bomItemCommandAddBomItemsBatch as addBomItemsBatch,
  bomItemCommandDeleteBomItem as deleteBomItem,
  bomItemCommandUpdateBomItem as updateBomItem,
} from "@/api/generated/orval/bom-item-commands/bom-item-commands";
import type { AddBomItemRequest } from "@/api/generated/orval/model/addBomItemRequest";
import type { AddBomItemsBatchRequest } from "@/api/generated/orval/model/addBomItemsBatchRequest";
import type { UpdateBomItemRequest } from "@/api/generated/orval/model/updateBomItemRequest";
import { toPartBomItemModel } from "@/features/parts/api/parts.api";
import type { PartBomResponseDto } from "@/features/parts/api/parts.types";
import type { PartBomModel } from "@/features/parts/types/parts-model";

function toBomModel(response: unknown): PartBomModel {
  const bom = response as PartBomResponseDto;
  return {
    children: (bom.children ?? []).map(toPartBomItemModel),
    parents: (bom.parents ?? []).map(toPartBomItemModel),
  };
}

export async function addBomItemApi(
  partId: string,
  revisionId: string,
  request: AddBomItemRequest,
): Promise<PartBomModel> {
  const response = await addBomItem(partId, revisionId, request);
  return toBomModel(response);
}

export async function addBomItemsBatchApi(
  partId: string,
  revisionId: string,
  request: AddBomItemsBatchRequest,
): Promise<PartBomModel> {
  const response = await addBomItemsBatch(partId, revisionId, request);
  return toBomModel(response);
}

export async function updateBomItemApi(
  partId: string,
  revisionId: string,
  bomItemId: string,
  request: UpdateBomItemRequest,
): Promise<PartBomModel> {
  const response = await updateBomItem(partId, revisionId, bomItemId, request);
  return toBomModel(response);
}

export async function deleteBomItemApi(
  partId: string,
  revisionId: string,
  bomItemId: string,
): Promise<PartBomModel> {
  const response = await deleteBomItem(partId, revisionId, bomItemId);
  return toBomModel(response);
}
