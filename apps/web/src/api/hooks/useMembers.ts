import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getMembers, getInvitations, createInvitation, cancelInvitation } from "../member";
import type { CreateInvitationRequest } from "../types";

export const MEMBERS_QUERY_KEY = ["members"] as const;
export const INVITATIONS_QUERY_KEY = ["invitations"] as const;

const INVITATION_ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: "유효하지 않은 이메일 주소입니다.",
  ALREADY_MEMBER: "이미 조직에 속한 멤버입니다.",
  DUPLICATE_INVITATION: "이미 초대가 발송된 이메일입니다.",
  FORBIDDEN: "초대 권한이 없습니다. 관리자만 초대할 수 있습니다.",
  NOT_FOUND: "초대 정보를 찾을 수 없습니다.",
};

function getInvitationErrorMessage(err: unknown, fallback: string): string {
  const axiosErr = err as { response?: { data?: { code?: string; message?: string } } };
  const code = axiosErr?.response?.data?.code;
  if (code && INVITATION_ERROR_MESSAGES[code]) {
    return INVITATION_ERROR_MESSAGES[code];
  }
  return axiosErr?.response?.data?.message || fallback;
}

/** 조직 멤버 목록 */
export function useMembers(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: MEMBERS_QUERY_KEY,
    queryFn: getMembers,
    enabled: options?.enabled,
  });
}

/** 초대 목록 */
export function useInvitations() {
  return useQuery({
    queryKey: INVITATIONS_QUERY_KEY,
    queryFn: getInvitations,
  });
}

/** 멤버 초대 */
export function useCreateInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateInvitationRequest) => createInvitation(request),
    onSuccess: () => {
      toast.success("초대를 발송했습니다");
      queryClient.invalidateQueries({ queryKey: INVITATIONS_QUERY_KEY });
    },
    onError: (err) => {
      toast.error(getInvitationErrorMessage(err, "초대 발송에 실패했습니다"));
    },
  });
}

/** 초대 취소 */
export function useCancelInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: string) => cancelInvitation(invitationId),
    onSuccess: () => {
      toast.success("초대를 취소했습니다");
      queryClient.invalidateQueries({ queryKey: INVITATIONS_QUERY_KEY });
    },
    onError: (err) => {
      toast.error(getInvitationErrorMessage(err, "초대 취소에 실패했습니다"));
    },
  });
}
