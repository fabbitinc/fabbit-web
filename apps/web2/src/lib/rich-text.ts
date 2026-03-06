export interface RichTextNode {
  type: string;
  text?: string;
  content?: RichTextNode[];
}

export interface RichTextDocument {
  type: "doc";
  content: RichTextNode[];
}

export type RichTextValue = RichTextDocument | Record<string, unknown> | null;

export function toRichTextDocument(text: string): RichTextDocument | null {
  const normalized = text.trim();

  if (!normalized) {
    return null;
  }

  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: normalized,
          },
        ],
      },
    ],
  };
}

export function getPlainTextFromRichText(value: unknown): string {
  if (!value || typeof value !== "object") {
    return "";
  }

  const nodes = "content" in value && Array.isArray(value.content) ? (value.content as RichTextNode[]) : [];
  return nodes
    .flatMap((node) => ("content" in node && Array.isArray(node.content) ? node.content : []))
    .map((node) => node.text ?? "")
    .join(" ")
    .trim();
}

export function normalizeRichTextDocument(value: unknown): RichTextDocument | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  if (!getPlainTextFromRichText(value)) {
    return null;
  }

  return value as RichTextDocument;
}
