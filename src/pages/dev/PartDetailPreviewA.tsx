import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  MoreHorizontal,
  Network,
  FileText,
  GitBranch,
  Clock,
  Upload,
  ZoomIn,
  Maximize2,
  RotateCcw,
  Layers,
  Building2,
  ExternalLink,
  ChevronRight,
  Package,
  ImageOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// =============================================================================
// A안: Drawing Hero + Side Properties
// 컨셉: 도면이 시각적 중심, 속성은 사이드바로 항상 노출
//        탭은 BOM / 도면 / 공급사 / 이력만 관리
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
  drawing_thumbnail: string | null;
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
    part_number: "BRK-001",
    name: "브라켓 A",
    revision: "A",
    material: "SUS304",
    category: "기구부품",
    description:
      "본 부품은 메인 프레임 조립체의 우측 고정용 브라켓으로, 모터 하우징과 베이스 플레이트를 연결하는 역할을 합니다. SUS304 재질로 내식성이 우수하며, 표면 처리는 전해연마 적용.",
    specification: "KS D 3698",
    weight: 1.25,
    unit: "EA",
    lifecycle_state: "양산",
    is_phantom: false,
    lead_time_days: 14,
    children_count: 5,
    drawings_count: 2,
    suppliers_count: 2,
    drawing_thumbnail: null,
  },
  "BLT-001": {
    part_number: "BLT-001",
    name: "육각 볼트 M8x25",
    revision: "A",
    material: "SUS304",
    category: "구매부품",
    description: "체결용 표준 볼트. 프레임 및 브래킷 고정에 사용됩니다.",
    specification: "KS B 1010",
    weight: 0.02,
    unit: "EA",
    lifecycle_state: "양산",
    is_phantom: false,
    lead_time_days: 3,
    children_count: 0,
    drawings_count: 0,
    suppliers_count: 3,
    drawing_thumbnail: null,
  },
  "HSG-002": {
    part_number: "HSG-002",
    name: "기어박스 하우징",
    revision: "C",
    material: "FC250",
    category: "기구부품",
    description:
      "기어 트레인을 수용하는 하우징. 주철 재질로 높은 강성과 진동 감쇠 특성 보유.",
    specification: "KS D 4301",
    weight: 8.3,
    unit: "EA",
    lifecycle_state: "개발",
    is_phantom: false,
    lead_time_days: 30,
    children_count: 12,
    drawings_count: 3,
    suppliers_count: 1,
    drawing_thumbnail: null,
  },
  "GR-001": {
    part_number: "GR-001",
    name: "스퍼 기어",
    revision: "A",
    material: "SCM440",
    category: "구동부품",
    description:
      "1단 감속용 스퍼 기어. 모듈 2, 잇수 40. 침탄열처리 후 연삭 가공.",
    specification: "KS B 1405",
    weight: 0.85,
    unit: "EA",
    lifecycle_state: "폐기",
    is_phantom: false,
    lead_time_days: null,
    children_count: 0,
    drawings_count: 1,
    suppliers_count: 0,
    drawing_thumbnail: null,
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

// --- 서브 컴포넌트 ---

function LifecycleBadge({ state }: { state: string }) {
  const config =
    state === "양산"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
      : state === "개발"
        ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400"
        : "border-muted bg-muted/50 text-muted-foreground";

  return (
    <Badge variant="outline" className={config}>
      {state}
    </Badge>
  );
}

function Dash() {
  return <span className="text-muted-foreground/30">—</span>;
}

// 도면 프리뷰 영역
function DrawingPreview({ item }: { item: PartDetail }) {
  const hasDrawing = item.drawings_count > 0;

  return (
    <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border bg-muted/20">
      {hasDrawing ? (
        <>
          {/* 도면 썸네일 placeholder — 실제론 이미지/PDF 렌더 */}
          <div className="flex flex-col items-center gap-3 text-muted-foreground/50">
            <div className="relative">
              <FileText className="h-16 w-16" strokeWidth={1} />
              {/* 모서리에 작은 "도면" 아이콘 */}
              <div className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Layers className="h-3.5 w-3.5" />
              </div>
            </div>
            <span className="text-xs">도면 미리보기</span>
          </div>

          {/* 뷰어 컨트롤 오버레이 */}
          <div className="absolute right-3 bottom-3 flex items-center gap-1">
            <button className="flex h-7 w-7 items-center justify-center rounded-md bg-background/80 text-muted-foreground shadow-sm backdrop-blur-sm hover:bg-background hover:text-foreground">
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button className="flex h-7 w-7 items-center justify-center rounded-md bg-background/80 text-muted-foreground shadow-sm backdrop-blur-sm hover:bg-background hover:text-foreground">
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button className="flex h-7 w-7 items-center justify-center rounded-md bg-background/80 text-muted-foreground shadow-sm backdrop-blur-sm hover:bg-background hover:text-foreground">
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* 도면 번호 오버레이 */}
          <div className="absolute left-3 bottom-3">
            <span className="rounded-md bg-background/80 px-2 py-1 font-mono text-[11px] text-muted-foreground shadow-sm backdrop-blur-sm">
              DWG-{item.part_number}
            </span>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
          <ImageOff className="h-10 w-10" strokeWidth={1.2} />
          <span className="text-xs">등록된 도면 없음</span>
          <Button variant="outline" size="sm" className="mt-1 text-xs">
            <Upload className="h-3 w-3" />
            도면 등록
          </Button>
        </div>
      )}
    </div>
  );
}

// 속성 사이드바
function PropertiesSidebar({ item }: { item: PartDetail }) {
  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "품번", value: <span className="font-mono text-xs">{item.part_number}</span> },
    { label: "리비전", value: <span className="inline-flex h-5 min-w-5 items-center justify-center rounded bg-muted px-1 font-mono text-[11px] font-medium text-muted-foreground">{item.revision}</span> },
    { label: "카테고리", value: item.category },
    { label: "재질", value: item.material ?? <Dash /> },
    { label: "규격", value: item.specification ?? <Dash /> },
    { label: "중량", value: item.weight != null ? `${item.weight} kg` : <Dash /> },
    { label: "단위", value: item.unit },
    { label: "리드타임", value: item.lead_time_days != null ? `${item.lead_time_days}일` : <Dash /> },
    { label: "팬텀", value: item.is_phantom ? "예" : "아니오" },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* 요약 카운터 */}
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center rounded-lg border bg-muted/30 py-2.5">
          <span className="text-base font-semibold text-foreground">{item.children_count}</span>
          <span className="text-[10px] text-muted-foreground">하위부품</span>
        </div>
        <div className="flex flex-col items-center rounded-lg border bg-muted/30 py-2.5">
          <span className="text-base font-semibold text-foreground">{item.drawings_count}</span>
          <span className="text-[10px] text-muted-foreground">도면</span>
        </div>
        <div className="flex flex-col items-center rounded-lg border bg-muted/30 py-2.5">
          <span className="text-base font-semibold text-foreground">{item.suppliers_count}</span>
          <span className="text-[10px] text-muted-foreground">공급사</span>
        </div>
      </div>

      {/* 속성 리스트 */}
      <div className="rounded-lg border">
        <table className="w-full">
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-border/50 last:border-b-0">
                <td className="w-20 py-2 pl-3 pr-2 text-xs text-muted-foreground">{row.label}</td>
                <td className="py-2 pr-3 text-sm text-foreground">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 설명 */}
      {item.description && (
        <div>
          <h4 className="mb-1.5 text-xs font-medium text-muted-foreground">설명</h4>
          <p className="text-sm leading-relaxed text-foreground/80">{item.description}</p>
        </div>
      )}
    </div>
  );
}

// BOM 탭
function BomTab({ children, parents }: { children: BomChild[]; parents: BomParent[] }) {
  return (
    <div className="space-y-6">
      {/* 하위 부품 */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <Network className="h-3.5 w-3.5 text-muted-foreground" />
            하위 부품
            <span className="text-xs text-muted-foreground">({children.length})</span>
          </h3>
          {children.length > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
              BOM 전체 보기
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}
        </div>
        {children.length === 0 ? (
          <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground/60">
            하위 부품이 없습니다
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="py-2 pl-3 pr-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">품번</th>
                  <th className="py-2 px-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">품명</th>
                  <th className="py-2 px-2 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">수량</th>
                  <th className="py-2 pl-2 pr-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">단위</th>
                </tr>
              </thead>
              <tbody>
                {children.map((c) => (
                  <tr key={c.part_number} className="border-b border-border/40 last:border-b-0 hover:bg-muted/30">
                    <td className="py-2 pl-3 pr-2">
                      <button className="font-mono text-xs font-medium text-primary hover:underline">{c.part_number}</button>
                    </td>
                    <td className="py-2 px-2 text-foreground">{c.name}</td>
                    <td className="py-2 px-2 text-right font-medium text-foreground">{c.quantity}</td>
                    <td className="py-2 pl-2 pr-3 text-muted-foreground">{c.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 상위 사용처 (Where Used) */}
      <div>
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-foreground">
          <ChevronRight className="h-3.5 w-3.5 rotate-180 text-muted-foreground" />
          사용처 (Where Used)
          <span className="text-xs text-muted-foreground">({parents.length})</span>
        </h3>
        {parents.length === 0 ? (
          <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground/60">
            상위 부품이 없습니다
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="py-2 pl-3 pr-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">품번</th>
                  <th className="py-2 px-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">품명</th>
                  <th className="py-2 pl-2 pr-3 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">수량</th>
                </tr>
              </thead>
              <tbody>
                {parents.map((p) => (
                  <tr key={p.part_number} className="border-b border-border/40 last:border-b-0 hover:bg-muted/30">
                    <td className="py-2 pl-3 pr-2">
                      <button className="font-mono text-xs font-medium text-primary hover:underline">{p.part_number}</button>
                    </td>
                    <td className="py-2 px-2 text-foreground">{p.name}</td>
                    <td className="py-2 pl-2 pr-3 text-right font-medium text-foreground">{p.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// 도면 탭
function DrawingsTab({ drawings }: { drawings: RelatedDrawing[] }) {
  if (drawings.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground/60">
        등록된 도면이 없습니다
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="py-2 pl-3 pr-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">도면번호</th>
            <th className="py-2 px-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">도면명</th>
            <th className="py-2 px-2 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">버전</th>
            <th className="py-2 pl-2 pr-3 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">상태</th>
          </tr>
        </thead>
        <tbody>
          {drawings.map((d) => (
            <tr key={d.drawing_number} className="border-b border-border/40 last:border-b-0 hover:bg-muted/30">
              <td className="py-2 pl-3 pr-2 font-mono text-xs font-medium text-primary">{d.drawing_number}</td>
              <td className="py-2 px-2 text-foreground">{d.name ?? <Dash />}</td>
              <td className="py-2 px-2 text-center text-muted-foreground">{d.version ?? <Dash />}</td>
              <td className="py-2 pl-2 pr-3 text-center">
                {d.status ? (
                  <Badge variant="outline" className="text-[10px]">{d.status}</Badge>
                ) : <Dash />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 공급사 탭
function SuppliersTab({ suppliers }: { suppliers: Supplier[] }) {
  if (suppliers.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground/60">
        등록된 공급사가 없습니다
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="py-2 pl-3 pr-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">업체명</th>
            <th className="py-2 px-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">코드</th>
            <th className="py-2 px-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">국가</th>
            <th className="py-2 pl-2 pr-3 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">단가</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((s) => (
            <tr key={`${s.company_name}-${s.code}`} className="border-b border-border/40 last:border-b-0 hover:bg-muted/30">
              <td className="py-2 pl-3 pr-2 font-medium text-foreground">{s.company_name}</td>
              <td className="py-2 px-2 font-mono text-xs text-muted-foreground">{s.code ?? <Dash />}</td>
              <td className="py-2 px-2 text-muted-foreground">{s.country ?? <Dash />}</td>
              <td className="py-2 pl-2 pr-3 text-right text-foreground">
                {s.unit_cost != null ? `₩${s.unit_cost.toLocaleString("ko-KR")}` : <Dash />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 이력 탭
function HistoryTab({ history }: { history: HistoryEntry[] }) {
  if (history.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-16 text-center text-sm text-muted-foreground/60">
        변경 이력이 없습니다
      </div>
    );
  }

  return (
    <div className="relative pl-6">
      <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" />
      <div className="space-y-5">
        {history.map((h) => (
          <div key={h.id} className="relative">
            <div className="absolute -left-6 top-1.5 h-[7px] w-[7px] rounded-full border-2 border-primary bg-background" />
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-medium text-foreground">{h.action}</span>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">{h.detail}</p>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground/60">
              <Clock className="h-3 w-3" />
              {h.date} · {h.user}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- 메인 컴포넌트 ---

type TabKey = "bom" | "drawings" | "suppliers" | "history";

const TABS: { key: TabKey; label: string; icon: React.ElementType; count?: (item: PartDetail) => number }[] = [
  { key: "bom", label: "BOM", icon: Network, count: (i) => i.children_count },
  { key: "drawings", label: "도면", icon: FileText, count: (i) => i.drawings_count },
  { key: "suppliers", label: "공급사", icon: Building2, count: (i) => i.suppliers_count },
  { key: "history", label: "이력", icon: Clock },
];

export function PartDetailPreviewA() {
  const { partNumber } = useParams<{ partNumber: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>("bom");

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
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Package className="mb-3 h-12 w-12 text-muted-foreground/30" strokeWidth={1.2} />
            <p className="text-sm">품번 &ldquo;{partNumber}&rdquo;에 해당하는 부품을 찾을 수 없습니다</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="dev-page-container">
        {/* 네비게이션 + 액션 */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/dev/parts")}
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

        {/* 헤더: 품번 + 상태 + 품명 */}
        <div className="mb-5">
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-xl font-bold text-foreground">{item.part_number}</h1>
            <LifecycleBadge state={item.lifecycle_state} />
            <span className="text-sm text-muted-foreground">{item.category}</span>
          </div>
          <p className="mt-1 text-lg text-foreground">{item.name}</p>
        </div>

        {/* 히어로 영역: 도면 프리뷰(좌) + 속성 사이드바(우) */}
        <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <DrawingPreview item={item} />
          </div>
          <div className="lg:col-span-2">
            <PropertiesSidebar item={item} />
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="mb-5 border-b">
          <div className="flex gap-0">
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
                    <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-muted px-1 text-[10px] font-medium text-muted-foreground">
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

        {/* 탭 내용 */}
        {activeTab === "bom" && <BomTab children={MOCK_CHILDREN} parents={MOCK_PARENTS} />}
        {activeTab === "drawings" && <DrawingsTab drawings={MOCK_DRAWINGS} />}
        {activeTab === "suppliers" && <SuppliersTab suppliers={MOCK_SUPPLIERS} />}
        {activeTab === "history" && <HistoryTab history={MOCK_HISTORY} />}
      </div>
    </div>
  );
}
