import {
  partNumberCategoryList as listCategoriesApi,
  partNumberCategoryCreate as createCategoryApi,
  partNumberCategoryUpdate as updateCategoryApi,
  partNumberCategoryDelete as deleteCategoryApi,
  partNumberCategoryGetNextNumber as getNextNumberApi,
  partNumberCategoryCheckNumber as checkNumberApi,
} from "@/api/generated/orval/part-number-categories/part-number-categories";
import type {
  CreatePartNumberCategoryRequest,
  UpdatePartNumberCategoryRequest,
  PartNumberCategoryListResponse,
  PartNumberCategoryResponse,
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
  const result = response as PartNumberCategoryListResponse;
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
  request: CreatePartNumberCategoryRequest,
): Promise<NumberingCategoryModel> {
  const response = await createCategoryApi(request);
  return toNumberingCategoryModel(response as PartNumberCategoryResponse);
}

export async function updateNumberingCategory(
  categoryId: string,
  request: UpdatePartNumberCategoryRequest,
): Promise<NumberingCategoryModel> {
  const response = await updateCategoryApi(categoryId, request);
  return toNumberingCategoryModel(response as PartNumberCategoryResponse);
}

export async function deleteNumberingCategory(categoryId: string): Promise<void> {
  await deleteCategoryApi(categoryId);
}

// ── 변환 ──

function toNumberingCategoryModel(dto: PartNumberCategoryResponse): NumberingCategoryModel {
  return {
    id: dto.id ?? "",
    name: dto.name ?? "",
    prefix: dto.prefix ?? "",
    delimiter: dto.delimiter ?? "-",
    digits: dto.digits ?? 4,
    previewPartNumber: dto.preview_part_number ?? "",
  };
}
