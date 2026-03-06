import { AlertCircle, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { Button, Progress } from "@fabbit/ui";

export type PartsTemplateProcessingStepStatus = "pending" | "in_progress" | "completed";

export interface PartsTemplateProcessingStep {
  key: string;
  label: string;
  status: PartsTemplateProcessingStepStatus;
}

export interface PartsTemplateProcessingScreenProps {
  fileName: string;
  progress: number;
  steps: PartsTemplateProcessingStep[];
  logs: string[];
  error?: string | null;
  hasUpload: boolean;
  canProceed: boolean;
  canRetry: boolean;
  onRetry: () => void;
  onProceed: () => void;
}

export function PartsTemplateProcessingScreen({
  fileName,
  progress,
  steps,
  logs,
  error = null,
  hasUpload,
  canProceed,
  canRetry,
  onRetry,
  onProceed,
}: PartsTemplateProcessingScreenProps) {
  return (
    <div className="space-y-6">
      <section className="app-panel rounded-[32px] p-6 sm:p-8">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">부품 템플릿 처리</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {fileName} 파일을 분석해 속성과 관계 매핑 후보를 구성합니다.
        </p>

        {!hasUpload ? (
          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] px-4 py-3 text-sm text-[var(--status-warning)]">
            <AlertCircle className="size-4" />
            업로드 정보가 없습니다. 파일을 먼저 업로드한 뒤 다시 시도해주세요.
          </div>
        ) : null}

        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">진행률</span>
            <span className="font-medium text-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <section className="app-panel rounded-[32px] p-5">
          <h2 className="text-sm font-semibold text-foreground">처리 단계</h2>
          <div className="mt-4 space-y-2">
            {steps.map((step) => (
              <div
                key={step.key}
                className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-3 text-sm"
              >
                {getStepIcon(step.status)}
                <span className="text-foreground">{step.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="app-panel rounded-[32px] p-5">
          <h2 className="text-sm font-semibold text-foreground">처리 로그</h2>
          <div className="mt-4 space-y-2 rounded-[24px] bg-muted/30 p-4">
            {logs.map((log, index) => (
              <p key={`${log}-${index}`} className="text-xs text-muted-foreground">
                {log}
              </p>
            ))}
          </div>

          {error ? <p className="mt-4 text-sm text-[var(--status-danger)]">{error}</p> : null}

          <div className="mt-5 flex items-center justify-end gap-2">
            {error ? (
              <Button onClick={onRetry} disabled={!canRetry}>
                재시도
              </Button>
            ) : (
              <Button disabled={!canProceed} onClick={onProceed}>
                매핑 확인
              </Button>
            )}
          </div>
        </section>
      </section>
    </div>
  );
}

function getStepIcon(status: PartsTemplateProcessingStepStatus) {
  if (status === "completed") {
    return <CheckCircle2 className="size-4 text-[var(--status-success)]" />;
  }

  if (status === "in_progress") {
    return <Loader2 className="size-4 animate-spin text-primary" />;
  }

  return <Circle className="size-4 text-muted-foreground" />;
}
