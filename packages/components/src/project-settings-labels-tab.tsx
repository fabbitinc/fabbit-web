import { Button } from "@fabbit/ui";

export interface ProjectSettingsLabelsTabProps {
  href?: string;
}

export function ProjectSettingsLabelsTab({
  href = "/organization/settings?menu=change",
}: ProjectSettingsLabelsTabProps) {
  return (
    <section className="rounded-lg border border-border/70 bg-muted/25 p-6">
      <p className="text-lg font-semibold text-foreground">라벨 관리</p>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        현재 OpenAPI 계약에는 레거시의 프로젝트 전용 라벨 엔드포인트가 포함되어 있지 않습니다. 새 구조에서는
        조직 공용 라벨을 기준으로 운영하며, 라벨 관리는 조직 설정에서 수행합니다.
      </p>
      <div className="mt-4">
        <Button asChild type="button" variant="outline">
          <a href={href}>조직 라벨 설정으로 이동</a>
        </Button>
      </div>
    </section>
  );
}
