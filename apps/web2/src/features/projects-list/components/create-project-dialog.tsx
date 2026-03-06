import { ProjectCreateDialog as ProjectCreateDialogView } from "@fabbit/components";
import { useProjectsListStore } from "@/features/projects-list/stores/projects-list-store";

interface CreateProjectDialogProps {
  isPending: boolean;
  onSubmit: (input: { name: string; description: string }) => void;
}

export function CreateProjectDialog({ isPending, onSubmit }: CreateProjectDialogProps) {
  const isOpen = useProjectsListStore((state) => state.isCreateDialogOpen);
  const draftName = useProjectsListStore((state) => state.draftName);
  const draftDescription = useProjectsListStore((state) => state.draftDescription);
  const openCreateDialog = useProjectsListStore((state) => state.openCreateDialog);
  const closeCreateDialog = useProjectsListStore((state) => state.closeCreateDialog);
  const setDraftName = useProjectsListStore((state) => state.setDraftName);
  const setDraftDescription = useProjectsListStore((state) => state.setDraftDescription);

  return (
    <ProjectCreateDialogView
      description={draftDescription}
      isPending={isPending}
      name={draftName}
      open={isOpen}
      onDescriptionChange={setDraftDescription}
      onNameChange={setDraftName}
      onOpenChange={(open) => {
        if (open) {
          openCreateDialog();
          return;
        }

        closeCreateDialog();
      }}
      onSubmit={() =>
        onSubmit({
          name: draftName,
          description: draftDescription,
        })}
    />
  );
}
