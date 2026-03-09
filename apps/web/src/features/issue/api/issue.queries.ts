import { mutationOptions, queryOptions } from "@tanstack/react-query";
import {
  addIssueFiles,
  closeIssue,
  createIssue,
  createIssueComment,
  deleteIssueComment,
  deleteIssueFile,
  fetchIssueDetail,
  fetchIssueTimeline,
  reopenIssue,
  syncIssueAssignees,
  syncIssueChanges,
  syncIssueLabels,
  syncIssueParts,
  updateIssue,
  updateIssueComment,
} from "@/features/issue/api/issue.api";
import type {
  AddIssueFilesRequestDto,
  CreateIssueCommentRequestDto,
  CreateIssueRequestDto,
  SyncIssueAssigneesRequestDto,
  SyncIssueChangesRequestDto,
  SyncIssueLabelsRequestDto,
  SyncIssuePartsRequestDto,
  UpdateIssueCommentRequestDto,
  UpdateIssueRequestDto,
} from "@/features/issue/api/issue.types";

export const issueKeys = {
  all: ["issue"] as const,
  detail: (issueNumber: number) => ["issue", issueNumber, "detail"] as const,
  timeline: (issueNumber: number) => ["issue", issueNumber, "timeline"] as const,
};

export const issueQueries = {
  detail: (issueNumber: number) =>
    queryOptions({
      queryKey: issueKeys.detail(issueNumber),
      queryFn: () => fetchIssueDetail(issueNumber),
      staleTime: 30_000,
    }),
  timeline: (issueNumber: number) =>
    queryOptions({
      queryKey: issueKeys.timeline(issueNumber),
      queryFn: () => fetchIssueTimeline(issueNumber),
      staleTime: 10_000,
    }),
};

export const issueMutations = {
  create: () =>
    mutationOptions({
      mutationKey: ["issue", "create"],
      mutationFn: (request: CreateIssueRequestDto) => createIssue(request),
    }),
  update: (issueNumber: number) =>
    mutationOptions({
      mutationKey: ["issue", issueNumber, "update"],
      mutationFn: (request: UpdateIssueRequestDto) => updateIssue(issueNumber, request),
    }),
  syncAssignees: (issueNumber: number) =>
    mutationOptions({
      mutationKey: ["issue", issueNumber, "sync-assignees"],
      mutationFn: (request: SyncIssueAssigneesRequestDto) => syncIssueAssignees(issueNumber, request),
    }),
  syncLabels: (issueNumber: number) =>
    mutationOptions({
      mutationKey: ["issue", issueNumber, "sync-labels"],
      mutationFn: (request: SyncIssueLabelsRequestDto) => syncIssueLabels(issueNumber, request),
    }),
  syncParts: (issueNumber: number) =>
    mutationOptions({
      mutationKey: ["issue", issueNumber, "sync-parts"],
      mutationFn: (request: SyncIssuePartsRequestDto) => syncIssueParts(issueNumber, request),
    }),
  syncChanges: (issueNumber: number) =>
    mutationOptions({
      mutationKey: ["issue", issueNumber, "sync-changes"],
      mutationFn: (request: SyncIssueChangesRequestDto) => syncIssueChanges(issueNumber, request),
    }),
  close: (issueNumber: number) =>
    mutationOptions({
      mutationKey: ["issue", issueNumber, "close"],
      mutationFn: () => closeIssue(issueNumber),
    }),
  reopen: (issueNumber: number) =>
    mutationOptions({
      mutationKey: ["issue", issueNumber, "reopen"],
      mutationFn: () => reopenIssue(issueNumber),
    }),
  createComment: (issueNumber: number) =>
    mutationOptions({
      mutationKey: ["issue", issueNumber, "create-comment"],
      mutationFn: (request: CreateIssueCommentRequestDto) => createIssueComment(issueNumber, request),
    }),
  updateComment: (issueNumber: number, commentId: string) =>
    mutationOptions({
      mutationKey: ["issue", issueNumber, "update-comment", commentId],
      mutationFn: (request: UpdateIssueCommentRequestDto) => updateIssueComment(issueNumber, commentId, request),
    }),
  deleteComment: (issueNumber: number, commentId: string) =>
    mutationOptions({
      mutationKey: ["issue", issueNumber, "delete-comment", commentId],
      mutationFn: () => deleteIssueComment(issueNumber, commentId),
    }),
  addFiles: (issueNumber: number) =>
    mutationOptions({
      mutationKey: ["issue", issueNumber, "add-files"],
      mutationFn: (request: AddIssueFilesRequestDto) => addIssueFiles(issueNumber, request),
    }),
  deleteFile: (issueNumber: number, fileId: string) =>
    mutationOptions({
      mutationKey: ["issue", issueNumber, "delete-file", fileId],
      mutationFn: () => deleteIssueFile(issueNumber, fileId),
    }),
};
