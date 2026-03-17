import { useState } from "react";
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
  Input,
} from "@fabbit/ui";
import { Loader2, Pencil } from "lucide-react";
import { useOrganizationCategoriesQuery } from "@/features/organization-settings/hooks/use-organization-categories-query";
import { useRenameOrganizationCategoryAction } from "@/features/organization-settings/hooks/use-rename-organization-category-action";

export function OrganizationPartsCategoriesTab() {
  const categoriesQuery = useOrganizationCategoriesQuery();
  const renameCategoryAction = useRenameOrganizationCategoryAction();
  const [renameTarget, setRenameTarget] = useState<{ category: string; partCount: number } | null>(null);
  const [nextName, setNextName] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isDuplicate = (categoriesQuery.data ?? []).some(
    (category) => category.category === nextName.trim() && category.category !== renameTarget?.category,
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-foreground">카테고리 관리</h2>
        <p className="mt-1 text-sm text-muted-foreground">부품을 분류하는 카테고리 이름을 관리합니다.</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border/70 bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">카테고리명</th>
              <th className="px-4 py-3 text-left font-medium">부품 수</th>
              <th className="w-12 px-4 py-3">
                <span className="sr-only">관리</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {(categoriesQuery.data ?? []).map((category) => (
              <tr key={category.category} className="border-t border-border/70">
                <td className="px-4 py-3 font-medium">{category.category}</td>
                <td className="px-4 py-3 text-muted-foreground">{category.partCount}개</td>
                <td className="px-4 py-3">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setRenameTarget(category);
                      setNextName(category.category);
                    }}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
            {(categoriesQuery.data?.length ?? 0) === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-sm text-muted-foreground" colSpan={3}>
                  등록된 카테고리가 없습니다.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <Dialog
        open={renameTarget !== null && !confirmOpen}
        onOpenChange={(open) => {
          if (!open) {
            setRenameTarget(null);
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>카테고리 이름 변경</DialogTitle>
            <DialogDescription>새 카테고리 이름을 입력하세요.</DialogDescription>
          </DialogHeader>
          <Input value={nextName} onChange={(event) => setNextName(event.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTarget(null)}>
              취소
            </Button>
            <Button
              disabled={!nextName.trim() || nextName.trim() === renameTarget?.category}
              onClick={() => setConfirmOpen(true)}
            >
              변경
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmOpen(false);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isDuplicate ? "카테고리를 합치시겠습니까?" : "카테고리 이름을 변경하시겠습니까?"}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-muted-foreground">
                {isDuplicate ? (
                  <>
                    <p>
                      "{renameTarget?.category}" 카테고리 부품 {renameTarget?.partCount ?? 0}건이 "{nextName.trim()}" 카테고리로 이동합니다.
                    </p>
                    <p className="font-medium text-destructive">이 작업은 되돌릴 수 없습니다.</p>
                  </>
                ) : (
                  <>
                    <p>
                      "{renameTarget?.category}" 카테고리에 속한 모든 부품({renameTarget?.partCount ?? 0}개)의 이름이 일괄 변경됩니다.
                    </p>
                  </>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              disabled={renameCategoryAction.isPending}
              onClick={() =>
                renameCategoryAction.mutate(
                  {
                    category: renameTarget?.category ?? "",
                    request: { new_name: nextName.trim() },
                  },
                  {
                    onSuccess: () => {
                      setConfirmOpen(false);
                      setRenameTarget(null);
                    },
                  },
                )
              }
            >
              {renameCategoryAction.isPending ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : null}
              {isDuplicate ? "합치기" : "변경"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
