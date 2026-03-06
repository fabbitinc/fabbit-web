import { useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fabbit/ui";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { MemberPickerPopover, TeamPickerPopover } from "@/features/organization-settings/components/organization-owner-pickers";
import { useOrganizationCategoriesQuery } from "@/features/organization-settings/hooks/use-organization-categories-query";
import { useDeleteOrganizationDefaultOwnerAction } from "@/features/organization-settings/hooks/use-delete-organization-default-owner-action";
import { useOrganizationDefaultOwnersQuery } from "@/features/organization-settings/hooks/use-organization-default-owners-query";
import { useUpsertOrganizationDefaultOwnerAction } from "@/features/organization-settings/hooks/use-upsert-organization-default-owner-action";

export function OrganizationPartsDefaultAssignmentTab() {
  const defaultOwnersQuery = useOrganizationDefaultOwnersQuery();
  const categoriesQuery = useOrganizationCategoriesQuery();
  const upsertDefaultOwnerAction = useUpsertOrganizationDefaultOwnerAction();
  const deleteDefaultOwnerAction = useDeleteOrganizationDefaultOwnerAction();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [nextCategory, setNextCategory] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ category?: string | null } | null>(null);

  const entries = useMemo(() => defaultOwnersQuery.data ?? [], [defaultOwnersQuery.data]);
  const usedCategories = useMemo(
    () => new Set(entries.filter((entry) => entry.category != null).map((entry) => entry.category as string)),
    [entries],
  );
  const availableCategories = useMemo(
    () =>
      (categoriesQuery.data ?? [])
        .map((category) => category.category)
        .filter((category) => !usedCategories.has(category)),
    [categoriesQuery.data, usedCategories],
  );

  const fallbackEntry =
    entries.find((entry) => entry.category === null) ?? {
      id: "__fallback__",
      category: null,
      defaultOwnerId: null,
      defaultOwner: null,
      defaultOwnerTeamId: null,
      defaultOwnerTeamName: null,
    };

  const categoryEntries = entries.filter((entry) => entry.category !== null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-foreground">부품 기본 담당 설정</h2>
        <p className="mt-1 text-sm text-muted-foreground">카테고리별 기본 담당팀과 담당자를 지정해 신규 부품 생성 시 자동 적용합니다.</p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">기본값</h3>
        <div className="overflow-hidden rounded-[24px] border border-border/70 bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">카테고리</th>
                <th className="px-4 py-3 text-left font-medium">담당팀</th>
                <th className="px-4 py-3 text-left font-medium">담당자</th>
                <th className="w-12 px-4 py-3">
                  <span className="sr-only">관리</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border/70">
                <td className="px-4 py-3 text-sm text-muted-foreground">전체</td>
                <td className="px-4 py-3">
                  <TeamPickerPopover
                    selectedTeamId={fallbackEntry.defaultOwnerTeamId ?? null}
                    selectedTeamName={fallbackEntry.defaultOwnerTeamName ?? null}
                    onSelect={(teamId) =>
                      upsertDefaultOwnerAction.mutate({
                        category: null,
                        default_owner_team_id: teamId,
                        default_owner_id: fallbackEntry.defaultOwnerId ?? null,
                      })
                    }
                  />
                </td>
                <td className="px-4 py-3">
                  <MemberPickerPopover
                    selectedMemberId={fallbackEntry.defaultOwnerId ?? null}
                    selectedMemberName={fallbackEntry.defaultOwner?.fullName}
                    onSelect={(memberId) =>
                      upsertDefaultOwnerAction.mutate({
                        category: null,
                        default_owner_id: memberId,
                        default_owner_team_id: fallbackEntry.defaultOwnerTeamId ?? null,
                      })
                    }
                  />
                </td>
                <td aria-hidden="true" className="px-4 py-3" />
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">카테고리별 담당</h3>
        <div className="overflow-hidden rounded-[24px] border border-border/70 bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">카테고리</th>
                <th className="px-4 py-3 text-left font-medium">담당팀</th>
                <th className="px-4 py-3 text-left font-medium">담당자</th>
                <th className="w-12 px-4 py-3">
                  <span className="sr-only">관리</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {categoryEntries.map((entry) => (
                <tr key={entry.id} className="border-t border-border/70">
                  <td className="px-4 py-3 font-medium">{entry.category}</td>
                  <td className="px-4 py-3">
                    <TeamPickerPopover
                      selectedTeamId={entry.defaultOwnerTeamId ?? null}
                      selectedTeamName={entry.defaultOwnerTeamName ?? null}
                      onSelect={(teamId) =>
                        upsertDefaultOwnerAction.mutate({
                          category: entry.category,
                          default_owner_team_id: teamId,
                          default_owner_id: entry.defaultOwnerId ?? null,
                        })
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <MemberPickerPopover
                      selectedMemberId={entry.defaultOwnerId ?? null}
                      selectedMemberName={entry.defaultOwner?.fullName}
                      onSelect={(memberId) =>
                        upsertDefaultOwnerAction.mutate({
                          category: entry.category,
                          default_owner_id: memberId,
                          default_owner_team_id: entry.defaultOwnerTeamId ?? null,
                        })
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      aria-label={`${entry.category} 기본 담당 설정 삭제`}
                      size="icon"
                      variant="ghost"
                      onClick={() => setDeleteTarget({ category: entry.category })}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
              {categoryEntries.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-muted-foreground" colSpan={4}>
                    카테고리별 담당 설정이 없습니다. 모든 부품에 기본값이 적용됩니다.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <Button
        className="gap-1"
        disabled={availableCategories.length === 0}
        variant="outline"
        onClick={() => setCreateDialogOpen(true)}
      >
        <Plus className="size-4" />
        담당 추가
      </Button>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>담당 추가</DialogTitle>
            <DialogDescription>기본 담당을 설정할 카테고리를 선택하세요.</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Select value={nextCategory} onValueChange={setNextCategory}>
              <SelectTrigger>
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              취소
            </Button>
            <Button
              disabled={!nextCategory || upsertDefaultOwnerAction.isPending}
              onClick={() =>
                upsertDefaultOwnerAction.mutate(
                  { category: nextCategory },
                  {
                    onSuccess: () => {
                      setNextCategory("");
                      setCreateDialogOpen(false);
                    },
                  },
                )
              }
            >
              {upsertDefaultOwnerAction.isPending ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : null}
              추가
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>기본 담당 설정 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleteTarget?.category}&quot; 카테고리의 기본 담당 설정을 삭제합니다. 기존 부품의 담당자는 유지됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteDefaultOwnerAction.isPending}
              onClick={() =>
                deleteDefaultOwnerAction.mutate(deleteTarget?.category ?? null, {
                  onSuccess: () => setDeleteTarget(null),
                })
              }
            >
              {deleteDefaultOwnerAction.isPending ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : null}
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
