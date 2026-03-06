# 09 web 시각 패리티 덮어쓰기 및 web2 동일화

## 작업 목표

- [x] `apps/web`의 핵심 화면 마크업/클래스 구조를 기준으로 `packages/components`를 덮어쓴다.
- [x] `dashboard`, `projects-list`, `project-detail`, `change-management`의 시각 패리티를 우선 맞춘다.
- [x] `packages/components`는 props-only를 유지하고 `apps/web2`는 연결 래퍼만 남긴다.
- [x] 필요한 `packages/ui` 프리미티브 스타일 차이를 보정한다.
- [x] `web2`에서 `web`와 동일한 외형이 나오도록 검증하고 문서를 갱신한다.

## 메모

- `apps/web`는 읽기 전용 소스로만 사용한다.
- 이번 단계의 완료 기준은 구조 정리가 아니라 `web`와 `web2`의 시각 패리티다.
- 우선 화면군:
  - `dashboard`
  - `projects-list`
  - `project-detail`
  - `change-management`
- 완료 항목:
  - `packages/components/src/dashboard-screen.tsx`를 `apps/web/src/pages/dashboard/DashboardPage.tsx` 기준의 요약 카드, 내 작업 목록, 부품 현황, 사용량 섹션 구조로 재구성했다.
  - `packages/components/src/project-list-screen.tsx`, `packages/components/src/project-list-table.tsx`를 `apps/web/src/pages/projects/ProjectListPage.tsx` 기준의 헤더, 검색, 테이블, 페이지네이션 구조로 덮어썼다.
  - `packages/components/src/change-management-screen.tsx`를 `apps/web/src/pages/changes/ChangeManagementPage.tsx` 기준의 헤더, 탭 바, 상태 필터, 리스트 구조로 재구성했다.
  - `packages/components/src/project-detail-screen.tsx`, `packages/components/src/project-overview-tab.tsx`를 `apps/web/src/pages/projects/ProjectDetailPage.tsx`의 컴팩트 헤더/탭 패턴 기준으로 맞췄다.
  - `packages/components/src/summary-card.tsx`, `packages/components/src/usage-card.tsx`도 `web` 카드 스타일 기준으로 다시 정리했다.
  - `apps/web2/src/features/dashboard/components/dashboard-screen.tsx`와 관련 storybook 스토리들을 새 props 계약과 `web` 표시 기준에 맞게 갱신했다.
- 검증:
  - `pnpm lint:web2` 통과
  - `pnpm build:web2` 통과
  - `pnpm build-storybook` 통과
- 메모:
  - `parts`, `bom-explore`, `part-detail` 화면은 현재 구조와 마크업이 `web`와 큰 차이가 없어서 이번 단계에서 별도 덮어쓰지 않았다.
