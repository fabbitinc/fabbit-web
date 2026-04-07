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
  SyncIssuePartsRequestDto,
  UpdateIssueCommentRequestDto,
  UpdateIssueRequestDto,
} from "@/features/issue/api/issue.types";

export const issueKeys = {
  all: ["issue"] as const,
  detail: (issueId: string) => ["issue", issueId, "detail"] as const,
  timeline: (issueId: string) => ["issue", issueId, "timeline"] as const,
};

export const issueQueries = {
  detail: (issueId: string) =>
    queryOptions({
      queryKey: issueKeys.detail(issueId),
      queryFn: () => fetchIssueDetail(issueId),
      staleTime: 30_000,
    }),
  timeline: (issueId: string) =>
    queryOptions({
      queryKey: issueKeys.timeline(issueId),
      queryFn: () => fetchIssueTimeline(issueId),
      staleTime: 10_000,
    }),
};

export const issueMutations = {
  create: () =>
    mutationOptions({
      mutationKey: ["issue", "create"],
      mutationFn: (request: CreateIssueRequestDto) => createIssue(request),
    }),
  update: (issueId: string) =>
    mutationOptions({
      mutationKey: ["issue", issueId, "update"],
      mutationFn: (request: UpdateIssueRequestDto) => updateIssue(issueId, request),
    }),
  syncAssignees: (issueId: string) =>
    mutationOptions({
      mutationKey: ["issue", issueId, "sync-assignees"],
      mutationFn: (request: SyncIssueAssigneesRequestDto) => syncIssueAssignees(issueId, request),
    }),
  syncLabels: (issueId: string) =>
    mutationOptions({
      mutationKey: ["issue", issueId, "sync-labels"],
      mutationFn: (labelIds: string[]) => syncIssueLabels(issueId, labelIds),
    }),
  syncParts: (issueId: string) =>
    mutationOptions({
      mutationKey: ["issue", issueId, "sync-parts"],
      mutationFn: (request: SyncIssuePartsRequestDto) => syncIssueParts(issueId, request),
    }),
  syncChanges: (issueId: string) =>
    mutationOptions({
      mutationKey: ["issue", issueId, "sync-changes"],
      mutationFn: (request: SyncIssueChangesRequestDto) => syncIssueChanges(issueId, request),
    }),
  close: (issueId: string) =>
    mutationOptions({
      mutationKey: ["issue", issueId, "close"],
      mutationFn: () => closeIssue(issueId),
    }),
  reopen: (issueId: string) =>
    mutationOptions({
      mutationKey: ["issue", issueId, "reopen"],
      mutationFn: () => reopenIssue(issueId),
    }),
  createComment: (issueId: string) =>
    mutationOptions({
      mutationKey: ["issue", issueId, "create-comment"],
      mutationFn: (request: CreateIssueCommentRequestDto) => createIssueComment(issueId, request),
    }),
  updateComment: (issueId: string, commentId: string) =>
    mutationOptions({
      mutationKey: ["issue", issueId, "update-comment", commentId],
      mutationFn: (request: UpdateIssueCommentRequestDto) => updateIssueComment(issueId, commentId, request),
    }),
  deleteComment: (issueId: string, commentId: string) =>
    mutationOptions({
      mutationKey: ["issue", issueId, "delete-comment", commentId],
      mutationFn: () => deleteIssueComment(issueId, commentId),
    }),
  addFiles: (issueId: string) =>
    mutationOptions({
      mutationKey: ["issue", issueId, "add-files"],
      mutationFn: (request: AddIssueFilesRequestDto) => addIssueFiles(issueId, request),
    }),
  deleteFile: (issueId: string, fileId: string) =>
    mutationOptions({
      mutationKey: ["issue", issueId, "delete-file", fileId],
      mutationFn: () => deleteIssueFile(issueId, fileId),
    }),
};
