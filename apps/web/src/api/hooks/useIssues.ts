import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  assignIssueUsers,
  closeIssue,
  createIssueComment,
  createProjectIssue,
  deleteIssueComment,
  getIssueTimeline,
  getProjectIssue,
  getProjectIssues,
  getIssueLabels,
  reopenIssue,
  syncIssueAssignees,
  syncIssueLabels,
  syncIssueParts,
  attachIssueFiles,
  deleteIssueFile,
  unassignIssueUsers,
  updateIssueComment,
  updateIssue,
} from "../issue";
import type { CreateIssueRequest, UpdateIssueRequest } from "../types";
import { createFileUpload, uploadFileToPresignedUrl, completeFileUpload } from "../file";
import { PROJECT_LABELS_QUERY_KEY } from "./useLabels";
import { PROJECT_QUERY_KEY } from "./useProjects";

export const PROJECT_ISSUES_QUERY_KEY = ["projectIssues"] as const;
export const PROJECT_ISSUE_DETAIL_QUERY_KEY = ["projectIssueDetail"] as const;
export const PROJECT_ISSUE_TIMELINE_QUERY_KEY = ["projectIssueTimeline"] as const;

/** 프로젝트 이슈 목록 조회 훅 */
export function useProjectIssues(projectId: string | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...PROJECT_ISSUES_QUERY_KEY, projectId],
    queryFn: () => getProjectIssues(projectId!),
    enabled: !!projectId && (options?.enabled ?? true),
  });
}

/** 프로젝트 이슈 상세 조회 훅 */
export function useProjectIssue(projectId: string | undefined, issueNumber: string | undefined) {
  return useQuery({
    queryKey: [...PROJECT_ISSUE_DETAIL_QUERY_KEY, projectId, issueNumber],
    queryFn: () => getProjectIssue(projectId!, issueNumber!),
    enabled: !!projectId && !!issueNumber,
  });
}

/** 이슈 타임라인 조회 훅 */
export function useIssueTimeline(projectId: string | undefined, issueNumber: string | undefined) {
  return useQuery({
    queryKey: [...PROJECT_ISSUE_TIMELINE_QUERY_KEY, projectId, issueNumber],
    queryFn: () => getIssueTimeline(projectId!, issueNumber!),
    enabled: !!projectId && !!issueNumber,
  });
}

/** 이슈용 프로젝트 라벨 목록 조회 훅 (IssueLabelDto[] 반환) */
export function useIssueLabels(projectId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: [...PROJECT_LABELS_QUERY_KEY, projectId, "issue"],
    queryFn: () => getIssueLabels(projectId!),
    enabled: !!projectId && enabled,
  });
}

/** 프로젝트 이슈 생성 훅 */
export function useCreateProjectIssue(projectId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateIssueRequest) => createProjectIssue(projectId!, request),
    onSuccess: () => {
      toast.success("이슈가 생성되었습니다");
      queryClient.invalidateQueries({ queryKey: [...PROJECT_ISSUES_QUERY_KEY, projectId] });
      queryClient.invalidateQueries({ queryKey: [...PROJECT_QUERY_KEY, projectId] });
    },
    onError: () => {
      toast.error("이슈 생성에 실패했습니다");
    },
  });
}

/** 이슈 담당자 추가 훅 */
export function useAssignIssueUsers(projectId: string | undefined, issueNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userIds: string[]) => assignIssueUsers(projectId!, issueNumber!, userIds),
    onSuccess: () => {
      toast.success("담당자를 추가했습니다");
      queryClient.invalidateQueries({ queryKey: [...PROJECT_ISSUES_QUERY_KEY, projectId] });
      queryClient.invalidateQueries({ queryKey: [...PROJECT_ISSUE_DETAIL_QUERY_KEY, projectId, issueNumber] });
      queryClient.invalidateQueries({ queryKey: [...PROJECT_ISSUE_TIMELINE_QUERY_KEY, projectId, issueNumber] });
    },
    onError: () => {
      toast.error("담당자 추가에 실패했습니다");
    },
  });
}

/** 이슈 담당자 제거 훅 */
export function useUnassignIssueUsers(projectId: string | undefined, issueNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userIds: string[]) => unassignIssueUsers(projectId!, issueNumber!, userIds),
    onSuccess: () => {
      toast.success("담당자를 제거했습니다");
      queryClient.invalidateQueries({ queryKey: [...PROJECT_ISSUES_QUERY_KEY, projectId] });
      queryClient.invalidateQueries({ queryKey: [...PROJECT_ISSUE_DETAIL_QUERY_KEY, projectId, issueNumber] });
      queryClient.invalidateQueries({ queryKey: [...PROJECT_ISSUE_TIMELINE_QUERY_KEY, projectId, issueNumber] });
    },
    onError: () => {
      toast.error("담당자 제거에 실패했습니다");
    },
  });
}

/** 이슈 담당자 동기화 훅 */
export function useSyncIssueAssignees(projectId: string | undefined, issueNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userIds: string[]) => syncIssueAssignees(projectId!, issueNumber!, userIds),
    onSuccess: () => {
      toast.success("담당자를 적용했습니다");
      queryClient.invalidateQueries({ queryKey: [...PROJECT_ISSUES_QUERY_KEY, projectId] });
      queryClient.invalidateQueries({ queryKey: [...PROJECT_ISSUE_DETAIL_QUERY_KEY, projectId, issueNumber] });
      queryClient.invalidateQueries({ queryKey: [...PROJECT_ISSUE_TIMELINE_QUERY_KEY, projectId, issueNumber] });
    },
    onError: () => {
      toast.error("담당자 적용에 실패했습니다");
    },
  });
}

/** 이슈 라벨 동기화 훅 */
export function useSyncIssueLabels(projectId: string | undefined, issueNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (labelIds: string[]) => syncIssueLabels(projectId!, issueNumber!, labelIds),
    onSuccess: () => {
      toast.success("라벨을 적용했습니다");
      queryClient.invalidateQueries({ queryKey: [...PROJECT_ISSUES_QUERY_KEY, projectId] });
      queryClient.invalidateQueries({ queryKey: [...PROJECT_ISSUE_DETAIL_QUERY_KEY, projectId, issueNumber] });
      queryClient.invalidateQueries({ queryKey: [...PROJECT_ISSUE_TIMELINE_QUERY_KEY, projectId, issueNumber] });
    },
    onError: () => {
      toast.error("라벨 적용에 실패했습니다");
    },
  });
}

/** 이슈 부품 동기화 훅 */
export function useSyncIssueParts(projectId: string | undefined, issueNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (partIds: string[]) => syncIssueParts(projectId!, issueNumber!, partIds),
    onSuccess: () => {
      toast.success("부품을 적용했습니다");
      queryClient.invalidateQueries({ queryKey: [...PROJECT_ISSUES_QUERY_KEY, projectId] });
      queryClient.invalidateQueries({ queryKey: [...PROJECT_ISSUE_DETAIL_QUERY_KEY, projectId, issueNumber] });
      queryClient.invalidateQueries({ queryKey: [...PROJECT_ISSUE_TIMELINE_QUERY_KEY, projectId, issueNumber] });
    },
    onError: () => {
      toast.error("부품 적용에 실패했습니다");
    },
  });
}

/** 이슈 파일 업로드 및 첨부 훅 */
export function useUploadIssueFiles(projectId: string | undefined, issueNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (files: File[]) => {
      const fileIds: string[] = [];
      for (const file of files) {
        const { file_id, upload_url } = await createFileUpload({
          original_name: file.name,
          content_type: file.type || "application/octet-stream",
          file_size: file.size,
        });
        await uploadFileToPresignedUrl(upload_url, file, file.type || "application/octet-stream");
        await completeFileUpload(file_id);
        fileIds.push(file_id);
      }
      await attachIssueFiles(projectId!, issueNumber!, fileIds);
    },
    onSuccess: () => {
      toast.success("파일을 첨부했습니다");
      queryClient.invalidateQueries({ queryKey: [...PROJECT_ISSUE_DETAIL_QUERY_KEY, projectId, issueNumber] });
      queryClient.invalidateQueries({ queryKey: [...PROJECT_ISSUE_TIMELINE_QUERY_KEY, projectId, issueNumber] });
    },
    onError: () => {
      toast.error("파일 첨부에 실패했습니다");
    },
  });
}

/** 이슈 파일 삭제 훅 */
export function useDeleteIssueFile(projectId: string | undefined, issueNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => deleteIssueFile(projectId!, issueNumber!, fileId),
    onSuccess: () => {
      toast.success("파일을 삭제했습니다");
      queryClient.invalidateQueries({ queryKey: [...PROJECT_ISSUE_DETAIL_QUERY_KEY, projectId, issueNumber] });
      queryClient.invalidateQueries({ queryKey: [...PROJECT_ISSUE_TIMELINE_QUERY_KEY, projectId, issueNumber] });
    },
    onError: () => {
      toast.error("파일 삭제에 실패했습니다");
    },
  });
}

/** 이슈 댓글 생성 훅 */
export function useCreateIssueComment(projectId: string | undefined, issueNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Record<string, unknown>) => createIssueComment(projectId!, issueNumber!, body),
    onSuccess: () => {
      toast.success("댓글을 작성했습니다");
      queryClient.invalidateQueries({ queryKey: [...PROJECT_ISSUE_TIMELINE_QUERY_KEY, projectId, issueNumber] });
      queryClient.invalidateQueries({ queryKey: [...PROJECT_ISSUE_DETAIL_QUERY_KEY, projectId, issueNumber] });
      queryClient.invalidateQueries({ queryKey: [...PROJECT_ISSUES_QUERY_KEY, projectId] });
    },
    onError: () => {
      toast.error("댓글 작성에 실패했습니다");
    },
  });
}

/** 이슈 댓글 수정 훅 */
export function useUpdateIssueComment(projectId: string | undefined, issueNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, body }: { commentId: string; body: Record<string, unknown> }) =>
      updateIssueComment(projectId!, issueNumber!, commentId, body),
    onSuccess: async () => {
      toast.success("댓글을 수정했습니다");
      await queryClient.invalidateQueries({ queryKey: [...PROJECT_ISSUE_TIMELINE_QUERY_KEY, projectId, issueNumber] });
    },
    onError: () => {
      toast.error("댓글 수정에 실패했습니다");
    },
  });
}

/** 이슈 닫기 훅 */
export function useCloseIssue(projectId: string | undefined, issueNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => closeIssue(projectId!, issueNumber!),
    onSuccess: () => {
      toast.success("이슈를 닫았습니다");
      queryClient.invalidateQueries({ queryKey: [...PROJECT_ISSUES_QUERY_KEY, projectId] });
      queryClient.invalidateQueries({ queryKey: [...PROJECT_ISSUE_DETAIL_QUERY_KEY, projectId, issueNumber] });
      queryClient.invalidateQueries({ queryKey: [...PROJECT_ISSUE_TIMELINE_QUERY_KEY, projectId, issueNumber] });
      queryClient.invalidateQueries({ queryKey: [...PROJECT_QUERY_KEY, projectId] });
    },
    onError: () => {
      toast.error("이슈 닫기에 실패했습니다");
    },
  });
}

/** 이슈 다시 열기 훅 */
export function useReopenIssue(projectId: string | undefined, issueNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => reopenIssue(projectId!, issueNumber!),
    onSuccess: () => {
      toast.success("이슈를 다시 열었습니다");
      queryClient.invalidateQueries({ queryKey: [...PROJECT_ISSUES_QUERY_KEY, projectId] });
      queryClient.invalidateQueries({ queryKey: [...PROJECT_ISSUE_DETAIL_QUERY_KEY, projectId, issueNumber] });
      queryClient.invalidateQueries({ queryKey: [...PROJECT_ISSUE_TIMELINE_QUERY_KEY, projectId, issueNumber] });
      queryClient.invalidateQueries({ queryKey: [...PROJECT_QUERY_KEY, projectId] });
    },
    onError: () => {
      toast.error("이슈 다시 열기에 실패했습니다");
    },
  });
}

/** 이슈 수정 (제목/본문) 훅 */
export function useUpdateIssue(projectId: string | undefined, issueNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateIssueRequest) => updateIssue(projectId!, issueNumber!, request),
    onSuccess: async () => {
      toast.success("이슈를 수정했습니다");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [...PROJECT_ISSUES_QUERY_KEY, projectId] }),
        queryClient.invalidateQueries({ queryKey: [...PROJECT_ISSUE_DETAIL_QUERY_KEY, projectId, issueNumber] }),
      ]);
    },
    onError: () => {
      toast.error("이슈 수정에 실패했습니다");
    },
  });
}

/** 이슈 댓글 삭제 훅 */
export function useDeleteIssueComment(projectId: string | undefined, issueNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => deleteIssueComment(projectId!, issueNumber!, commentId),
    onSuccess: () => {
      toast.success("댓글을 삭제했습니다");
      queryClient.invalidateQueries({ queryKey: [...PROJECT_ISSUE_TIMELINE_QUERY_KEY, projectId, issueNumber] });
      queryClient.invalidateQueries({ queryKey: [...PROJECT_ISSUE_DETAIL_QUERY_KEY, projectId, issueNumber] });
      queryClient.invalidateQueries({ queryKey: [...PROJECT_ISSUES_QUERY_KEY, projectId] });
    },
    onError: () => {
      toast.error("댓글 삭제에 실패했습니다");
    },
  });
}
