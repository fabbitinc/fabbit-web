# 10 app shell 및 create screen 패키지 승격

## 작업 목표

- [x] `apps/web`의 `MainLayout`, `Header`, `Sidebar` 구현을 읽기 전용 기준으로 삼아 `packages/components`의 앱 셸을 덮어쓴다.
- [x] `apps/web2` 메인 레이아웃이 `packages/components`의 앱 셸을 소비하도록 바꿔 `apps/web2`에는 라우팅/상태 연결만 남긴다.
- [x] `apps/web`의 `CreateForm`, `CreateFormSidebar` 구조를 기준으로 `새 이슈`, `새 변경 요청` 화면 조합을 `packages/components`로 승격한다.
- [x] `apps/web2`의 이슈 상세 렌더 루프 원인인 `useAuthStore` selector 문제와 타임라인 재시도 누락을 수정한다.
- [x] storybook 스토리와 public export를 새 패키지 기준으로 맞춘다.

## 메모

- `apps/web`는 절대 수정하지 않는다.
- 앱 셸의 시각 기준은 `apps/web/src/components/layout/MainLayout.tsx`, `Header.tsx`, `Sidebar.tsx`다.
- 생성 화면의 시각/구조 기준은 `apps/web/src/pages/changes/CreateForm.tsx`, `CreateFormSidebar.tsx`, `IssueCreatePage.tsx`, `ChangeRequestCreatePage.tsx`다.
- `packages/components`는 props-only 조합으로 유지하고, `apps/web2`는 query/store/router/action 연결만 남긴다.
- `web2` 현재 `main-app-layout.tsx`는 자체 마크업을 들고 있어 패키지 셸 소비 구조로 다시 정리해야 한다.
- `apps/web2/src/features/issue/components/issue-detail-screen.tsx`의 selector는 새 객체를 반환하므로 먼저 안정화가 필요하다.
- 완료 메모:
  - `packages/ui/src/styles.css`에 `topbar-shell`, `sidebar-shell`, `app-panel` 등 `web` 셸 클래스 훅을 공용 스타일로 올렸다.
  - `packages/components/src/app-shell.tsx`, `app-header.tsx`, `app-sidebar.tsx`를 `web`의 `MainLayout/Header/Sidebar` 구조 기준으로 다시 작성했다.
  - `apps/web2/src/app/layouts/main-app-layout.tsx`는 패키지 셸을 소비하고 라우터/인증 스토어/조직 전환/로그아웃 연결만 남도록 정리했다.
  - `packages/components/src/change-create-screen.tsx`를 추가해 `web`의 `CreateForm + CreateFormSidebar` 구조를 패키지 컴포넌트로 승격했다.
  - `apps/web2/src/features/change-shared/components/change-create-form.tsx`는 lookup query와 submit 연결만 담당하도록 축소했다.
  - `apps/web2/src/features/issue/components/issue-detail-screen.tsx`에서 `useAuthStore` selector가 새 객체를 만들지 않게 수정했고, 상세/타임라인 재시도를 함께 수행하도록 보강했다.
  - `apps/storybook`의 `AppShell`, `AppHeader`, `AppSidebar` 스토리와 페이지 스토리를 새 public API 기준으로 갱신했고 `ChangeCreateScreen` 스토리를 추가했다.

## 검증 항목

- [x] `packages/components`의 `AppShell`, `AppHeader`, `AppSidebar`가 `web` 구현 기준의 톤/여백/구조를 반영하는가
- [x] `apps/web2/src/app/layouts/main-app-layout.tsx`가 패키지 셸만 조립하는가
- [x] `packages/components`에 create screen public export가 추가됐는가
- [x] `apps/web2`의 `issue-create`, `change-request-create`가 새 package screen을 쓰는가
- [x] `issue-detail-screen`이 `getSnapshot should be cached`를 유발하는 selector를 제거했는가
- [x] `pnpm lint:web2`
- [x] `pnpm build:web2`
- [x] `pnpm build-storybook`
