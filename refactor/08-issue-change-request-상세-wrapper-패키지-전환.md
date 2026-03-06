# 08 issue change-request 상세 wrapper 패키지 전환

## 작업 목표

- [x] `issue-detail-screen`의 편집/댓글/확인 다이얼로그 UI 상태를 `packages/components`로 이동한다.
- [x] `change-request-detail-screen`의 편집/댓글/확인 다이얼로그 UI 상태를 `packages/components`로 이동한다.
- [x] `apps/web2` 상세 화면 wrapper는 query/action 연결과 데이터 정규화만 남기도록 축소한다.
- [x] 변경된 screen 계약에 맞춰 storybook screen 스토리를 갱신한다.
- [x] `pnpm build:web2`, `pnpm lint:web2`, `pnpm build-storybook`으로 최종 검증한다.

## 메모

- `apps/web`는 계속 읽기 전용이다.
- 이번 단계의 핵심은 `web2` 상세 화면의 로컬 UI 상태를 packages로 이동해 `cv-component`/`cv-structure` 경계를 더 강하게 맞추는 것이다.
- 완료 항목:
  - `packages/components`에 `editable-timeline-comment`, `detail-selection-dialog`를 추가해 상세 화면 공통 편집/선택 UI를 props-only 조합으로 이동했다.
  - `packages/components/src/issue-detail-screen.tsx`, `packages/components/src/change-request-detail-screen.tsx`가 본문 편집, 댓글 작성/수정, 확인 다이얼로그를 직접 책임지도록 확장됐다.
  - `apps/web2/src/features/issue/components/issue-detail-screen.tsx`, `apps/web2/src/features/change-request/components/change-request-detail-screen.tsx`는 query/action 연결, timeline event 매핑, dialog 데이터 정규화만 남기도록 축소됐다.
  - `apps/storybook/stories/components/IssueDetailScreen.stories.tsx`, `apps/storybook/stories/components/ChangeRequestDetailScreen.stories.tsx`를 새 screen 계약에 맞게 갱신했다.
- 검증:
  - `pnpm build:web2` 통과
  - `pnpm lint:web2` 통과
  - `pnpm build-storybook` 통과
