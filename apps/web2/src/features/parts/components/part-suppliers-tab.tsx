import { Building2, MapPin } from "lucide-react";
import { usePartSuppliersQuery } from "@/features/parts/hooks/use-part-suppliers-query";

interface PartSuppliersTabProps {
  partId: string;
}

export function PartSuppliersTab({ partId }: PartSuppliersTabProps) {
  const suppliersQuery = usePartSuppliersQuery(partId);

  return (
    <section className="app-panel rounded-lg p-4">
      <div>
        <p className="text-lg font-semibold text-foreground">공급사</p>
        <p className="mt-1 text-sm text-muted-foreground">이 부품에 연결된 공급사 목록입니다.</p>
      </div>

      <div className="mt-4 space-y-2">
        {suppliersQuery.isLoading ? <p className="text-sm text-muted-foreground">공급사를 불러오는 중입니다.</p> : null}
        {!suppliersQuery.isLoading && (suppliersQuery.data?.length ?? 0) === 0 ? (
          <p className="rounded-md border border-border/70 bg-muted/20 px-4 py-4 text-sm text-muted-foreground">
            등록된 공급사가 없습니다.
          </p>
        ) : null}
        {suppliersQuery.data?.map((supplier) => (
          <div key={supplier.id} className="flex items-center justify-between gap-3 rounded-md border border-border/70 bg-card px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-muted/70 p-2">
                <Building2 className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{supplier.companyName}</p>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {supplier.code ? <span className="font-mono">{supplier.code}</span> : null}
                  {supplier.country ? (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3" />
                      {supplier.country}
                    </span>
                  ) : null}
                </p>
              </div>
            </div>
            {supplier.unitCost != null ? <p className="text-sm font-medium text-foreground">₩{supplier.unitCost.toLocaleString("ko-KR")}</p> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
