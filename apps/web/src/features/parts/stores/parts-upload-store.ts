import { create } from "zustand";

interface PartsUploadStore {
  isOpen: boolean;
  contextPartId: string | null;
  openDialog: (contextPartId?: string) => void;
  closeDialog: () => void;
}

export const usePartsUploadStore = create<PartsUploadStore>((set) => ({
  isOpen: false,
  contextPartId: null,
  openDialog: (contextPartId) =>
    set({
      isOpen: true,
      contextPartId: contextPartId ?? null,
    }),
  closeDialog: () =>
    set({
      isOpen: false,
      contextPartId: null,
    }),
}));
