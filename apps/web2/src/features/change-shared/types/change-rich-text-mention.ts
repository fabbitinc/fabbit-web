export interface ChangeRichTextMentionItem {
  id: string;
  label: string;
  profileImageUrl?: string | null;
  state?: string;
  number?: number;
  issueType?: "issue" | "change_request";
}

export interface ChangeRichTextMentionLookup {
  lookupMembers: (query: string) => Promise<ChangeRichTextMentionItem[]>;
  lookupIssues: (query: string) => Promise<ChangeRichTextMentionItem[]>;
}
