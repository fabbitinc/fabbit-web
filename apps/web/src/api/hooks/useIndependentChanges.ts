import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getChanges,
  getChange,
  getChangeTimeline,
  createChange,
  updateChange,
  syncChangeAssignees,
  syncChangeReviewers,
  syncChangeLabels,
  syncChangeParts,
  attachChangeFiles,
  deleteChangeFile,
  createChangeComment,
  updateChangeComment,
  deleteChangeComment,
  syncChangeIssues,
  closeChange,
  mergeChange,
  submitChange,
  reopenChange,
} from "../independent-change";
import {
  createFileUpload,
  uploadFileToPresignedUrl,
  completeFileUpload,
} from "../file";
import type { CreateChangeRequest, UpdateChangeRequest } from "../types";

export const CHANGES_QUERY_KEY = ["changes"] as const;
export const CHANGE_DETAIL_QUERY_KEY = ["changeDetail"] as const;
export const CHANGE_TIMELINE_QUERY_KEY = ["changeTimeline"] as const;

/** 독립 변경 요청 목록 조회 훅 */
export function useChanges() {
  return useQuery({
    queryKey: [...CHANGES_QUERY_KEY],
    queryFn: () => getChanges(),
  });
}

/** 독립 변경 요청 상세 조회 훅 */
export function useChange(changeNumber: string | undefined) {
  return useQuery({
    queryKey: [...CHANGE_DETAIL_QUERY_KEY, changeNumber],
    queryFn: () => getChange(changeNumber!),
    enabled: !!changeNumber,
  });
}

/** 독립 변경 요청 타임라인 조회 훅 */
export function useIndependentChangeTimeline(changeNumber: string | undefined) {
  return useQuery({
    queryKey: [...CHANGE_TIMELINE_QUERY_KEY, changeNumber],
    queryFn: () => getChangeTimeline(changeNumber!),
    enabled: !!changeNumber,
  });
}

/** 독립 변경 요청 생성 훅 */
export function useCreateChange() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateChangeRequest) => createChange(request),
    onSuccess: () => {
      toast.success("변경 요청이 생성되었습니다");
      queryClient.invalidateQueries({ queryKey: [...CHANGES_QUERY_KEY] });
    },
    onError: () => {
      toast.error("변경 요청 생성에 실패했습니다");
    },
  });
}

/** 독립 변경 요청 수정 훅 */
export function useIndependentUpdateChange(changeNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateChangeRequest) => updateChange(changeNumber!, request),
    onSuccess: async () => {
      toast.success("변경 요청을 수정했습니다");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [...CHANGES_QUERY_KEY] }),
        queryClient.invalidateQueries({ queryKey: [...CHANGE_DETAIL_QUERY_KEY, changeNumber] }),
      ]);
    },
    onError: () => {
      toast.error("변경 요청 수정에 실패했습니다");
    },
  });
}

/** 독립 변경 요청 담당자 동기화 훅 */
export function useIndependentSyncChangeAssignees(changeNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userIds: string[]) => syncChangeAssignees(changeNumber!, userIds),
    onSuccess: () => {
      toast.success("담당자를 적용했습니다");
      queryClient.invalidateQueries({ queryKey: [...CHANGES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [...CHANGE_DETAIL_QUERY_KEY, changeNumber] });
      queryClient.invalidateQueries({ queryKey: [...CHANGE_TIMELINE_QUERY_KEY, changeNumber] });
    },
    onError: () => {
      toast.error("담당자 적용에 실패했습니다");
    },
  });
}

/** 독립 변경 요청 검토자 동기화 훅 */
export function useIndependentSyncChangeReviewers(changeNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userIds: string[]) => syncChangeReviewers(changeNumber!, userIds),
    onSuccess: () => {
      toast.success("검토자를 적용했습니다");
      queryClient.invalidateQueries({ queryKey: [...CHANGES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [...CHANGE_DETAIL_QUERY_KEY, changeNumber] });
      queryClient.invalidateQueries({ queryKey: [...CHANGE_TIMELINE_QUERY_KEY, changeNumber] });
    },
    onError: () => {
      toast.error("검토자 적용에 실패했습니다");
    },
  });
}

/** 독립 변경 요청 라벨 동기화 훅 */
export function useIndependentSyncChangeLabels(changeNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (labelIds: string[]) => syncChangeLabels(changeNumber!, labelIds),
    onSuccess: () => {
      toast.success("라벨을 적용했습니다");
      queryClient.invalidateQueries({ queryKey: [...CHANGES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [...CHANGE_DETAIL_QUERY_KEY, changeNumber] });
      queryClient.invalidateQueries({ queryKey: [...CHANGE_TIMELINE_QUERY_KEY, changeNumber] });
    },
    onError: () => {
      toast.error("라벨 적용에 실패했습니다");
    },
  });
}

/** 독립 변경 요청 부품 동기화 훅 */
export function useIndependentSyncChangeParts(changeNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (partIds: string[]) => syncChangeParts(changeNumber!, partIds),
    onSuccess: () => {
      toast.success("부품을 적용했습니다");
      queryClient.invalidateQueries({ queryKey: [...CHANGES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [...CHANGE_DETAIL_QUERY_KEY, changeNumber] });
      queryClient.invalidateQueries({ queryKey: [...CHANGE_TIMELINE_QUERY_KEY, changeNumber] });
    },
    onError: () => {
      toast.error("부품 적용에 실패했습니다");
    },
  });
}

/** 독립 변경 요청 파일 업로드 및 첨부 훅 */
export function useIndependentUploadChangeFiles(changeNumber: string | undefined) {
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
      await attachChangeFiles(changeNumber!, fileIds);
    },
    onSuccess: () => {
      toast.success("파일을 첨부했습니다");
      queryClient.invalidateQueries({ queryKey: [...CHANGE_DETAIL_QUERY_KEY, changeNumber] });
      queryClient.invalidateQueries({ queryKey: [...CHANGE_TIMELINE_QUERY_KEY, changeNumber] });
    },
    onError: () => {
      toast.error("파일 첨부에 실패했습니다");
    },
  });
}

/** 독립 변경 요청 파일 삭제 훅 */
export function useIndependentDeleteChangeFile(changeNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => deleteChangeFile(changeNumber!, fileId),
    onSuccess: () => {
      toast.success("파일을 삭제했습니다");
      queryClient.invalidateQueries({ queryKey: [...CHANGE_DETAIL_QUERY_KEY, changeNumber] });
      queryClient.invalidateQueries({ queryKey: [...CHANGE_TIMELINE_QUERY_KEY, changeNumber] });
    },
    onError: () => {
      toast.error("파일 삭제에 실패했습니다");
    },
  });
}

/** 독립 변경 요청 댓글 생성 훅 */
export function useIndependentCreateChangeComment(changeNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Record<string, unknown>) => createChangeComment(changeNumber!, body),
    onSuccess: () => {
      toast.success("댓글을 작성했습니다");
      queryClient.invalidateQueries({ queryKey: [...CHANGE_TIMELINE_QUERY_KEY, changeNumber] });
      queryClient.invalidateQueries({ queryKey: [...CHANGE_DETAIL_QUERY_KEY, changeNumber] });
      queryClient.invalidateQueries({ queryKey: [...CHANGES_QUERY_KEY] });
    },
    onError: () => {
      toast.error("댓글 작성에 실패했습니다");
    },
  });
}

/** 독립 변경 요청 댓글 수정 훅 */
export function useIndependentUpdateChangeComment(changeNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, body }: { commentId: string; body: Record<string, unknown> }) =>
      updateChangeComment(changeNumber!, commentId, body),
    onSuccess: async () => {
      toast.success("댓글을 수정했습니다");
      await queryClient.invalidateQueries({ queryKey: [...CHANGE_TIMELINE_QUERY_KEY, changeNumber] });
    },
    onError: () => {
      toast.error("댓글 수정에 실패했습니다");
    },
  });
}

/** 독립 변경 요청 댓글 삭제 훅 */
export function useIndependentDeleteChangeComment(changeNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => deleteChangeComment(changeNumber!, commentId),
    onSuccess: () => {
      toast.success("댓글을 삭제했습니다");
      queryClient.invalidateQueries({ queryKey: [...CHANGE_TIMELINE_QUERY_KEY, changeNumber] });
      queryClient.invalidateQueries({ queryKey: [...CHANGE_DETAIL_QUERY_KEY, changeNumber] });
      queryClient.invalidateQueries({ queryKey: [...CHANGES_QUERY_KEY] });
    },
    onError: () => {
      toast.error("댓글 삭제에 실패했습니다");
    },
  });
}

/** 독립 변경 요청 이슈 동기화 훅 */
export function useIndependentSyncChangeIssues(changeNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (issueIds: string[]) => syncChangeIssues(changeNumber!, issueIds),
    onSuccess: () => {
      toast.success("이슈를 적용했습니다");
      queryClient.invalidateQueries({ queryKey: [...CHANGE_DETAIL_QUERY_KEY, changeNumber] });
      queryClient.invalidateQueries({ queryKey: [...CHANGE_TIMELINE_QUERY_KEY, changeNumber] });
    },
    onError: () => {
      toast.error("이슈 적용에 실패했습니다");
    },
  });
}

/** 독립 변경 요청 닫기 훅 */
export function useIndependentCloseChange(changeNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => closeChange(changeNumber!),
    onSuccess: () => {
      toast.success("변경 요청을 닫았습니다");
      queryClient.invalidateQueries({ queryKey: [...CHANGES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [...CHANGE_DETAIL_QUERY_KEY, changeNumber] });
      queryClient.invalidateQueries({ queryKey: [...CHANGE_TIMELINE_QUERY_KEY, changeNumber] });
    },
    onError: () => {
      toast.error("변경 요청 닫기에 실패했습니다");
    },
  });
}

/** 독립 변경 요청 반영 (merge) 훅 */
export function useIndependentMergeChange(changeNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => mergeChange(changeNumber!),
    onSuccess: () => {
      toast.success("변경 사항을 반영했습니다");
      queryClient.invalidateQueries({ queryKey: [...CHANGES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [...CHANGE_DETAIL_QUERY_KEY, changeNumber] });
      queryClient.invalidateQueries({ queryKey: [...CHANGE_TIMELINE_QUERY_KEY, changeNumber] });
    },
    onError: () => {
      toast.error("변경 반영에 실패했습니다");
    },
  });
}

/** 독립 변경 요청 제출 훅 */
export function useIndependentSubmitChange(changeNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => submitChange(changeNumber!),
    onSuccess: () => {
      toast.success("변경 요청을 제출했습니다");
      queryClient.invalidateQueries({ queryKey: [...CHANGES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [...CHANGE_DETAIL_QUERY_KEY, changeNumber] });
      queryClient.invalidateQueries({ queryKey: [...CHANGE_TIMELINE_QUERY_KEY, changeNumber] });
    },
    onError: () => {
      toast.error("변경 요청 제출에 실패했습니다");
    },
  });
}

/** 독립 변경 요청 다시 열기 훅 */
export function useIndependentReopenChange(changeNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => reopenChange(changeNumber!),
    onSuccess: () => {
      toast.success("변경 요청을 다시 제출했습니다");
      queryClient.invalidateQueries({ queryKey: [...CHANGES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [...CHANGE_DETAIL_QUERY_KEY, changeNumber] });
      queryClient.invalidateQueries({ queryKey: [...CHANGE_TIMELINE_QUERY_KEY, changeNumber] });
    },
    onError: () => {
      toast.error("변경 요청 다시 제출에 실패했습니다");
    },
  });
}
