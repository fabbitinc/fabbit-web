import type { ItemData } from "../types";

export interface ParentItem {
  item: ItemData;
  usageQuantity: number;
}

/**
 * 특정 아이템의 상위 품목을 재귀적으로 검색
 * 전체 아이템 트리를 순회하며 children에 해당 아이템이 있는지 확인
 */
export function findParentItems(
  targetId: string,
  allItems: ItemData[]
): ParentItem[] {
  const parents: ParentItem[] = [];

  function searchInItem(item: ItemData): void {
    if (item.children) {
      for (const child of item.children) {
        if (child.id === targetId) {
          parents.push({
            item: item,
            usageQuantity: child.quantity,
          });
        }
        searchInItem(child);
      }
    }
  }

  for (const item of allItems) {
    searchInItem(item);
  }

  return parents;
}

/**
 * 모든 아이템을 재귀적으로 평탄화
 */
export function flattenItems(items: ItemData[]): ItemData[] {
  const result: ItemData[] = [];

  function flatten(item: ItemData): void {
    result.push(item);
    if (item.children) {
      for (const child of item.children) {
        flatten(child);
      }
    }
  }

  for (const item of items) {
    flatten(item);
  }

  return result;
}
