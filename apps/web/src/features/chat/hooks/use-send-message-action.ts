import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { sendChatMessage } from "../api/chat.api";
import { chatKeys } from "../api/chat.queries";
import { useChatStore } from "../stores/chat-store";
import { extractApiError } from "@/lib/api-error";

interface SendMessageParams {
  threadId: string;
  text: string;
}

export function useSendMessageAction() {
  const queryClient = useQueryClient();
  const { startStreaming } = useChatStore();

  return useMutation({
    mutationKey: ["chat", "send-message"],
    mutationFn: ({ threadId, text }: SendMessageParams) =>
      sendChatMessage(threadId, text),
    onSuccess: async (response, { threadId }) => {
      // runId로 SSE 스트리밍 시작
      if (response.run_id) {
        startStreaming(response.run_id);
      }
      // 메시지 목록 갱신 (사용자 메시지 확인)
      await queryClient.invalidateQueries({
        queryKey: chatKeys.messages(threadId),
      });
    },
    onError: (error) => {
      toast.error(extractApiError(error, "메시지 전송에 실패했습니다."));
    },
  });
}
