import { lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { MainAppLayout } from "@/app/layouts/main-app-layout";
import { ProtectedRoute } from "@/app/routes/protected-route";
import { PublicRoute } from "@/app/routes/public-route";
import { RegistrationRoute } from "@/app/routes/registration-route";
import { SessionGate } from "@/app/routes/session-gate";
import { RegistrationLayout } from "@/pages/registration/registration-layout";

const LoginPage = lazy(async () => ({ default: (await import("@/pages/auth/login-page")).LoginPage }));
const SignupPage = lazy(async () => ({ default: (await import("@/pages/registration/signup-page")).SignupPage }));
const WorkspaceSetupPage = lazy(async () => ({
  default: (await import("@/pages/registration/workspace-setup-page")).WorkspaceSetupPage,
}));
const PlanSelectionPage = lazy(async () => ({
  default: (await import("@/pages/registration/plan-selection-page")).PlanSelectionPage,
}));
const AcceptInvitePage = lazy(async () => ({ default: (await import("@/pages/invite/accept-invite-page")).AcceptInvitePage }));
const DashboardPage = lazy(async () => ({ default: (await import("@/pages/dashboard/dashboard-page")).DashboardPage }));
const OrganizationSettingsPage = lazy(async () => ({
  default: (await import("@/pages/organization/organization-settings-page")).OrganizationSettingsPage,
}));
const UserSettingsPage = lazy(async () => ({ default: (await import("@/pages/user/user-settings-page")).UserSettingsPage }));
const ProjectListPage = lazy(async () => ({ default: (await import("@/pages/projects/project-list-page")).ProjectListPage }));
const ProjectDetailPage = lazy(async () => ({ default: (await import("@/pages/projects/project-detail-page")).ProjectDetailPage }));
const ChangeManagementPage = lazy(async () => ({
  default: (await import("@/pages/changes/change-management-page")).ChangeManagementPage,
}));
const IssueCreatePage = lazy(async () => ({ default: (await import("@/pages/changes/issue-create-page")).IssueCreatePage }));
const IssueDetailPage = lazy(async () => ({ default: (await import("@/pages/changes/issue-detail-page")).IssueDetailPage }));
const EngineeringChangeCreatePage = lazy(async () => ({
  default: (await import("@/pages/changes/engineering-change-create-page")).EngineeringChangeCreatePage,
}));
const EngineeringChangeDetailPage = lazy(async () => ({
  default: (await import("@/pages/changes/engineering-change-detail-page")).EngineeringChangeDetailPage,
}));
const PartsPage = lazy(async () => ({ default: (await import("@/pages/parts/parts-page")).PartsPage }));
const PartCreatePage = lazy(async () => ({ default: (await import("@/pages/parts/part-create-page")).PartCreatePage }));
const PartDetailPage = lazy(async () => ({ default: (await import("@/pages/parts/part-detail-page")).PartDetailPage }));
const PartEditPage = lazy(async () => ({ default: (await import("@/pages/parts/part-edit-page")).PartEditPage }));
const PartsTemplateAnalysisPage = lazy(async () => ({
  default: (await import("@/pages/parts/parts-template-analysis-page")).PartsTemplateAnalysisPage,
}));
const PartsTemplateProcessingPage = lazy(async () => ({
  default: (await import("@/pages/parts/parts-template-processing-page")).PartsTemplateProcessingPage,
}));
const PartsTemplateMappingPage = lazy(async () => ({
  default: (await import("@/pages/parts/parts-template-mapping-page")).PartsTemplateMappingPage,
}));
const BomExplorePage = lazy(async () => ({ default: (await import("@/pages/parts/bom-explore-page")).BomExplorePage }));
const PartDrawingViewerPage = lazy(async () => ({
  default: (await import("@/pages/parts/part-drawing-viewer-page")).PartDrawingViewerPage,
}));

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
            path="/parts/drawing-viewer"
            element={
              <ProtectedRoute>
                <PartDrawingViewerPage />
              </ProtectedRoute>
            }
          />

          <Route
            element={
              <ProtectedRoute>
                <MainAppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/parts" element={<PartsPage />} />
            <Route path="/parts/new" element={<PartCreatePage />} />
            <Route path="/parts/templates" element={<PartsTemplateAnalysisPage />} />
            <Route path="/parts/templates/processing" element={<PartsTemplateProcessingPage />} />
            <Route path="/parts/templates/mapping" element={<PartsTemplateMappingPage />} />
            <Route path="/parts/:partNumber/revisions/:revisionCode/templates" element={<PartsTemplateAnalysisPage />} />
            <Route path="/parts/:partNumber/revisions/:revisionCode/templates/processing" element={<PartsTemplateProcessingPage />} />
            <Route path="/parts/:partNumber/revisions/:revisionCode/templates/mapping" element={<PartsTemplateMappingPage />} />
            <Route path="/parts/:partNumber/revisions/:revisionCode/bom" element={<BomExplorePage />} />
            <Route path="/parts/:partNumber/revisions/:revisionCode" element={<PartDetailPage />} />
            <Route path="/parts/:partNumber/drafts/:draftKey/edit" element={<PartEditPage />} />
            <Route path="/parts/:partNumber/drafts/:draftKey" element={<PartDetailPage />} />
            <Route path="/parts/:partNumber/revisions/:revisionCode/drafts/:draftKey/edit" element={<PartEditPage />} />
            <Route path="/parts/:partNumber/revisions/:revisionCode/drafts/:draftKey" element={<PartDetailPage />} />
            <Route path="/changes/issues/new" element={<IssueCreatePage />} />
            <Route path="/changes/issues/:issueNumber" element={<IssueDetailPage />} />
            <Route path="/changes/engineering-changes/new" element={<EngineeringChangeCreatePage />} />
            <Route path="/changes/engineering-changes/:changeNumber" element={<EngineeringChangeDetailPage />} />
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
