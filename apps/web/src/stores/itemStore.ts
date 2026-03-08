import { create } from "zustand";
import type { ItemData } from "@/features/items/types";

interface ItemStore {
  selectedFolderId: string;
  selectedItemId: string | null;
  selectedProjectId: string | null; // 부품 관리에서 선택된 프로젝트 ID
  expandedIds: Set<string>;
  selectedItem: ItemData | null;
  drawerOpen: boolean;
  drawerExpanded: boolean;

  setSelectedFolderId: (id: string) => void;
  setSelectedItemId: (id: string | null) => void;
  setSelectedProjectId: (id: string | null) => void;
  // 배치 업데이트 함수 (성능 최적화: 단일 리렌더링)
  selectFolder: (folderId: string, projectId: string | null) => void;
  selectProject: (projectId: string) => void;
  clearSelection: () => void;
  toggleExpanded: (id: string) => void;
  selectItem: (item: ItemData | null) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawerExpand: () => void;
}

export const useItemStore = create<ItemStore>((set, get) => ({
  selectedFolderId: "",
  selectedItemId: null,
  selectedProjectId: null,
  expandedIds: new Set<string>(),
  selectedItem: null,
  drawerOpen: false,
  drawerExpanded: false,

  setSelectedFolderId: (id) => set({ selectedFolderId: id }),
  setSelectedItemId: (id) => set({ selectedItemId: id }),
  setSelectedProjectId: (id) => set({ selectedProjectId: id }),

  // 배치 업데이트 함수 (성능 최적화: 3번 → 1번 리렌더링)
  selectFolder: (folderId, projectId) =>
    set({
      selectedFolderId: folderId,
      selectedItemId: null,
      selectedProjectId: projectId,
    }),

  selectProject: (projectId) =>
    set({
      selectedFolderId: "",
      selectedItemId: null,
      selectedProjectId: projectId,
    }),

  clearSelection: () =>
    set({
      selectedFolderId: "",
      selectedItemId: null,
      selectedProjectId: null,
    }),

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
  closeDrawer: () =>
    set({ drawerOpen: false, selectedItem: null, drawerExpanded: false }),
  toggleDrawerExpand: () => set({ drawerExpanded: !get().drawerExpanded }),
}));
