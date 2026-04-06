import {
  partCategoryList as listCategoriesApi,
  partCategoryCreate as createCategoryApi,
  partCategoryUpdate as updateCategoryApi,
  partCategoryDelete as deleteCategoryApi,
  partCategoryGetNextNumber as getNextNumberApi,
  partCategoryCheckNumber as checkNumberApi,
} from "@/api/generated/orval/part-categories/part-categories";
import type {
  CreatePartCategoryRequest,
  UpdatePartCategoryRequest,
  PartCategoryListResponse,
  PartCategoryResponse,
  PartNumberPreviewResponse,
  PartNumberAvailabilityResponse,
} from "@/api/generated/orval/model";
import type {
  NumberingCategoryModel,
  NextNumberPreviewModel,
  PartNumberAvailabilityModel,
} from "@/features/part-number-categories/types/numbering-categories.types";

// ── 조회 ──

export async function fetchNumberingCategories(): Promise<NumberingCategoryModel[]> {
  const response = await listCategoriesApi();
  const result = response as PartCategoryListResponse;
  return (result.items ?? []).map(toNumberingCategoryModel);
}

export async function fetchNextNumber(categoryId: string): Promise<NextNumberPreviewModel> {
  const response = await getNextNumberApi(categoryId);
  const result = response as PartNumberPreviewResponse;
  return {
    partNumber: result.part_number ?? "",
    note: result.note ?? null,
  };
}

export async function fetchCheckNumber(partNumber: string): Promise<PartNumberAvailabilityModel> {
  const response = await checkNumberApi({ partNumber });
  const result = response as PartNumberAvailabilityResponse;
  return {
    partNumber: result.part_number ?? partNumber,
    available: result.available ?? false,
  };
}

// ── 생성/수정/삭제 ──

export async function createNumberingCategory(
  request: CreatePartCategoryRequest,
): Promise<NumberingCategoryModel> {
  const response = await createCategoryApi(request);
  return toNumberingCategoryModel(response as PartCategoryResponse);
}

export async function updateNumberingCategory(
  categoryId: string,
  request: UpdatePartCategoryRequest,
): Promise<NumberingCategoryModel> {
  const response = await updateCategoryApi(categoryId, request);
  return toNumberingCategoryModel(response as PartCategoryResponse);
}

export async function deleteNumberingCategory(categoryId: string): Promise<void> {
  await deleteCategoryApi(categoryId);
}

// ── 변환 ──

function toNumberingCategoryModel(dto: PartCategoryResponse): NumberingCategoryModel {
  return {
    id: dto.id ?? "",
    name: dto.name ?? "",
    formatPrefix: dto.format_prefix ?? "",
    formatSuffix: dto.format_suffix ?? "",
    digits: dto.digits ?? 4,
    autoNumberingEnabled: dto.auto_numbering_enabled ?? false,
    previewPartNumber: dto.preview_part_number ?? "",
  };
}
