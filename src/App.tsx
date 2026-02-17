import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { LoginPage } from "@/pages/auth/LoginPage";
import { ProjectListPage } from "@/pages/projects/ProjectListPage";
import { ProjectDetailPage } from "@/pages/projects/ProjectDetailPage";
import { ProjectSettingsPage } from "@/pages/projects/ProjectSettingsPage";
import { OrganizationSettingsPage } from "@/pages/organization/OrganizationSettingsPage";
import { UserSettingsPage } from "@/pages/user/UserSettingsPage";
import { PartsPage } from "@/pages/parts/PartsPage";
import { PartDetailPage } from "@/pages/parts/PartDetailPage";
import { PartsTemplateAnalysisPage } from "@/pages/parts/PartsTemplateAnalysisPage";
import { PartsTemplateMappingPage } from "@/pages/parts/PartsTemplateMappingPage";
import { PartsTemplateProcessingPage } from "@/pages/parts/PartsTemplateProcessingPage";
import { PartsUploadPage } from "@/pages/parts/PartsUploadPage";
import { UploadModal } from "@/features/upload/components/UploadModal";
import { SimpleBomImportModal } from "@/features/items/components/SimpleBomImportModal";
import { Toaster } from "@/components/ui/sonner";
import { useAuthStore } from "@/stores/authStore";
import { getAuthCookies, clearAuthCookies } from "@/lib/auth-cookies";
import { getSubdomain } from "@/lib/subdomain";
import { getSite } from "@/api";
import type { SiteResponse } from "@/api/types/auth";

// Registration 관련 임포트
import { RegistrationLayout } from "@/features/registration/components/RegistrationLayout";
import { SignupPage } from "@/features/registration/pages/SignupPage";
import { WorkspaceSetupPage } from "@/features/registration/pages/WorkspaceSetupPage";
import { PlanSelectionPage } from "@/features/registration/pages/PlanSelectionPage";

// Dev 프리뷰
import { MappingCardPreview } from "@/pages/dev/MappingCardPreview";
import { ItemsMasterPreview } from "@/pages/dev/ItemsMasterPreview";
import { ItemDetailPreview } from "@/pages/dev/ItemDetailPreview";
import { PartsUploadPreview } from "@/pages/dev/PartsUploadPreview";
import { PartsTemplateAnalysisPreview } from "@/pages/dev/PartsTemplateAnalysisPreview";
import { DesignSystemPreview } from "@/pages/dev/DesignSystemPreview";
import { ProjectsHubPreview } from "@/pages/dev/ProjectsHubPreview";
import { ProjectRepoPreview } from "@/pages/dev/ProjectRepoPreview";
import { ProjectOpsItemDetailPreview } from "@/pages/dev/ProjectOpsItemDetailPreview";
import { ProjectScheduleDetailPreview } from "@/pages/dev/ProjectScheduleDetailPreview";

// 온보딩 관련 임포트
import { OnboardingLayout } from "@/features/onboarding/components/OnboardingLayout";
import { DataUploadPage } from "@/features/onboarding/pages/DataUploadPage";
import { AIMappingPage } from "@/features/onboarding/pages/AIMappingPage";
import { DataProcessingPage } from "@/features/onboarding/pages/DataProcessingPage";
import { ExplorePage } from "@/features/onboarding/pages/ExplorePage";

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
  const stats = {
    parts: {
      total: 0,
      added_this_week: 0,
      added_today: 0,
    },
    bom_links: {
      total: 387,
    },
    last_synthesis: {
      completed_at: "2026-02-16T11:20:00Z",
      nodes_created: 45,
    },
  };

  const totalManagedParts = stats.parts.total;
  const lastSynthesisAt = new Date(stats.last_synthesis.completed_at).toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {totalManagedParts > 0 ? (
          <section className="rounded-lg border border-border bg-card p-5 md:col-span-2">
            <p className="text-xs text-muted-foreground">Part 현황</p>
            <p className="mt-2 text-3xl font-bold text-foreground">
              <AnimatedCount value={stats.parts.total} />개
            </p>
            <p className="mt-1 text-xs text-muted-foreground">현재 시스템에서 관리 중인 부품 수</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <DeltaBadge label="이번 주" value={stats.parts.added_this_week} />
              <DeltaBadge label="오늘" value={stats.parts.added_today} />
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
            <p className="text-xs text-muted-foreground">Part 현황</p>
            <p className="mt-2 text-lg font-semibold" style={{ color: "var(--status-info)" }}>
              아직 등록된 부품이 없습니다.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">아이템 등록을 하러 가볼까요?</p>
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
          <p className="text-xs text-muted-foreground">BOM Link</p>
          <p className="mt-2 text-3xl font-bold text-foreground">
            <AnimatedCount value={stats.bom_links.total} />개
          </p>
          <p className="mt-1 text-xs text-muted-foreground">생성된 연결 관계 수</p>
        </section>

        <section className="rounded-lg border border-border bg-card p-5 md:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs text-muted-foreground">마지막 Synthesis</p>
              <p className="mt-1 text-sm font-medium text-foreground">완료 시각: {lastSynthesisAt}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">생성 노드</p>
              <p className="text-2xl font-bold text-foreground">
                <AnimatedCount value={stats.last_synthesis.nodes_created} />
              </p>
            </div>
          </div>
        </section>
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
    // 서브도메인(워크스페이스) → 로그인, 루트 도메인(www 포함) → 회원가입
    return (
      <Navigate to={getSubdomain() ? "/login" : "/register/signup"} replace />
    );
  }

  return <>{children}</>;
}

// 비인증 사용자만 접근 가능한 라우트 (로그인 페이지)
// 루트 도메인(www 포함)에서는 로그인 불필요 → 회원가입으로
function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const onboardingCompleted = useAuthStore(
    (state) => state.onboardingCompleted,
  );

  if (!getSubdomain()) {
    return <Navigate to="/register/signup" replace />;
  }

  if (isAuthenticated && onboardingCompleted) {
    return <Navigate to="/" replace />;
  }

  if (isAuthenticated && !onboardingCompleted) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Registration 라우트 (회원가입 플로우 1-3단계)
// 미인증 사용자만 접근 가능
function RegistrationRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const onboardingCompleted = useAuthStore(
    (state) => state.onboardingCompleted,
  );

  if (isAuthenticated && onboardingCompleted) {
    return <Navigate to="/" replace />;
  }

  if (isAuthenticated && !onboardingCompleted) {
    return <Navigate to="/" replace />;
  }

  // 서브도메인(워크스페이스)에서는 회원가입 불가 → 로그인으로
  if (getSubdomain()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// 온보딩 플로우 라우트 (데이터 온보딩 4-7단계)
// 인증 + 온보딩 미완료 사용자만 접근 가능
function OnboardingRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const onboardingCompleted = useAuthStore(
    (state) => state.onboardingCompleted,
  );

  // 온보딩 완료된 사용자 → 메인으로
  if (isAuthenticated && onboardingCompleted) {
    return <Navigate to="/" replace />;
  }

  // 미인증 사용자 → 서브도메인이면 로그인, 루트면 회원가입
  if (!isAuthenticated) {
    return (
      <Navigate to={getSubdomain() ? "/login" : "/register/signup"} replace />
    );
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

      // 2. 서브도메인 사이트 검증
      const subdomain = getSubdomain();
      if (subdomain) {
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
        {/* TODO 삭제 Dev Preview (인증 불필요) */}
        <Route path="/dev/mapping-preview" element={<MappingCardPreview />} />
        <Route path="/dev/design" element={<DesignSystemPreview />} />
        <Route path="/dev/projects" element={<ProjectsHubPreview />} />
        <Route path="/dev/projects/:projectId" element={<ProjectRepoPreview />} />
        <Route path="/dev/projects/:projectId/approvals/:itemId" element={<ProjectOpsItemDetailPreview />} />
        <Route path="/dev/projects/:projectId/changes/:itemId" element={<ProjectOpsItemDetailPreview />} />
        <Route path="/dev/projects/:projectId/issues/:itemId" element={<ProjectOpsItemDetailPreview />} />
        <Route path="/dev/projects/:projectId/schedules/:scheduleId" element={<ProjectScheduleDetailPreview />} />
        <Route path="/dev/parts" element={<ItemsMasterPreview />} />
        <Route path="/dev/parts/templates" element={<PartsTemplateAnalysisPreview />} />
        <Route path="/dev/parts/upload" element={<PartsUploadPreview />} />
        <Route path="/dev/parts/:partNumber/templates" element={<PartsTemplateAnalysisPreview />} />
        <Route path="/dev/parts/:partNumber/upload" element={<PartsUploadPreview />} />
        <Route path="/dev/parts/:partNumber" element={<ItemDetailPreview />} />

        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* /signup → /register/signup 리다이렉트 */}
        <Route
          path="/signup"
          element={<Navigate to="/register/signup" replace />}
        />

        {/* Registration Routes (회원가입 1-3단계) */}
        <Route
          path="/register"
          element={
            <RegistrationRoute>
              <RegistrationLayout />
            </RegistrationRoute>
          }
        >
          <Route path="signup" element={<SignupPage />} />
          <Route path="workspace" element={<WorkspaceSetupPage />} />
          <Route path="plan" element={<PlanSelectionPage />} />
          <Route index element={<Navigate to="signup" replace />} />
        </Route>

        {/* Onboarding Routes (데이터 온보딩 4-7단계) */}
        <Route
          path="/onboarding"
          element={
            <OnboardingRoute>
              <OnboardingLayout />
            </OnboardingRoute>
          }
        >
          <Route path="upload" element={<DataUploadPage />} />
          <Route path="mapping" element={<AIMappingPage />} />
          <Route path="processing" element={<DataProcessingPage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route index element={<Navigate to="upload" replace />} />
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
                  <Route path="/parts/upload" element={<PartsUploadPage />} />
                  <Route path="/parts/:partNumber/templates" element={<PartsTemplateAnalysisPage />} />
                  <Route path="/parts/:partNumber/templates/processing" element={<PartsTemplateProcessingPage />} />
                  <Route path="/parts/:partNumber/templates/mapping" element={<PartsTemplateMappingPage />} />
                  <Route path="/parts/:partNumber/upload" element={<PartsUploadPage />} />
                  <Route path="/parts/:partNumber" element={<PartDetailPage />} />
                  <Route path="/items" element={<Navigate to="/parts" replace />} />
                  <Route path="/items/:id" element={<LegacyItemDetailRedirect />} />
                  <Route path="/items/:id/bom" element={<LegacyItemDetailRedirect />} />
                  <Route path="/projects" element={<ProjectListPage />} />
                  <Route path="/projects/:id" element={<ProjectDetailPage />} />
                  <Route
                    path="/projects/:id/settings"
                    element={<ProjectSettingsPage />}
                  />
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
      <SimpleBomImportModal />
      <Toaster position="bottom-right" />
    </>
  );
}

export default App;
