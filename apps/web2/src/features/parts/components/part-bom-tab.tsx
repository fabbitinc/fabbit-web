import { useNavigate } from "react-router-dom";
import { ExternalLink, Package } from "lucide-react";
import { Button } from "@fabbit/ui";
import { usePartBomQuery } from "@/features/parts/hooks/use-part-bom-query";

interface PartBomTabProps {
  partId: string;
}

export function PartBomTab({ partId }: PartBomTabProps) {
  const navigate = useNavigate();
  const bomQuery = usePartBomQuery(partId);

  const children = bomQuery.data?.children ?? [];
  const parents = bomQuery.data?.parents ?? [];

  return (
    <div className="space-y-8">
      <section className="app-panel rounded-lg p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-foreground">하위 부품</p>
            <p className="mt-1 text-sm text-muted-foreground">{children.length}개의 하위 부품이 연결되어 있습니다.</p>
          </div>
          {children.length > 0 ? (
            <Button type="button" variant="outline" onClick={() => navigate(`/parts/${partId}/bom`)}>
              <ExternalLink className="size-4" />
              BOM 전체 보기
            </Button>
          ) : null}
        </div>

        <div className="mt-4 space-y-2">
          {bomQuery.isLoading ? <p className="text-sm text-muted-foreground">BOM을 불러오는 중입니다.</p> : null}
          {!bomQuery.isLoading && children.length === 0 ? (
            <p className="rounded-md border border-border/70 bg-muted/20 px-4 py-4 text-sm text-muted-foreground">
              하위 부품이 없습니다.
            </p>
          ) : null}
          {children.map((child) => (
            <button
              key={child.id}
              type="button"
              className="flex w-full cursor-pointer items-center justify-between rounded-md border border-border/70 bg-card px-4 py-3 text-left"
              onClick={() => navigate(`/parts/${child.id}`)}
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-muted/70 p-2">
                  <Package className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-mono text-xs font-medium text-foreground">{child.partNumber}</p>
                  <p className="text-sm text-muted-foreground">{child.name ?? "이름 없음"}</p>
                </div>
              </div>
              <span className="text-sm font-medium text-foreground">x{child.quantity}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="app-panel rounded-lg p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-foreground">상위 부품</p>
            <p className="mt-1 text-sm text-muted-foreground">{parents.length}개의 상위 부품이 이 부품을 사용합니다.</p>
          </div>
          {parents.length > 0 ? (
            <Button type="button" variant="outline" onClick={() => navigate(`/parts/${partId}/bom?direction=reverse`)}>
              <ExternalLink className="size-4" />
              역전개 보기
            </Button>
          ) : null}
        </div>

        <div className="mt-4 space-y-2">
          {!bomQuery.isLoading && parents.length === 0 ? (
            <p className="rounded-md border border-border/70 bg-muted/20 px-4 py-4 text-sm text-muted-foreground">
              상위 부품이 없습니다.
            </p>
          ) : null}
          {parents.map((parent) => (
            <button
              key={parent.id}
              type="button"
              className="flex w-full cursor-pointer items-center justify-between rounded-md border border-border/70 bg-card px-4 py-3 text-left"
              onClick={() => navigate(`/parts/${parent.id}`)}
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-muted/70 p-2">
                  <Package className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-mono text-xs font-medium text-foreground">{parent.partNumber}</p>
                  <p className="text-sm text-muted-foreground">{parent.name ?? "이름 없음"}</p>
                </div>
              </div>
              <span className="text-sm font-medium text-foreground">x{parent.quantity}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
