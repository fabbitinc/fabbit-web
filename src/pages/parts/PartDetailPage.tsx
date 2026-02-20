import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  MoreHorizontal,
  Sparkles,
  Network,
  FileText,
  GitBranch,
  Upload,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePartsUploadStore } from "@/stores/partsUploadStore";
import { usePartDetail } from "@/api/hooks/useParts";
import type {
  PartDetailResponse,
  BomChild,
  BomParent,
  RelatedDrawing,
  RelatedSupplier,
} from "@/api/types/parts";

// --- 서브 컴포넌트 ---

function StatusBadge({ state }: { state: string | null }) {
  if (!state) return <span className="text-muted-foreground/40">—</span>;

  const config =
    state === "양산"
      ? {
          className:
            "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400",
        }
      : state === "개발"
        ? {
            className:
              "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400",
          }
        : {
            className: "border-muted bg-muted/50 text-muted-foreground",
          };

  return (
    <Badge variant="outline" className={config.className}>
      {state}
    </Badge>
  );
}

function PropertyRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <tr className="border-b border-border/50 last:border-b-0">
      <td className="w-28 py-2.5 pr-4 text-sm text-muted-foreground">
        {label}
      </td>
      <td className="py-2.5 text-sm text-foreground">
        {value ?? <span className="text-muted-foreground/40">—</span>}
      </td>
    </tr>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border bg-muted/30 px-4 py-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-lg font-semibold text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

// 기본정보 탭
function InfoTab({ item }: { item: PartDetailResponse }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      {/* 속성 테이블 */}
      <div className="lg:col-span-3">
        <h3 className="mb-3 text-sm font-medium text-foreground">속성</h3>
        <div className="rounded-lg border">
          <table className="w-full">
            <tbody>
              <PropertyRow
                label="품번"
                value={
                  <span className="font-mono text-xs">
                    {item.part_number}
                  </span>
                }
              />
              <PropertyRow label="품명" value={item.name} />
              <PropertyRow label="리비전" value={item.revision} />
              <PropertyRow label="카테고리" value={item.category} />
              <PropertyRow label="재질" value={item.material} />
              <PropertyRow
                label="상태"
                value={<StatusBadge state={item.lifecycle_state} />}
              />
              <PropertyRow label="단위" value={item.unit} />
              <PropertyRow
                label="팬텀"
                value={
                  item.is_phantom != null
                    ? item.is_phantom
                      ? "예"
                      : "아니오"
                    : null
                }
              />
              <PropertyRow
                label="리드타임"
                value={
                  item.lead_time_days != null
                    ? `${item.lead_time_days}일`
                    : null
                }
              />
            </tbody>
          </table>
        </div>
      </div>

      {/* 요약 + 설명 */}
      <div className="lg:col-span-2">
        <h3 className="mb-3 text-sm font-medium text-foreground">요약</h3>
        <div className="mb-6 grid grid-cols-3 gap-3">
          <SummaryCard
            icon={Network}
            label="BOM"
            value={item.children.length}
          />
          <SummaryCard
            icon={FileText}
            label="도면"
            value={item.drawings.length}
          />
          <SummaryCard
            icon={GitBranch}
            label="Rev"
            value={item.revision ?? "—"}
          />
        </div>

        <h3 className="mb-3 text-sm font-medium text-foreground">설명</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {item.description || (
            <span className="text-muted-foreground/40">
              설명이 없습니다.
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

// BOM 단순 테이블
function BomFlatTable({
  title,
  items,
  emptyMessage,
}: {
  title: string;
  items: (BomChild | BomParent)[];
  emptyMessage: string;
}) {
  if (items.length === 0) return <EmptyState message={emptyMessage} />;

  return (
    <div>
      <h3 className="mb-3 text-sm font-medium text-foreground">{title}</h3>
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full table-fixed text-sm">
          <colgroup>
            <col style={{ width: "25%" }} />
            <col />
            <col style={{ width: "12%" }} />
          </colgroup>
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="py-2.5 pl-4 pr-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                품번
              </th>
              <th className="py-2.5 pl-4 pr-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                품명
              </th>
              <th className="py-2.5 pl-4 pr-2 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                수량
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.part_number}
                className="border-b border-border/50 last:border-b-0 hover:bg-muted/50"
              >
                <td className="py-2.5 pl-4 pr-2 font-mono text-xs font-medium text-primary">
                  {item.part_number}
                </td>
                <td className="py-2.5 pl-4 pr-2 text-foreground">
                  {item.name ?? (
                    <span className="text-muted-foreground/40">—</span>
                  )}
                </td>
                <td className="py-2.5 pl-4 pr-2 text-right font-medium text-foreground">
                  {item.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// BOM 탭
function BomTab({
  children,
  parents,
  onAnalyze,
  onUpload,
}: {
  children: BomChild[];
  parents: BomParent[];
  onAnalyze: () => void;
  onUpload: () => void;
}) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-end gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onAnalyze}
          className="ai-outline-btn ai-theme-1"
        >
          <Sparkles className="ai-outline-btn__icon h-4 w-4" />
          속성 분석
        </Button>
        <Button size="sm" variant="outline" onClick={onUpload}>
          <Upload className="h-4 w-4" />
          부품 업로드
        </Button>
      </div>

      <div className="space-y-6">
        <BomFlatTable
          title="하위 부품"
          items={children}
          emptyMessage="하위 부품이 없습니다"
        />
        <BomFlatTable
          title="상위 부품"
          items={parents}
          emptyMessage="상위 부품이 없습니다"
        />
      </div>
    </div>
  );
}

// 도면 탭
function DrawingsTab({ drawings }: { drawings: RelatedDrawing[] }) {
  if (drawings.length === 0)
    return <EmptyState message="등록된 도면이 없습니다" />;

  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full table-fixed text-sm">
        <colgroup>
          <col style={{ width: "25%" }} />
          <col />
          <col style={{ width: "12%" }} />
          <col style={{ width: "12%" }} />
        </colgroup>
        <thead>
          <tr className="border-b bg-muted/50 text-left">
            <th className="py-2.5 pl-4 pr-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              도면번호
            </th>
            <th className="py-2.5 pl-4 pr-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              도면명
            </th>
            <th className="py-2.5 pl-4 pr-2 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              버전
            </th>
            <th className="py-2.5 pl-4 pr-2 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              상태
            </th>
          </tr>
        </thead>
        <tbody>
          {drawings.map((d) => (
            <tr
              key={d.drawing_number}
              className="border-b border-border/50 last:border-b-0 hover:bg-muted/50"
            >
              <td className="py-2.5 pl-4 pr-2 font-mono text-xs font-medium text-primary">
                {d.drawing_number}
              </td>
              <td className="py-2.5 pl-4 pr-2 text-foreground">
                {d.name ?? (
                  <span className="text-muted-foreground/40">—</span>
                )}
              </td>
              <td className="py-2.5 pl-4 pr-2 text-center text-muted-foreground">
                {d.version ?? "—"}
              </td>
              <td className="py-2.5 pl-4 pr-2 text-center text-muted-foreground">
                {d.status ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 공급사 탭
function SuppliersTab({ suppliers }: { suppliers: RelatedSupplier[] }) {
  if (suppliers.length === 0)
    return <EmptyState message="등록된 공급사가 없습니다" />;

  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full table-fixed text-sm">
        <colgroup>
          <col />
          <col style={{ width: "15%" }} />
          <col style={{ width: "15%" }} />
          <col style={{ width: "15%" }} />
        </colgroup>
        <thead>
          <tr className="border-b bg-muted/50 text-left">
            <th className="py-2.5 pl-4 pr-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              업체명
            </th>
            <th className="py-2.5 pl-4 pr-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              코드
            </th>
            <th className="py-2.5 pl-4 pr-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              국가
            </th>
            <th className="py-2.5 pl-4 pr-2 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              단가
            </th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((s) => (
            <tr
              key={`${s.company_name}-${s.code}`}
              className="border-b border-border/50 last:border-b-0 hover:bg-muted/50"
            >
              <td className="py-2.5 pl-4 pr-2 font-medium text-foreground">
                {s.company_name}
              </td>
              <td className="py-2.5 pl-4 pr-2 font-mono text-xs text-muted-foreground">
                {s.code ?? "—"}
              </td>
              <td className="py-2.5 pl-4 pr-2 text-muted-foreground">
                {s.country ?? "—"}
              </td>
              <td className="py-2.5 pl-4 pr-2 text-right text-foreground">
                {s.unit_cost != null
                  ? s.unit_cost.toLocaleString("ko-KR")
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 이력 탭
function HistoryTab() {
  return <EmptyState message="변경 이력이 없습니다" />;
}

// 빈 상태
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <FileText className="h-6 w-6" />
      </div>
      <p className="text-sm">{message}</p>
    </div>
  );
}

// --- 메인 컴포넌트 ---

type TabKey = "info" | "bom" | "drawings" | "suppliers" | "history";

const TABS: { key: TabKey; label: string }[] = [
  { key: "info", label: "기본정보" },
  { key: "bom", label: "BOM" },
  { key: "drawings", label: "도면" },
  { key: "suppliers", label: "공급사" },
  { key: "history", label: "이력" },
];

export function PartDetailPage() {
  const { partId } = useParams<{ partId: string }>();
  const navigate = useNavigate();
  const openPartsUploadModal = usePartsUploadStore((s) => s.openModal);
  const [activeTab, setActiveTab] = useState<TabKey>("info");

  const { data: item, isLoading, isError } = usePartDetail(partId);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background px-6 py-8">
        <div className="dev-page-container">
          <button
            onClick={() => navigate("/parts")}
            className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            부품 관리
          </button>
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              불러오는 중...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 에러 또는 데이터 없음
  if (isError || !item) {
    return (
      <div className="min-h-screen bg-background px-6 py-8">
        <div className="dev-page-container">
          <button
            onClick={() => navigate("/parts")}
            className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            부품 관리
          </button>
          <EmptyState
            message={`해당하는 부품을 찾을 수 없습니다`}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="dev-page-container">
        {/* 헤더 영역 */}
        <div className="mb-6">
          {/* 상단: 뒤로가기 + 액션 버튼 */}
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => navigate("/parts")}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              부품 관리
            </button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Pencil className="h-3.5 w-3.5" />
                편집
              </Button>
              <Button variant="outline" size="icon-sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 품번 + 상태 + 카테고리 */}
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-xl font-bold text-foreground">
              {item.part_number}
            </h1>
            <StatusBadge state={item.lifecycle_state} />
            {item.category && (
              <span className="text-sm text-muted-foreground">
                {item.category}
              </span>
            )}
          </div>

          {/* 품명 */}
          {item.name && (
            <p className="mt-1 text-lg text-foreground">{item.name}</p>
          )}

          {/* 메타 정보 */}
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            {item.revision && <span>Rev {item.revision}</span>}
            {item.material && (
              <>
                <span className="text-border">&middot;</span>
                <span>{item.material}</span>
              </>
            )}
            <span className="text-border">&middot;</span>
            <span>도면 {item.drawings.length}건</span>
            <span className="text-border">&middot;</span>
            <span>하위부품 {item.children.length}건</span>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="mb-6 border-b">
          <div className="flex gap-0">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 탭 내용 */}
        {activeTab === "info" && <InfoTab item={item} />}
        {activeTab === "bom" && (
          <BomTab
            children={item.children}
            parents={item.parents}
            onAnalyze={() =>
              navigate(`/parts/${item.id}/templates`)
            }
            onUpload={() => openPartsUploadModal(item.part_number)}
          />
        )}
        {activeTab === "drawings" && (
          <DrawingsTab drawings={item.drawings} />
        )}
        {activeTab === "suppliers" && (
          <SuppliersTab suppliers={item.suppliers} />
        )}
        {activeTab === "history" && <HistoryTab />}
      </div>
    </div>
  );
}
