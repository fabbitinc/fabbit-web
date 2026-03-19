import { mutationOptions, queryOptions } from "@tanstack/react-query";
import {
  addEngineeringChangeFiles,
  createEngineeringChange,
  createEngineeringChangeComment,
  deleteEngineeringChangeComment,
  deleteEngineeringChangeFile,
  fetchEngineeringChangeDetail,
  fetchEngineeringChangeTimeline,
  replaceEngineeringChangeSteps,
  submitEngineeringChange,
  syncEngineeringChangeIssues,
  updateEngineeringChange,
  updateEngineeringChangeComment,
} from "@/features/engineering-change/api/engineering-change.api";
import type {
  AddEngineeringChangeFilesRequestDto,
  CreateEngineeringChangeCommentRequestDto,
  CreateEngineeringChangeDto,
  ReplaceEngineeringChangeStepsRequestDto,
  SyncEngineeringChangeIssuesRequestDto,
  UpdateEngineeringChangeCommentRequestDto,
  UpdateEngineeringChangeDto,
} from "@/features/engineering-change/api/engineering-change.types";

export const engineeringChangeKeys = {
  all: ["engineering-change"] as const,
  detail: (engineeringChangeId: string) => ["engineering-change", engineeringChangeId, "detail"] as const,
  timeline: (engineeringChangeId: string) => ["engineering-change", engineeringChangeId, "timeline"] as const,
};

export const engineeringChangeQueries = {
  detail: (engineeringChangeId: string) =>
    queryOptions({
      queryKey: engineeringChangeKeys.detail(engineeringChangeId),
      queryFn: () => fetchEngineeringChangeDetail(engineeringChangeId),
      staleTime: 30_000,
    }),
  timeline: (engineeringChangeId: string) =>
    queryOptions({
      queryKey: engineeringChangeKeys.timeline(engineeringChangeId),
      queryFn: () => fetchEngineeringChangeTimeline(engineeringChangeId),
      staleTime: 10_000,
    }),
};

export const engineeringChangeMutations = {
  create: () =>
    mutationOptions({
      mutationKey: ["engineering-change", "create"],
      mutationFn: (request: CreateEngineeringChangeDto) => createEngineeringChange(request),
    }),
  update: (engineeringChangeId: string) =>
    mutationOptions({
      mutationKey: ["engineering-change", engineeringChangeId, "update"],
      mutationFn: (request: UpdateEngineeringChangeDto) => updateEngineeringChange(engineeringChangeId, request),
    }),
  syncIssues: (engineeringChangeId: string) =>
    mutationOptions({
      mutationKey: ["engineering-change", engineeringChangeId, "sync-issues"],
      mutationFn: (request: SyncEngineeringChangeIssuesRequestDto) =>
        syncEngineeringChangeIssues(engineeringChangeId, request),
    }),
  syncReviewers: (engineeringChangeId: string) =>
    mutationOptions({
      mutationKey: ["engineering-change", engineeringChangeId, "sync-reviewers"],
      mutationFn: (request: ReplaceEngineeringChangeStepsRequestDto) =>
        replaceEngineeringChangeSteps(engineeringChangeId, request),
    }),
  submit: (engineeringChangeId: string) =>
    mutationOptions({
      mutationKey: ["engineering-change", engineeringChangeId, "submit"],
      mutationFn: () => submitEngineeringChange(engineeringChangeId),
    }),
  createComment: (engineeringChangeId: string) =>
    mutationOptions({
      mutationKey: ["engineering-change", engineeringChangeId, "create-comment"],
      mutationFn: (request: CreateEngineeringChangeCommentRequestDto) =>
        createEngineeringChangeComment(engineeringChangeId, request),
    }),
  updateComment: (engineeringChangeId: string, commentId: string) =>
    mutationOptions({
      mutationKey: ["engineering-change", engineeringChangeId, "update-comment", commentId],
      mutationFn: (request: UpdateEngineeringChangeCommentRequestDto) =>
        updateEngineeringChangeComment(engineeringChangeId, commentId, request),
    }),
  deleteComment: (engineeringChangeId: string, commentId: string) =>
    mutationOptions({
      mutationKey: ["engineering-change", engineeringChangeId, "delete-comment", commentId],
      mutationFn: () => deleteEngineeringChangeComment(engineeringChangeId, commentId),
    }),
  addFiles: (engineeringChangeId: string) =>
    mutationOptions({
      mutationKey: ["engineering-change", engineeringChangeId, "add-files"],
      mutationFn: (request: AddEngineeringChangeFilesRequestDto) =>
        addEngineeringChangeFiles(engineeringChangeId, request),
    }),
  deleteFile: (engineeringChangeId: string, fileId: string) =>
    mutationOptions({
      mutationKey: ["engineering-change", engineeringChangeId, "delete-file", fileId],
      mutationFn: () => deleteEngineeringChangeFile(engineeringChangeId, fileId),
    }),
};
