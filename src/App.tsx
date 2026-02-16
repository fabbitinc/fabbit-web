import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { LoginPage } from "@/pages/auth/LoginPage";
import { ItemsPage } from "@/pages/items/ItemsPage";
import { ItemDetailPage } from "@/pages/items/ItemDetailPage";
import { BOMPage } from "@/pages/items/BOMPage";
import { ProjectListPage } from "@/pages/projects/ProjectListPage";
import { ProjectDetailPage } from "@/pages/projects/ProjectDetailPage";
import { ProjectSettingsPage } from "@/pages/projects/ProjectSettingsPage";
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

// 온보딩 관련 임포트
import { OnboardingLayout } from "@/features/onboarding/components/OnboardingLayout";
import { DataUploadPage } from "@/features/onboarding/pages/DataUploadPage";
import { AIMappingPage } from "@/features/onboarding/pages/AIMappingPage";
import { DataProcessingPage } from "@/features/onboarding/pages/DataProcessingPage";
import { ExplorePage } from "@/features/onboarding/pages/ExplorePage";

function DashboardPage() {
  return (
    <div className="flex h-64 items-center justify-center rounded-lg border border-border bg-background">
      <p className="text-muted-foreground">대시보드 - Coming Soon</p>
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
  const onboardingCompleted = useAuthStore(
    (state) => state.onboardingCompleted,
  );

  if (!isAuthenticated) {
    // 서브도메인(워크스페이스) → 로그인, 루트 도메인(www 포함) → 회원가입
    return (
      <Navigate to={getSubdomain() ? "/login" : "/register/signup"} replace />
    );
  }

  if (!onboardingCompleted) {
    return <Navigate to="/onboarding/upload" replace />;
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
    return <Navigate to="/onboarding/upload" replace />;
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
    return <Navigate to="/onboarding/upload" replace />;
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
        <Route path="/dev/items" element={<ItemsMasterPreview />} />
        <Route path="/dev/items/:partNumber" element={<ItemDetailPreview />} />

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
                  <Route path="/items" element={<ItemsPage />} />
                  <Route path="/items/:id" element={<ItemDetailPage />} />
                  <Route path="/items/:id/bom" element={<BOMPage />} />
                  <Route path="/projects" element={<ProjectListPage />} />
                  <Route path="/projects/:id" element={<ProjectDetailPage />} />
                  <Route
                    path="/projects/:id/settings"
                    element={<ProjectSettingsPage />}
                  />
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
