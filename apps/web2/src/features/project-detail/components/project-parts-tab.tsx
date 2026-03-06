import { useEffect, useMemo, useState } from "react";
import { Link, Search, Trash2 } from "lucide-react";
import { Button, ConfirmDialog, Input } from "@fabbit/ui";
import { ProjectAddPartsDialog } from "@/features/project-detail/components/project-add-parts-dialog";
import { useProjectPartsQuery } from "@/features/project-detail/hooks/use-project-parts-query";
import { useUnlinkProjectPartsAction } from "@/features/project-detail/hooks/use-unlink-project-parts-action";
import { useProjectDetailStore } from "@/features/project-detail/stores/project-detail-store";

interface ProjectPartsTabProps {
  isReadonly: boolean;
  projectId: string;
}

const pageSize = 20;

export function ProjectPartsTab({ isReadonly, projectId }: ProjectPartsTabProps) {
  const openAddPartDialog = useProjectDetailStore((state) => state.openAddPartDialog);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [removingPartId, setRemovingPartId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search]);

  const partsQuery = useProjectPartsQuery(projectId, {
    search: debouncedSearch || undefined,
    offset: (page - 1) * pageSize,
    limit: pageSize,
  });
  const unlinkProjectPartsAction = useUnlinkProjectPartsAction(projectId);

  const totalCount = partsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const removingPart = useMemo(
    () => partsQuery.data?.items.find((part) => part.id === removingPartId) ?? null,
    [partsQuery.data?.items, removingPartId],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="연결된 부품 검색"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Button disabled={isReadonly} type="button" onClick={openAddPartDialog}>
          <Link className="size-4" />
          부품 연결
        </Button>
      </div>

      <section className="app-panel overflow-hidden rounded-[32px]">
        <div className="border-b border-border/70 px-5 py-4">
          <p className="text-sm font-medium text-foreground">연결된 부품</p>
          <p className="mt-1 text-sm text-muted-foreground">{totalCount.toLocaleString()}개의 부품이 이 프로젝트에 연결되어 있습니다.</p>
        </div>

        <div className="divide-y divide-border/60">
          {partsQuery.data?.items.map((part) => (
            <div key={part.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <a className="font-medium text-foreground hover:text-primary" href={`/parts/${part.id}`}>
                  {part.partNumber}
                </a>
                <p className="mt-1 text-sm text-muted-foreground">{part.name || "이름 없음"}</p>
              </div>
              <Button
                disabled={isReadonly}
                size="sm"
                type="button"
                variant="ghost"
                onClick={() => setRemovingPartId(part.id)}
              >
                <Trash2 className="size-4" />
                연결 해제
              </Button>
            </div>
          ))}

          {partsQuery.isLoading ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">부품 목록을 불러오는 중입니다.</div>
          ) : null}

          {!partsQuery.isLoading && totalCount === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              {debouncedSearch ? "검색 결과가 없습니다." : "연결된 부품이 없습니다."}
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between border-t border-border/70 px-5 py-4">
          <p className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </p>
          <div className="flex gap-2">
            <Button disabled={page <= 1} size="sm" type="button" variant="outline" onClick={() => setPage((current) => current - 1)}>
              이전
            </Button>
            <Button
              disabled={page >= totalPages}
              size="sm"
              type="button"
              variant="outline"
              onClick={() => setPage((current) => current + 1)}
            >
              다음
            </Button>
          </div>
        </div>
      </section>

      <ProjectAddPartsDialog projectId={projectId} />

      <ConfirmDialog
        cancelLabel="취소"
        confirmLabel="연결 해제"
        description={removingPart ? `${removingPart.partNumber} 부품을 프로젝트에서 해제합니다.` : "선택한 부품을 프로젝트에서 해제합니다."}
        open={Boolean(removingPartId)}
        title="부품 연결을 해제할까요?"
        variant="destructive"
        onCancel={() => setRemovingPartId(null)}
        onConfirm={() => {
          if (!removingPartId) {
            return;
          }

          unlinkProjectPartsAction.mutate([removingPartId], {
            onSuccess: () => {
              if ((partsQuery.data?.items.length ?? 0) === 1 && page > 1) {
                setPage((current) => current - 1);
              }
              setRemovingPartId(null);
            },
          });
        }}
        onOpenChange={(open) => {
          if (!open) {
            setRemovingPartId(null);
          }
        }}
      />
    </div>
  );
}
