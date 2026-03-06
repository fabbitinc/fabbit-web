import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input } from "@fabbit/ui";
import { useLinkPartsToProjectAction } from "@/features/parts/hooks/use-link-parts-to-project-action";
import { usePartLinkableProjectsQuery } from "@/features/parts/hooks/use-part-linkable-projects-query";

interface LinkPartsToProjectDialogProps {
  open: boolean;
  selectedPartIds: string[];
  onComplete: () => void;
  onOpenChange: (open: boolean) => void;
}

export function LinkPartsToProjectDialog({
  open,
  selectedPartIds,
  onComplete,
  onOpenChange,
}: LinkPartsToProjectDialogProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const projectsQuery = usePartLinkableProjectsQuery(
    {
      search: debouncedQuery || undefined,
      offset: 0,
      limit: 50,
    },
    open,
  );
  const linkPartsToProjectAction = useLinkPartsToProjectAction();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 250);

    return () => window.clearTimeout(timer);
  }, [query]);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          setQuery("");
          setDebouncedQuery("");
          setSelectedProjectId(null);
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>프로젝트 연결</DialogTitle>
          <DialogDescription>{selectedPartIds.length}개의 부품을 연결할 프로젝트를 선택합니다.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="프로젝트 이름으로 검색"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div className="max-h-[360px] overflow-y-auto rounded-[24px] border border-border/70 bg-muted/20 p-3">
            {projectsQuery.isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : null}

            {!projectsQuery.isLoading && (projectsQuery.data?.length ?? 0) === 0 ? (
              <div className="flex h-40 items-center justify-center px-6 text-center text-sm leading-6 text-muted-foreground">
                연결할 수 있는 프로젝트가 없습니다.
              </div>
            ) : null}

            {!projectsQuery.isLoading ? (
              <div className="space-y-2">
                {projectsQuery.data?.map((project) => (
                  <label
                    key={project.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-[20px] border px-4 py-3 ${
                      selectedProjectId === project.id
                        ? "border-primary bg-primary/5"
                        : "border-border/70 bg-card"
                    }`}
                  >
                    <input
                      aria-label={`${project.name} 프로젝트 선택`}
                      checked={selectedProjectId === project.id}
                      className="mt-1 size-4 accent-primary"
                      name="part-link-project"
                      type="radio"
                      onChange={() => setSelectedProjectId(project.id)}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{project.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {project.description ?? "설명이 없습니다."}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button
            disabled={!selectedProjectId || linkPartsToProjectAction.isPending}
            type="button"
            onClick={async () => {
              if (!selectedProjectId) {
                return;
              }

              await linkPartsToProjectAction.mutateAsync({
                projectId: selectedProjectId,
                partIds: selectedPartIds,
              });
              onComplete();
              onOpenChange(false);
            }}
          >
            {linkPartsToProjectAction.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            프로젝트 연결
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
