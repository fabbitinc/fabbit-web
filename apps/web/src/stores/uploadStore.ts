import { create } from "zustand";

export type UploadStatus =
  | "pending"
  | "uploading"
  | "analyzing"
  | "completed"
  | "failed";

export interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  status: UploadStatus;
  /** 현재 단계 메시지 */
  statusMessage?: string;
  /** 업로드된 파일 URL */
  fileUrl?: string;
  error?: string;
}

interface UploadStore {
  files: UploadFile[];
  isModalOpen: boolean;
  /** 도면 업로드 시 사용할 프로젝트 ID */
  projectId: string | null;

  openModal: (type: "drawing", projectId?: string) => void;
  closeModal: () => void;
  addFiles: (files: File[]) => void;
  updateFile: (id: string, updates: Partial<UploadFile>) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  getActiveUploads: () => UploadFile[];
}

export const useUploadStore = create<UploadStore>((set, get) => ({
  files: [],
  isModalOpen: false,
  projectId: null,

  openModal: (_type: "drawing", projectId?: string) =>
    set({
      isModalOpen: true,
      projectId: projectId ?? null,
      files: [],
    }),

  closeModal: () => set({ isModalOpen: false }),

  addFiles: (newFiles) => {
    const { updateFile } = get();

    const uploadFiles: UploadFile[] = newFiles.map((file) => ({
      id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      name: file.name,
      size: file.size,
      status: "pending" as UploadStatus,
    }));

    set((state) => ({ files: [...state.files, ...uploadFiles] }));

    // 각 파일에 대해 업로드 시뮬레이션
    uploadFiles.forEach((uploadFile) => {
      simulateUploadProcess(uploadFile.id, updateFile);
    });
  },

  updateFile: (id, updates) => {
    set((state) => ({
      files: state.files.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }));
  },

  removeFile: (id) => {
    set((state) => ({ files: state.files.filter((f) => f.id !== id) }));
  },

  clearFiles: () => {
    set({ files: [] });
  },

  getActiveUploads: () => {
    return get().files.filter(
      (f) => f.status === "uploading" || f.status === "analyzing",
    );
  },
}));

/**
 * 도면 업로드 시뮬레이션 (mock)
 * TODO: 도면 업로드 API 연동 시 실제 구현으로 교체
 */
function simulateUploadProcess(
  fileId: string,
  updateFile: (id: string, updates: Partial<UploadFile>) => void,
) {
  updateFile(fileId, {
    status: "uploading",
    statusMessage: "파일 업로드 중...",
  });

  setTimeout(() => {
    updateFile(fileId, {
      status: "analyzing",
      statusMessage: "파일 분석 중...",
    });

    setTimeout(() => {
      updateFile(fileId, {
        status: "completed",
        statusMessage: "분석 완료",
      });
    }, 2000);
  }, 1000);
}
