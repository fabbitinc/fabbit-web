# 09 web 시각 패리티 최종 정렬

## 작업 목표

- [x] `apps/web`를 읽기 전용 기준 소스로 삼아 핵심 화면군의 시각 구조와 스타일 차이를 전수 정리한다.
- [x] `packages/components`의 핵심 screen/조합물을 `web` 마크업과 클래스 기준으로 덮어써 `web2`가 동일한 외형을 소비하게 만든다.
- [x] `apps/web2` wrapper는 컨벤션을 유지한 채 package screen 계약만 연결하도록 정리한다.
- [x] 필요한 storybook screen 스토리와 props 계약을 갱신한다.
- [x] `pnpm build:web2`, `pnpm lint:web2`, `pnpm build-storybook`으로 회귀를 확인한다.

## 메모

- `apps/web`는 절대 수정하지 않는다.
- 시각 기준은 `web`, 구조 기준은 `web2`, 재사용 경계는 `packages`를 유지한다.
- 같은 역할의 UI/컴포넌트가 `packages`에 이미 있으면 `web` 스타일 기준으로 덮어쓴다.
- 이번 단계의 완료 조건은 구조 정리가 아니라 `web2`가 `web`와 같은 화면 형태로 보이도록 만드는 것이다.
- 우선 대상:
  - `dashboard`, `projects-list`, `project-detail`, `change-management`
  - `parts-list`, `part-detail`, `bom-explore`
  - `issue-detail`, `change-request-detail`
  - 설정/온보딩 screen 중 `web` 외형과 차이가 남은 항목
- 진행 메모:
  - `dashboard-screen` 상단 헤더와 카드 레이아웃을 `web` 기준의 `rounded-lg border bg-card` 구조로 정리했다.
  - `project-list-screen`, `projects-list-screen`, `project-list-table`을 `web` 목록 화면 톤으로 정리하고 중복 screen을 단일 구조로 묶었다.
  - `project-detail-screen`, `change-management-screen`은 breadcrumb/underline tab/nav 패턴 기준으로 재정렬해 `web` 상단 구조와 톤을 맞췄다.
  - `parts-list-screen`, `parts-list-table`, `part-detail-screen`, `part-header-card`, `part-properties-tab`, `bom-explore-screen`은 현재 `web` shell 기준의 breadcrumb, underline tab, `rounded-lg border bg-card` 톤으로 유지되는 상태를 확인했다.
  - 시각 패리티 검증 중 드러난 `usage-card` 타입 문제와 `accept-invite-screen` submit 타입 문제를 같이 정리했다.
  - 최종 검증:
    - `pnpm lint:web2` 통과
    - `pnpm build:web2` 통과
    - `pnpm build-storybook` 통과
