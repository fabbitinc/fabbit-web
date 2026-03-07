# 23. 변경내용 및 속성 매핑 web 기준 재이관

## 목표

- `change request detail`의 `변경 내용` 탭을 `apps/web` 원본 기준 구조와 시각으로 다시 맞춘다.
- `parts template mapping` 화면을 `apps/web` 원본 기준으로 `packages/components`와 `apps/web2` 연결층에 다시 반영한다.
- `apps/web2`에는 hook/query/store/router 연결만 남기고, 화면 조합은 `packages/components`가 소유하게 정리한다.

## 작업 메모

- 현재 `packages/components/src/change-request-diff-tab.tsx`는 mock notice 중심 구현이라 `apps/web/src/pages/projects/ChangesDiffTab.tsx`의 실제 구성과 차이가 크다.
- 현재 `parts-template-mapping`은 `packages/components` 승격이 일부 진행됐지만, `apps/web2`와 `packages/components` 사이에 중복 CSS/조합이 남아 있을 가능성이 높다.
- 이번 단계도 `apps/web`는 읽기 전용이며, `web` 구현을 패키지/연결층에 덮어쓰는 방식으로 진행한다.

## 검증 항목

- `change-detail`의 `변경 내용` 탭 구조가 `web` 기준으로 패키지에 승격됐는지 확인
- `parts-template-mapping` 화면이 `web` 원본 구조를 `packages/components` public import로 소비하는지 확인
- `pnpm --filter @fabbit/web2 exec tsc --noEmit`
- `pnpm lint:web2`
- `pnpm build:web2`
- `pnpm build-storybook`

## 작업 결과

- `packages/components/src/change-request-diff-tab.tsx`
  - 기존의 축약 mock notice UI를 제거하고 `apps/web/src/pages/projects/ChangesDiffTab.tsx` 구조를 그대로 옮겼다.
  - `before/after` 스냅샷 기반 테이블, 상단 요약 카운트, 수정/추가/삭제 badge, 접기/펼치기 카드 구조를 패키지가 직접 소유하게 바꿨다.
- `apps/storybook/stories/components/ChangeRequestDiffTab.stories.tsx`
  - 새 diff 타입에 맞춰 스토리를 갱신했다.
- `packages/components/src/parts-template-mapping-screen.tsx`
  - 헤더/설명/하단 CTA를 `apps/web/src/pages/parts/PartsTemplateMappingPage.tsx`의 실제 구조로 다시 맞췄다.
  - 기존의 `Mapping` 배지와 `부품 템플릿 매핑 검토` 문구를 제거하고, `web` 원본의 `매핑 확인` 카드 헤더와 툴팁 스타일을 복구했다.
- `packages/components/src/parts-template-mapping-screen.css`
  - `apps/web/src/pages/parts/parts-template-mapping.css`의 override 규칙을 패키지 CSS로 덮어써 색/배경/hover 토큰을 원본 기준으로 복구했다.
- `packages/components/src/parts-template-mapping-board.tsx`
  - 원본 매핑 보드의 샘플 테이블, 컬럼, 카드, select, DnD overlay 렌더링을 새 패키지 컴포넌트로 승격했다.
  - `packages/components`는 props-only 렌더링만 담당하고, 이동/선택/삭제는 callback으로 외부에서 받도록 구성했다.
- `apps/web2/src/features/part-template-mapping/components/kanban/kanban-board.tsx`
  - 로컬 보드 렌더링을 제거하고 `@fabbit/components`의 `PartsTemplateMappingBoard`를 소비하는 연결층으로 축소했다.
  - store/hook/action을 사용한 이동 오케스트레이션만 남겼다.
- `apps/web2/src/features/part-template-mapping/components/kanban/kanban-card.tsx`
- `apps/web2/src/features/part-template-mapping/components/kanban/kanban-column.tsx`
- `apps/web2/src/features/part-template-mapping/components/kanban/kanban-context.tsx`
- `apps/web2/src/features/part-template-mapping/components/kanban/kanban-drag-overlay.tsx`
- `apps/web2/src/features/part-template-mapping/components/parts-template-mapping.css`
  - 위 앱 로컬 UI 구현과 중복 CSS는 삭제했다.
- `packages/components/package.json`, `pnpm-lock.yaml`
  - 패키지 보드가 직접 쓰는 `@dnd-kit/core` 의존을 `packages/components`로 옮겼고, `pnpm install --offline`로 워크스페이스 링크를 갱신했다.

## 검증 결과

- `pnpm install --offline` 통과
  - 다운로드 없이 기존 lock/store만 사용했고, 기존 Storybook peer warning만 남았다.
- `pnpm --filter @fabbit/web2 exec tsc --noEmit` 통과
- `pnpm lint:web2` 통과
- `pnpm build:web2` 통과
  - 기존과 같은 chunk size 경고만 남고, 매핑 CSS escape 경고는 제거했다.
- `pnpm build-storybook` 통과
  - `stories/**/*.mdx` 없음 경고, `"use client"` 무시 경고, chunk size 경고만 남았다.

## 남은 격차

- 이번 단계로 `변경 내용` 탭의 렌더링 구조와 `속성 매핑` 화면의 셸/보드 UI 소유권은 `packages/components` 쪽으로 더 끌어올렸다.
- 다만 `change-detail`의 `변경 내용` 데이터 자체는 여전히 서버 diff 계약이 없어서 패키지 내부 기본 mock 스냅샷에 기대고 있다. 즉 구조는 `web` 기준으로 맞췄지만, 데이터 소스까지 `web2` 실데이터로 정렬된 상태는 아니다.
- 현재 자동 패리티 스크립트는 `change-detail`의 `changes` 탭과 `parts-template-mapping` 라우트를 캡처하지 않는다. 따라서 이번 단계는 타입/빌드 검증은 끝났지만, 이 두 화면은 별도 캡처 자동화 또는 수동 비교가 추가로 필요하다.
