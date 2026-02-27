import { create } from "zustand";

interface BomImportStore {
  isModalOpen: boolean;
  projectId: string | null;
  folderId: string | null;

  openModal: (projectId: string, folderId?: string) => void;
  closeModal: () => void;
}

export const useBomImportStore = create<BomImportStore>((set) => ({
  isModalOpen: false,
  projectId: null,
  folderId: null,

  openModal: (projectId, folderId) =>
    set({
      isModalOpen: true,
      projectId,
      folderId: folderId ?? null,
    }),

  closeModal: () =>
    set({
      isModalOpen: false,
      projectId: null,
      folderId: null,
    }),
}));
