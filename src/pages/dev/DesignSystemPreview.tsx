import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  CheckCircle2,
  ChevronRight,
  FileText,
  Folder,
  FolderTree,
  Info,
  Layers,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ThemeOption {
  id: "option-1" | "option-2" | "option-3" | "option-4" | "option-5";
  shortName: string;
  name: string;
  concept: string;
  brand50: string;
  brand500: string;
  brand600: string;
  accent500: string;
  aiFrom: string;
  aiTo: string;
  aiText: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  surface: string;
  background: string;
}

interface StatusToneColor {
  text: string;
  bg: string;
  border: string;
}

interface StatusToneOption {
  id: "tone-1" | "tone-2" | "tone-3" | "tone-4";
  label: string;
  concept: string;
  success: StatusToneColor;
  warning: StatusToneColor;
  danger: StatusToneColor;
  info: StatusToneColor;
}

type ToneLevel = "success" | "warning" | "danger" | "info";

interface LogoMoodOption {
  id: "logo-balanced" | "logo-cool" | "logo-warm";
  label: string;
  concept: string;
}

interface LogoConcept {
  id:
    | "logo-rabbit"
    | "logo-beaver-1"
    | "logo-beaver-2"
    | "logo-beaver-3"
    | "logo-beaver-4"
    | "logo-beaver-5";
  name: string;
  tagline: string;
  primary: string;
  accent: string;
  text: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "option-1",
    shortName: "1안",
    name: "Precision Blue + Violet",
    concept: "신뢰/정밀 중심. 기존 프로덕션 이행이 가장 쉬운 안",
    brand50: "#eef4ff",
    brand500: "#2563eb",
    brand600: "#1d4ed8",
    accent500: "#7c3aed",
    aiFrom: "#06b6d4",
    aiTo: "#2563eb",
    aiText: "#1e40af",
    textPrimary: "#0f172a",
    textSecondary: "#475569",
    border: "#dbe5f3",
    surface: "#ffffff",
    background: "#f8fafc",
  },
  {
    id: "option-2",
    shortName: "2안",
    name: "Cyan + Deep Navy",
    concept: "모던/데이터 중심. 시원하고 기술적인 톤",
    brand50: "#ecfeff",
    brand500: "#0891b2",
    brand600: "#0e7490",
    accent500: "#1e3a8a",
    aiFrom: "#0ea5e9",
    aiTo: "#155e75",
    aiText: "#155e75",
    textPrimary: "#082f49",
    textSecondary: "#155e75",
    border: "#cceaf0",
    surface: "#ffffff",
    background: "#f4fbfc",
  },
  {
    id: "option-3",
    shortName: "3안",
    name: "Indigo + Lime",
    concept: "강한 구분감. 상태 강조가 쉬운 안",
    brand50: "#eef2ff",
    brand500: "#4f46e5",
    brand600: "#4338ca",
    accent500: "#65a30d",
    aiFrom: "#6366f1",
    aiTo: "#65a30d",
    aiText: "#4338ca",
    textPrimary: "#1e1b4b",
    textSecondary: "#3730a3",
    border: "#dcd9ff",
    surface: "#ffffff",
    background: "#f8f7ff",
  },
  {
    id: "option-4",
    shortName: "4안",
    name: "Muted Orange (Anthropic 톤)",
    concept: "톤다운된 오렌지와 웜 뉴트럴 기반. 차분한 브랜드 무드",
    brand50: "#fff7ef",
    brand500: "#d4864d",
    brand600: "#bf713a",
    accent500: "#6a5442",
    aiFrom: "#e2a26c",
    aiTo: "#c57a45",
    aiText: "#9a5a2f",
    textPrimary: "#3a2f26",
    textSecondary: "#7a6657",
    border: "#eddcc9",
    surface: "#ffffff",
    background: "#fbf4ec",
  },
  {
    id: "option-5",
    shortName: "5안",
    name: "Sidebar Navy + Precision Blue",
    concept: "메인 사이드바의 딥 네이비 무드와 1안 블루 계열을 결합한 운영형 톤",
    brand50: "#edf4ff",
    brand500: "#3b82f6",
    brand600: "#2563eb",
    accent500: "#64748b",
    aiFrom: "#22d3ee",
    aiTo: "#3b82f6",
    aiText: "#1d4ed8",
    textPrimary: "#0f172a",
    textSecondary: "#475569",
    border: "#cbd5e1",
    surface: "#ffffff",
    background: "#f3f7ff",
  },
];

const LIST_ROWS = [
  { id: "APR-128", title: "모터 하우징 재질 변경 승인", owner: "김설계", status: "In Review" },
  { id: "CR-209", title: "BLT-001 체결 토크 변경", owner: "박생산", status: "Open" },
  { id: "ISS-044", title: "BOM 수량 불일치", owner: "최품질", status: "Blocked" },
];

const TREE_ROWS = [
  { depth: 0, name: "Drive Unit Gen4", type: "PROJECT" },
  { depth: 1, name: "기구 폴더", type: "FOLDER" },
  { depth: 2, name: "HSG-002 기어박스 하우징", type: "PART" },
  { depth: 2, name: "BLT-001 육각 볼트", type: "PART" },
  { depth: 1, name: "전장 폴더", type: "FOLDER" },
  { depth: 2, name: "PCB-001 메인 제어보드", type: "PART" },
];

const COMMON_TONE_OPTIONS: StatusToneOption[] = [
  {
    id: "tone-1",
    label: "공통 1안 Balanced",
    concept: "기본 운영 톤. 명확하고 안정적인 상태 구분",
    success: { text: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
    warning: { text: "#b45309", bg: "#fffbeb", border: "#fde68a" },
    danger: { text: "#b91c1c", bg: "#fef2f2", border: "#fecaca" },
    info: { text: "#0369a1", bg: "#f0f9ff", border: "#bae6fd" },
  },
  {
    id: "tone-2",
    label: "공통 2안 Cool",
    concept: "채도 낮은 쿨 톤. 데이터/엔지니어링 화면 친화",
    success: { text: "#0f766e", bg: "#f0fdfa", border: "#99f6e4" },
    warning: { text: "#a16207", bg: "#fefce8", border: "#fde047" },
    danger: { text: "#be123c", bg: "#fff1f2", border: "#fecdd3" },
    info: { text: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
  },
  {
    id: "tone-3",
    label: "공통 3안 Vivid",
    concept: "경고/이벤트를 더 강하게 드러내는 고대비 톤",
    success: { text: "#166534", bg: "#dcfce7", border: "#86efac" },
    warning: { text: "#92400e", bg: "#fef3c7", border: "#f59e0b" },
    danger: { text: "#991b1b", bg: "#fee2e2", border: "#f87171" },
    info: { text: "#1e3a8a", bg: "#dbeafe", border: "#60a5fa" },
  },
  {
    id: "tone-4",
    label: "공통 4안 Muted",
    concept: "톤다운된 웜/뉴트럴. 밀도 높은 업무화면용",
    success: { text: "#3f6212", bg: "#f7fee7", border: "#d9f99d" },
    warning: { text: "#9a3412", bg: "#fff7ed", border: "#fdba74" },
    danger: { text: "#9f1239", bg: "#fff1f2", border: "#fda4af" },
    info: { text: "#334155", bg: "#f8fafc", border: "#cbd5e1" },
  },
];

const LOGO_MOOD_OPTIONS: LogoMoodOption[] = [
  {
    id: "logo-balanced",
    label: "로고 무드: Balanced",
    concept: "브랜드 색을 유지하면서 명도만 낮춰 묵직하게",
  },
  {
    id: "logo-cool",
    label: "로고 무드: Cool Deep",
    concept: "차분한 딥 블루 계열로 기술적인 인상 강화",
  },
  {
    id: "logo-warm",
    label: "로고 무드: Warm Muted",
    concept: "웜톤을 섞어 친화적이지만 가벼워 보이지 않게",
  },
];

const PRIMARY_THEME_CLASS: Record<ThemeOption["id"], string> = {
  "option-1": "theme-primary-1",
  "option-2": "theme-primary-2",
  "option-3": "theme-primary-3",
  "option-4": "theme-primary-4",
  "option-5": "theme-primary-5",
};

const COMMON_THEME_CLASS: Record<StatusToneOption["id"], string> = {
  "tone-1": "theme-common-1",
  "tone-2": "theme-common-2",
  "tone-3": "theme-common-3",
  "tone-4": "theme-common-4",
};

const LOGO_CONCEPTS: LogoConcept[] = [
  {
    id: "logo-rabbit",
    name: "Blueprint Bunny",
    tagline: "도면 그리드 + 토끼 귀 실루엣",
    primary: "#2563eb",
    accent: "#06b6d4",
    text: "#0f172a",
  },
  {
    id: "logo-beaver-1",
    name: "Beaver Draft",
    tagline: "도면 시트 + 비버 얼굴",
    primary: "#4338ca",
    accent: "#65a30d",
    text: "#1f1b4d",
  },
  {
    id: "logo-beaver-2",
    name: "Gear Beaver",
    tagline: "제조 기어 + 비버 앞니 포인트",
    primary: "#0e7490",
    accent: "#155e75",
    text: "#083344",
  },
  {
    id: "logo-beaver-3",
    name: "Logistics Tail",
    tagline: "물류 라우트 + 비버 꼬리",
    primary: "#d4864d",
    accent: "#6a5442",
    text: "#3a2f26",
  },
  {
    id: "logo-beaver-4",
    name: "Fab Dam",
    tagline: "fab + dam 구조의 단단한 상징",
    primary: "#1d4ed8",
    accent: "#7c3aed",
    text: "#111827",
  },
  {
    id: "logo-beaver-5",
    name: "Cargo Beaver",
    tagline: "운송 박스 + 비버 캐릭터 배지",
    primary: "#0f766e",
    accent: "#0ea5e9",
    text: "#0f172a",
  },
];

function clamp255(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const value = clean.length === 3
    ? clean.split("").map((c) => c + c).join("")
    : clean;

  const r = Number.parseInt(value.slice(0, 2), 16);
  const g = Number.parseInt(value.slice(2, 4), 16);
  const b = Number.parseInt(value.slice(4, 6), 16);
  return { r, g, b };
}

function rgbToHex(r: number, g: number, b: number) {
  const rr = clamp255(r).toString(16).padStart(2, "0");
  const gg = clamp255(g).toString(16).padStart(2, "0");
  const bb = clamp255(b).toString(16).padStart(2, "0");
  return `#${rr}${gg}${bb}`;
}

function mixHex(base: string, blend: string, ratio: number) {
  const clamped = Math.max(0, Math.min(1, ratio));
  const a = hexToRgb(base);
  const b = hexToRgb(blend);
  return rgbToHex(
    a.r * (1 - clamped) + b.r * clamped,
    a.g * (1 - clamped) + b.g * clamped,
    a.b * (1 - clamped) + b.b * clamped
  );
}

export function DesignSystemPreview() {
  const [selectedPrimaryId, setSelectedPrimaryId] = useState<ThemeOption["id"]>("option-1");
  const [selectedCommonToneId, setSelectedCommonToneId] = useState<StatusToneOption["id"]>("tone-1");
  const [selectedLogoMoodId, setSelectedLogoMoodId] = useState<LogoMoodOption["id"]>("logo-cool");

  const activeTheme = useMemo(() => {
    return THEME_OPTIONS.find((theme) => theme.id === selectedPrimaryId) ?? THEME_OPTIONS[0];
  }, [selectedPrimaryId]);

  const activeCommonTone = useMemo(() => {
    return COMMON_TONE_OPTIONS.find((tone) => tone.id === selectedCommonToneId) ?? COMMON_TONE_OPTIONS[0];
  }, [selectedCommonToneId]);

  const activeLogoMood = useMemo(() => {
    return LOGO_MOOD_OPTIONS.find((mood) => mood.id === selectedLogoMoodId) ?? LOGO_MOOD_OPTIONS[1];
  }, [selectedLogoMoodId]);

  const appliedThemeClass = cn(
    PRIMARY_THEME_CLASS[selectedPrimaryId],
    COMMON_THEME_CLASS[selectedCommonToneId]
  );

  const logoGradient = useMemo(() => {
    if (selectedLogoMoodId === "logo-balanced") {
      return {
        from: mixHex(activeTheme.brand600, "#0f172a", 0.32),
        to: mixHex(activeTheme.accent500, "#111827", 0.22),
      };
    }

    if (selectedLogoMoodId === "logo-warm") {
      return {
        from: mixHex(activeTheme.brand600, "#7c4a2d", 0.42),
        to: mixHex(activeTheme.accent500, "#8a5a3b", 0.38),
      };
    }

    return {
      from: mixHex(activeTheme.brand600, "#0b2f4a", 0.46),
      to: mixHex(activeTheme.accent500, "#1b3558", 0.34),
    };
  }, [activeTheme, selectedLogoMoodId]);

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      <div className="dev-page-container grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-6 lg:h-fit">
          <section className="rounded-2xl border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground">디자인 제어 패널</h2>
            <p className="mt-1 text-xs text-muted-foreground">왼쪽 선택값이 오른쪽 모든 샘플에 즉시 반영됩니다.</p>

            <div className="mt-4 space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Primary 색 선택</Label>
                <Select value={selectedPrimaryId} onValueChange={(value) => setSelectedPrimaryId(value as ThemeOption["id"])}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {THEME_OPTIONS.map((theme) => (
                      <SelectItem key={theme.id} value={theme.id}>
                        {theme.shortName} {theme.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">로고 무드 선택</Label>
                <Select value={selectedLogoMoodId} onValueChange={(value) => setSelectedLogoMoodId(value as LogoMoodOption["id"])}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOGO_MOOD_OPTIONS.map((mood) => (
                      <SelectItem key={mood.id} value={mood.id}>
                        {mood.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">공통부분 색 선택</Label>
                <Select value={selectedCommonToneId} onValueChange={(value) => setSelectedCommonToneId(value as StatusToneOption["id"])}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_TONE_OPTIONS.map((tone) => (
                      <SelectItem key={tone.id} value={tone.id}>
                        {tone.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>
        </aside>

        <main className={cn("space-y-5", appliedThemeClass)}>
          <section className="rounded-2xl border bg-card p-5">
            <h1 className="text-2xl font-semibold text-foreground">Fabbit 디자인 시스템 컬러 제안</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              브랜드/로고/공통 상태 톤을 분리 선택해서 실제 운영 화면처럼 조합 검증합니다.
            </p>
          </section>

          <section className="rounded-2xl border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">브랜드 로고/아이콘 시안 5종</h2>
              <span className="text-xs text-muted-foreground">아이콘 + 워드마크</span>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Fabbit 브랜딩 후보입니다. 제품 아이콘(정사각형)과 헤더용 워드마크 조합을 함께 확인하세요.
            </p>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {LOGO_CONCEPTS.map((concept) => (
                <LogoCard key={concept.id} concept={concept} />
              ))}
            </div>
          </section>

          <CommonSection tone={activeCommonTone} />
          <ThemeSection
            theme={activeTheme}
            logoGradient={logoGradient}
            logoMood={activeLogoMood}
          />
        </main>
      </div>
    </div>
  );
}

function CommonSection({ tone }: { tone: StatusToneOption }) {
  return (
    <section className="rounded-2xl border bg-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">공통 컴포넌트 시스템</h2>
        <span className="text-xs text-muted-foreground">{tone.label}</span>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">{tone.concept}</p>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-2 rounded-xl border bg-white p-3">
          <p className="text-xs font-medium text-foreground">상태 배지</p>
          <div className="flex flex-wrap gap-2">
            <ToneChip label="Success" level="success" />
            <ToneChip label="Warning" level="warning" />
            <ToneChip label="Danger" level="danger" />
            <ToneChip label="Info" level="info" />
          </div>
        </section>

        <section className="space-y-2 rounded-xl border bg-white p-3">
          <p className="text-xs font-medium text-foreground">상태 버튼</p>
          <div className="flex flex-wrap gap-2">
            <ToneButton label="승인" level="success" />
            <ToneButton label="검토요청" level="warning" />
            <ToneButton label="차단" level="danger" />
            <ToneButton label="진행중" level="info" />
          </div>
        </section>

        <section className="space-y-2 rounded-xl border bg-white p-3 lg:col-span-2">
          <p className="text-xs font-medium text-foreground">상태 알림</p>
          <ToneAlertRow icon={<CheckCircle2 className="h-4 w-4" />} label="Success" desc="승인 완료 / 적재 성공" level="success" />
          <ToneAlertRow icon={<TriangleAlert className="h-4 w-4" />} label="Warning" desc="리스크 일정 / 검토 필요" level="warning" />
          <ToneAlertRow icon={<TriangleAlert className="h-4 w-4" />} label="Danger" desc="스키마 불일치 / 차단" level="danger" />
          <ToneAlertRow icon={<Info className="h-4 w-4" />} label="Info" desc="분석 진행 / 알림" level="info" />
        </section>

        <section className="overflow-hidden rounded-xl border bg-white lg:col-span-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 text-left text-xs text-muted-foreground">
                <th className="px-2.5 py-2">항목</th>
                <th className="px-2.5 py-2">상태</th>
                <th className="px-2.5 py-2">처리</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="px-2.5 py-2 text-foreground">APR-128</td>
                <td className="px-2.5 py-2"><ToneChip label="In Review" level="warning" /></td>
                <td className="px-2.5 py-2 text-muted-foreground">대기</td>
              </tr>
              <tr className="border-t">
                <td className="px-2.5 py-2 text-foreground">ISS-044</td>
                <td className="px-2.5 py-2"><ToneChip label="Blocked" level="danger" /></td>
                <td className="px-2.5 py-2 text-muted-foreground">즉시 대응</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </section>
  );
}

function LogoCard({ concept }: { concept: LogoConcept }) {
  return (
    <div className="rounded-xl border bg-white p-3">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold" style={{ color: concept.text }}>{concept.name}</p>
          <p className="text-xs text-muted-foreground">{concept.tagline}</p>
        </div>
        <span className="rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground">{concept.id}</span>
      </div>

      <div className="mb-2 flex items-center gap-3 rounded-lg border bg-background p-2.5">
        <LogoIcon concept={concept} />
        <div>
          <p className="text-xs text-muted-foreground">Wordmark</p>
          <p className="text-base font-semibold tracking-tight" style={{ color: concept.text }}>
            Fabbit
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-md border p-2 text-center">
          <p className="mb-1 text-[10px] text-muted-foreground">App Icon</p>
          <div className="mx-auto w-fit"><LogoIcon concept={concept} compact /></div>
        </div>
        <div className="rounded-md border p-2 text-center">
          <p className="mb-1 text-[10px] text-muted-foreground">Header Lockup</p>
          <p className="text-sm font-semibold tracking-tight" style={{ color: concept.text }}>Fabbit</p>
        </div>
      </div>
    </div>
  );
}

function LogoIcon({ concept, compact }: { concept: LogoConcept; compact?: boolean }) {
  const size = compact ? 34 : 40;

  if (concept.id === "logo-rabbit") {
    return (
      <div
        className="relative grid place-items-center overflow-hidden rounded-xl"
        style={{ width: size, height: size, background: `linear-gradient(135deg, ${concept.primary}, ${concept.accent})` }}
      >
        <div className="absolute inset-[20%] rounded-md border border-white/45" />
        <div className="absolute left-[32%] top-[8%] h-[28%] w-[14%] rounded-full bg-white/80" />
        <div className="absolute right-[32%] top-[8%] h-[28%] w-[14%] rounded-full bg-white/80" />
        <div className="absolute bottom-[22%] h-[2px] w-[46%] bg-white/55" />
      </div>
    );
  }

  if (concept.id === "logo-beaver-1") {
    return (
      <div
        className="relative overflow-hidden rounded-xl"
        style={{ width: size, height: size, background: `linear-gradient(140deg, ${concept.primary}, ${concept.accent})` }}
      >
        <div className="absolute inset-[20%] rounded-md border border-white/55" />
        <div className="absolute left-[25%] top-[24%] h-[44%] w-[50%] rounded-[42%] bg-white/86" />
        <div className="absolute left-[35%] top-[60%] h-[12%] w-[10%] rounded-[2px] bg-amber-100" />
        <div className="absolute left-[48%] top-[60%] h-[12%] w-[10%] rounded-[2px] bg-amber-100" />
        <div className="absolute left-[30%] top-[40%] h-[7%] w-[7%] rounded-full" style={{ backgroundColor: concept.accent }} />
        <div className="absolute right-[30%] top-[40%] h-[7%] w-[7%] rounded-full" style={{ backgroundColor: concept.accent }} />
      </div>
    );
  }

  if (concept.id === "logo-beaver-2") {
    return (
      <div
        className="relative grid place-items-center overflow-hidden rounded-xl"
        style={{ width: size, height: size, backgroundColor: concept.primary }}
      >
        <div className="h-[56%] w-[56%] rounded-full border-4" style={{ borderColor: `${concept.accent}` }} />
        <div className="absolute h-[14%] w-[14%] rounded-full bg-white" />
        <div className="absolute left-[38%] top-[56%] h-[10%] w-[8%] rounded-[2px] bg-amber-100" />
        <div className="absolute right-[38%] top-[56%] h-[10%] w-[8%] rounded-[2px] bg-amber-100" />
        <div className="absolute left-[13%] top-[13%] h-[10%] w-[10%] rounded-sm bg-white" />
        <div className="absolute right-[13%] top-[13%] h-[10%] w-[10%] rounded-sm bg-white" />
        <div className="absolute left-[13%] bottom-[13%] h-[10%] w-[10%] rounded-sm bg-white" />
        <div className="absolute right-[13%] bottom-[13%] h-[10%] w-[10%] rounded-sm bg-white" />
      </div>
    );
  }

  if (concept.id === "logo-beaver-3") {
    return (
      <div
        className="relative grid place-items-center rounded-xl"
        style={{ width: size, height: size, backgroundColor: concept.primary }}
      >
        <div className="absolute left-[16%] top-[18%] h-[46%] w-[40%] rounded-sm border-2 border-white/80" />
        <div className="absolute left-[24%] top-[28%] h-[2px] w-[24%] bg-white/70" />
        <div className="absolute left-[24%] top-[36%] h-[2px] w-[24%] bg-white/70" />
        <div className="absolute right-[10%] top-[40%] h-[34%] w-[34%] rounded-[20%] rotate-12 bg-white/85" />
        <div className="absolute right-[17%] top-[52%] h-[7%] w-[7%] rounded-full" style={{ backgroundColor: concept.accent }} />
        <div className="absolute right-[28%] top-[52%] h-[7%] w-[7%] rounded-full" style={{ backgroundColor: concept.accent }} />
      </div>
    );
  }

  if (concept.id === "logo-beaver-4") {
    return (
      <div
        className="relative overflow-hidden rounded-xl"
        style={{ width: size, height: size, backgroundColor: concept.primary }}
      >
        <div className="absolute left-[14%] top-[24%] h-[40%] w-[52%] rounded-[42%] bg-white/86" />
        <div className="absolute right-[10%] top-[54%] h-[34%] w-[36%] rounded-[18%] rotate-12 bg-white/80" />
        <div className="absolute left-[22%] top-[42%] h-[7%] w-[7%] rounded-full" style={{ backgroundColor: concept.accent }} />
        <div className="absolute left-[36%] top-[42%] h-[7%] w-[7%] rounded-full" style={{ backgroundColor: concept.accent }} />
        <div className="absolute left-[27%] top-[56%] h-[10%] w-[8%] rounded-[2px] bg-amber-100" />
        <div className="absolute left-[38%] top-[56%] h-[10%] w-[8%] rounded-[2px] bg-amber-100" />
      </div>
    );
  }

  if (concept.id === "logo-beaver-5") {
    return (
      <div
        className="relative grid place-items-center overflow-hidden rounded-xl"
        style={{ width: size, height: size, backgroundColor: concept.primary }}
      >
        <div className="absolute inset-[18%] rounded-md border border-white/65" />
        <div className="absolute left-[24%] top-[24%] h-[34%] w-[50%] rounded-[42%] bg-white/86" />
        <div className="absolute left-[35%] top-[38%] h-[7%] w-[7%] rounded-full" style={{ backgroundColor: concept.accent }} />
        <div className="absolute right-[35%] top-[38%] h-[7%] w-[7%] rounded-full" style={{ backgroundColor: concept.accent }} />
        <div className="absolute left-[41%] top-[48%] h-[5%] w-[14%] rounded-full" style={{ backgroundColor: concept.accent }} />
        <div className="absolute left-[22%] bottom-[18%] h-[12%] w-[56%] rounded-sm border border-white/70" />
      </div>
    );
  }

  return (
    <div
      className="relative grid place-items-center overflow-hidden rounded-xl"
      style={{ width: size, height: size, backgroundColor: concept.primary }}
    >
      <div className="absolute inset-[18%] rounded-md border border-white/65" />
    </div>
  );
}

function getToneStyle(level: ToneLevel) {
  if (level === "success") {
    return {
      color: "var(--status-success)",
      borderColor: "var(--status-success-border)",
      backgroundColor: "var(--status-success-bg)",
    };
  }

  if (level === "warning") {
    return {
      color: "var(--status-warning)",
      borderColor: "var(--status-warning-border)",
      backgroundColor: "var(--status-warning-bg)",
    };
  }

  if (level === "danger") {
    return {
      color: "var(--status-danger)",
      borderColor: "var(--status-danger-border)",
      backgroundColor: "var(--status-danger-bg)",
    };
  }

  return {
    color: "var(--status-info)",
    borderColor: "var(--status-info-border)",
    backgroundColor: "var(--status-info-bg)",
  };
}

function ToneButton({ label, level }: { label: string; level: ToneLevel }) {
  return (
    <Button
      type="button"
      variant="outline"
      className="h-7 px-3 py-1 text-xs font-semibold"
      style={getToneStyle(level)}
    >
      {label}
    </Button>
  );
}

function ToneChip({ label, level }: { label: string; level: ToneLevel }) {
  return (
    <span
      className="rounded-full border px-2 py-0.5 text-xs font-semibold"
      style={getToneStyle(level)}
    >
      {label}
    </span>
  );
}

function ToneAlertRow({
  icon,
  label,
  desc,
  level,
}: {
  icon: ReactNode;
  label: string;
  desc: string;
  level: ToneLevel;
}) {
  const toneStyle = getToneStyle(level);

  return (
    <div
      className="flex items-center justify-between rounded-md border px-2.5 py-2"
      style={{ borderColor: toneStyle.borderColor, backgroundColor: toneStyle.backgroundColor }}
    >
      <div className="flex items-center gap-2 text-sm">
        {icon}
        <span className="font-medium" style={{ color: toneStyle.color }}>{label}</span>
      </div>
      <span className="text-xs" style={{ color: toneStyle.color }}>{desc}</span>
    </div>
  );
}

function ThemeSection({
  theme,
  logoGradient,
  logoMood,
}: {
  theme: ThemeOption;
  logoGradient: { from: string; to: string };
  logoMood: LogoMoodOption;
}) {
  return (
    <section
      className="rounded-2xl border p-5"
      style={{
        backgroundColor: "var(--theme-background)",
        borderColor: "var(--theme-border)",
      }}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: "var(--theme-text-primary)" }}>
            {theme.shortName} {theme.name}
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--theme-text-secondary)" }}>
            {theme.concept}
          </p>
        </div>
        <Badge
          variant="outline"
          style={{
            borderColor: "var(--brand-500)",
            color: "var(--brand-600)",
            backgroundColor: "var(--theme-surface)",
          }}
        >
          Fabbit Candidate
        </Badge>
      </div>

      <div className="mb-4 grid gap-2 md:grid-cols-7">
        <ColorSwatch label="brand-50" value={theme.brand50} />
        <ColorSwatch label="brand-500" value={theme.brand500} />
        <ColorSwatch label="brand-600" value={theme.brand600} />
        <GradientSwatch label="logo-gradient (brand 연동)" from={logoGradient.from} to={logoGradient.to} />
        <ColorSwatch label="accent-500" value={theme.accent500} />
        <ColorSwatch label="text-primary" value={theme.textPrimary} />
        <ColorSwatch label="border" value={theme.border} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section
          className="rounded-xl border p-4"
          style={{ borderColor: "var(--theme-border)", backgroundColor: "var(--theme-surface)" }}
        >
          <p className="mb-3 text-sm font-medium" style={{ color: "var(--theme-text-primary)" }}>
            폼/버튼 샘플
          </p>

            <div className="space-y-3">
            <div className="rounded-lg border px-3 py-2" style={{ borderColor: "var(--theme-border)", backgroundColor: "#ffffff" }}>
              <p className="mb-1 text-xs text-muted-foreground">Fabbit Logo ({logoMood.label})</p>
              <div className="flex items-center gap-2">
                <div
                  className="h-8 w-8 rounded-md border"
                  style={{
                    borderColor: `${logoGradient.from}66`,
                    background: `linear-gradient(145deg, ${logoGradient.from}, ${logoGradient.to})`,
                    boxShadow: `inset 0 1px 0 rgb(255 255 255 / 0.25), 0 1px 2px ${logoGradient.from}33`,
                  }}
                />
                <span
                  className="text-lg font-semibold tracking-tight"
                  style={{
                    backgroundImage: `linear-gradient(145deg, ${logoGradient.from}, ${logoGradient.to})`,
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                    WebkitTextStroke: "0.2px rgba(15,23,42,0.12)",
                  }}
                >
                  Fabbit
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">{logoMood.concept}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="ai-outline-btn"
              >
                <Sparkles className="ai-outline-btn__icon h-4 w-4" />
                속성 분석
              </Button>
              <Button variant="outline" style={{ borderColor: "var(--brand-500)", color: "var(--brand-600)" }}>
                데이터 업로드
              </Button>
              <Button variant="outline" style={{ borderColor: "var(--accent-500)", color: "var(--accent-500)" }}>
                템플릿 관리
              </Button>
            </div>

            <div className="space-y-1">
              <Label htmlFor={`${theme.id}-input`} style={{ color: "var(--theme-text-secondary)" }}>
                부품 검색
              </Label>
              <Input
                id={`${theme.id}-input`}
                placeholder="PRT-001, 브래킷"
                style={{ borderColor: "var(--theme-border)" }}
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs" style={{ color: "var(--theme-text-secondary)" }}>
                <span>매핑 승인 진행률</span>
                <span>68%</span>
              </div>
              <Progress value={68} className="h-2" />
            </div>
          </div>
        </section>

        <section
          className="rounded-xl border p-4"
          style={{ borderColor: "var(--theme-border)", backgroundColor: "var(--theme-surface)" }}
        >
          <p className="mb-3 text-sm font-medium" style={{ color: "var(--theme-text-primary)" }}>
            상태/알림 샘플 (공통 톤 적용)
          </p>
          <div className="space-y-2">
            <ToneAlertRow icon={<CheckCircle2 className="h-4 w-4" />} label="Success" desc="승인 완료 / 적재 성공" level="success" />
            <ToneAlertRow icon={<TriangleAlert className="h-4 w-4" />} label="Warning" desc="리스크 일정 / 검토 필요" level="warning" />
            <ToneAlertRow icon={<TriangleAlert className="h-4 w-4" />} label="Danger" desc="스키마 불일치 / 차단" level="danger" />
          </div>
        </section>

        <section
          className="rounded-xl border p-4 lg:col-span-2"
          style={{ borderColor: "var(--theme-border)", backgroundColor: "var(--theme-surface)" }}
        >
          <p className="mb-3 text-sm font-medium" style={{ color: "var(--theme-text-primary)" }}>
            목록(테이블) 샘플
          </p>
          <div className="overflow-hidden rounded-lg border" style={{ borderColor: "var(--theme-border)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "var(--brand-50)", color: "var(--theme-text-secondary)" }}>
                  <th className="px-3 py-2 text-left text-xs font-medium">ID</th>
                  <th className="px-3 py-2 text-left text-xs font-medium">제목</th>
                  <th className="px-3 py-2 text-left text-xs font-medium">담당</th>
                  <th className="px-3 py-2 text-left text-xs font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {LIST_ROWS.map((row) => (
                    <tr
                      key={row.id}
                      className="cursor-pointer border-t hover:bg-muted/20"
                      style={{ borderColor: "var(--theme-border)" }}
                    >
                      <td className="px-3 py-2 font-mono text-xs" style={{ color: "var(--theme-text-primary)" }}>{row.id}</td>
                      <td className="px-3 py-2" style={{ color: "var(--theme-text-primary)" }}>{row.title}</td>
                      <td className="px-3 py-2" style={{ color: "var(--theme-text-secondary)" }}>{row.owner}</td>
                      <td className="px-3 py-2">
                        <ToneChip label={row.status} level="warning" />
                      </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section
          className="rounded-xl border p-4 lg:col-span-2"
          style={{ borderColor: "var(--theme-border)", backgroundColor: "var(--theme-surface)" }}
        >
          <p className="mb-3 text-sm font-medium" style={{ color: "var(--theme-text-primary)" }}>
            트리뷰 샘플
          </p>
          <div className="space-y-1">
            {TREE_ROWS.map((row, index) => (
              <div
                key={`${row.name}-${index}`}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/20"
                style={{ paddingLeft: `${8 + row.depth * 20}px` }}
              >
                {row.type === "PROJECT" ? (
                  <Layers className="h-4 w-4" style={{ color: "var(--brand-600)" }} />
                ) : row.type === "FOLDER" ? (
                  <Folder className="h-4 w-4" style={{ color: "var(--accent-500)" }} />
                ) : (
                  <FileText className="h-4 w-4" style={{ color: "var(--theme-text-secondary)" }} />
                )}
                <span className="text-sm" style={{ color: "var(--theme-text-primary)" }}>{row.name}</span>
                {row.type === "FOLDER" && <ChevronRight className="ml-auto h-4 w-4" style={{ color: "var(--theme-text-secondary)" }} />}
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-md border px-3 py-2 text-xs" style={{ borderColor: "var(--theme-border)", color: "var(--theme-text-secondary)" }}>
            <span className="inline-flex items-center gap-1">
              <FolderTree className="h-3.5 w-3.5" />
              선택한 테마로 리스트/트리뷰 시인성 검증
            </span>
          </div>
        </section>
      </div>
    </section>
  );
}

function ColorSwatch({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-white p-2">
      <div className="h-8 rounded" style={{ backgroundColor: value }} />
      <p className="mt-1 text-[11px] font-medium text-foreground">{label}</p>
      <p className="text-[10px] text-muted-foreground">{value}</p>
    </div>
  );
}

function GradientSwatch({
  label,
  from,
  to,
}: {
  label: string;
  from: string;
  to: string;
}) {
  return (
    <div className="rounded-lg border bg-white p-2">
      <div className="h-8 rounded" style={{ background: `linear-gradient(135deg, ${from}, ${to})` }} />
      <p className="mt-1 text-[11px] font-medium text-foreground">{label}</p>
      <p className="text-[10px] text-muted-foreground">{from} → {to}</p>
    </div>
  );
}
