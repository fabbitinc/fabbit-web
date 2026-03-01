import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getProjectChanges,
  getProjectChange,
  getChangeTimeline,
  createProjectChange,
  syncChangeAssignees,
  syncChangeReviewers,
  getChangeLabels,
  syncChangeLabels,
  syncChangeParts,
  attachChangeFiles,
  deleteChangeFile,
  createChangeComment,
  updateChangeComment,
  deleteChangeComment,
} from "../change";
import { createFileUpload, uploadFileToPresignedUrl, completeFileUpload } from "../file";
import type { CreateChangeRequest } from "../types";
import { PROJECT_LABELS_QUERY_KEY } from "./useLabels";

export const PROJECT_CHANGES_QUERY_KEY = ["projectChanges"] as const;
export const PROJECT_CHANGE_DETAIL_QUERY_KEY = ["projectChangeDetail"] as const;
export const PROJECT_CHANGE_TIMELINE_QUERY_KEY = ["projectChangeTimeline"] as const;

/** 프로젝트 변경 반영 목록 조회 훅 */
export function useProjectChanges(projectId: string | undefined) {
  return useQuery({
    queryKey: [...PROJECT_CHANGES_QUERY_KEY, projectId],
    queryFn: () => getProjectChanges(projectId!),
    enabled: !!projectId,
  });
}

/** 프로젝트 변경 반영 상세 조회 훅 */
export function useProjectChange(projectId: string | undefined, changeNumber: string | undefined) {
  return useQuery({
    queryKey: [...PROJECT_CHANGE_DETAIL_QUERY_KEY, projectId, changeNumber],
    queryFn: () => getProjectChange(projectId!, changeNumber!),
    enabled: !!projectId && !!changeNumber,
  });
}

/** 변경 반영 타임라인 조회 훅 */
export function useChangeTimeline(projectId: string | undefined, changeNumber: string | undefined) {
  return useQuery({
    queryKey: [...PROJECT_CHANGE_TIMELINE_QUERY_KEY, projectId, changeNumber],
    queryFn: () => getChangeTimeline(projectId!, changeNumber!),
    enabled: !!projectId && !!changeNumber,
  });
}

/** 프로젝트 변경 반영 생성 훅 */
export function useCreateProjectChange(projectId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateChangeRequest) => createProjectChange(projectId!, request),
    onSuccess: () => {
      toast.success("변경 반영이 생성되었습니다");
      queryClient.invalidateQueries({ queryKey: [...PROJECT_CHANGES_QUERY_KEY, projectId] });
    },
    onError: () => {
      toast.error("변경 반영 생성에 실패했습니다");
    },
  });
}

/** 변경 반영 담당자 동기화 훅 */
export function useSyncChangeAssignees(projectId: string | undefined, changeNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userIds: string[]) => syncChangeAssignees(projectId!, changeNumber!, userIds),
    onSuccess: () => {
      toast.success("담당자를 적용했습니다");
      queryClient.invalidateQueries({ queryKey: [...PROJECT_CHANGES_QUERY_KEY, projectId] });
      queryClient.invalidateQueries({ queryKey: [...PROJECT_CHANGE_DETAIL_QUERY_KEY, projectId, changeNumber] });
      queryClient.invalidateQueries({ queryKey: [...PROJECT_CHANGE_TIMELINE_QUERY_KEY, projectId, changeNumber] });
    },
    onError: () => {
      toast.error("담당자 적용에 실패했습니다");
    },
  });
}

/** 변경 반영 검토자 동기화 훅 */
export function useSyncChangeReviewers(projectId: string | undefined, changeNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userIds: string[]) => syncChangeReviewers(projectId!, changeNumber!, userIds),
    onSuccess: () => {
      toast.success("검토자를 적용했습니다");
      queryClient.invalidateQueries({ queryKey: [...PROJECT_CHANGES_QUERY_KEY, projectId] });
      queryClient.invalidateQueries({ queryKey: [...PROJECT_CHANGE_DETAIL_QUERY_KEY, projectId, changeNumber] });
      queryClient.invalidateQueries({ queryKey: [...PROJECT_CHANGE_TIMELINE_QUERY_KEY, projectId, changeNumber] });
    },
    onError: () => {
      toast.error("검토자 적용에 실패했습니다");
    },
  });
}

/** 변경 반영용 프로젝트 라벨 목록 조회 훅 */
export function useChangeLabels(projectId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: [...PROJECT_LABELS_QUERY_KEY, projectId, "change"],
    queryFn: () => getChangeLabels(projectId!),
    enabled: !!projectId && enabled,
  });
}

/** 변경 반영 라벨 동기화 훅 */
export function useSyncChangeLabels(projectId: string | undefined, changeNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (labelIds: string[]) => syncChangeLabels(projectId!, changeNumber!, labelIds),
    onSuccess: () => {
      toast.success("라벨을 적용했습니다");
      queryClient.invalidateQueries({ queryKey: [...PROJECT_CHANGES_QUERY_KEY, projectId] });
      queryClient.invalidateQueries({ queryKey: [...PROJECT_CHANGE_DETAIL_QUERY_KEY, projectId, changeNumber] });
      queryClient.invalidateQueries({ queryKey: [...PROJECT_CHANGE_TIMELINE_QUERY_KEY, projectId, changeNumber] });
    },
    onError: () => {
      toast.error("라벨 적용에 실패했습니다");
    },
  });
}

/** 변경 반영 부품 동기화 훅 */
export function useSyncChangeParts(projectId: string | undefined, changeNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (partIds: string[]) => syncChangeParts(projectId!, changeNumber!, partIds),
    onSuccess: () => {
      toast.success("부품을 적용했습니다");
      queryClient.invalidateQueries({ queryKey: [...PROJECT_CHANGES_QUERY_KEY, projectId] });
      queryClient.invalidateQueries({ queryKey: [...PROJECT_CHANGE_DETAIL_QUERY_KEY, projectId, changeNumber] });
      queryClient.invalidateQueries({ queryKey: [...PROJECT_CHANGE_TIMELINE_QUERY_KEY, projectId, changeNumber] });
    },
    onError: () => {
      toast.error("부품 적용에 실패했습니다");
    },
  });
}

/** 변경 반영 파일 업로드 및 첨부 훅 */
export function useUploadChangeFiles(projectId: string | undefined, changeNumber: string | undefined) {
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
      await attachChangeFiles(projectId!, changeNumber!, fileIds);
    },
    onSuccess: () => {
      toast.success("파일을 첨부했습니다");
      queryClient.invalidateQueries({ queryKey: [...PROJECT_CHANGE_DETAIL_QUERY_KEY, projectId, changeNumber] });
      queryClient.invalidateQueries({ queryKey: [...PROJECT_CHANGE_TIMELINE_QUERY_KEY, projectId, changeNumber] });
    },
    onError: () => {
      toast.error("파일 첨부에 실패했습니다");
    },
  });
}

/** 변경 반영 파일 삭제 훅 */
export function useDeleteChangeFile(projectId: string | undefined, changeNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => deleteChangeFile(projectId!, changeNumber!, fileId),
    onSuccess: () => {
      toast.success("파일을 삭제했습니다");
      queryClient.invalidateQueries({ queryKey: [...PROJECT_CHANGE_DETAIL_QUERY_KEY, projectId, changeNumber] });
      queryClient.invalidateQueries({ queryKey: [...PROJECT_CHANGE_TIMELINE_QUERY_KEY, projectId, changeNumber] });
    },
    onError: () => {
      toast.error("파일 삭제에 실패했습니다");
    },
  });
}

/** 변경 반영 댓글 생성 훅 */
export function useCreateChangeComment(projectId: string | undefined, changeNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Record<string, unknown>) => createChangeComment(projectId!, changeNumber!, body),
    onSuccess: () => {
      toast.success("댓글을 작성했습니다");
      queryClient.invalidateQueries({ queryKey: [...PROJECT_CHANGE_TIMELINE_QUERY_KEY, projectId, changeNumber] });
      queryClient.invalidateQueries({ queryKey: [...PROJECT_CHANGE_DETAIL_QUERY_KEY, projectId, changeNumber] });
      queryClient.invalidateQueries({ queryKey: [...PROJECT_CHANGES_QUERY_KEY, projectId] });
    },
    onError: () => {
      toast.error("댓글 작성에 실패했습니다");
    },
  });
}

/** 변경 반영 댓글 수정 훅 */
export function useUpdateChangeComment(projectId: string | undefined, changeNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, body }: { commentId: string; body: Record<string, unknown> }) =>
      updateChangeComment(projectId!, changeNumber!, commentId, body),
    onSuccess: () => {
      toast.success("댓글을 수정했습니다");
      queryClient.invalidateQueries({ queryKey: [...PROJECT_CHANGE_TIMELINE_QUERY_KEY, projectId, changeNumber] });
    },
    onError: () => {
      toast.error("댓글 수정에 실패했습니다");
    },
  });
}

/** 변경 반영 댓글 삭제 훅 */
export function useDeleteChangeComment(projectId: string | undefined, changeNumber: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => deleteChangeComment(projectId!, changeNumber!, commentId),
    onSuccess: () => {
      toast.success("댓글을 삭제했습니다");
      queryClient.invalidateQueries({ queryKey: [...PROJECT_CHANGE_TIMELINE_QUERY_KEY, projectId, changeNumber] });
      queryClient.invalidateQueries({ queryKey: [...PROJECT_CHANGE_DETAIL_QUERY_KEY, projectId, changeNumber] });
      queryClient.invalidateQueries({ queryKey: [...PROJECT_CHANGES_QUERY_KEY, projectId] });
    },
    onError: () => {
      toast.error("댓글 삭제에 실패했습니다");
    },
  });
}
