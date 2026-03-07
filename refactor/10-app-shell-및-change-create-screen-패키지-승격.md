# 10 app shell 및 change create screen 패키지 승격

## 작업 목표

- [x] `apps/web/src/components/layout/MainLayout.tsx`, `Header.tsx`, `Sidebar.tsx`를 읽기 전용 기준으로 삼아 `packages/components`의 앱 셸 계층을 `web` 구현 기준으로 덮어쓴다.
- [x] `apps/web2/src/app/layouts/main-app-layout.tsx`가 `@fabbit/components`의 앱 셸만 소비하도록 정리한다.
- [x] `apps/web/src/pages/changes/CreateForm.tsx`, `CreateFormSidebar.tsx` 기준의 생성 화면 조합을 `packages/components`로 승격한다.
- [x] `apps/web2`의 새 이슈/새 변경 요청 화면은 hook/query 연결만 남기고 패키지 screen을 사용하게 바꾼다.
- [x] `apps/web2/src/features/issue/components/issue-detail-screen.tsx`의 `useAuthStore` selector 렌더 루프를 제거한다.
- [x] storybook이 패키지 public import 기준으로 같은 셸/생성 화면을 렌더하도록 갱신한다.

## 메모

- `apps/web`는 읽기 전용이며 절대 수정하지 않는다.
- 현재 `packages/components`의 `AppShell`, `AppHeader`, `AppSidebar`는 `web` 구조 일부만 반영한 상태라 모바일 오버레이, 조직 전환, 검색 다이얼로그, 상단 액션, web 전용 class 사용이 빠져 있다.
- `apps/web2/src/app/layouts/main-app-layout.tsx`는 아직 직접 마크업으로 단순한 사이드바를 그리고 있어 패키지 승격 목표를 만족하지 못한다.
- `apps/web2/src/features/change-shared/components/change-create-form.tsx`는 아직 `apps/web2` 내부 UI 조합을 직접 갖고 있어 `packages/components` 승격이 미완료다.
- 이번 단계의 기준 소스:
  - `apps/web/src/components/layout/MainLayout.tsx`
  - `apps/web/src/components/layout/Header.tsx`
  - `apps/web/src/components/layout/Sidebar.tsx`
  - `apps/web/src/pages/changes/CreateForm.tsx`
  - `apps/web/src/pages/changes/CreateFormSidebar.tsx`
- 완료 메모:
  - `packages/components/src/app-shell.tsx`, `app-header.tsx`, `app-sidebar.tsx`를 `web` 셸 동작 기준으로 정리하고, 이전 호출부 호환을 위해 alias prop도 일부 유지했다.
  - `apps/web2/src/app/layouts/main-app-layout.tsx`는 직접 마크업을 제거하고 `AppShell/AppHeader/AppSidebar`만 조합하도록 바꿨다.
  - `apps/web2/src/features/auth/hooks/use-switch-organization-action.ts`, `use-logout-action.ts`를 추가해 조직 전환/로그아웃을 layout 밖 action hook으로 분리했다.
  - `apps/web2/src/features/change-shared/components/change-create-form.tsx`는 계속 wrapper 역할만 유지하고, `IssueCreatePage`, `ChangeRequestCreatePage`는 `web` placeholder 문구에 맞게 조정했다.
  - `packages/components/src/change-create-screen.tsx`는 첨부파일 추가 버튼과 폭 등 `web` 세부 UI 차이를 줄이도록 보정했다.
  - `apps/web2/src/index.css`, `apps/storybook/.storybook/preview.css`에 navigation/topbar class를 추가해 package 셸이 실제로 같은 톤으로 렌더되게 했다.
  - `apps/storybook/stories/components/ChangeCreateScreen.stories.tsx`를 추가했다.

## 검증 항목

- [x] `apps/web2` 메인 레이아웃이 `@fabbit/components` 셸을 사용한다.
- [x] `apps/web2` 새 이슈/새 변경 요청 화면이 `@fabbit/components` 생성 screen을 사용한다.
- [x] `issue-detail-screen`의 auth selector가 새 객체를 반환하지 않는다.
- [x] storybook 스토리가 `@fabbit/components` 공개 API로 갱신된다.
- [ ] `pnpm lint:web2`
- [ ] `pnpm build:web2`
- [ ] `pnpm build-storybook`
