import { mutationOptions, queryOptions } from "@tanstack/react-query";
import {
  addChangeRequestFiles,
  closeChangeRequest,
  createChangeRequest,
  createChangeRequestComment,
  deleteChangeRequestComment,
  deleteChangeRequestFile,
  fetchChangeRequestDetail,
  fetchChangeRequestTimeline,
  mergeChangeRequest,
  reopenChangeRequest,
  submitChangeRequest,
  syncChangeRequestAssignees,
  syncChangeRequestIssues,
  syncChangeRequestLabels,
  syncChangeRequestParts,
  syncChangeRequestReviewers,
  updateChangeRequest,
  updateChangeRequestComment,
} from "@/features/change-request/api/change-request.api";
import type {
  AddChangeRequestFilesRequestDto,
  CreateChangeRequestCommentRequestDto,
  CreateChangeRequestDto,
  SyncChangeRequestAssigneesRequestDto,
  SyncChangeRequestIssuesRequestDto,
  SyncChangeRequestLabelsRequestDto,
  SyncChangeRequestPartsRequestDto,
  SyncChangeRequestReviewersRequestDto,
  UpdateChangeRequestCommentRequestDto,
  UpdateChangeRequestDto,
} from "@/features/change-request/api/change-request.types";

export const changeRequestKeys = {
  all: ["change-request"] as const,
  detail: (changeNumber: number) => ["change-request", changeNumber, "detail"] as const,
  timeline: (changeNumber: number) => ["change-request", changeNumber, "timeline"] as const,
};

export const changeRequestQueries = {
  detail: (changeNumber: number) =>
    queryOptions({
      queryKey: changeRequestKeys.detail(changeNumber),
      queryFn: () => fetchChangeRequestDetail(changeNumber),
      staleTime: 30_000,
    }),
  timeline: (changeNumber: number) =>
    queryOptions({
      queryKey: changeRequestKeys.timeline(changeNumber),
      queryFn: () => fetchChangeRequestTimeline(changeNumber),
      staleTime: 10_000,
    }),
};

export const changeRequestMutations = {
  create: () =>
    mutationOptions({
      mutationKey: ["change-request", "create"],
      mutationFn: (request: CreateChangeRequestDto) => createChangeRequest(request),
    }),
  update: (changeNumber: number) =>
    mutationOptions({
      mutationKey: ["change-request", changeNumber, "update"],
      mutationFn: (request: UpdateChangeRequestDto) => updateChangeRequest(changeNumber, request),
    }),
  syncIssues: (changeNumber: number) =>
    mutationOptions({
      mutationKey: ["change-request", changeNumber, "sync-issues"],
      mutationFn: (request: SyncChangeRequestIssuesRequestDto) => syncChangeRequestIssues(changeNumber, request),
    }),
  syncAssignees: (changeNumber: number) =>
    mutationOptions({
      mutationKey: ["change-request", changeNumber, "sync-assignees"],
      mutationFn: (request: SyncChangeRequestAssigneesRequestDto) => syncChangeRequestAssignees(changeNumber, request),
    }),
  syncReviewers: (changeNumber: number) =>
    mutationOptions({
      mutationKey: ["change-request", changeNumber, "sync-reviewers"],
      mutationFn: (request: SyncChangeRequestReviewersRequestDto) => syncChangeRequestReviewers(changeNumber, request),
    }),
  syncLabels: (changeNumber: number) =>
    mutationOptions({
      mutationKey: ["change-request", changeNumber, "sync-labels"],
      mutationFn: (request: SyncChangeRequestLabelsRequestDto) => syncChangeRequestLabels(changeNumber, request),
    }),
  syncParts: (changeNumber: number) =>
    mutationOptions({
      mutationKey: ["change-request", changeNumber, "sync-parts"],
      mutationFn: (request: SyncChangeRequestPartsRequestDto) => syncChangeRequestParts(changeNumber, request),
    }),
  submit: (changeNumber: number) =>
    mutationOptions({
      mutationKey: ["change-request", changeNumber, "submit"],
      mutationFn: () => submitChangeRequest(changeNumber),
    }),
  merge: (changeNumber: number) =>
    mutationOptions({
      mutationKey: ["change-request", changeNumber, "merge"],
      mutationFn: () => mergeChangeRequest(changeNumber),
    }),
  close: (changeNumber: number) =>
    mutationOptions({
      mutationKey: ["change-request", changeNumber, "close"],
      mutationFn: () => closeChangeRequest(changeNumber),
    }),
  reopen: (changeNumber: number) =>
    mutationOptions({
      mutationKey: ["change-request", changeNumber, "reopen"],
      mutationFn: () => reopenChangeRequest(changeNumber),
    }),
  createComment: (changeNumber: number) =>
    mutationOptions({
      mutationKey: ["change-request", changeNumber, "create-comment"],
      mutationFn: (request: CreateChangeRequestCommentRequestDto) => createChangeRequestComment(changeNumber, request),
    }),
  updateComment: (changeNumber: number, commentId: string) =>
    mutationOptions({
      mutationKey: ["change-request", changeNumber, "update-comment", commentId],
      mutationFn: (request: UpdateChangeRequestCommentRequestDto) =>
        updateChangeRequestComment(changeNumber, commentId, request),
    }),
  deleteComment: (changeNumber: number, commentId: string) =>
    mutationOptions({
      mutationKey: ["change-request", changeNumber, "delete-comment", commentId],
      mutationFn: () => deleteChangeRequestComment(changeNumber, commentId),
    }),
  addFiles: (changeNumber: number) =>
    mutationOptions({
      mutationKey: ["change-request", changeNumber, "add-files"],
      mutationFn: (request: AddChangeRequestFilesRequestDto) => addChangeRequestFiles(changeNumber, request),
    }),
  deleteFile: (changeNumber: number, fileId: string) =>
    mutationOptions({
      mutationKey: ["change-request", changeNumber, "delete-file", fileId],
      mutationFn: () => deleteChangeRequestFile(changeNumber, fileId),
    }),
};
