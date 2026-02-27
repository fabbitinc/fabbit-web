import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { LoginPage } from "@/pages/auth/LoginPage";
import { ProjectListPage } from "@/pages/projects/ProjectListPage";
import { ProjectDetailPage } from "@/pages/projects/ProjectDetailPage";
import { OrganizationSettingsPage } from "@/pages/organization/OrganizationSettingsPage";
import { UserSettingsPage } from "@/pages/user/UserSettingsPage";
import { PartsPage } from "@/pages/parts/PartsPage";
import { PartDetailPage } from "@/pages/parts/PartDetailPage";
import { BomExplorePage } from "@/pages/parts/BomExplorePage";
import { PartsTemplateAnalysisPage } from "@/pages/parts/PartsTemplateAnalysisPage";
import { PartsTemplateMappingPage } from "@/pages/parts/PartsTemplateMappingPage";
import { PartsTemplateProcessingPage } from "@/pages/parts/PartsTemplateProcessingPage";
import { PartsUploadDialog } from "@/pages/parts/PartsUploadDialog";
import { UploadModal } from "@/features/upload/components/UploadModal";
import { SimpleBomImportModal } from "@/features/items/components/SimpleBomImportModal";
import { Toaster } from "@/components/ui/sonner";
import { useAuthStore } from "@/stores/authStore";
import { getAuthCookies, clearAuthCookies } from "@/lib/auth-cookies";
import { getSubdomain, isRegisterDomain } from "@/lib/subdomain";
import { getSite } from "@/api";
import { useDashboardStats } from "@/api/hooks/useDashboard";
import type { SiteResponse } from "@/api/types/auth";

// Registration 관련 임포트
import { RegistrationLayout } from "@/features/registration/components/RegistrationLayout";
import { SignupPage } from "@/features/registration/pages/SignupPage";
import { WorkspaceSetupPage } from "@/features/registration/pages/WorkspaceSetupPage";
import { PlanSelectionPage } from "@/features/registration/pages/PlanSelectionPage";


function AnimatedCount({ value, durationMs = 420 }: { value: number; durationMs?: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const safeTarget = Math.max(0, Math.floor(value));
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      setDisplay(Math.round(safeTarget * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, durationMs]);

  return <>{display.toLocaleString()}</>;
}

function DeltaBadge({ value, label }: { value: number; label: string }) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const prefix = isPositive ? "+" : "";
  const style = isPositive
    ? {
        color: "var(--status-success)",
        borderColor: "var(--status-success-border)",
        backgroundColor: "var(--status-success-bg)",
      }
    : isNegative
      ? {
          color: "var(--status-danger)",
          borderColor: "var(--status-danger-border)",
          backgroundColor: "var(--status-danger-bg)",
        }
      : {
          color: "var(--status-info)",
          borderColor: "var(--status-info-border)",
          backgroundColor: "var(--status-info-bg)",
        };

  return (
    <span className="inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium" style={style}>
      {label} {prefix}
      {Math.abs(value).toLocaleString()}
    </span>
  );
}

function DashboardPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading || !stats) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-36 animate-pulse rounded-lg bg-muted md:col-span-2" />
          <div className="h-36 animate-pulse rounded-lg bg-muted" />
          <div className="h-20 animate-pulse rounded-lg bg-muted md:col-span-3" />
        </div>
      </div>
    );
  }

  const totalManagedParts = stats.parts.total;
  const lastSynthesis = stats.last_synthesis;
  const lastSynthesisAt = lastSynthesis?.completed_at
    ? new Date(lastSynthesis.completed_at).toLocaleString("ko-KR", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : null;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {totalManagedParts > 0 ? (
          <section className="rounded-lg border border-border bg-card p-5 md:col-span-2">
            <p className="text-xs text-muted-foreground">부품 현황</p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              <AnimatedCount value={stats.parts.total} />개
            </p>
            <p className="mt-1 text-xs text-muted-foreground">현재 시스템에서 관리 중인 부품 수</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <DeltaBadge label="이번 주" value={stats.parts.added_this_week} />
            </div>
          </section>
        ) : (
          <section
            className="rounded-lg border border-dashed p-5 md:col-span-2"
            style={{
              borderColor: "var(--status-info-border)",
              backgroundColor: "var(--status-info-bg)",
            }}
          >
            <p className="text-xs text-muted-foreground">부품 현황</p>
            <p className="mt-2 text-lg font-semibold" style={{ color: "var(--status-info)" }}>
              아직 등록된 부품이 없습니다.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">부품 등록을 하러 가볼까요?</p>
            <div className="mt-3">
              <Button
                variant="outline"
                style={{ borderColor: "var(--brand-500)", color: "var(--brand-600)" }}
                onClick={() => navigate("/parts")}
              >
                부품 등록 페이지로 이동
              </Button>
            </div>
          </section>
        )}

        <section className="rounded-lg border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground">BOM 연결</p>
          <p className="mt-2 text-3xl font-bold text-foreground">
            <AnimatedCount value={stats.bom_links.total} />개
          </p>
          <p className="mt-1 text-xs text-muted-foreground">부품 간 구성 관계 수</p>
        </section>

        {lastSynthesis ? (
          <section className="rounded-lg border border-border bg-card p-5 md:col-span-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs text-muted-foreground">마지막 부품 업로드</p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {lastSynthesisAt ? `완료 시각: ${lastSynthesisAt}` : `상태: ${lastSynthesis.status}`}
                </p>
              </div>
              <div className="flex gap-6">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">등록 항목</p>
                  <p className="text-2xl font-bold text-foreground">
                    <AnimatedCount value={lastSynthesis.nodes_created} />
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">등록 관계</p>
                  <p className="text-2xl font-bold text-foreground">
                    <AnimatedCount value={lastSynthesis.relationships_created} />
                  </p>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section
            className="rounded-lg border border-dashed p-5 md:col-span-3"
            style={{
              borderColor: "var(--status-info-border)",
              backgroundColor: "var(--status-info-bg)",
            }}
          >
            <p className="text-xs text-muted-foreground">부품 업로드</p>
            <p className="mt-1 text-sm text-muted-foreground">아직 부품 업로드 이력이 없습니다.</p>
          </section>
        )}
      </div>

    </div>
  );
}

function ApprovalPage() {
  return (
    <div className="flex h-64 items-center justify-center rounded-lg border border-border bg-background">
      <p className="text-muted-foreground">결재 - Coming Soon</p>
    </div>
  );
}

function ConflictsPage() {
  return (
    <div className="flex h-64 items-center justify-center rounded-lg border border-border bg-background">
      <p className="text-muted-foreground">충돌관리 - Coming Soon</p>
    </div>
  );
}

function LegacyItemDetailRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={id ? `/parts/${id}` : "/parts"} replace />;
}

function LegacyPartUploadRedirect() {
  const { partId } = useParams<{ partId: string }>();
  return <Navigate to={partId ? `/parts/${partId}` : "/parts"} replace />;
}

function SiteNotFoundPage() {
  const hostname = window.location.hostname;
  const APP_DOMAIN = import.meta.env.VITE_APP_DOMAIN?.split(":")[0] || "";
  const subdomain = hostname.endsWith(`.${APP_DOMAIN}`)
    ? hostname.slice(0, -(APP_DOMAIN.length + 1))
    : hostname;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0f172a]">
      {/* 배경 그라데이션 오브 */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-200px] left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[#3b82f6]/15 blur-[120px]" />
        <div className="absolute right-[-200px] bottom-[-100px] h-[500px] w-[500px] rounded-full bg-[#8b5cf6]/10 blur-[100px]" />
        <div className="absolute top-1/3 left-[-150px] h-[300px] w-[300px] rounded-full bg-[#3b82f6]/8 blur-[80px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center px-6">
        {/* 로고 */}
        <div className="mb-16 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] shadow-lg shadow-blue-500/25">
            <svg
              className="h-5 w-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-lg font-bold text-white">Fabbit</span>
        </div>

        {/* 메인 메시지 */}
        <h1 className="mb-3 text-center text-2xl font-bold tracking-tight text-white">
          워크스페이스를 찾을 수 없습니다
        </h1>
        <p className="mb-10 max-w-xs text-center text-sm leading-relaxed text-slate-400">
          입력하신 주소에 해당하는 워크스페이스가 없습니다.
          <br />
          주소를 다시 확인해 주세요.
        </p>

        {/* URL 바 스타일 주소 표시 */}
        <div className="w-full max-w-sm rounded-xl border border-white/10 bg-white/5 shadow-lg shadow-black/20 backdrop-blur-sm">
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <div className="h-2.5 w-2.5 rounded-full bg-white/15" />
              <div className="h-2.5 w-2.5 rounded-full bg-white/15" />
            </div>
          </div>
          <div className="flex items-center justify-center px-5 py-4">
            <span className="font-mono text-sm">
              <span className="font-semibold text-red-400">{subdomain}</span>
              <span className="text-slate-500">.{APP_DOMAIN}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 인증된 사용자만 접근 가능한 라우트 (온보딩 완료 필수)
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    // 워크스페이스 서브도메인 → 로그인, register/루트 도메인 → 회원가입
    return (
      <Navigate to={isRegisterDomain() ? "/signup" : "/login"} replace />
    );
  }

  return <>{children}</>;
}

// 비인증 사용자만 접근 가능한 라우트 (로그인 페이지)
// register/루트 도메인에서는 로그인 불필요 → 회원가입으로
function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isRegisterDomain()) {
    return <Navigate to="/signup" replace />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Registration 라우트 (회원가입 플로우 1-3단계)
// 미인증 사용자만 접근 가능
function RegistrationRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // 워크스페이스 서브도메인에서는 회원가입 불가 → 로그인으로
  if (!isRegisterDomain()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

type AppStatus = "loading" | "ready" | "site_not_found";

function App() {
  const [status, setStatus] = useState<AppStatus>("loading");
  const [, setSite] = useState<SiteResponse | null>(null);
  const fetchMe = useAuthStore((s) => s.fetchMe);

  useEffect(() => {
    async function init() {
      // 1. 쿠키 토큰 복원 (서브도메인 전환 시)
      const { accessToken, refreshToken } = getAuthCookies();
      if (accessToken && refreshToken) {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        clearAuthCookies();
        await fetchMe();
      }

      // BACKLOG: 자동 로그인 토큰 유효성 검증 — localStorage에 토큰이 있으면 fetchMe()로 유효성 확인 후 인증 상태 복원. 현재는 zustand persist가 isAuthenticated를 바로 복원하여 만료 토큰 시 첫 API 호출까지 감지 불가.

      // 2. 서브도메인 사이트 검증 (register 서브도메인은 스킵)
      const subdomain = getSubdomain();
      if (subdomain && subdomain !== "register") {
        try {
          const siteData = await getSite();
          setSite(siteData);
        } catch {
          setStatus("site_not_found");
          return;
        }
      }

      setStatus("ready");
    }

    init();
  }, [fetchMe]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (status === "site_not_found") {
    return <SiteNotFoundPage />;
  }

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* Registration Routes (회원가입 1-3단계) — register 서브도메인에서만 진입 */}
        <Route
          element={
            <RegistrationRoute>
              <RegistrationLayout />
            </RegistrationRoute>
          }
        >
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/workspace" element={<WorkspaceSetupPage />} />
          <Route path="/plan" element={<PlanSelectionPage />} />
        </Route>

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/parts" element={<PartsPage />} />
                  <Route path="/parts/templates" element={<PartsTemplateAnalysisPage />} />
                  <Route path="/parts/templates/processing" element={<PartsTemplateProcessingPage />} />
                  <Route path="/parts/templates/mapping" element={<PartsTemplateMappingPage />} />
                  <Route path="/parts/upload" element={<Navigate to="/parts" replace />} />
                  <Route path="/parts/:partId/templates" element={<PartsTemplateAnalysisPage />} />
                  <Route path="/parts/:partId/templates/processing" element={<PartsTemplateProcessingPage />} />
                  <Route path="/parts/:partId/templates/mapping" element={<PartsTemplateMappingPage />} />
                  <Route path="/parts/:partId/upload" element={<LegacyPartUploadRedirect />} />
                  <Route path="/parts/:partId/bom" element={<BomExplorePage />} />
                  <Route path="/parts/:partId" element={<PartDetailPage />} />
                  <Route path="/items" element={<Navigate to="/parts" replace />} />
                  <Route path="/items/:id" element={<LegacyItemDetailRedirect />} />
                  <Route path="/items/:id/bom" element={<LegacyItemDetailRedirect />} />
                  <Route path="/projects" element={<ProjectListPage />} />
                  <Route path="/projects/:projectId/*" element={<ProjectDetailPage />} />
                  <Route path="/organization/settings" element={<OrganizationSettingsPage />} />
                  <Route path="/user/settings" element={<UserSettingsPage />} />
                  <Route path="/approval" element={<ApprovalPage />} />
                  <Route path="/conflicts" element={<ConflictsPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
      <UploadModal />
      <PartsUploadDialog />
      <SimpleBomImportModal />
      <Toaster position="bottom-right" />
    </>
  );
}

export default App;
