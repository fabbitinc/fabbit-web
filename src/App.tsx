import { Routes, Route, Navigate, useLocation } from "react-router-dom";
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

// 온보딩 관련 임포트
import { OnboardingLayout } from "@/features/onboarding/components/OnboardingLayout";
import { SignupPage } from "@/features/onboarding/pages/SignupPage";
import { WorkspaceSetupPage } from "@/features/onboarding/pages/WorkspaceSetupPage";
import { DataUploadPage } from "@/features/onboarding/pages/DataUploadPage";
import { AIMappingPage } from "@/features/onboarding/pages/AIMappingPage";
import { DataProcessingPage } from "@/features/onboarding/pages/DataProcessingPage";
import { PlanSelectionPage } from "@/features/onboarding/pages/PlanSelectionPage";
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

// 인증된 사용자만 접근 가능한 라우트 (온보딩 완료 필수)
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!onboardingCompleted) {
    return <Navigate to="/onboarding/workspace" replace />;
  }

  return <>{children}</>;
}

// 비인증 사용자만 접근 가능한 라우트 (로그인 페이지)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);

  if (isAuthenticated && onboardingCompleted) {
    return <Navigate to="/" replace />;
  }

  if (isAuthenticated && !onboardingCompleted) {
    return <Navigate to="/onboarding/workspace" replace />;
  }

  return <>{children}</>;
}

// 온보딩 플로우 라우트 (회원가입 ~ 온보딩 전체)
// 미인증 사용자는 signup만, 인증 사용자는 전체 접근 가능
function OnboardingRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const onboardingCompleted = useAuthStore((state) => state.onboardingCompleted);
  const location = useLocation();

  // 온보딩 완료된 사용자 → 메인으로
  if (isAuthenticated && onboardingCompleted) {
    return <Navigate to="/" replace />;
  }

  // 미인증 사용자가 signup 외 페이지 접근 시 → signup으로
  if (!isAuthenticated && !location.pathname.includes("/signup")) {
    return <Navigate to="/onboarding/signup" replace />;
  }

  return <>{children}</>;
}

function App() {
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

        {/* /signup → /onboarding/signup 리다이렉트 */}
        <Route path="/signup" element={<Navigate to="/onboarding/signup" replace />} />

        {/* Onboarding Routes (회원가입 + 온보딩 통합) */}
        <Route
          path="/onboarding"
          element={
            <OnboardingRoute>
              <OnboardingLayout />
            </OnboardingRoute>
          }
        >
          <Route path="signup" element={<SignupPage />} />
          <Route path="workspace" element={<WorkspaceSetupPage />} />
          <Route path="plan" element={<PlanSelectionPage />} />
          <Route path="upload" element={<DataUploadPage />} />
          <Route path="mapping" element={<AIMappingPage />} />
          <Route path="processing" element={<DataProcessingPage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route index element={<Navigate to="signup" replace />} />
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
                  <Route path="/projects/:id/settings" element={<ProjectSettingsPage />} />
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
