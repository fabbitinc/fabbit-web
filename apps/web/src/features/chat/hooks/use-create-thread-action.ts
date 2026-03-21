import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createChatThread } from "../api/chat.api";
import { chatKeys } from "../api/chat.queries";
import { useChatStore } from "../stores/chat-store";
import { extractApiError } from "@/lib/api-error";
import type { CreateChatThreadRequest } from "@/api/generated/orval/model";

export function useCreateThreadAction() {
  const queryClient = useQueryClient();
  const { openThread } = useChatStore();

  return useMutation({
    mutationKey: ["chat", "create-thread"],
    mutationFn: (request: CreateChatThreadRequest) =>
      createChatThread(request),
    onSuccess: async (response) => {
      const threadId = response.thread_id;
      if (threadId) {
        openThread(threadId);
      }
      await queryClient.invalidateQueries({ queryKey: chatKeys.threads() });
    },
    onError: (error) => {
      toast.error(extractApiError(error, "대화 생성에 실패했습니다."));
    },
  });
}
