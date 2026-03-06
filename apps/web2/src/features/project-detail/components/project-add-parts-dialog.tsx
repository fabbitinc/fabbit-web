import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
} from "@fabbit/ui";
import { useLinkProjectPartsAction } from "@/features/project-detail/hooks/use-link-project-parts-action";
import { useProjectPartLookupQuery } from "@/features/project-detail/hooks/use-project-part-lookup-query";
import { useProjectDetailStore } from "@/features/project-detail/stores/project-detail-store";

interface ProjectAddPartsDialogProps {
  projectId: string;
}

export function ProjectAddPartsDialog({ projectId }: ProjectAddPartsDialogProps) {
  const isOpen = useProjectDetailStore((state) => state.isAddPartDialogOpen);
  const partLookupQuery = useProjectDetailStore((state) => state.partLookupQuery);
  const selectedPartIds = useProjectDetailStore((state) => state.selectedPartIds);
  const setPartLookupQuery = useProjectDetailStore((state) => state.setPartLookupQuery);
  const toggleSelectedPart = useProjectDetailStore((state) => state.toggleSelectedPart);
  const resetPartDialog = useProjectDetailStore((state) => state.resetPartDialog);

  const [debouncedQuery, setDebouncedQuery] = useState(partLookupQuery);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(partLookupQuery.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [partLookupQuery]);

  const partLookup = useProjectPartLookupQuery(
    projectId,
    {
      search: debouncedQuery || undefined,
      exclude_linked: true,
      limit: 20,
    },
    isOpen,
  );
  const linkPartsAction = useLinkProjectPartsAction(projectId);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? undefined : resetPartDialog())}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>부품 연결</DialogTitle>
          <DialogDescription>프로젝트에 연결할 부품을 검색하고 선택합니다.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="품번 또는 품명으로 검색"
              value={partLookupQuery}
              onChange={(event) => setPartLookupQuery(event.target.value)}
            />
          </div>

          <div className="max-h-[360px] space-y-2 overflow-y-auto rounded-[24px] border border-border/70 bg-muted/20 p-3">
            {partLookup.isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : null}

            {!partLookup.isLoading && (partLookup.data?.length ?? 0) === 0 ? (
              <div className="flex h-40 items-center justify-center px-6 text-center text-sm leading-6 text-muted-foreground">
                연결할 수 있는 부품이 없습니다. 검색어를 바꾸거나 이미 연결된 부품인지 확인해 주세요.
              </div>
            ) : null}

            {partLookup.data?.map((part) => (
              <label
                key={part.id}
                className="flex cursor-pointer items-center gap-3 rounded-[20px] border border-border/70 bg-card px-4 py-3"
              >
                <Checkbox checked={selectedPartIds.includes(part.id)} onCheckedChange={() => toggleSelectedPart(part.id)} />
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{part.partNumber}</p>
                  <p className="truncate text-sm text-muted-foreground">{part.name || "이름 없음"}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={resetPartDialog}>
            취소
          </Button>
          <Button
            disabled={selectedPartIds.length === 0 || linkPartsAction.isPending}
            type="button"
            onClick={() => linkPartsAction.mutate(selectedPartIds)}
          >
            {linkPartsAction.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            선택한 부품 연결
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
