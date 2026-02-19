import { create } from "zustand";

interface PartsUploadStore {
  isOpen: boolean;
  partNumber: string | null;
  openModal: (partNumber?: string) => void;
  closeModal: () => void;
}

export const usePartsUploadStore = create<PartsUploadStore>((set) => ({
  isOpen: false,
  partNumber: null,
  openModal: (partNumber) =>
    set({
      isOpen: true,
      partNumber: partNumber ?? null,
    }),
  closeModal: () =>
    set({
      isOpen: false,
      partNumber: null,
    }),
}));
