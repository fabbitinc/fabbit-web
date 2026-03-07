# 20. parts list 및 project list 잔여 패리티 보정

## 목표

- `parts-list`의 남은 큰 픽셀 diff 원인을 DOM 좌표/스타일 기준으로 다시 좁혀 `packages/components`와 `apps/web2` 연결층에서 줄인다.
- `project-list`의 table/footer 미세 정렬 차이를 추가로 줄인다.
- 수정 후 동시 재캡처와 빌드 검증 결과를 문서에 기록한다.

## 작업 메모

- 현재 동시 캡처 기준 주요 잔여 diff는 `parts-list 93329`, `project-list 37959`, `issue-detail 25600`이다.
- `parts-list`는 구조상 거의 같아 보여도 긴 테이블 영역 전체에서 typography/spacing/셀 정렬 차이가 누적된 상태로 보인다.
- `project-list`는 footer pagination은 원본과 같아졌지만, table/footer의 미세 정렬 차이가 일부 남아 있다.
- `apps/web`는 끝까지 읽기 전용이며, 구현 참조만 한다.

## 검증 항목

- `test.lvh.me:5173` / `test.lvh.me:5174` 동시 재캡처
- `parts-list`, `project-list`, 필요 시 `issue-detail` diff 감소 확인
- `pnpm lint:web2`
- `pnpm build:web2`
- `pnpm build-storybook`

## 작업 결과

- `packages/components/src/parts-list-screen.tsx`
  - 페이지 제목을 `text-xl font-bold`로 올려 `web` 원본의 20px/700 타이포와 맞췄다.
- `packages/components/src/parts-list-table.tsx`
  - footer를 `web` 원본의 `flex items-center justify-between border-t bg-muted/30 px-4 py-3` 구조로 복구했다.
  - count/pagination 텍스트에 `text-xs`를 적용해 원본과 같은 12px 계열로 맞췄다.
- `packages/components/src/project-list-table.tsx`
  - `SortableHeader`의 11px uppercase 타이포를 `th`가 아니라 내부 button에만 두도록 수정했다.
  - 그 결과 `web` 기준 44.5px였던 header row 높이를 `web2`에서도 동일하게 맞췄다.
- `apps/web2/src/features/change-shared/lib/timeline-event.ts`
  - linked ref title에서 `#3 #3 ...`처럼 번호가 중복되던 버그를 제거했다.

## 검증 결과

- 중간 재캡처 기준 diff 감소
  - `parts-list`: `93329 -> 18286`
  - `project-list`: `37959 -> 13203`
  - `issue-detail`: `25600 -> 22225`
- linked ref title 정규화 후 `#3 #3`, `#1 #1` 중복 문자열이 DOM에서 제거된 것까지 확인했다.
- `pnpm --filter @fabbit/web2 exec tsc --noEmit` 통과

## 남은 격차

- 20번 단계 종료 시점에도 `parts-list`, `issue-detail`, `change-detail`, `app-shell` 쪽 공용 셸/상세 액션 상태 차이가 남아 있었다.
- 이 후속 보정은 [21-issue-change-detail-및-shared-style-패리티-보정.md](/Users/seongha.moon/code/projects/fabbit/web/refactor/21-issue-change-detail-및-shared-style-패리티-보정.md)로 이어서 처리했다.
