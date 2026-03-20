import { create } from "zustand";
import type {
  OwnerSeatType,
  PlanTier,
  SignupFormData,
  WorkspaceFormData,
} from "@/features/registration/types/registration.types";

interface RegistrationStoreState {
  signupData: SignupFormData;
  workspaceData: WorkspaceFormData;
  selectedPlan: PlanTier;
  ownerSeatType: OwnerSeatType | null;
  scopedToken: string;
  setSignupData: (data: Partial<SignupFormData>) => void;
  setWorkspaceData: (data: Partial<WorkspaceFormData>) => void;
  setSelectedPlan: (plan: PlanTier) => void;
  setOwnerSeatType: (seatType: OwnerSeatType | null) => void;
  setScopedToken: (token: string) => void;
  clearScopedToken: () => void;
  reset: () => void;
}

const initialSignupData: SignupFormData = {
  name: "",
  email: "",
  password: "",
  turnstileToken: "",
  verificationToken: "",
  code: "",
};

const initialWorkspaceData: WorkspaceFormData = {
  organizationName: "",
  slug: "",
  industry: "",
  teamSize: "",
  role: "",
};

export const useRegistrationStore = create<RegistrationStoreState>()((set) => ({
  signupData: initialSignupData,
  workspaceData: initialWorkspaceData,
  selectedPlan: "starter",
  ownerSeatType: null,
  scopedToken: "",
  setSignupData: (data) =>
    set((state) => ({
      signupData: { ...state.signupData, ...data },
    })),
  setWorkspaceData: (data) =>
    set((state) => ({
      workspaceData: { ...state.workspaceData, ...data },
    })),
  setSelectedPlan: (selectedPlan) => set({ selectedPlan, ownerSeatType: null }),
  setOwnerSeatType: (ownerSeatType) => set({ ownerSeatType }),
  setScopedToken: (scopedToken) => set({ scopedToken }),
  clearScopedToken: () => set({ scopedToken: "" }),
  reset: () =>
    set({
      signupData: initialSignupData,
      workspaceData: initialWorkspaceData,
      selectedPlan: "starter",
      ownerSeatType: null,
      scopedToken: "",
    }),
}));
