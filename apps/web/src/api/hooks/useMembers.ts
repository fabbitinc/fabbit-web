import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getMembers, getInvitations, createInvitation, cancelInvitation, removeMember } from "../member";
import type { CreateInvitationRequest } from "../types";

export const MEMBERS_QUERY_KEY = ["members"] as const;
export const INVITATIONS_QUERY_KEY = ["invitations"] as const;

const INVITATION_ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: "유효하지 않은 이메일 주소입니다.",
  ALREADY_MEMBER: "이미 조직에 속한 사용자입니다.",
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

/** 멤버 제거 */
export function useRemoveMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => removeMember(userId),
    onSuccess: () => {
      toast.success("사용자를 제거했습니다");
      queryClient.invalidateQueries({ queryKey: MEMBERS_QUERY_KEY });
    },
    onError: (err) => {
      const axiosErr = err as { response?: { data?: { code?: string; message?: string } } };
      const code = axiosErr?.response?.data?.code;
      const messages: Record<string, string> = {
        FORBIDDEN: "사용자 제거 권한이 없습니다. 관리자만 제거할 수 있습니다.",
        CANNOT_REMOVE_OWNER: "조직 소유자는 제거할 수 없습니다.",
        CANNOT_REMOVE_SELF: "자기 자신은 제거할 수 없습니다.",
      };
      const message = (code && messages[code]) || axiosErr?.response?.data?.message || "사용자 제거에 실패했습니다";
      toast.error(message);
    },
  });
}
