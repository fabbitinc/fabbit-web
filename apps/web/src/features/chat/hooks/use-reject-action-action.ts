import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { rejectChatAction } from "../api/chat.api";
import { chatKeys } from "../api/chat.queries";
import { useChatStore } from "../stores/chat-store";
import { extractApiError } from "@/lib/api-error";

export function useRejectActionAction() {
  const queryClient = useQueryClient();
  const activeThreadId = useChatStore((s) => s.activeThreadId);

  return useMutation({
    mutationKey: ["chat", "reject-action"],
    mutationFn: (actionRequestId: string) =>
      rejectChatAction(actionRequestId),
    onSuccess: async () => {
      toast.success("액션이 취소되었습니다.");
      if (activeThreadId) {
        await queryClient.invalidateQueries({
          queryKey: chatKeys.messages(activeThreadId),
        });
      }
    },
    onError: (error) => {
      toast.error(extractApiError(error, "액션 취소에 실패했습니다."));
    },
  });
}
