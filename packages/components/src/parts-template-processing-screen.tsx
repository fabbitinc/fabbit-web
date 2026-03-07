import { AlertCircle, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { Button, Progress } from "@fabbit/ui";

export type PartsTemplateProcessingStepStatus = "pending" | "in_progress" | "completed";

export interface PartsTemplateProcessingStep {
  key: string;
  label: string;
  status: PartsTemplateProcessingStepStatus;
}

export interface PartsTemplateProcessingScreenProps {
  canProceed: boolean;
  canRetry: boolean;
  error?: string | null;
  fileName: string;
  hasUpload: boolean;
  logs: string[];
  progress: number;
  steps: PartsTemplateProcessingStep[];
  onProceed: () => void;
  onRetry: () => void;
}

export function PartsTemplateProcessingScreen({
  canProceed,
  canRetry,
  error = null,
  fileName,
  hasUpload,
  logs,
  progress,
  steps,
  onProceed,
  onRetry,
}: PartsTemplateProcessingScreenProps) {
  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="dev-page-container space-y-4">
        <div className="rounded-lg border bg-card p-5">
          <h1 className="text-xl font-bold text-foreground">속성 분석 처리</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {fileName ? `${fileName} 파일을 분석 중입니다.` : "파일을 분석 중입니다."}
          </p>

          {!hasUpload ? (
            <div className="mt-4 flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
              <AlertCircle className="h-4 w-4" />
              업로드 정보가 없습니다. 파일을 먼저 업로드한 뒤 다시 시도해 주세요.
            </div>
          ) : null}

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">진행률</span>
              <span className="font-medium text-foreground">{progress}%</span>
            </div>
            <Progress className="h-2" value={progress} />
          </div>
        </div>

        <section className="rounded-lg border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground">처리 단계</h2>
          <div className="mt-3 space-y-2">
            {steps.map((step) => (
              <div key={step.key} className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm">
                {getStepIcon(step.status)}
                <span className="text-foreground">{step.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground">처리 로그</h2>
          <div className="mt-3 space-y-2 rounded-md bg-muted/30 p-3">
            {logs.map((log, index) => (
              <p key={`${log}-${index}`} className="text-xs text-muted-foreground">
                {log}
              </p>
            ))}
          </div>

          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

          <div className="mt-4 flex items-center justify-end">
            {error ? (
              <Button disabled={!canRetry} onClick={onRetry}>
                재시도
              </Button>
            ) : (
              <Button disabled={!canProceed} onClick={onProceed}>
                매핑 확인
              </Button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function getStepIcon(status: PartsTemplateProcessingStepStatus) {
  if (status === "completed") {
    return <CheckCircle2 className="h-4 w-4 text-green-600" />;
  }

  if (status === "in_progress") {
    return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
  }

  return <Circle className="h-4 w-4 text-muted-foreground" />;
}
