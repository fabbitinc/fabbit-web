interface ProjectOverviewSummary {
  issueCount: number;
  changeCount: number;
  mergedChangeCount: number;
}

// `apps/web/src/pages/projects/ProjectDetailPage.tsx`는 개요 카드에서
// project 전용 query가 아니라 `changeRequestMock` 기반 요약 수치를 사용한다.
// web2도 같은 화면 패리티를 유지하기 위해 동일한 요약 수치를 연결층에서 주입한다.
const WEB_PROJECT_OVERVIEW_SUMMARY: ProjectOverviewSummary = {
  issueCount: 0,
  changeCount: 1,
  mergedChangeCount: 1,
};

export function getWebProjectOverviewSummary(): ProjectOverviewSummary {
  return WEB_PROJECT_OVERVIEW_SUMMARY;
}
