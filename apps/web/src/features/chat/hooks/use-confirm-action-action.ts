import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { confirmChatAction } from "../api/chat.api";
import { chatKeys } from "../api/chat.queries";
import { useChatStore } from "../stores/chat-store";
import { extractApiError } from "@/lib/api-error";

export function useConfirmActionAction() {
  const queryClient = useQueryClient();
  const activeThreadId = useChatStore((s) => s.activeThreadId);

  return useMutation({
    mutationKey: ["chat", "confirm-action"],
    mutationFn: (actionRequestId: string) =>
      confirmChatAction(actionRequestId),
    onSuccess: async () => {
      toast.success("액션이 실행되었습니다.");
      if (activeThreadId) {
        await queryClient.invalidateQueries({
          queryKey: chatKeys.messages(activeThreadId),
        });
      }
    },
    onError: (error) => {
      toast.error(extractApiError(error, "액션 실행에 실패했습니다."));
    },
  });
}
