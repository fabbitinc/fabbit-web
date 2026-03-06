import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getIssues,
  getIssue,
  getIssueTimeline,
  createIssue,
  updateIssue,
  syncIssueAssignees,
  syncIssueLabels,
  syncIssueChanges,
  syncIssueParts,
  attachIssueFiles,
  deleteIssueFile,
  createIssueComment,
  updateIssueComment,
  deleteIssueComment,
  closeIssue,
  reopenIssue,
} from "../independent-issue";
import type { CreateIssueRequest, UpdateIssueRequest } from "../types";
import { uploadFiles } from "../file";

export const ISSUES_QUERY_KEY = ["issues"] as const;
export const ISSUE_DETAIL_QUERY_KEY = ["issueDetail"] as const;
export const ISSUE_TIMELINE_QUERY_KEY = ["issueTimeline"] as const;

/** 독립 이슈 목록 조회 훅 */
export function useIssues(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...ISSUES_QUERY_KEY],
    queryFn: () => getIssues(),
    enabled: options?.enabled,
  });
}

/** 독립 이슈 상세 조회 훅 */
export function useIssue(issueNumber: string | undefined) {
  return useQuery({
    queryKey: [...ISSUE_DETAIL_QUERY_KEY, issueNumber],
    queryFn: () => getIssue(issueNumber!),
    enabled: !!issueNumber,
  });
}

/** 독립 이슈 타임라인 조회 훅 */
export function useIndependentIssueTimeline(issueNumber: string | undefined) {
  return useQuery({
    queryKey: [...ISSUE_TIMELINE_QUERY_KEY, issueNumber],
    queryFn: () => getIssueTimeline(issueNumber!),
    enabled: !!issueNumber,
  });
}

/** 독립 이슈 생성 훅 */
export function useCreateIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateIssueRequest) => createIssue(request),
    onSuccess: () => {
      toast.success("이슈가 생성되었습니다");
      queryClient.invalidateQueries({ queryKey: [...ISSUES_QUERY_KEY] });
    },
    onError: () => {
      toast.error("이슈 생성에 실패했습니다");
    },
  });
}

/** 독립 이슈 수정 훅 */
export function useIndependentUpdateIssue(issueNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateIssueRequest) => updateIssue(issueNumber!, request),
    onSuccess: async () => {
      toast.success("이슈를 수정했습니다");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [...ISSUES_QUERY_KEY] }),
        queryClient.invalidateQueries({ queryKey: [...ISSUE_DETAIL_QUERY_KEY, issueNumber] }),
      ]);
    },
    onError: () => {
      toast.error("이슈 수정에 실패했습니다");
    },
  });
}

/** 독립 이슈 담당자 동기화 훅 */
export function useIndependentSyncIssueAssignees(issueNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userIds: string[]) => syncIssueAssignees(issueNumber!, userIds),
    onSuccess: () => {
      toast.success("담당자를 적용했습니다");
      queryClient.invalidateQueries({ queryKey: [...ISSUES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [...ISSUE_DETAIL_QUERY_KEY, issueNumber] });
      queryClient.invalidateQueries({ queryKey: [...ISSUE_TIMELINE_QUERY_KEY, issueNumber] });
    },
    onError: () => {
      toast.error("담당자 적용에 실패했습니다");
    },
  });
}

/** 독립 이슈 변경 요청 동기화 훅 */
export function useIndependentSyncIssueChanges(issueNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (crIds: string[]) => syncIssueChanges(issueNumber!, crIds),
    onSuccess: () => {
      toast.success("변경 요청을 적용했습니다");
      queryClient.invalidateQueries({ queryKey: [...ISSUES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [...ISSUE_DETAIL_QUERY_KEY, issueNumber] });
      queryClient.invalidateQueries({ queryKey: [...ISSUE_TIMELINE_QUERY_KEY, issueNumber] });
    },
    onError: () => {
      toast.error("변경 요청 적용에 실패했습니다");
    },
  });
}

/** 독립 이슈 라벨 동기화 훅 */
export function useIndependentSyncIssueLabels(issueNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (labelIds: string[]) => syncIssueLabels(issueNumber!, labelIds),
    onSuccess: () => {
      toast.success("라벨을 적용했습니다");
      queryClient.invalidateQueries({ queryKey: [...ISSUES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [...ISSUE_DETAIL_QUERY_KEY, issueNumber] });
      queryClient.invalidateQueries({ queryKey: [...ISSUE_TIMELINE_QUERY_KEY, issueNumber] });
    },
    onError: () => {
      toast.error("라벨 적용에 실패했습니다");
    },
  });
}

/** 독립 이슈 부품 동기화 훅 */
export function useIndependentSyncIssueParts(issueNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (partIds: string[]) => syncIssueParts(issueNumber!, partIds),
    onSuccess: () => {
      toast.success("부품을 적용했습니다");
      queryClient.invalidateQueries({ queryKey: [...ISSUES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [...ISSUE_DETAIL_QUERY_KEY, issueNumber] });
      queryClient.invalidateQueries({ queryKey: [...ISSUE_TIMELINE_QUERY_KEY, issueNumber] });
    },
    onError: () => {
      toast.error("부품 적용에 실패했습니다");
    },
  });
}

/** 독립 이슈 파일 업로드 및 첨부 훅 */
export function useIndependentUploadIssueFiles(issueNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (files: File[]) => {
      const fileIds = await uploadFiles(files);
      await attachIssueFiles(issueNumber!, fileIds);
    },
    onSuccess: () => {
      toast.success("파일을 첨부했습니다");
      queryClient.invalidateQueries({ queryKey: [...ISSUE_DETAIL_QUERY_KEY, issueNumber] });
      queryClient.invalidateQueries({ queryKey: [...ISSUE_TIMELINE_QUERY_KEY, issueNumber] });
    },
    onError: () => {
      toast.error("파일 첨부에 실패했습니다");
    },
  });
}

/** 독립 이슈 파일 삭제 훅 */
export function useIndependentDeleteIssueFile(issueNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => deleteIssueFile(issueNumber!, fileId),
    onSuccess: () => {
      toast.success("파일을 삭제했습니다");
      queryClient.invalidateQueries({ queryKey: [...ISSUE_DETAIL_QUERY_KEY, issueNumber] });
      queryClient.invalidateQueries({ queryKey: [...ISSUE_TIMELINE_QUERY_KEY, issueNumber] });
    },
    onError: () => {
      toast.error("파일 삭제에 실패했습니다");
    },
  });
}

/** 독립 이슈 댓글 생성 훅 */
export function useIndependentCreateIssueComment(issueNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Record<string, unknown>) => createIssueComment(issueNumber!, body),
    onSuccess: () => {
      toast.success("댓글을 작성했습니다");
      queryClient.invalidateQueries({ queryKey: [...ISSUE_TIMELINE_QUERY_KEY, issueNumber] });
      queryClient.invalidateQueries({ queryKey: [...ISSUE_DETAIL_QUERY_KEY, issueNumber] });
      queryClient.invalidateQueries({ queryKey: [...ISSUES_QUERY_KEY] });
    },
    onError: () => {
      toast.error("댓글 작성에 실패했습니다");
    },
  });
}

/** 독립 이슈 댓글 수정 훅 */
export function useIndependentUpdateIssueComment(issueNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, body }: { commentId: string; body: Record<string, unknown> }) =>
      updateIssueComment(issueNumber!, commentId, body),
    onSuccess: async () => {
      toast.success("댓글을 수정했습니다");
      await queryClient.invalidateQueries({ queryKey: [...ISSUE_TIMELINE_QUERY_KEY, issueNumber] });
    },
    onError: () => {
      toast.error("댓글 수정에 실패했습니다");
    },
  });
}

/** 독립 이슈 댓글 삭제 훅 */
export function useIndependentDeleteIssueComment(issueNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => deleteIssueComment(issueNumber!, commentId),
    onSuccess: () => {
      toast.success("댓글을 삭제했습니다");
      queryClient.invalidateQueries({ queryKey: [...ISSUE_TIMELINE_QUERY_KEY, issueNumber] });
      queryClient.invalidateQueries({ queryKey: [...ISSUE_DETAIL_QUERY_KEY, issueNumber] });
      queryClient.invalidateQueries({ queryKey: [...ISSUES_QUERY_KEY] });
    },
    onError: () => {
      toast.error("댓글 삭제에 실패했습니다");
    },
  });
}

/** 독립 이슈 닫기 훅 */
export function useIndependentCloseIssue(issueNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => closeIssue(issueNumber!),
    onSuccess: () => {
      toast.success("이슈를 닫았습니다");
      queryClient.invalidateQueries({ queryKey: [...ISSUES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [...ISSUE_DETAIL_QUERY_KEY, issueNumber] });
      queryClient.invalidateQueries({ queryKey: [...ISSUE_TIMELINE_QUERY_KEY, issueNumber] });
    },
    onError: () => {
      toast.error("이슈 닫기에 실패했습니다");
    },
  });
}

/** 독립 이슈 다시 열기 훅 */
export function useIndependentReopenIssue(issueNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => reopenIssue(issueNumber!),
    onSuccess: () => {
      toast.success("이슈를 다시 열었습니다");
      queryClient.invalidateQueries({ queryKey: [...ISSUES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [...ISSUE_DETAIL_QUERY_KEY, issueNumber] });
      queryClient.invalidateQueries({ queryKey: [...ISSUE_TIMELINE_QUERY_KEY, issueNumber] });
    },
    onError: () => {
      toast.error("이슈 다시 열기에 실패했습니다");
    },
  });
}
