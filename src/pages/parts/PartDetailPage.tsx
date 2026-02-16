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
  Clock,
  Download,
  FileImage,
  File,
  Upload,
  ChevronRight,
  ChevronDown,
  Paperclip,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// --- 타입 ---

type PartStatus = "Draft" | "Released" | "Obsolete";

interface PartDetail {
  part_number: string;
  name: string;
  revision: string;
  material: string | null;
  category: string;
  drawing_count: number;
  child_count: number;
  status: PartStatus;
  description: string;
  specification: string | null;
  weight: number | null;
  unit: string;
  item_type: "PART" | "ASSEMBLY";
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface BomTreeNode {
  part_number: string;
  name: string;
  revision: string;
  material: string | null;
  quantity: number;
  unit: string;
  children?: BomTreeNode[];
}

interface DrawingFile {
  id: string;
  file_name: string;
  file_size: string;
  file_type: string;
  revision: string;
  uploaded_at: string;
  uploaded_by: string;
}

interface HistoryEntry {
  id: string;
  date: string;
  user: string;
  action: string;
  revision: string;
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
    drawing_count: 2,
    child_count: 5,
    status: "Released",
    description:
      "본 부품은 메인 프레임 조립체의 우측 고정용 브라켓으로, 모터 하우징과 베이스 플레이트를 연결하는 역할을 합니다. SUS304 재질로 내식성이 우수하며, 표면 처리는 전해연마 적용.",
    specification: "KS D 3698",
    weight: 1.25,
    unit: "EA",
    item_type: "PART",
    created_at: "2024-01-10",
    updated_at: "2025-02-01",
    created_by: "김설계",
  },
  "BRK-002": {
    part_number: "BRK-002",
    name: "브라켓 B",
    revision: "B",
    material: "SUS316",
    category: "기구부품",
    drawing_count: 1,
    child_count: 3,
    status: "Released",
    description: "좌측 고정용 브라켓. 높은 내식성이 요구되는 환경에서 사용.",
    specification: "KS D 3698",
    weight: 1.1,
    unit: "EA",
    item_type: "PART",
    created_at: "2024-01-15",
    updated_at: "2025-01-20",
    created_by: "김설계",
  },
  "PLT-001": {
    part_number: "PLT-001",
    name: "베이스 플레이트",
    revision: "D",
    material: "AL6061",
    category: "기구부품",
    drawing_count: 3,
    child_count: 8,
    status: "Released",
    description:
      "전체 조립체의 기초가 되는 베이스 플레이트. 모든 주요 컴포넌트가 이 위에 조립됩니다.",
    specification: "KS D 6759",
    weight: 4.5,
    unit: "EA",
    item_type: "ASSEMBLY",
    created_at: "2023-11-05",
    updated_at: "2025-02-10",
    created_by: "박엔지니어",
  },
  "HSG-002": {
    part_number: "HSG-002",
    name: "기어박스 하우징",
    revision: "C",
    material: "FC250",
    category: "기구부품",
    drawing_count: 3,
    child_count: 12,
    status: "Draft",
    description:
      "기어 트레인을 수용하는 하우징. 주철 재질로 높은 강성과 진동 감쇠 특성 보유.",
    specification: "KS D 4301",
    weight: 8.3,
    unit: "EA",
    item_type: "ASSEMBLY",
    created_at: "2024-03-20",
    updated_at: "2025-02-12",
    created_by: "이기계",
  },
  "PCB-001": {
    part_number: "PCB-001",
    name: "메인 제어보드",
    revision: "B",
    material: null,
    category: "전자부품",
    drawing_count: 1,
    child_count: 7,
    status: "Released",
    description: "시스템 전체를 제어하는 메인 PCB. MCU, 통신 모듈, 전원부 포함.",
    specification: null,
    weight: 0.15,
    unit: "EA",
    item_type: "ASSEMBLY",
    created_at: "2024-02-10",
    updated_at: "2025-01-30",
    created_by: "최전자",
  },
  "GR-001": {
    part_number: "GR-001",
    name: "스퍼 기어",
    revision: "A",
    material: "SCM440",
    category: "구동부품",
    drawing_count: 1,
    child_count: 0,
    status: "Obsolete",
    description:
      "1단 감속용 스퍼 기어. 모듈 2, 잇수 40. 침탄열처리 후 연삭 가공.",
    specification: "KS B 1405",
    weight: 0.85,
    unit: "EA",
    item_type: "PART",
    created_at: "2024-01-08",
    updated_at: "2024-12-15",
    created_by: "이기계",
  },
  "BLT-001": {
    part_number: "BLT-001",
    name: "육각 볼트 M8x25",
    revision: "A",
    material: "SUS304",
    category: "구매부품",
    drawing_count: 0,
    child_count: 0,
    status: "Released",
    description: "체결용 표준 볼트. 프레임 및 브래킷 고정에 사용됩니다.",
    specification: "KS B 1010",
    weight: 0.02,
    unit: "EA",
    item_type: "PART",
    created_at: "2024-01-12",
    updated_at: "2025-01-20",
    created_by: "김설계",
  },
};

const MOCK_BOM_CHILDREN: BomTreeNode[] = [
  {
    part_number: "BLT-001", name: "육각 볼트 M8x25", revision: "A", material: "SUS304", quantity: 4, unit: "EA",
  },
  {
    part_number: "NUT-001", name: "육각 너트 M8", revision: "A", material: "SUS304", quantity: 4, unit: "EA",
  },
  {
    part_number: "PIN-001", name: "다웰 핀 Ø6x20", revision: "A", material: "SUJ2", quantity: 2, unit: "EA",
    children: [
      { part_number: "PIN-001-A", name: "핀 헤드", revision: "A", material: "SUJ2", quantity: 1, unit: "EA" },
      { part_number: "PIN-001-B", name: "핀 바디", revision: "A", material: "SUJ2", quantity: 1, unit: "EA" },
    ],
  },
  {
    part_number: "GSK-001", name: "오링 P20", revision: "A", material: "NBR", quantity: 1, unit: "EA",
  },
  {
    part_number: "SPR-001", name: "인장 스프링", revision: "A", material: "SWP", quantity: 2, unit: "EA",
  },
];

const MOCK_BOM_PARENTS: BomTreeNode[] = [
  {
    part_number: "FRM-001", name: "프레임 조립체", revision: "B", material: "SPHC", quantity: 2, unit: "EA",
    children: [
      { part_number: "MAIN-ASM", name: "메인 조립체", revision: "A", material: null, quantity: 1, unit: "EA" },
    ],
  },
  {
    part_number: "HSG-001", name: "모터 하우징", revision: "A", material: "AL6061", quantity: 1, unit: "EA",
  },
];

const MOCK_DRAWINGS: DrawingFile[] = [
  { id: "d1", file_name: "BRK-001_Rev.A.pdf", file_size: "2.4 MB", file_type: "PDF", revision: "A", uploaded_at: "2025-01-15", uploaded_by: "김설계" },
  { id: "d2", file_name: "BRK-001_3D.step", file_size: "8.1 MB", file_type: "STEP", revision: "A", uploaded_at: "2025-01-15", uploaded_by: "김설계" },
];

const MOCK_HISTORY: HistoryEntry[] = [
  { id: "h1", date: "2025-02-01", user: "김설계", action: "속성 변경", revision: "A", detail: "중량 값 수정: 1.20kg → 1.25kg" },
  { id: "h2", date: "2025-01-15", user: "김설계", action: "도면 업로드", revision: "A", detail: "BRK-001_Rev.A.pdf, BRK-001_3D.step 업로드" },
  { id: "h3", date: "2024-12-20", user: "박검토", action: "상태 변경", revision: "A", detail: "Draft → Released" },
  { id: "h4", date: "2024-06-10", user: "김설계", action: "리비전 생성", revision: "A", detail: "초기 리비전 A 생성" },
  { id: "h5", date: "2024-01-10", user: "김설계", action: "부품 생성", revision: "-", detail: "부품 신규 등록" },
];

// --- 서브 컴포넌트 ---

function StatusBadge({ status }: { status: PartStatus }) {
  const config = {
    Released: { className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", dot: "bg-emerald-500" },
    Draft: { className: "bg-amber-500/10 text-amber-600 border-amber-500/20", dot: "bg-amber-500" },
    Obsolete: { className: "bg-gray-500/10 text-gray-500 border-gray-500/20", dot: "bg-gray-400" },
  }[status];

  return (
    <Badge variant="outline" className={`gap-1.5 ${config.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {status}
    </Badge>
  );
}

function PropertyRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <tr className="border-b border-border/50 last:border-b-0">
      <td className="w-28 py-2.5 pr-4 text-sm text-muted-foreground">{label}</td>
      <td className="py-2.5 text-sm text-foreground">{value ?? <span className="text-muted-foreground/40">—</span>}</td>
    </tr>
  );
}

function SummaryCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg border bg-muted/30 px-4 py-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-lg font-semibold text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

// 기본정보 탭
function InfoTab({ item }: { item: PartDetail }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      {/* 속성 테이블 */}
      <div className="lg:col-span-3">
        <h3 className="mb-3 text-sm font-medium text-foreground">속성</h3>
        <div className="rounded-lg border">
          <table className="w-full">
            <tbody>
              <PropertyRow label="품번" value={<span className="font-mono text-xs">{item.part_number}</span>} />
              <PropertyRow label="품명" value={item.name} />
              <PropertyRow label="리비전" value={item.revision} />
              <PropertyRow label="카테고리" value={item.category} />
              <PropertyRow label="유형" value={item.item_type === "ASSEMBLY" ? "조립품" : "단품"} />
              <PropertyRow label="재질" value={item.material} />
              <PropertyRow label="상태" value={<StatusBadge status={item.status} />} />
              <PropertyRow label="규격" value={item.specification} />
              <PropertyRow label="중량" value={item.weight != null ? `${item.weight} kg` : null} />
              <PropertyRow label="단위" value={item.unit} />
              <PropertyRow label="생성자" value={item.created_by} />
              <PropertyRow label="생성일" value={item.created_at} />
              <PropertyRow label="수정일" value={item.updated_at} />
            </tbody>
          </table>
        </div>
      </div>

      {/* 요약 + 설명 */}
      <div className="lg:col-span-2">
        <h3 className="mb-3 text-sm font-medium text-foreground">요약</h3>
        <div className="mb-6 grid grid-cols-3 gap-3">
          <SummaryCard icon={Network} label="BOM" value={item.child_count} />
          <SummaryCard icon={Paperclip} label="첨부" value={item.drawing_count} />
          <SummaryCard icon={GitBranch} label="Rev" value={item.revision} />
        </div>

        <h3 className="mb-3 text-sm font-medium text-foreground">설명</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {item.description || <span className="text-muted-foreground/40">설명이 없습니다.</span>}
        </p>
      </div>
    </div>
  );
}

// BOM 트리 행
function BomTreeRow({
  node,
  depth,
  expanded,
  onToggle,
}: {
  node: BomTreeNode;
  depth: number;
  expanded: Set<string>;
  onToggle: (partNumber: string) => void;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expanded.has(node.part_number);

  return (
    <>
      <tr className="border-b border-border/50 last:border-b-0 hover:bg-muted/50">
        <td className="py-2.5 pl-4 pr-2 font-mono text-xs font-medium text-primary">
          <span className="inline-flex items-center" style={{ paddingLeft: `${depth * 20}px` }}>
            {hasChildren ? (
              <button
                onClick={() => onToggle(node.part_number)}
                className="mr-1 flex h-4 w-4 shrink-0 items-center justify-center rounded hover:bg-muted"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </button>
            ) : (
              <span className="mr-1 w-4 shrink-0" />
            )}
            {node.part_number}
          </span>
        </td>
        <td className="py-2.5 pl-4 pr-2 text-foreground">{node.name}</td>
        <td className="py-2.5 pl-4 pr-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-muted text-[11px] font-medium text-muted-foreground">{node.revision}</span>
        </td>
        <td className="py-2.5 pl-4 pr-2 text-muted-foreground">{node.material ?? "—"}</td>
        <td className="py-2.5 pl-4 pr-2 text-right font-medium text-foreground">{node.quantity}</td>
        <td className="py-2.5 pl-4 pr-2 text-muted-foreground">{node.unit}</td>
      </tr>
      {hasChildren && isExpanded &&
        node.children!.map((child) => (
          <BomTreeRow
            key={child.part_number}
            node={child}
            depth={depth + 1}
            expanded={expanded}
            onToggle={onToggle}
          />
        ))}
    </>
  );
}

// BOM 트리 테이블
function BomTreeTable({ nodes, emptyMessage }: { nodes: BomTreeNode[]; emptyMessage: string }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(partNumber: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(partNumber)) next.delete(partNumber);
      else next.add(partNumber);
      return next;
    });
  }

  if (nodes.length === 0) return <EmptyState message={emptyMessage} />;

  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full table-fixed text-sm">
        <colgroup>
          <col style={{ width: "22%" }} />
          <col />
          <col style={{ width: "8%" }} />
          <col style={{ width: "14%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "8%" }} />
        </colgroup>
        <thead>
          <tr className="border-b bg-muted/50 text-left">
            <th className="py-2.5 pl-4 pr-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">품번</th>
            <th className="py-2.5 pl-4 pr-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">품명</th>
            <th className="py-2.5 pl-4 pr-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Rev</th>
            <th className="py-2.5 pl-4 pr-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">재질</th>
            <th className="py-2.5 pl-4 pr-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground text-right">수량</th>
            <th className="py-2.5 pl-4 pr-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">단위</th>
          </tr>
        </thead>
        <tbody>
          {nodes.map((node) => (
            <BomTreeRow
              key={node.part_number}
              node={node}
              depth={0}
              expanded={expanded}
              onToggle={toggle}
            />
          ))}
        </tbody>
      </table>
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
  children: BomTreeNode[];
  parents: BomTreeNode[];
  onAnalyze: () => void;
  onUpload: () => void;
}) {
  const isTreeViewEnabled = false;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">BOM 트리뷰는 현재 비활성화되었습니다.</p>
        <div className="flex items-center gap-2">
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
      </div>

      {isTreeViewEnabled ? (
        <div className="space-y-3">
          <BomTreeTable nodes={children} emptyMessage="하위 부품이 없습니다" />
          <BomTreeTable nodes={parents} emptyMessage="상위 부품이 없습니다" />
        </div>
      ) : (
        <EmptyState message="트리뷰 없이 BOM 정보를 제공합니다." />
      )}
    </div>
  );
}

// 도면 탭
function DrawingsTab({ drawings }: { drawings: DrawingFile[] }) {
  if (drawings.length === 0) return <EmptyState message="등록된 도면이 없습니다" />;

  function getFileIcon(type: string) {
    if (type === "PDF") return FileText;
    if (type === "STEP" || type === "IGES") return File;
    return FileImage;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {drawings.map((d) => {
        const Icon = getFileIcon(d.file_type);
        return (
          <div key={d.id} className="flex items-center gap-4 rounded-lg border p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{d.file_name}</p>
              <p className="text-xs text-muted-foreground">
                {d.file_size} · {d.file_type} · Rev {d.revision} · {d.uploaded_at}
              </p>
            </div>
            <Button variant="ghost" size="icon-sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}

// 이력 탭
function HistoryTab({ history }: { history: HistoryEntry[] }) {
  if (history.length === 0) return <EmptyState message="변경 이력이 없습니다" />;

  return (
    <div className="relative pl-6">
      {/* 타임라인 세로선 */}
      <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" />

      <div className="space-y-6">
        {history.map((h) => (
          <div key={h.id} className="relative">
            {/* 타임라인 점 */}
            <div className="absolute -left-6 top-1.5 h-[7px] w-[7px] rounded-full border-2 border-primary bg-background" />
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-medium text-foreground">{h.action}</span>
              <Badge variant="outline" className="text-[10px]">Rev {h.revision}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{h.detail}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground/70">
              <Clock className="h-3 w-3" />
              {h.date} · {h.user}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
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

type TabKey = "info" | "bom" | "attachments" | "history";

const TABS: { key: TabKey; label: string }[] = [
  { key: "info", label: "기본정보" },
  { key: "bom", label: "BOM" },
  { key: "attachments", label: "첨부 파일" },
  { key: "history", label: "이력" },
];

export function PartDetailPage() {
  const { partNumber } = useParams<{ partNumber: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>("info");

  const item = partNumber ? MOCK_PARTS[partNumber] : undefined;

  if (!item) {
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
          <EmptyState message={`품번 "${partNumber}"에 해당하는 부품을 찾을 수 없습니다`} />
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
            <h1 className="font-mono text-xl font-bold text-foreground">{item.part_number}</h1>
            <StatusBadge status={item.status} />
            <span className="text-sm text-muted-foreground">{item.category}</span>
          </div>

          {/* 품명 */}
          <p className="mt-1 text-lg text-foreground">{item.name}</p>

          {/* 메타 정보 */}
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <span>Rev {item.revision}</span>
            <span className="text-border">·</span>
            <span>{item.material ?? "재질 없음"}</span>
            <span className="text-border">·</span>
            <span>도면 {item.drawing_count}건</span>
            <span className="text-border">·</span>
            <span>하위부품 {item.child_count}건</span>
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
            children={MOCK_BOM_CHILDREN}
            parents={MOCK_BOM_PARENTS}
            onAnalyze={() => navigate(`/parts/${item.part_number}/templates?scope=detail`)}
            onUpload={() => navigate(`/parts/${item.part_number}/upload?scope=detail`)}
          />
        )}
        {activeTab === "attachments" && <DrawingsTab drawings={MOCK_DRAWINGS} />}
        {activeTab === "history" && <HistoryTab history={MOCK_HISTORY} />}
      </div>
    </div>
  );
}
