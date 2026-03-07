# 19. project list pagination 및 issue detail 실화면 재정렬

## 목표

- `project-list` 하단 pagination/footer를 `apps/web` 원본 기준으로 다시 맞춰 `packages/components`가 동일한 테이블 셸을 소유하게 한다.
- `issue-detail`의 남은 실화면 diff 원인을 `apps/web` 구현 기준으로 다시 좁혀 `packages/components`와 `apps/web2` 연결층에서 정리한다.
- 수정 후 `web`/`web2` 캡처를 재수집해 diff 감소 여부를 확인한다.

## 작업 메모

- 직전 단계에서 `project-list` footer가 `safePage / totalPages` 형태로 단순화돼 `apps/web/src/pages/projects/ProjectListPage.tsx`의 `getPageNumbers(...)` 기반 pagination과 어긋난 상태다.
- `issue-detail`은 read-only Tiptap padding 보정 이후에도 diff가 남아 있어 timeline spacing, 우측 패널 정보 행, 상태 badge/제목 블록 구조를 다시 확인해야 한다.
- `apps/web`는 읽기 전용이며, 구현/마크업 참조만 한다.

## 검증 항목

- `test.lvh.me:5173` / `test.lvh.me:5174` 기준 `project-list`, `issue-detail` 재캡처
- `project-list` / `issue-detail` diff 감소 확인
- `pnpm lint:web2`
- `pnpm build:web2`
- `pnpm build-storybook`

## 작업 결과

- `packages/components/src/project-list-table.tsx` footer를 `apps/web/src/pages/projects/ProjectListPage.tsx` 원본의 `getPageNumbers(...)` 기반 pagination으로 복구했다.
- `packages/components/src/issue-detail-screen.tsx`, `packages/components/src/change-request-detail-screen.tsx`의 상대시간 fallback을 `web` 원본처럼 `M/D`로 되돌렸다.
- `apps/web2/src/features/change-shared/lib/timeline-event.ts`를 새로 만들어 `apps/web/src/pages/changes/utils.ts`의 detail 포맷 해석(`changes`, `added/removed refs`, linked refs)을 `web2` 연결층으로 옮겼다.
- `apps/web2/src/features/issue/components/issue-detail-screen.tsx`, `apps/web2/src/features/change-request/components/change-request-detail-screen.tsx`가 위 공용 유틸을 사용하도록 바꿨다.
- `apps/web2/src/features/issue/components/issue-detail-screen.tsx`의 첨부파일 크기 표기를 `7.4 MB / 27 KB` 형식의 `web` 원본 규칙으로 맞췄다.

## 검증 결과

- 동시 재캡처 기준(`2026-03-07 16:44 KST`) 주요 diff:
  - `issue-detail`: `29929 -> 25600`
  - `project-list`: `38677 -> 37959`
  - `change-detail`: `14356 -> 14356`
  - `parts-list`: `93329 -> 93329`
  - `app-shell`: `13309 -> 13310`
- `issue-detail`은 파일 첨부 이벤트 문구, 첨부파일 크기, 상대시간 표기가 `web`와 사실상 동일한 수준까지 수렴했다.
- `pnpm --filter @fabbit/web2 exec tsc --noEmit`, `pnpm lint:web2`, `pnpm build:web2`, `pnpm build-storybook` 모두 통과했다.
- `build:web2`와 `build-storybook`에는 기존과 동일한 chunk size 경고, Storybook의 `"use client"` 무시 경고만 남았다.

## 남은 격차

- `parts-list`는 구조는 거의 같지만 긴 테이블 영역 전체에 걸친 미세 typography/antialiasing/spacing 차이 때문에 diff가 크게 남아 있다.
- `project-list`는 실화면상 거의 같은 수준이지만, table/footer의 미세 정렬 차이가 일부 남아 있다.
- `change-detail`은 현재 데이터셋 기준으로 이벤트 매핑 차이가 거의 없었고 diff도 낮은 편이지만, 완전 동일 판정은 실제 브라우저 나란히 비교로만 확정할 수 있다.
