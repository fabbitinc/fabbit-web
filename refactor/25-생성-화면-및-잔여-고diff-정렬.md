# 25. 생성 화면 및 잔여 고 diff 정렬

## 목표

- `apps/web`의 새 이슈/새 변경 요청 화면을 읽기 전용 기준으로 다시 대조해, `packages/components`와 `apps/web2` 연결층의 남은 차이를 줄인다.
- parity 수치가 아직 큰 `issue-create`, `change-create`를 우선 보정한다.
- 이어서 `parts-list`, `project-detail` 등 잔여 고 diff 화면의 구조 차이를 1~2곳 더 줄인다.

## 메모

- `apps/web`는 수정하지 않는다.
- `packages/components`는 props-only 조합, `apps/web2`는 hook/query/store/router 연결만 남긴다.
- 빌드 통과나 threshold 통과만 완료로 보지 않고, `web` 구현 기준으로 패키지 소유권이 맞는지 함께 확인한다.

## 검증 항목

- `packages/components`의 생성 화면 조합이 `web` 구현 기준으로 갱신되었는가
- `apps/web2` 생성 화면이 연결층만 남도록 유지되는가
- 잔여 고 diff 화면 1~2곳이 추가로 줄었는가
- `pnpm --filter @fabbit/web2 exec tsc --noEmit`
- `pnpm lint:web2`
- `pnpm build:web2`
- `pnpm build-storybook`
- `pnpm parity:web2`

## 작업

- `apps/web2/src/pages/changes/issue-create-page.tsx`
  - 설명 문구를 `web` 원본과 동일한 `추적할 작업 또는 문제를 등록합니다.`로 교체했다.
- `apps/web2/src/pages/changes/change-request-create-page.tsx`
  - 설명 문구를 `web` 원본과 동일한 `설계 변경사항을 등록하고 리뷰를 요청합니다.`로 교체했다.
- `packages/components/src/project-overview-tab.tsx`
  - 개요 카드가 탭 카운트와 다른 값을 받을 수 있도록 `overviewIssueCount`, `overviewChangeCount`, `overviewMergedChangeCount` optional props를 추가했다.
  - 탭 카운트는 기존 `issueCount`, `changeCount`를 유지하고, 개요 카드만 새 overview 필드를 우선 사용하게 바꿨다.
- `apps/web2/src/features/project-detail/components/project-detail-screen.tsx`
  - `web`의 `ProjectDetailPage`가 개요 카드에서 project query가 아니라 `changeRequestMock` 기반 수치(`열린 변경 요청 1`, `반영 완료 1`)를 쓰는 구조를 그대로 반영했다.
  - 탭 카운트는 기존 query 값(`0`)을 유지하고, 개요 카드용 수치만 별도 주입하게 변경했다.
- `apps/web2/src/features/project-detail/lib/project-overview-summary.ts`
  - `web` 원본의 개요 카드 요약 수치를 연결층에서 주입하기 위한 feature 로컬 helper를 추가했다.
- `apps/storybook/stories/components/ProjectDetailScreen.stories.tsx`
- `apps/storybook/stories/components/ProjectOverviewTab.stories.tsx`
  - 새 overview props를 반영해 스토리도 깨지지 않도록 맞췄다.

## 결과

- `web2 /changes/issues/new`
  - 설명 문구가 `추적할 작업 또는 문제를 등록합니다.`로 `web`와 같아졌다.
- `web2 /changes/requests/new`
  - 설명 문구가 `설계 변경사항을 등록하고 리뷰를 요청합니다.`로 `web`와 같아졌다.
- `web2 /projects/019cc6bd-7b09-7cd4-a762-11e32b96dcb1`
  - 탭은 `변경 요청 (0)`을 유지하면서, 개요 카드만 `열린 변경 요청 1 / 반영 완료 1`로 `web`와 같아졌다.
- parity 수치 변화
  - `issue-create`: `4507 -> 2592`
  - `change-create`: `4115 -> 2594`
  - `project-detail`: `3302 -> 2874`
- 이번 단계에서 `parts-list`는 추가 보정하지 않았고, 최신 수치 `3731`로 남아 있다.

## 검증 결과

- `pnpm --filter @fabbit/web2 exec tsc --noEmit`: 통과
- `pnpm lint:web2`: 통과
- `pnpm build:web2`: 통과
  - 기존과 같은 chunk size 경고만 확인
- `pnpm build-storybook`: 통과
  - 기존과 같은 `stories/**/*.mdx` 없음 경고, `"use client"` 무시 경고만 확인
- `pnpm parity:web2`: 통과
  - `issue-create 2592 / threshold 4700`
  - `change-create 2594 / threshold 4300`
  - `project-detail 2874 / threshold 3500`
  - 잔여 상위 diff: `parts-template-analysis 3840`, `parts-list 3731`, `app-shell 3122`, `project-list 3042`, `issue-detail 3037`, `change-detail 2935`
