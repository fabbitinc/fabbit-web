import type { ReactNode } from "react";

export interface FormSectionProps {
  /** 섹션 제목 (예: "기본 정보") */
  title: string;
  /** 섹션 설명 */
  description?: string;
  /** 폼 필드들 */
  children: ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <fieldset className={`space-y-4 ${className ?? ""}`}>
      <div>
        <legend className="text-sm font-semibold text-foreground">
          {title}
        </legend>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </fieldset>
  );
}
