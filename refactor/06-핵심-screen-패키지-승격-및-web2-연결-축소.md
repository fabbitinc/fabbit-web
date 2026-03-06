# 06 핵심 screen 패키지 승격 및 web2 연결 축소

## 작업 목표

- [x] `dashboard`, `projects-list`, `change-management` 화면 조합을 `packages/components`로 승격한다.
- [x] `project-detail`, `parts-list`, `part-detail` 화면 조합을 `packages/components`로 승격한다.
- [x] 해당 `web2` feature screen을 query/store/router 연결 래퍼로 축소한다.
- [x] `apps/storybook`에 신규 screen 스토리를 추가한다.
- [x] `web` 시각 기준과 `web2` 컨벤션 기준을 동시에 만족하도록 검증한다.

## 메모

- 이번 단계는 설정 화면 외 핵심 조회/상세 화면을 `packages` 기준으로 재정렬하는 단계다.
- `packages/components`는 props-only screen 조합을 담당하고, `web2`는 query/store/router/navigate만 담당한다.
- 작업은 두 축으로 병렬 수행한다.
- `packages/components/src/index.ts`에 `DashboardScreen`, `ProjectListScreen`, `ChangeManagementScreen`, `ProjectDetailScreen`, `PartsListScreen`, `PartDetailScreen`, `IssueDetailScreen`, `ChangeRequestDetailScreen` public export를 추가했다.
- `apps/web2`의 `dashboard`, `projects-list`, `change-management`, `project-detail`, `parts-list`, `part-detail`, `issue-detail`, `change-request-detail`는 모두 package screen을 소비하는 연결 래퍼 구조로 정리했다.
- `apps/storybook/stories/components`에 `DashboardScreen`, `ProjectListScreen`, `ChangeManagementScreen`, `IssueDetailScreen`, `ChangeRequestDetailScreen` 스토리를 추가했고, 기존 `ProjectDetailScreen`, `PartsListScreen`, `PartDetailScreen` 스토리는 `@fabbit/components` public import 기준으로 정리했다.
- 검증:
  - `pnpm build:web2` 통과
  - `pnpm lint:web2` 통과
  - `pnpm build-storybook` 통과
- 다음 단계 잔여 후보:
  - `bom-explore-screen`
  - `signup-screen`
  - `workspace-setup-screen`
  - `parts-template-processing-screen`
  - `parts-template-analysis-screen`
