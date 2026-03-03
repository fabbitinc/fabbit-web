import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getTeams,
  getTeamMembers,
  createTeam,
  updateTeam,
  deleteTeam,
  addTeamMembers,
  removeTeamMembers,
} from "../team";
import type { CreateTeamRequest, UpdateTeamRequest } from "../types";

export const TEAMS_QUERY_KEY = ["teams"] as const;
export const TEAM_MEMBERS_QUERY_KEY = ["teamMembers"] as const;

/** 팀 목록 조회 훅 */
export function useTeams(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: TEAMS_QUERY_KEY,
    queryFn: getTeams,
    enabled: options?.enabled,
  });
}

/** 팀 멤버 목록 조회 훅 */
export function useTeamMembers(teamId: string | null) {
  return useQuery({
    queryKey: [...TEAM_MEMBERS_QUERY_KEY, teamId],
    queryFn: () => getTeamMembers(teamId!),
    enabled: !!teamId,
  });
}

/** 팀 생성 뮤테이션 */
export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateTeamRequest) => createTeam(request),
    onSuccess: () => {
      toast.success("팀이 생성되었습니다");
      queryClient.invalidateQueries({ queryKey: TEAMS_QUERY_KEY });
    },
    onError: () => {
      toast.error("팀 생성에 실패했습니다");
    },
  });
}

/** 팀 수정 뮤테이션 */
export function useUpdateTeam(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateTeamRequest) => updateTeam(teamId, request),
    onSuccess: () => {
      toast.success("팀 정보가 수정되었습니다");
      queryClient.invalidateQueries({ queryKey: TEAMS_QUERY_KEY });
    },
    onError: () => {
      toast.error("팀 수정에 실패했습니다");
    },
  });
}

/** 팀 삭제 뮤테이션 */
export function useDeleteTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamId: string) => deleteTeam(teamId),
    onSuccess: () => {
      toast.success("팀이 삭제되었습니다");
      queryClient.invalidateQueries({ queryKey: TEAMS_QUERY_KEY });
    },
    onError: () => {
      toast.error("팀 삭제에 실패했습니다");
    },
  });
}

/** 팀 멤버 추가 뮤테이션 */
export function useAddTeamMembers(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userIds: string[]) => addTeamMembers(teamId, userIds),
    onSuccess: (data) => {
      toast.success(`${data.count}명의 멤버를 추가했습니다`);
      queryClient.invalidateQueries({ queryKey: [...TEAM_MEMBERS_QUERY_KEY, teamId] });
      queryClient.invalidateQueries({ queryKey: TEAMS_QUERY_KEY });
    },
    onError: () => {
      toast.error("멤버 추가에 실패했습니다");
    },
  });
}

/** 팀 멤버 제거 뮤테이션 */
export function useRemoveTeamMembers(teamId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userIds: string[]) => removeTeamMembers(teamId, userIds),
    onSuccess: () => {
      toast.success("멤버를 제거했습니다");
      queryClient.invalidateQueries({ queryKey: [...TEAM_MEMBERS_QUERY_KEY, teamId] });
      queryClient.invalidateQueries({ queryKey: TEAMS_QUERY_KEY });
    },
    onError: () => {
      toast.error("멤버 제거에 실패했습니다");
    },
  });
}
