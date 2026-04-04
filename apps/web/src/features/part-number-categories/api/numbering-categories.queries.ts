import { queryOptions, mutationOptions } from "@tanstack/react-query";
import type { CreatePartNumberCategoryRequest, UpdatePartNumberCategoryRequest } from "@/api/generated/orval/model";
import {
  fetchNumberingCategories,
  fetchNextNumber,
  fetchCheckNumber,
  createNumberingCategory,
  updateNumberingCategory,
  deleteNumberingCategory,
} from "@/features/part-number-categories/api/numbering-categories.api";

export const numberingCategoriesKeys = {
  all: ["numbering-categories"] as const,
  list: () => ["numbering-categories", "list"] as const,
  nextNumber: (categoryId: string) => ["numbering-categories", categoryId, "next-number"] as const,
  checkNumber: (partNumber: string) => ["numbering-categories", "check-number", partNumber] as const,
};

export const numberingCategoriesQueries = {
  list: () =>
    queryOptions({
      queryKey: numberingCategoriesKeys.list(),
      queryFn: fetchNumberingCategories,
      staleTime: 30_000,
    }),
  nextNumber: (categoryId: string) =>
    queryOptions({
      queryKey: numberingCategoriesKeys.nextNumber(categoryId),
      queryFn: () => fetchNextNumber(categoryId),
      enabled: !!categoryId,
      staleTime: 0,
    }),
  checkNumber: (partNumber: string) =>
    queryOptions({
      queryKey: numberingCategoriesKeys.checkNumber(partNumber),
      queryFn: () => fetchCheckNumber(partNumber),
      enabled: false,
      staleTime: 0,
    }),
};

export const numberingCategoriesMutations = {
  create: () =>
    mutationOptions({
      mutationKey: ["numbering-categories", "create"],
      mutationFn: (request: CreatePartNumberCategoryRequest) => createNumberingCategory(request),
    }),
  update: (categoryId: string) =>
    mutationOptions({
      mutationKey: ["numbering-categories", categoryId, "update"],
      mutationFn: (request: UpdatePartNumberCategoryRequest) =>
        updateNumberingCategory(categoryId, request),
    }),
  delete: (categoryId: string) =>
    mutationOptions({
      mutationKey: ["numbering-categories", categoryId, "delete"],
      mutationFn: () => deleteNumberingCategory(categoryId),
    }),
};
