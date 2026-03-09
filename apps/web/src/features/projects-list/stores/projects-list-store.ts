import { create } from "zustand";

interface ProjectsListStore {
  isCreateDialogOpen: boolean;
  draftName: string;
  draftDescription: string;
  openCreateDialog: () => void;
  closeCreateDialog: () => void;
  setDraftName: (name: string) => void;
  setDraftDescription: (description: string) => void;
  resetCreateDraft: () => void;
}

const initialState = {
  isCreateDialogOpen: false,
  draftName: "",
  draftDescription: "",
};

export const useProjectsListStore = create<ProjectsListStore>()((set) => ({
  ...initialState,
  openCreateDialog: () => set({ isCreateDialogOpen: true }),
  closeCreateDialog: () => set({ isCreateDialogOpen: false }),
  setDraftName: (draftName) => set({ draftName }),
  setDraftDescription: (draftDescription) => set({ draftDescription }),
  resetCreateDraft: () => set(initialState),
}));
