import { create } from "zustand";
import type { ChatMessage } from "@/features/onboarding/types/onboarding.types";

interface ExploreState {
  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
}

export const useExploreStore = create<ExploreState>()((set) => ({
  chatMessages: [],

  addChatMessage: (message) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, message],
    })),
}));
