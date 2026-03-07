# 17. project detail 및 parts list 실화면 재승격

## 목표

- `parts list` 상단 검색/필터/선택 액션 구조를 `apps/web` 구현 기준으로 `packages/components`에 복구한다.
- `project detail` 헤더, 탭, 개요 탭 구조를 `apps/web` 기준으로 다시 맞춘다.
- 필요 시 `web2`에 project-scoped query를 추가해 `packages/components`에 props만 주입한다.
- `issue/change detail`의 남은 padding/탭 마크업 차이를 같이 줄인다.

## 작업 메모

- 시작 시점 실캡처 기준 큰 차이는 `parts-list`, `project-detail`, `issue/change detail padding`이다.
- `packages/components/src/parts-list-screen.tsx`는 삭제된 상태라 즉시 복구가 필요하다.
- `project detail`은 헤더, 탭 계약, overview 레이아웃이 모두 `web` 원본과 다르다.
- `apps/web`는 읽기 전용이며, 구현 참조만 한다.

## 검증 항목

- `test.lvh.me:5173` / `test.lvh.me:5174` 캡처 재수집
- `parts-list`, `project-detail`, `issue-detail`, `change-detail` diff 감소 확인
- `pnpm lint:web2`
- `pnpm build:web2`
- `pnpm build-storybook`

## 작업 결과

- `packages/components`의 `project detail` 헤더/탭/overview 구조를 `apps/web/src/pages/projects/ProjectDetailPage.tsx` 기준으로 다시 맞췄다.
- `packages/components`의 `parts list` 상단 검색/필터/선택 액션과 테이블 셸을 `apps/web` 원본 기준으로 복구했다.
- `apps/web2`는 project-scoped query와 연결층만 남기고, 화면 마크업은 `packages/components` 조합물을 그대로 소비하도록 정리했다.
- 상세 화면 루트 padding/탭 구조 보정 작업의 출발점을 이 단계에서 정리했고, 후속 18/19 단계에서 추가 보정을 이어갔다.

## 검증 결과

- 후속 단계까지 포함해 `pnpm lint:web2`, `pnpm build:web2`, `pnpm build-storybook` 통과를 재확인했다.
- `parts-list`, `project-detail`은 현재 `web`와 거의 같은 구조/좌표로 수렴했고, 잔여 diff는 미세 typography/spacing 수준으로 남아 있다.

## 남은 격차

- `parts-list`는 픽셀 diff가 여전히 가장 크며, 컬럼별 폰트 렌더링과 미세 간격 차이가 남아 있다.
- `project-detail`은 구조 이관은 끝났지만, 최종 판단은 실제 브라우저 나란히 비교 기준으로만 가능하다.
