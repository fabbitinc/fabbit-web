import { Activity, Settings2, Wrench } from "lucide-react";
import { Badge, Button } from "@fabbit/ui";
import type { ProjectDetailModel } from "@/features/project-detail/types/project-detail-model";

interface ProjectOverviewTabProps {
  project: ProjectDetailModel;
  onActivityClick: () => void;
  onPartsClick: () => void;
  onSettingsClick: () => void;
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-[28px] border border-border/70 bg-card p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

export function ProjectOverviewTab({
  project,
  onActivityClick,
  onPartsClick,
  onSettingsClick,
}: ProjectOverviewTabProps) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-3">
        <StatCard
          description="현재 프로젝트에 연결된 부품 수입니다."
          label="Parts"
          value={`${project.partCount.toLocaleString()}개`}
        />
        <StatCard
          description="프로젝트 생성 시점을 기준으로 기록합니다."
          label="Created"
          value={new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(new Date(project.createdAt))}
        />
        <StatCard
          description="최근 프로젝트 정보가 수정된 시점입니다."
          label="Updated"
          value={new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(new Date(project.updatedAt))}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="app-panel rounded-[32px] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Badge variant={project.isArchived ? "warning" : "accent"}>
                {project.isArchived ? "보관됨" : "운영 중"}
              </Badge>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">프로젝트 요약</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {project.description || "설명이 없습니다. 설정에서 프로젝트 설명을 추가할 수 있습니다."}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-border/70 bg-card p-6">
          <p className="text-lg font-semibold text-foreground">빠른 이동</p>
          <div className="mt-4 grid gap-3">
            <Button type="button" variant="outline" onClick={onPartsClick}>
              <Wrench className="size-4" />
              부품 연결 관리
            </Button>
            <Button type="button" variant="outline" onClick={onActivityClick}>
              <Activity className="size-4" />
              활동 피드 보기
            </Button>
            <Button type="button" variant="outline" onClick={onSettingsClick}>
              <Settings2 className="size-4" />
              프로젝트 설정
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
