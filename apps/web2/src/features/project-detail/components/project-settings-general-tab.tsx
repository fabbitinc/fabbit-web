import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button, Input, Textarea } from "@fabbit/ui";
import { useUpdateProjectAction } from "@/features/project-detail/hooks/use-update-project-action";
import type { ProjectDetailModel } from "@/features/project-detail/types/project-detail-model";

interface ProjectSettingsGeneralTabProps {
  isReadonly: boolean;
  project: ProjectDetailModel;
}

export function ProjectSettingsGeneralTab({ isReadonly, project }: ProjectSettingsGeneralTabProps) {
  return (
    <ProjectSettingsGeneralForm
      key={`${project.id}:${project.name}:${project.description ?? ""}`}
      isReadonly={isReadonly}
      project={project}
    />
  );
}

function ProjectSettingsGeneralForm({ isReadonly, project }: ProjectSettingsGeneralTabProps) {
  const updateProjectAction = useUpdateProjectAction();
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");

  const isDirty = name !== project.name || description !== (project.description ?? "");

  return (
    <section className="space-y-4">
      <div>
        <p className="text-lg font-semibold text-foreground">프로젝트 정보</p>
        <p className="mt-1 text-sm text-muted-foreground">이름과 설명을 수정합니다.</p>
      </div>

      <div className="grid gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">프로젝트 이름</p>
          <Input disabled={isReadonly} value={name} onChange={(event) => setName(event.target.value)} />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">설명</p>
          <Textarea
            disabled={isReadonly}
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          disabled={!isDirty || isReadonly || updateProjectAction.isPending}
          type="button"
          onClick={() =>
            updateProjectAction.mutate({
              projectId: project.id,
              name,
              description,
            })
          }
        >
          {updateProjectAction.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          저장
        </Button>
      </div>
    </section>
  );
}
