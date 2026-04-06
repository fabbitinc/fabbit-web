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
  Badge,
  Button,
} from "@fabbit/ui";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useNumberingCategoriesQuery } from "@/features/part-number-categories/hooks/use-numbering-categories-query";
import { useCreateNumberingCategoryAction } from "@/features/part-number-categories/hooks/use-create-numbering-category-action";
import { useUpdateNumberingCategoryAction } from "@/features/part-number-categories/hooks/use-update-numbering-category-action";
import { useDeleteNumberingCategoryAction } from "@/features/part-number-categories/hooks/use-delete-numbering-category-action";
import { NumberingCategoryFormModal } from "@/features/part-number-categories/components/numbering-category-form-modal";
import type { NumberingCategoryModel } from "@/features/part-number-categories/types/numbering-categories.types";

export function OrganizationNumberingCategoriesSection() {
  const categoriesQuery = useNumberingCategoriesQuery();
  const categories = categoriesQuery.data ?? [];

  // 모달 상태
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<NumberingCategoryModel | null>(null);

  // 삭제 확인 상태
  const [deleteTarget, setDeleteTarget] = useState<NumberingCategoryModel | null>(null);

  // 뮤테이션 훅
  const createAction = useCreateNumberingCategoryAction({
    onSuccess: () => {
      setFormOpen(false);
    },
  });
  const updateAction = useUpdateNumberingCategoryAction(editTarget?.id ?? "");
  const deleteAction = useDeleteNumberingCategoryAction(deleteTarget?.id ?? "");

  const isLoading = categoriesQuery.isLoading;
  const isEmpty = !isLoading && categories.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">카테고리 관리</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            카테고리별 채번 규칙을 설정하면 부품 생성 시 품번이 자동으로 부여됩니다
          </p>
        </div>
        {!isEmpty ? (
          <Button
            size="sm"
            variant="outline"
            className="shrink-0"
            onClick={() => {
              setEditTarget(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-1.5 size-3.5" />
            카테고리 추가
          </Button>
        ) : null}
      </div>

      {/* 로딩 상태: 스켈레톤 테이블 */}
      {isLoading ? (
        <div className="overflow-hidden rounded-lg border border-border/70 bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">이름</th>
                <th className="px-4 py-3 text-left font-medium">자동 채번</th>
                <th className="px-4 py-3 text-left font-medium">미리보기</th>
                <th className="w-20 px-4 py-3">
                  <span className="sr-only">관리</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((i) => (
                <tr key={i} className="border-t border-border/70">
                  {[1, 2, 3, 4].map((j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {/* 빈 상태 */}
      {isEmpty ? (
        <div className="rounded-lg border border-dashed border-border/70 bg-card px-6 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            아직 카테고리가 없습니다. 카테고리를 만들어 부품 생성 시 품번을 자동으로 부여하세요.
          </p>
          <Button
            className="mt-4 cursor-pointer"
            size="sm"
            onClick={() => {
              setEditTarget(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-1.5 size-3.5" />
            카테고리 추가
          </Button>
        </div>
      ) : null}

      {/* 테이블 */}
      {!isLoading && categories.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-border/70 bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">이름</th>
                <th className="px-4 py-3 text-left font-medium">자동 채번</th>
                <th className="px-4 py-3 text-left font-medium">미리보기</th>
                <th className="w-20 px-4 py-3">
                  <span className="sr-only">관리</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-t border-border/70">
                  <td className="px-4 py-3 font-medium">{category.name}</td>
                  <td className="px-4 py-3">
                    <Badge variant={category.autoNumberingEnabled ? "success" : "outline"}>
                      {category.autoNumberingEnabled ? "사용 중" : "사용 안 함"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {category.autoNumberingEnabled ? category.previewPartNumber : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="cursor-pointer"
                        onClick={() => {
                          setEditTarget(category);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="cursor-pointer text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(category)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {/* 생성/수정 모달 */}
      <NumberingCategoryFormModal
        open={formOpen}
        editTarget={editTarget}
        isPending={editTarget ? updateAction.isPending : createAction.isPending}
        onClose={() => {
          setFormOpen(false);
          setEditTarget(null);
        }}
        onSubmit={(values) => {
          const request = values.autoNumberingEnabled
            ? {
                name: values.name,
                auto_numbering_enabled: true as const,
                format_prefix: values.formatPrefix,
                format_suffix: values.formatSuffix || undefined,
                digits: values.digits,
              }
            : {
                name: values.name,
                auto_numbering_enabled: false as const,
              };
          if (editTarget) {
            updateAction.mutate(request, {
              onSuccess: () => {
                setFormOpen(false);
                setEditTarget(null);
              },
            });
          } else {
            createAction.mutate(request);
          }
        }}
      />

      {/* 삭제 확인 AlertDialog */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>카테고리를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteTarget?.name}&rdquo; 카테고리를 삭제합니다. 이미 생성된 부품의 품번은 변경되지 않습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteAction.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                deleteAction.mutate(undefined, {
                  onSuccess: () => setDeleteTarget(null),
                })
              }
            >
              {deleteAction.isPending ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : null}
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
