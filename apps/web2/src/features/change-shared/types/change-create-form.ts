import type { RichTextDocument } from "@/lib/rich-text";

export interface ChangeCreateFormSubmitInput {
  title: string;
  body: RichTextDocument | null;
  assigneeIds: string[];
  reviewerIds: string[];
  labelIds: string[];
  partIds: string[];
  files: File[];
  linkedIssueNumber: number | null;
}
