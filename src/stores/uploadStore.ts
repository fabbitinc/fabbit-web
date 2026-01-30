import { create } from "zustand";

export type UploadStatus = "pending" | "uploading" | "processing" | "completed" | "failed" | "conflict";

export interface UploadFile {
  id: string;
  name: string;
  size: number;
  status: UploadStatus;
  progress: number;
  aiProgress?: {
    step: string;
    percentage: number;
  };
  result?: {
    itemsFound: number;
    conflictsFound: number;
  };
  error?: string;
}

interface UploadStore {
  files: UploadFile[];
  isModalOpen: boolean;

  openModal: () => void;
  closeModal: () => void;
  addFiles: (files: File[]) => void;
  updateFile: (id: string, updates: Partial<UploadFile>) => void;
  removeFile: (id: string) => void;
  clearCompleted: () => void;
  getActiveUploads: () => UploadFile[];
}

export const useUploadStore = create<UploadStore>((set, get) => ({
  files: [],
  isModalOpen: false,

  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),

  addFiles: (newFiles) => {
    const uploadFiles: UploadFile[] = newFiles.map((file) => ({
      id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      status: "pending",
      progress: 0,
    }));
    set((state) => ({ files: [...state.files, ...uploadFiles] }));

    // Simulate upload and AI processing for each file
    uploadFiles.forEach((file) => {
      simulateUploadProcess(file.id, get().updateFile);
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

  clearCompleted: () => {
    set((state) => ({
      files: state.files.filter((f) => f.status !== "completed"),
    }));
  },

  getActiveUploads: () => {
    return get().files.filter(
      (f) => f.status === "uploading" || f.status === "processing"
    );
  },
}));

// Simulate the upload and AI processing
function simulateUploadProcess(
  fileId: string,
  updateFile: (id: string, updates: Partial<UploadFile>) => void
) {
  // Phase 1: Uploading
  updateFile(fileId, { status: "uploading", progress: 0 });

  let uploadProgress = 0;
  const uploadInterval = setInterval(() => {
    uploadProgress += Math.random() * 30;
    if (uploadProgress >= 100) {
      uploadProgress = 100;
      clearInterval(uploadInterval);
      updateFile(fileId, { progress: 100 });

      // Phase 2: AI Processing
      setTimeout(() => startAIProcessing(fileId, updateFile), 500);
    } else {
      updateFile(fileId, { progress: Math.min(uploadProgress, 99) });
    }
  }, 300);
}

function startAIProcessing(
  fileId: string,
  updateFile: (id: string, updates: Partial<UploadFile>) => void
) {
  const steps = [
    { step: "도면 이미지 분석 중...", percentage: 20 },
    { step: "표제란 인식 중...", percentage: 40 },
    { step: "부품표(BOM) 추출 중...", percentage: 60 },
    { step: "기존 데이터와 대조 중...", percentage: 80 },
    { step: "결과 저장 중...", percentage: 100 },
  ];

  updateFile(fileId, { status: "processing", aiProgress: steps[0] });

  let stepIndex = 0;
  const processInterval = setInterval(() => {
    stepIndex++;
    if (stepIndex >= steps.length) {
      clearInterval(processInterval);

      // Randomly decide if there's a conflict (for demo)
      const hasConflict = Math.random() > 0.7;

      if (hasConflict) {
        updateFile(fileId, {
          status: "conflict",
          aiProgress: { step: "충돌 감지됨", percentage: 100 },
          result: { itemsFound: 5, conflictsFound: 2 },
        });
      } else {
        updateFile(fileId, {
          status: "completed",
          aiProgress: { step: "완료", percentage: 100 },
          result: { itemsFound: Math.floor(Math.random() * 10) + 1, conflictsFound: 0 },
        });
      }
    } else {
      updateFile(fileId, { aiProgress: steps[stepIndex] });
    }
  }, 800);
}
