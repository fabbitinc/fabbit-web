import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  MoreHorizontal,
  Network,
  FileText,
  Clock,
  Building2,
  ExternalLink,
  Package,
  ChevronRight,
  MapPin,
  ImageOff,
  Layers,
  ZoomIn,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// =============================================================================
// C안 (parts4): Visual Header + Icon Tabs
// 컨셉: 시각적으로 풍성한 헤더 (도면 썸네일 + 속성 요약)
//        아이콘 + 카운트가 있는 탭 바, 여백 넉넉한 콘텐츠
// =============================================================================

// --- 타입 ---

interface PartDetail {
  part_number: string;
  name: string;
  revision: string;
  material: string | null;
  category: string;
  description: string;
  specification: string | null;
  weight: number | null;
  unit: string;
  lifecycle_state: "양산" | "개발" | "폐기";
  is_phantom: boolean;
  lead_time_days: number | null;
  children_count: number;
  drawings_count: number;
  suppliers_count: number;
}

interface BomChild {
  part_number: string;
  name: string;
  quantity: number;
  unit: string;
}

interface BomParent {
  part_number: string;
  name: string;
  quantity: number;
}

interface RelatedDrawing {
  drawing_number: string;
  name: string | null;
  version: string | null;
  status: string | null;
}

interface Supplier {
  company_name: string;
  code: string | null;
  country: string | null;
  unit_cost: number | null;
}

interface HistoryEntry {
  id: string;
  date: string;
  user: string;
  action: string;
  detail: string;
}

// --- Mock 데이터 ---

const MOCK_PARTS: Record<string, PartDetail> = {
  "BRK-001": {
    part_number: "BRK-001", name: "브라켓 A", revision: "A", material: "SUS304",
    category: "기구부품",
    description: "본 부품은 메인 프레임 조립체의 우측 고정용 브라켓으로, 모터 하우징과 베이스 플레이트를 연결하는 역할을 합니다. SUS304 재질로 내식성이 우수하며, 표면 처리는 전해연마 적용.",
    specification: "KS D 3698", weight: 1.25, unit: "EA", lifecycle_state: "양산",
    is_phantom: false, lead_time_days: 14, children_count: 5, drawings_count: 2, suppliers_count: 2,
  },
  "BLT-001": {
    part_number: "BLT-001", name: "육각 볼트 M8x25", revision: "A", material: "SUS304",
    category: "구매부품",
    description: "체결용 표준 볼트. 프레임 및 브래킷 고정에 사용됩니다.",
    specification: "KS B 1010", weight: 0.02, unit: "EA", lifecycle_state: "양산",
    is_phantom: false, lead_time_days: 3, children_count: 0, drawings_count: 0, suppliers_count: 3,
  },
  "HSG-002": {
    part_number: "HSG-002", name: "기어박스 하우징", revision: "C", material: "FC250",
    category: "기구부품",
    description: "기어 트레인을 수용하는 하우징. 주철 재질로 높은 강성과 진동 감쇠 특성 보유.",
    specification: "KS D 4301", weight: 8.3, unit: "EA", lifecycle_state: "개발",
    is_phantom: false, lead_time_days: 30, children_count: 12, drawings_count: 3, suppliers_count: 1,
  },
  "GR-001": {
    part_number: "GR-001", name: "스퍼 기어", revision: "A", material: "SCM440",
    category: "구동부품",
    description: "1단 감속용 스퍼 기어. 모듈 2, 잇수 40. 침탄열처리 후 연삭 가공.",
    specification: "KS B 1405", weight: 0.85, unit: "EA", lifecycle_state: "폐기",
    is_phantom: false, lead_time_days: null, children_count: 0, drawings_count: 1, suppliers_count: 0,
  },
};

const MOCK_CHILDREN: BomChild[] = [
  { part_number: "BLT-001", name: "육각 볼트 M8x25", quantity: 4, unit: "EA" },
  { part_number: "NUT-001", name: "육각 너트 M8", quantity: 4, unit: "EA" },
  { part_number: "PIN-001", name: "다웰 핀 Ø6x20", quantity: 2, unit: "EA" },
  { part_number: "GSK-001", name: "오링 P20", quantity: 1, unit: "EA" },
  { part_number: "SPR-001", name: "인장 스프링", quantity: 2, unit: "EA" },
];

const MOCK_PARENTS: BomParent[] = [
  { part_number: "FRM-001", name: "프레임 조립체", quantity: 2 },
  { part_number: "HSG-001", name: "모터 하우징", quantity: 1 },
];

const MOCK_DRAWINGS: RelatedDrawing[] = [
  { drawing_number: "DWG-BRK-001", name: "브라켓 A 조립도", version: "1.0", status: "승인" },
  { drawing_number: "DWG-BRK-001-D", name: "브라켓 A 상세도", version: "1.0", status: "승인" },
];

const MOCK_SUPPLIERS: Supplier[] = [
  { company_name: "한국정밀공업", code: "KPI-001", country: "한국", unit_cost: 12500 },
  { company_name: "동양스틸", code: "DYS-042", country: "한국", unit_cost: 11800 },
];

const MOCK_HISTORY: HistoryEntry[] = [
  { id: "h1", date: "2025-02-01", user: "김설계", action: "속성 변경", detail: "중량 값 수정: 1.20kg → 1.25kg" },
  { id: "h2", date: "2025-01-15", user: "김설계", action: "도면 업로드", detail: "BRK-001_Rev.A.pdf 업로드" },
  { id: "h3", date: "2024-12-20", user: "박검토", action: "상태 변경", detail: "개발 → 양산" },
  { id: "h4", date: "2024-06-10", user: "김설계", action: "리비전 생성", detail: "초기 리비전 A 생성" },
  { id: "h5", date: "2024-01-10", user: "김설계", action: "부품 생성", detail: "부품 신규 등록" },
];

// --- 헬퍼 ---

function LifecycleBadge({ state }: { state: string }) {
  const cls =
    state === "양산"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
      : state === "개발"
        ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400"
        : "border-muted bg-muted/50 text-muted-foreground";
  return <Badge variant="outline" className={cls}>{state}</Badge>;
}

function Dash() {
  return <span className="text-muted-foreground/30">—</span>;
}

function EmptyBlock({ message, icon: Icon = FileText }: { message: string; icon?: React.ElementType }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground/40" />
      </div>
      <p className="text-sm text-muted-foreground/50">{message}</p>
    </div>
  );
}

// --- 헤더 영역 ---

function HeaderCard({ item }: { item: PartDetail }) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="p-5">
          {/* 품번 + 상태 + 액션 */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <h1 className="font-mono text-xl font-bold text-foreground">{item.part_number}</h1>
              <LifecycleBadge state={item.lifecycle_state} />
            </div>
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm">
                <Pencil className="h-3.5 w-3.5" />
                편집
              </Button>
              <Button variant="outline" size="icon-sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 품명 */}
          <p className="mt-1 text-base text-foreground">{item.name}</p>

          {/* 핵심 속성 — 인라인 그리드 */}
          <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-1.5 sm:grid-cols-4">
            <div>
              <dt className="text-[10px] text-muted-foreground/60">리비전</dt>
              <dd className="text-sm font-medium text-foreground">{item.revision}</dd>
            </div>
            <div>
              <dt className="text-[10px] text-muted-foreground/60">재질</dt>
              <dd className="text-sm text-foreground">{item.material ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-[10px] text-muted-foreground/60">카테고리</dt>
              <dd className="text-sm text-foreground">{item.category}</dd>
            </div>
            <div>
              <dt className="text-[10px] text-muted-foreground/60">중량</dt>
              <dd className="text-sm text-foreground">{item.weight != null ? `${item.weight} kg` : "—"}</dd>
            </div>
          </div>

          {/* 설명 (한 줄 truncate) */}
          {item.description && (
            <p className="mt-3 truncate text-sm text-muted-foreground">{item.description}</p>
          )}

          {/* 카운터 스트립 */}
          <div className="mt-4 flex items-center gap-4 border-t pt-3">
            <CounterChip icon={Network} label="하위 부품" count={item.children_count} />
            <CounterChip icon={FileText} label="도면" count={item.drawings_count} />
            <CounterChip icon={Building2} label="공급사" count={item.suppliers_count} />
            {item.lead_time_days != null && (
              <CounterChip icon={Clock} label="리드타임" count={item.lead_time_days} suffix="일" />
            )}
          </div>
        </div>
      </div>
  );
}

// 도면 프리뷰 (속성 탭용)
function DrawingPreview({ item }: { item: PartDetail }) {
  const hasDrawing = item.drawings_count > 0;

  return (
    <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border bg-muted/20">
      {hasDrawing ? (
        <>
          <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
            <div className="relative">
              <FileText className="h-14 w-14" strokeWidth={1} />
              <div className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Layers className="h-3 w-3" />
              </div>
            </div>
            <span className="text-[10px]">도면 미리보기</span>
          </div>
          <div className="absolute right-2 bottom-2 flex gap-1">
            <button className="flex h-6 w-6 items-center justify-center rounded bg-background/80 text-muted-foreground shadow-sm hover:text-foreground">
              <ZoomIn className="h-3 w-3" />
            </button>
            <button className="flex h-6 w-6 items-center justify-center rounded bg-background/80 text-muted-foreground shadow-sm hover:text-foreground">
              <Maximize2 className="h-3 w-3" />
            </button>
          </div>
          <div className="absolute left-2 bottom-2">
            <span className="rounded bg-background/80 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground shadow-sm">
              DWG-{item.part_number}
            </span>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-1.5 text-muted-foreground/25">
          <ImageOff className="h-10 w-10" strokeWidth={1.2} />
          <span className="text-[10px]">등록된 도면 없음</span>
        </div>
      )}
    </div>
  );
}

function CounterChip({
  icon: Icon,
  label,
  count,
  suffix,
}: {
  icon: React.ElementType;
  label: string;
  count: number;
  suffix?: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
      <span className="font-medium text-foreground">{count}{suffix}</span>
    </div>
  );
}

// --- 탭 콘텐츠 ---

// 속성 상세
function PropertiesTab({ item }: { item: PartDetail }) {
  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "품번", value: <span className="font-mono text-xs">{item.part_number}</span> },
    { label: "품명", value: item.name },
    { label: "리비전", value: item.revision },
    { label: "상태", value: <LifecycleBadge state={item.lifecycle_state} /> },
    { label: "카테고리", value: item.category },
    { label: "재질", value: item.material ?? <Dash /> },
    { label: "규격", value: item.specification ?? <Dash /> },
    { label: "중량", value: item.weight != null ? `${item.weight} kg` : <Dash /> },
    { label: "단위", value: item.unit },
    { label: "리드타임", value: item.lead_time_days != null ? `${item.lead_time_days}일` : <Dash /> },
    { label: "팬텀", value: item.is_phantom ? "예" : "아니오" },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
      {/* 좌: 도면 프리뷰 */}
      <div className="lg:col-span-3">
        <DrawingPreview item={item} />
      </div>

      {/* 우: 속성 + 설명 */}
      <div className="space-y-4 lg:col-span-2">
        <div className="rounded-lg border">
          <table className="w-full">
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b border-border/40 last:border-b-0">
                  <td className="w-24 py-2.5 pl-4 pr-2 text-xs text-muted-foreground">{row.label}</td>
                  <td className="py-2.5 pr-4 text-sm text-foreground">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {item.description && (
          <div>
            <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground/70">설명</h4>
            <p className="text-sm leading-relaxed text-foreground/80">{item.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// BOM
function BomTab({ children, parents }: { children: BomChild[]; parents: BomParent[] }) {
  return (
    <div className="space-y-8">
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h4 className="flex items-center gap-2 text-sm font-medium text-foreground">
            하위 부품
            <span className="text-xs font-normal text-muted-foreground">({children.length})</span>
          </h4>
          {children.length > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
              BOM 전체 보기 <ExternalLink className="h-3 w-3" />
            </Button>
          )}
        </div>
        {children.length === 0 ? (
          <EmptyBlock message="하위 부품이 없습니다" icon={Network} />
        ) : (
          <div className="space-y-1.5">
            {children.map((c) => (
              <div
                key={c.part_number}
                className="flex items-center justify-between rounded-lg border px-4 py-3 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <button className="font-mono text-xs font-medium text-primary hover:underline">
                      {c.part_number}
                    </button>
                    <p className="text-sm text-foreground">{c.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-foreground">{c.quantity}</span>
                  <span className="ml-1 text-xs text-muted-foreground">{c.unit}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
          사용처 · Where Used
          <span className="text-xs font-normal text-muted-foreground">({parents.length})</span>
        </h4>
        {parents.length === 0 ? (
          <EmptyBlock message="상위 부품이 없습니다" icon={ChevronRight} />
        ) : (
          <div className="space-y-1.5">
            {parents.map((p) => (
              <div
                key={p.part_number}
                className="flex items-center justify-between rounded-lg border px-4 py-3 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <button className="font-mono text-xs font-medium text-primary hover:underline">
                      {p.part_number}
                    </button>
                    <p className="text-sm text-foreground">{p.name}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-foreground">×{p.quantity}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// 도면
function DrawingsTab({ drawings }: { drawings: RelatedDrawing[] }) {
  if (drawings.length === 0) return <EmptyBlock message="등록된 도면이 없습니다" />;

  return (
    <div className="space-y-1.5">
      {drawings.map((d) => (
        <div
          key={d.drawing_number}
          className="flex items-center justify-between rounded-lg border px-4 py-3 transition-colors hover:bg-muted/30"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="font-mono text-xs font-medium text-primary">{d.drawing_number}</p>
              <p className="text-sm text-foreground">{d.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {d.version && <span className="text-xs text-muted-foreground">v{d.version}</span>}
            {d.status && <Badge variant="outline" className="text-[10px]">{d.status}</Badge>}
          </div>
        </div>
      ))}
    </div>
  );
}

// 공급사
function SuppliersTab({ suppliers }: { suppliers: Supplier[] }) {
  if (suppliers.length === 0) return <EmptyBlock message="등록된 공급사가 없습니다" icon={Building2} />;

  return (
    <div className="space-y-1.5">
      {suppliers.map((s) => (
        <div
          key={`${s.company_name}-${s.code}`}
          className="flex items-center justify-between rounded-lg border px-4 py-3 transition-colors hover:bg-muted/30"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{s.company_name}</p>
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                {s.code && <span className="font-mono">{s.code}</span>}
                {s.country && (
                  <span className="flex items-center gap-0.5">
                    <MapPin className="h-3 w-3" />
                    {s.country}
                  </span>
                )}
              </p>
            </div>
          </div>
          {s.unit_cost != null && (
            <span className="text-sm font-medium text-foreground">
              ₩{s.unit_cost.toLocaleString("ko-KR")}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// 이력
function HistoryTab({ history }: { history: HistoryEntry[] }) {
  if (history.length === 0) return <EmptyBlock message="변경 이력이 없습니다" icon={Clock} />;

  return (
    <div className="space-y-1.5">
      {history.map((h, idx) => (
        <div key={h.id} className="flex gap-4 rounded-lg border px-4 py-3">
          {/* 타임라인 도트 */}
          <div className="flex flex-col items-center pt-1">
            <div className="h-2 w-2 rounded-full bg-primary/60" />
            {idx < history.length - 1 && <div className="mt-1 flex-1 w-px bg-border" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{h.action}</span>
              <span className="text-[11px] text-muted-foreground/60">{h.date}</span>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">{h.detail}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground/50">{h.user}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- 메인 ---

type TabKey = "properties" | "bom" | "drawings" | "suppliers" | "history";

const TABS: { key: TabKey; label: string; icon: React.ElementType; count?: (item: PartDetail) => number }[] = [
  { key: "properties", label: "속성", icon: Package },
  { key: "bom", label: "BOM", icon: Network, count: (i) => i.children_count },
  { key: "drawings", label: "도면", icon: FileText, count: (i) => i.drawings_count },
  { key: "suppliers", label: "공급사", icon: Building2, count: (i) => i.suppliers_count },
  { key: "history", label: "이력", icon: Clock },
];

export function PartDetailPreviewC() {
  const { partNumber } = useParams<{ partNumber: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>("properties");

  const item = partNumber ? MOCK_PARTS[partNumber] : undefined;

  if (!item) {
    return (
      <div className="min-h-screen bg-background px-6 py-8">
        <div className="dev-page-container">
          <button
            onClick={() => navigate("/dev/parts")}
            className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            부품 관리
          </button>
          <EmptyBlock message={`품번 "${partNumber}"에 해당하는 부품을 찾을 수 없습니다`} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="dev-page-container">
        {/* 네비게이션 */}
        <div className="mb-4">
          <button
            onClick={() => navigate("/dev/parts")}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            부품 관리
          </button>
        </div>

        {/* 비주얼 헤더 카드 */}
        <div className="mb-5">
          <HeaderCard item={item} />
        </div>

        {/* 아이콘 탭 바 */}
        <div className="mb-5 border-b">
          <div className="flex">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const count = tab.count?.(item);
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                  {count != null && count > 0 && (
                    <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-muted px-1 text-[10px] font-medium text-muted-foreground">
                      {count}
                    </span>
                  )}
                  {activeTab === tab.key && (
                    <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 탭 콘텐츠 */}
        {activeTab === "properties" && <PropertiesTab item={item} />}
        {activeTab === "bom" && <BomTab children={MOCK_CHILDREN} parents={MOCK_PARENTS} />}
        {activeTab === "drawings" && <DrawingsTab drawings={MOCK_DRAWINGS} />}
        {activeTab === "suppliers" && <SuppliersTab suppliers={MOCK_SUPPLIERS} />}
        {activeTab === "history" && <HistoryTab history={MOCK_HISTORY} />}
      </div>
    </div>
  );
}
