import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { UploadedTemplateFileModel } from "@/features/part-template-mapping/types/part-template-mapping-model";

interface TemplateUploadStore {
  uploadedFiles: UploadedTemplateFileModel[];
  primaryUploadId: string | null;
  isPrimaryUploadCompleted: boolean;
  setUploadedFiles: (files: UploadedTemplateFileModel[]) => void;
  updateUploadedFile: (fileId: string, updates: Partial<UploadedTemplateFileModel>) => void;
  setPrimaryUploadId: (uploadId: string | null) => void;
  setPrimaryUploadCompleted: (isCompleted: boolean) => void;
  resetUploadState: () => void;
}

const INITIAL_TEMPLATE_UPLOAD_STATE = {
  uploadedFiles: [] as UploadedTemplateFileModel[],
  primaryUploadId: null as string | null,
  isPrimaryUploadCompleted: false,
};

export const useTemplateUploadStore = create<TemplateUploadStore>()(
  persist(
    (set) => ({
      ...INITIAL_TEMPLATE_UPLOAD_STATE,
      setUploadedFiles: (files) => set({ uploadedFiles: files }),
      updateUploadedFile: (fileId, updates) =>
        set((state) => ({
          uploadedFiles: state.uploadedFiles.map((file) =>
            file.id === fileId ? { ...file, ...updates } : file,
          ),
        })),
      setPrimaryUploadId: (uploadId) => set({ primaryUploadId: uploadId }),
      setPrimaryUploadCompleted: (isCompleted) => set({ isPrimaryUploadCompleted: isCompleted }),
      resetUploadState: () => set(INITIAL_TEMPLATE_UPLOAD_STATE),
    }),
    {
      name: "web2-part-template-upload-store",
      version: 1,
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        uploadedFiles: state.uploadedFiles,
        primaryUploadId: state.primaryUploadId,
        isPrimaryUploadCompleted: state.isPrimaryUploadCompleted,
      }),
    },
  ),
);
