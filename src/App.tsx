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
import { Toaster } from "@/components/ui/sonner";
// TODO: 인증 기능 활성화 시 주석 해제
// import { useAuthStore } from "@/stores/authStore";

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

// 인증된 사용자만 접근 가능한 라우트
// TODO: 인증 기능 활성화 시 주석 해제
// function ProtectedRoute({ children }: { children: React.ReactNode }) {
//   const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
//
//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }
//
//   return <>{children}</>;
// }

// 비인증 사용자만 접근 가능한 라우트 (로그인 페이지)
// TODO: 인증 기능 활성화 시 주석 해제
// function PublicRoute({ children }: { children: React.ReactNode }) {
//   const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
//
//   if (isAuthenticated) {
//     return <Navigate to="/" replace />;
//   }
//
//   return <>{children}</>;
// }

function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        {/* TODO: 인증 기능 활성화 시 ProtectedRoute로 감싸기 */}
        <Route
          path="/*"
          element={
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
          }
        />
      </Routes>
      <UploadModal />
      <Toaster position="bottom-right" />
    </>
  );
}

export default App;
