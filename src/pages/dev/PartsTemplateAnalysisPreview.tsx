import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  createTemplateVersion,
  getLatestTemplate,
  getTemplates,
  type TemplateScope,
} from "@/pages/dev/partsTemplateStore";

export function PartsTemplateAnalysisPreview() {
  const navigate = useNavigate();
  const { partNumber } = useParams<{ partNumber: string }>();
  const scope: TemplateScope = partNumber ? "part_detail" : "master";
  const [refreshKey, setRefreshKey] = useState(0);

  void refreshKey;
  const scopedTemplates = getTemplates().filter((template) => template.scope === scope);
  const latestTemplate = getLatestTemplate(scope);

  function runAnalysis() {
    const columns =
      scope === "master"
        ? ["part_number", "part_name", "material", "revision", "unit"]
        : ["part_number", "part_name", "quantity", "unit", "description"];

    createTemplateVersion(scope, columns);
    setRefreshKey((prev) => prev + 1);
  }

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="dev-page-container space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-foreground">속성 분석</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {scope === "master" ? "Part Master 템플릿" : `Part Detail 템플릿 (${partNumber})`}을 관리합니다.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate(scope === "master" ? "/dev/parts" : `/dev/parts/${partNumber}`)}
          >
            <ArrowLeft className="h-4 w-4" />
            돌아가기
          </Button>
        </div>

        <section className="rounded-lg border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">최신 템플릿</h2>
            {latestTemplate && <Badge variant="outline">v{latestTemplate.version}</Badge>}
          </div>
          {latestTemplate ? (
            <div className="mt-3 space-y-1 text-sm text-muted-foreground">
              <p>이름: {latestTemplate.name}</p>
              <p>fingerprint: {latestTemplate.fingerprint}</p>
              <p>업데이트: {latestTemplate.updatedAt}</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">아직 템플릿이 없습니다.</p>
          )}

          <div className="mt-4 flex items-center gap-2">
            <Button onClick={runAnalysis} variant="outline" className="ai-outline-btn ai-theme-1">
              <Sparkles className="ai-outline-btn__icon h-4 w-4" />
              속성 분석 실행
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                navigate(
                  scope === "master"
                    ? "/dev/parts/upload?scope=master"
                    : `/dev/parts/${partNumber}/upload?scope=detail`
                )
              }
            >
              데이터 업로드로 이동
            </Button>
          </div>
        </section>

        <section className="rounded-lg border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground">버전 이력</h2>
          <div className="mt-3 space-y-2">
            {scopedTemplates.map((template) => (
              <div key={template.id} className="rounded-md border bg-background p-3 text-sm">
                <p className="font-medium text-foreground">{template.name}</p>
                <p className="text-xs text-muted-foreground">scope={template.scope} · v{template.version} · {template.updatedAt}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
