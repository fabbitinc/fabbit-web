import { mutationOptions, queryOptions } from "@tanstack/react-query";
import {
  addEngineeringChangeFiles,
  closeEngineeringChange,
  createEngineeringChange,
  createEngineeringChangeComment,
  deleteEngineeringChangeComment,
  deleteEngineeringChangeFile,
  fetchEngineeringChangeDetail,
  fetchEngineeringChangeTimeline,
  mergeEngineeringChange,
  reopenEngineeringChange,
  submitEngineeringChange,
  syncEngineeringChangeAssignees,
  syncEngineeringChangeIssues,
  syncEngineeringChangeLabels,
  syncEngineeringChangeParts,
  syncEngineeringChangeReviewers,
  updateEngineeringChange,
  updateEngineeringChangeComment,
} from "@/features/engineering-change/api/engineering-change.api";
import type {
  AddEngineeringChangeFilesRequestDto,
  CreateEngineeringChangeCommentRequestDto,
  CreateEngineeringChangeDto,
  SyncEngineeringChangeAssigneesRequestDto,
  SyncEngineeringChangeIssuesRequestDto,
  SyncEngineeringChangeLabelsRequestDto,
  SyncEngineeringChangePartsRequestDto,
  SyncEngineeringChangeReviewersRequestDto,
  UpdateEngineeringChangeCommentRequestDto,
  UpdateEngineeringChangeDto,
} from "@/features/engineering-change/api/engineering-change.types";

export const engineeringChangeKeys = {
  all: ["engineering-change"] as const,
  detail: (changeNumber: number) => ["engineering-change", changeNumber, "detail"] as const,
  timeline: (changeNumber: number) => ["engineering-change", changeNumber, "timeline"] as const,
};

export const engineeringChangeQueries = {
  detail: (changeNumber: number) =>
    queryOptions({
      queryKey: engineeringChangeKeys.detail(changeNumber),
      queryFn: () => fetchEngineeringChangeDetail(changeNumber),
      staleTime: 30_000,
    }),
  timeline: (changeNumber: number) =>
    queryOptions({
      queryKey: engineeringChangeKeys.timeline(changeNumber),
      queryFn: () => fetchEngineeringChangeTimeline(changeNumber),
      staleTime: 10_000,
    }),
};

export const engineeringChangeMutations = {
  create: () =>
    mutationOptions({
      mutationKey: ["engineering-change", "create"],
      mutationFn: (request: CreateEngineeringChangeDto) => createEngineeringChange(request),
    }),
  update: (changeNumber: number) =>
    mutationOptions({
      mutationKey: ["engineering-change", changeNumber, "update"],
      mutationFn: (request: UpdateEngineeringChangeDto) => updateEngineeringChange(changeNumber, request),
    }),
  syncIssues: (changeNumber: number) =>
    mutationOptions({
      mutationKey: ["engineering-change", changeNumber, "sync-issues"],
      mutationFn: (request: SyncEngineeringChangeIssuesRequestDto) => syncEngineeringChangeIssues(changeNumber, request),
    }),
  syncAssignees: (changeNumber: number) =>
    mutationOptions({
      mutationKey: ["engineering-change", changeNumber, "sync-assignees"],
      mutationFn: (request: SyncEngineeringChangeAssigneesRequestDto) => syncEngineeringChangeAssignees(changeNumber, request),
    }),
  syncReviewers: (changeNumber: number) =>
    mutationOptions({
      mutationKey: ["engineering-change", changeNumber, "sync-reviewers"],
      mutationFn: (request: SyncEngineeringChangeReviewersRequestDto) => syncEngineeringChangeReviewers(changeNumber, request),
    }),
  syncLabels: (changeNumber: number) =>
    mutationOptions({
      mutationKey: ["engineering-change", changeNumber, "sync-labels"],
      mutationFn: (request: SyncEngineeringChangeLabelsRequestDto) => syncEngineeringChangeLabels(changeNumber, request),
    }),
  syncParts: (changeNumber: number) =>
    mutationOptions({
      mutationKey: ["engineering-change", changeNumber, "sync-parts"],
      mutationFn: (request: SyncEngineeringChangePartsRequestDto) => syncEngineeringChangeParts(changeNumber, request),
    }),
  submit: (changeNumber: number) =>
    mutationOptions({
      mutationKey: ["engineering-change", changeNumber, "submit"],
      mutationFn: () => submitEngineeringChange(changeNumber),
    }),
  merge: (changeNumber: number) =>
    mutationOptions({
      mutationKey: ["engineering-change", changeNumber, "merge"],
      mutationFn: () => mergeEngineeringChange(changeNumber),
    }),
  close: (changeNumber: number) =>
    mutationOptions({
      mutationKey: ["engineering-change", changeNumber, "close"],
      mutationFn: () => closeEngineeringChange(changeNumber),
    }),
  reopen: (changeNumber: number) =>
    mutationOptions({
      mutationKey: ["engineering-change", changeNumber, "reopen"],
      mutationFn: () => reopenEngineeringChange(changeNumber),
    }),
  createComment: (changeNumber: number) =>
    mutationOptions({
      mutationKey: ["engineering-change", changeNumber, "create-comment"],
      mutationFn: (request: CreateEngineeringChangeCommentRequestDto) => createEngineeringChangeComment(changeNumber, request),
    }),
  updateComment: (changeNumber: number, commentId: string) =>
    mutationOptions({
      mutationKey: ["engineering-change", changeNumber, "update-comment", commentId],
      mutationFn: (request: UpdateEngineeringChangeCommentRequestDto) =>
        updateEngineeringChangeComment(changeNumber, commentId, request),
    }),
  deleteComment: (changeNumber: number, commentId: string) =>
    mutationOptions({
      mutationKey: ["engineering-change", changeNumber, "delete-comment", commentId],
      mutationFn: () => deleteEngineeringChangeComment(changeNumber, commentId),
    }),
  addFiles: (changeNumber: number) =>
    mutationOptions({
      mutationKey: ["engineering-change", changeNumber, "add-files"],
      mutationFn: (request: AddEngineeringChangeFilesRequestDto) => addEngineeringChangeFiles(changeNumber, request),
    }),
  deleteFile: (changeNumber: number, fileId: string) =>
    mutationOptions({
      mutationKey: ["engineering-change", changeNumber, "delete-file", fileId],
      mutationFn: () => deleteEngineeringChangeFile(changeNumber, fileId),
    }),
};
