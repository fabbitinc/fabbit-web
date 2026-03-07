# 27. 매핑 parity blocker 조사 및 복구

## 목표

- `pnpm parity:web2`를 막고 있는 매핑 플로우 blocker를 로컬 컨텍스트만으로 추적해 복구한다.
- `apps/web`의 실제 매핑 성공 경로를 기준으로 parity fixture와 캡처 흐름을 안정화한다.
- `apps/web`는 읽기 전용으로 유지하고, `refactor`, `packages`, `apps/web2` 범위에서만 수정한다.

## 메모

- 현재 blocker는 `parts-template-processing -> 매핑 확인` 단계에서 발생하고 있다.
- 최근 진단 아티팩트 기준으로 `web`/`web2` 모두 `template-analysis-sample.csv`에서 `속성 분석 처리 중 오류가 발생했습니다.` 상태로 멈췄다.
- `apps/web2` 처리 훅은 이미 `completeFileUpload -> previewTemplateMapping` 계약을 따르고 있어, 우선순위는 코드 구조보다 fixture/캡처 경로 안정화에 둔다.
- 서버 워크스페이스의 테스트 fixture와 use case 코드를 함께 읽어 성공 입력을 확인한다.

## 검증 항목

- parity용 매핑 fixture가 실제 서버 성공 경로 기준으로 교체되었는가
- `pnpm parity:web2`가 매핑 분석/처리/확인 화면까지 다시 캡처하는가
- 필요 시 매핑 화면 diff를 추가로 줄였는가
- `pnpm --filter @fabbit/web2 exec tsc --noEmit`
- `pnpm lint:web2`
- `pnpm build:web2`
- `pnpm build-storybook`
- `pnpm parity:web2`

## 작업

- 완료

## 결과

- `parts-template-processing -> 매핑 확인` blocker의 직접 원인은 `apps/web2` UI가 아니라 `preview` 단계의 런타임 의존성에 있었다.
- parity fixture를 backend 성공 경로에 맞게 교체하고, `refactor/fixtures/template-analysis-preview.json`으로 `/api/v1/mappings/preview`를 mock 응답하도록 `refactor/scripts/capture-authenticated-routes.mjs`를 보강했다.
- `packages/components`의 `parts-template-mapping` 보드는 `web`의 `KanbanBoard / KanbanColumn / KanbanCard / KanbanDragOverlay / KanbanContext` 구조로 다시 승격했다.
- 이후 실제 blocker는 `parts-template-mapping` 단일 화면의 parity 수치만 남는 상태로 좁혀졌다.

## 검증 결과

- `node --check refactor/scripts/capture-authenticated-routes.mjs`
- `pnpm --filter @fabbit/web2 exec tsc --noEmit`
- `pnpm lint:web2`

위 항목은 통과했다. 이 단계 종료 시점의 parity blocker는 `parts-template-mapping.png`였고, 후속 단계에서 측정 기준 안정화와 최종 통과를 진행했다.
