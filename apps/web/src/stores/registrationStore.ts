import { create } from "zustand";
import type {
  SignupFormData,
  WorkspaceFormData,
  PlanTier,
} from "@/features/registration/types/registration.types";

interface RegistrationState {
  signupData: SignupFormData;
  workspaceData: WorkspaceFormData;
  selectedPlan: PlanTier;
  scopedToken: string;

  setSignupData: (data: Partial<SignupFormData>) => void;
  setWorkspaceData: (data: Partial<WorkspaceFormData>) => void;
  setSelectedPlan: (plan: PlanTier) => void;
  setScopedToken: (token: string) => void;
  clearScopedToken: () => void;
}

export const useRegistrationStore = create<RegistrationState>()((set) => ({
  signupData: {
    name: "",
    email: "",
    password: "",
    turnstileToken: "",
  },

  workspaceData: {
    organizationName: "",
    slug: "",
    industry: "",
    teamSize: "",
    role: "",
  },

  selectedPlan: "starter",

  scopedToken: "",

  setSignupData: (data) =>
    set((state) => ({
      signupData: { ...state.signupData, ...data },
    })),

  setWorkspaceData: (data) =>
    set((state) => ({
      workspaceData: { ...state.workspaceData, ...data },
    })),

  setSelectedPlan: (plan) => set({ selectedPlan: plan }),

  setScopedToken: (token) => set({ scopedToken: token }),

  clearScopedToken: () => set({ scopedToken: "" }),
}));
