import { Activity, Package, Settings2, Wrench } from "lucide-react";
import { Button } from "@fabbit/ui";

export interface ProjectOverviewTabProject {
  description: string | null;
  partCount: number;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
}

export interface ProjectOverviewTabProps {
  project: ProjectOverviewTabProject;
  onActivityClick: () => void;
  onPartsClick: () => void;
  onSettingsClick: () => void;
}

function StatCard({
  accentClassName,
  description,
  icon: Icon,
  label,
  value,
}: {
  accentClassName: string;
  description: string;
  icon: typeof Package;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className={`flex size-9 items-center justify-center rounded-full ${accentClassName}`}>
          <Icon className="size-4" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{description}</p>
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
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          accentClassName="bg-blue-100 text-blue-600"
          description="현재 프로젝트에 연결된 부품 수"
          icon={Package}
          label="연결된 부품"
          value={project.partCount.toLocaleString()}
        />
        <StatCard
          accentClassName="bg-emerald-100 text-emerald-600"
          description="프로젝트가 생성된 날짜"
          icon={Activity}
          label="생성일"
          value={new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(new Date(project.createdAt))}
        />
        <StatCard
          accentClassName="bg-amber-100 text-amber-600"
          description="최근 프로젝트 정보가 수정된 시점"
          icon={Settings2}
          label="최근 수정"
          value={new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(new Date(project.updatedAt))}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border bg-card">
          <div className="border-b px-4 py-3">
            <h3 className="text-sm font-medium text-foreground">프로젝트 요약</h3>
          </div>
          <div className="px-4 py-4">
            <p className="text-sm leading-6 text-muted-foreground">
              {project.description || "설명이 없습니다. 설정에서 프로젝트 설명을 추가할 수 있습니다."}
            </p>
            <div className="mt-4 inline-flex rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              {project.isArchived ? "보관된 프로젝트" : "운영 중인 프로젝트"}
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          <div className="border-b px-4 py-3">
            <h3 className="text-sm font-medium text-foreground">빠른 이동</h3>
          </div>
          <div className="grid gap-3 px-4 py-4">
            <Button size="sm" type="button" variant="outline" onClick={onPartsClick}>
              <Wrench className="size-4" />
              부품 연결 관리
            </Button>
            <Button size="sm" type="button" variant="outline" onClick={onActivityClick}>
              <Activity className="size-4" />
              활동 피드 보기
            </Button>
            <Button size="sm" type="button" variant="outline" onClick={onSettingsClick}>
              <Settings2 className="size-4" />
              프로젝트 설정
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
