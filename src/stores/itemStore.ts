import { create } from "zustand";
import type { ItemData } from "@/features/items/types";
import { mockItems, mockFolders, defaultFolderId } from "@/features/items/mock-data";
import type { TreeNodeData } from "@/features/items/types";

// 트리에서 특정 노드의 자식 아이템들을 찾는 헬퍼 함수
function findNodeById(nodes: TreeNodeData[], id: string): TreeNodeData | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

// 트리 노드를 ItemData 형식으로 변환
function treeNodeToItemData(node: TreeNodeData): ItemData {
  return {
    id: node.id,
    partNumber: node.partNumber ?? "",
    name: node.name,
    material: "",
    quantity: 1,
    unit: "EA",
    drawingStatus: node.status === "approved" ? "approved" : node.status === "draft" ? "draft" : "none",
    children: node.children?.map(treeNodeToItemData),
  };
}

// ItemData 배열에서 특정 ID를 가진 아이템 찾기
function findItemById(items: ItemData[], id: string): ItemData | null {
  for (const item of items) {
    if (item.id === id) return item;
    if (item.children) {
      const found = findItemById(item.children, id);
      if (found) return found;
    }
  }
  return null;
}

interface ItemStore {
  selectedFolderId: string;
  selectedItemId: string | null;
  selectedProjectId: string | null; // 부품관리에서 선택된 프로젝트 ID
  expandedIds: Set<string>;
  selectedItem: ItemData | null;
  drawerOpen: boolean;
  drawerExpanded: boolean;

  setSelectedFolderId: (id: string) => void;
  setSelectedItemId: (id: string | null) => void;
  setSelectedProjectId: (id: string | null) => void;
  toggleExpanded: (id: string) => void;
  selectItem: (item: ItemData | null) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawerExpand: () => void;
  getItems: () => ItemData[];
}

export const useItemStore = create<ItemStore>((set, get) => ({
  selectedFolderId: defaultFolderId,
  selectedItemId: null,
  selectedProjectId: null,
  expandedIds: new Set<string>(),
  selectedItem: null,
  drawerOpen: false,
  drawerExpanded: false,

  setSelectedFolderId: (id) => set({ selectedFolderId: id }),
  setSelectedItemId: (id) => set({ selectedItemId: id }),
  setSelectedProjectId: (id) => set({ selectedProjectId: id }),

  toggleExpanded: (id) => {
    const current = get().expandedIds;
    const next = new Set(current);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    set({ expandedIds: next });
  },

  selectItem: (item) => set({ selectedItem: item, drawerOpen: item !== null }),

  openDrawer: () => set({ drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false, selectedItem: null, drawerExpanded: false }),
  toggleDrawerExpand: () => set({ drawerExpanded: !get().drawerExpanded }),

  getItems: () => {
    const folderId = get().selectedFolderId;

    // 1. 먼저 mockItems에서 찾기 (폴더)
    if (mockItems[folderId]) {
      return mockItems[folderId];
    }

    // 2. mockItems의 아이템 중에서 해당 ID를 가진 어셈블리 찾기
    for (const items of Object.values(mockItems)) {
      const found = findItemById(items, folderId);
      if (found && found.children) {
        return found.children;
      }
    }

    // 3. 트리 데이터에서 찾기 (어셈블리)
    const node = findNodeById(mockFolders, folderId);
    if (node && node.children) {
      // 아이템 타입인 자식들만 반환 (폴더는 제외)
      const itemChildren = node.children.filter((c) => c.type === "item");
      return itemChildren.map(treeNodeToItemData);
    }

    return [];
  },
}));
