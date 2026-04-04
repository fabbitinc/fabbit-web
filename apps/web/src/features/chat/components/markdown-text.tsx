import { useMemo } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import type { Config as DomPurifyConfig } from "dompurify";

interface MarkdownTextProps {
  children: string;
}

// marked 설정: 불필요한 래핑 최소화
marked.setOptions({
  breaks: true, // 줄바꿈을 <br>로
  gfm: true, // GFM (테이블, 취소선 등)
  async: false,
});

// DOMPurify 허용 태그
const PURIFY_CONFIG: DomPurifyConfig = {
  ALLOWED_TAGS: [
    "p", "br", "strong", "b", "em", "i", "del", "s",
    "ul", "ol", "li",
    "code", "pre",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "blockquote",
    "table", "thead", "tbody", "tr", "th", "td",
    "hr", "span",
  ],
  ALLOWED_ATTR: [],
};

export function MarkdownText({ children }: MarkdownTextProps) {
  const html = useMemo(() => {
    const raw = marked.parse(children) as string;
    return DOMPurify.sanitize(raw, PURIFY_CONFIG);
  }, [children]);

  return (
    <div
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
