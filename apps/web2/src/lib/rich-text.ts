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

function collectPlainText(node: unknown): string[] {
  if (!node || typeof node !== "object") {
    return [];
  }

  const result: string[] = [];

  if ("text" in node && typeof node.text === "string") {
    result.push(node.text);
  }

  if ("content" in node && Array.isArray(node.content)) {
    node.content.forEach((child) => {
      result.push(...collectPlainText(child));
    });
  }

  return result;
}

export function getPlainTextFromRichText(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (!value || typeof value !== "object") {
    return "";
  }

  return collectPlainText(value)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeRichTextDocument(value: unknown): RichTextDocument | null {
  if (typeof value === "string") {
    return toRichTextDocument(value);
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  if (!getPlainTextFromRichText(value)) {
    return null;
  }

  return value as RichTextDocument;
}
