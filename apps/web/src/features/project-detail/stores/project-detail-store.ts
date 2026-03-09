import { create } from "zustand";
import type { ProjectRole } from "@/features/project-detail/types/project-detail-model";

interface ProjectDetailStore {
  isAddPartDialogOpen: boolean;
  partLookupQuery: string;
  selectedPartIds: string[];
  isAddMemberDialogOpen: boolean;
  memberLookupQuery: string;
  selectedMemberIds: string[];
  selectedMemberRole: ProjectRole;
  openAddPartDialog: () => void;
  closeAddPartDialog: () => void;
  setPartLookupQuery: (query: string) => void;
  toggleSelectedPart: (partId: string) => void;
  resetPartDialog: () => void;
  openAddMemberDialog: () => void;
  closeAddMemberDialog: () => void;
  setMemberLookupQuery: (query: string) => void;
  toggleSelectedMember: (userId: string) => void;
  setSelectedMemberRole: (role: ProjectRole) => void;
  resetMemberDialog: () => void;
}

const defaultMemberRole: ProjectRole = "MEMBER";

export const useProjectDetailStore = create<ProjectDetailStore>()((set) => ({
  isAddPartDialogOpen: false,
  partLookupQuery: "",
  selectedPartIds: [],
  isAddMemberDialogOpen: false,
  memberLookupQuery: "",
  selectedMemberIds: [],
  selectedMemberRole: defaultMemberRole,
  openAddPartDialog: () => set({ isAddPartDialogOpen: true }),
  closeAddPartDialog: () => set({ isAddPartDialogOpen: false }),
  setPartLookupQuery: (partLookupQuery) => set({ partLookupQuery }),
  toggleSelectedPart: (partId) =>
    set((state) => ({
      selectedPartIds: state.selectedPartIds.includes(partId)
        ? state.selectedPartIds.filter((currentPartId) => currentPartId !== partId)
        : [...state.selectedPartIds, partId],
    })),
  resetPartDialog: () =>
    set({
      isAddPartDialogOpen: false,
      partLookupQuery: "",
      selectedPartIds: [],
    }),
  openAddMemberDialog: () => set({ isAddMemberDialogOpen: true }),
  closeAddMemberDialog: () => set({ isAddMemberDialogOpen: false }),
  setMemberLookupQuery: (memberLookupQuery) => set({ memberLookupQuery }),
  toggleSelectedMember: (userId) =>
    set((state) => ({
      selectedMemberIds: state.selectedMemberIds.includes(userId)
        ? state.selectedMemberIds.filter((currentUserId) => currentUserId !== userId)
        : [...state.selectedMemberIds, userId],
    })),
  setSelectedMemberRole: (selectedMemberRole) => set({ selectedMemberRole }),
  resetMemberDialog: () =>
    set({
      isAddMemberDialogOpen: false,
      memberLookupQuery: "",
      selectedMemberIds: [],
      selectedMemberRole: defaultMemberRole,
    }),
}));
