# 21. issue/change detail 및 shared style 패리티 보정

## 목표

- `issue-detail`, `change-detail`의 하단 댓글 액션 상태를 `apps/web` 원본과 동일하게 맞춘다.
- `parts-list` 상단 AI 아웃라인 버튼과 테이블 헤더 정렬을 `web` 구현 기준으로 `packages`에 덮어쓴다.
- 캡처 diff 측정 스크립트의 수치 파싱을 고쳐 이후 검증 결과를 문서에 직접 남길 수 있게 한다.

## 작업 메모

- 최신 동시 캡처 기준 잔여 diff는 `issue-detail 20198`, `parts-list 18286`, `change-detail 14662`다.
- Playwright DOM 비교 결과 `web2`의 `issue-detail` / `change-detail` 댓글 버튼은 비어 있을 때 `disabled`인데, `web` 원본은 비활성화하지 않고 클릭 시점에만 guard를 건다.
- `parts-list`의 `속성 분석` 버튼은 `packages/ui`의 `.ai-outline-btn` 구현이 `web` 원본과 달라 색상/그라데이션이 어긋난다.
- `parts-list` 테이블 헤더는 `packages/components` 구현이 원본의 정렬 규칙(`pl-4`, `text-center`, `tracking-wider`)을 완전히 따르지 않는다.

## 검증 항목

- `test.lvh.me:5173` / `test.lvh.me:5174` 동시 재캡처
- `issue-detail`, `change-detail`, `parts-list` diff 감소 확인
- `pnpm lint:web2`
- `pnpm build:web2`
- `pnpm build-storybook`

## 작업 결과

- `packages/components/src/issue-detail-screen.tsx`
  - 댓글 버튼을 비어 있을 때 disabled 하지 않도록 바꿨다.
  - `web` 원본과 같이 클릭 시점 guard만 남겨 하단 액션 상태를 일치시켰다.
- `packages/components/src/change-request-detail-screen.tsx`
  - 댓글 버튼 disabled 조건을 `isCreatingComment`만 보도록 바꿔 `web` 원본과 맞췄다.
- `packages/ui/src/styles.css`
  - `.ai-outline-btn`와 `.ai-outline-btn__icon`을 `web` 원본 CSS 그대로 덮어써 `parts-list` 상단 `속성 분석` 버튼 톤을 맞췄다.
- `packages/components/src/parts-list-table.tsx`
  - `SortableHeader`에 `align`을 추가해 `카테고리/Rev/상태` 헤더를 원본처럼 중앙 정렬로 맞췄다.
  - `tracking-wider`, `pl-4` 규칙도 `web` 기준으로 복구했다.
- `packages/components/src/app-sidebar.tsx`
  - active/inactive nav item 색을 CSS 변수 기반 inline style로 고정해 `web`와 같은 active bg/blue text를 적용했다.
- `packages/components/src/app-header.tsx`
  - 검색/토글/도움말/알림/프로필 버튼 기본 색을 `var(--nav-topbar-icon)`으로 고정해 `web`와 같은 slate tone으로 맞췄다.
- `refactor/scripts/compare-captures.mjs`
  - ImageMagick `compare -metric AE` 결과에서 첫 숫자만 파싱하도록 고쳐 `summary.json`에 실제 `diffPixels`가 저장되게 했다.

## 검증 결과

- 최신 동시 재캡처 기준 diff
  - `issue-detail`: `20198 -> 9987`
  - `parts-list`: `16172 -> 6020`
  - `issue-create`: `14718 -> 4507`
  - `change-create`: `14326 -> 4115`
  - `project-detail`: `13463 -> 3302`
  - `app-shell`: `13313 -> 3125`
  - `project-list`: `13203 -> 3042`
  - `change-detail`: `13146 -> 2935`
  - `part-detail`: `12801 -> 2644`
- `pnpm --filter @fabbit/web2 exec tsc --noEmit` 통과
- `pnpm lint:web2` 통과
- `pnpm build:web2` 통과
  - 기존과 같은 chunk size 경고만 남음
- `pnpm build-storybook` 통과
  - `stories/**/*.mdx` 없음 경고, `"use client"` 무시 경고, chunk size 경고만 남음

## 남은 격차

- 숫자 기준으로는 모든 핵심 화면 diff가 1만 미만까지 내려왔고, 공용 셸 잔차도 `3125` 수준까지 줄었다.
- 다만 `issue-detail 9987`, `parts-list 6020`은 아직 0이 아니므로, 최종 완료를 단정하려면 실제 브라우저에서 hover/popover/open 상태까지 포함한 마지막 육안 비교가 한 번 더 필요하다.
- 현재 상태는 `web -> packages -> web2` 구조 이관과 정적 검증은 완료됐고, 남은 일은 미세 시각 패리티 최종 확인이다.
