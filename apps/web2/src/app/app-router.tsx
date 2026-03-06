import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { MainAppLayout } from "@/app/layouts/main-app-layout";
import { ProtectedRoute } from "@/app/routes/protected-route";
import { PublicRoute } from "@/app/routes/public-route";
import { RegistrationRoute } from "@/app/routes/registration-route";
import { SessionGate } from "@/app/routes/session-gate";
import { LoginPage } from "@/pages/auth/login-page";
import { SignupPage } from "@/pages/registration/signup-page";
import { WorkspaceSetupPage } from "@/pages/registration/workspace-setup-page";
import { PlanSelectionPage } from "@/pages/registration/plan-selection-page";
import { RegistrationLayout } from "@/pages/registration/registration-layout";
import { AcceptInvitePage } from "@/pages/invite/accept-invite-page";
import { DashboardPage } from "@/pages/dashboard/dashboard-page";
import { OrganizationSettingsPage } from "@/pages/organization/organization-settings-page";
import { UserSettingsPage } from "@/pages/user/user-settings-page";
import { ProjectListPage } from "@/pages/projects/project-list-page";
import { ProjectDetailPage } from "@/pages/projects/project-detail-page";
import { ChangeManagementPage } from "@/pages/changes/change-management-page";
import { IssueCreatePage } from "@/pages/changes/issue-create-page";
import { IssueDetailPage } from "@/pages/changes/issue-detail-page";
import { ChangeRequestCreatePage } from "@/pages/changes/change-request-create-page";
import { ChangeDetailPage } from "@/pages/changes/change-detail-page";
import { PartsPage } from "@/pages/parts/parts-page";
import { PartDetailPage } from "@/pages/parts/part-detail-page";
import { PartsTemplateAnalysisPage } from "@/pages/parts/parts-template-analysis-page";
import { PartsTemplateProcessingPage } from "@/pages/parts/parts-template-processing-page";
import { PartsTemplateMappingPage } from "@/pages/parts/parts-template-mapping-page";
import { BomExplorePage } from "@/pages/parts/bom-explore-page";

export function AppRouter() {
  return (
    <BrowserRouter>
      <SessionGate>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

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

          <Route element={<RegistrationLayout />}>
            <Route path="/invite/accept" element={<AcceptInvitePage />} />
          </Route>

          <Route
            element={
              <ProtectedRoute>
                <MainAppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/parts" element={<PartsPage />} />
            <Route path="/parts/templates" element={<PartsTemplateAnalysisPage />} />
            <Route path="/parts/templates/processing" element={<PartsTemplateProcessingPage />} />
            <Route path="/parts/templates/mapping" element={<PartsTemplateMappingPage />} />
            <Route path="/parts/:partId/templates" element={<PartsTemplateAnalysisPage />} />
            <Route path="/parts/:partId/templates/processing" element={<PartsTemplateProcessingPage />} />
            <Route path="/parts/:partId/templates/mapping" element={<PartsTemplateMappingPage />} />
            <Route path="/parts/:partId/bom" element={<BomExplorePage />} />
            <Route path="/parts/:partId" element={<PartDetailPage />} />
            <Route path="/changes/issues/new" element={<IssueCreatePage />} />
            <Route path="/changes/issues/:issueNumber" element={<IssueDetailPage />} />
            <Route path="/changes/requests/new" element={<ChangeRequestCreatePage />} />
            <Route path="/changes/requests/:changeNumber" element={<ChangeDetailPage />} />
            <Route path="/changes/*" element={<ChangeManagementPage />} />
            <Route path="/projects" element={<ProjectListPage />} />
            <Route path="/projects/:projectId/*" element={<ProjectDetailPage />} />
            <Route path="/organization/settings" element={<OrganizationSettingsPage />} />
            <Route path="/user/settings" element={<UserSettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SessionGate>
    </BrowserRouter>
  );
}
