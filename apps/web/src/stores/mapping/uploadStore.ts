import { create } from "zustand";
import type { UploadedFile } from "@/features/mapping/types/mapping.types";

interface UploadState {
  uploadedFiles: UploadedFile[];
  uploadIds: string[];
  primaryUploadId: string | null;

  addFiles: (files: UploadedFile[]) => void;
  updateFileProgress: (id: string, progress: number, status?: UploadedFile["status"]) => void;
  removeFile: (id: string) => void;
  addUploadId: (fileId: string, uploadId: string) => void;
  setPrimaryUploadId: (uploadId: string) => void;
  reset: () => void;
}

export const useUploadStore = create<UploadState>()((set) => ({
  uploadedFiles: [],
  uploadIds: [],
  primaryUploadId: null,

  addFiles: (files) =>
    set((state) => ({
      uploadedFiles: [...state.uploadedFiles, ...files],
    })),

  updateFileProgress: (id, progress, status) =>
    set((state) => ({
      uploadedFiles: state.uploadedFiles.map((f) =>
        f.id === id ? { ...f, progress, ...(status ? { status } : {}) } : f,
      ),
    })),

  removeFile: (id) =>
    set((state) => ({
      uploadedFiles: state.uploadedFiles.filter((f) => f.id !== id),
    })),

  addUploadId: (fileId, uploadId) =>
    set((state) => ({
      uploadedFiles: state.uploadedFiles.map((f) =>
        f.id === fileId ? { ...f, uploadId } : f,
      ),
      uploadIds: [...state.uploadIds, uploadId],
    })),

  setPrimaryUploadId: (uploadId) => set({ primaryUploadId: uploadId }),

  reset: () => set({ uploadedFiles: [], uploadIds: [], primaryUploadId: null }),
}));
