# 29. 매핑 preview mock 제거 및 threshold 재강화

## 목표

- parity 캡처 스크립트에 추가했던 `preview mapping` mock 경로를 제거한다.
- 매핑 플로우 parity를 실제 `localhost:8080` 응답 기준으로 다시 고정한다.
- `parts-template-mapping`과 관련 threshold를 다시 더 엄격하게 낮춘다.

## 메모

- `PARITY_USE_MOCK_TEMPLATE_PREVIEW=0` 기준으로 `web`/`web2` 모두 실제 preview 응답으로 `parts-template-mapping`까지 캡처되는 것을 확인했다.
- 실서버 기준 최신 수치는 `parts-template-mapping.png = 2592`, `parts-template-processing.png = 2592` 수준이다.
- 따라서 이전 단계에서 임시로 넣었던 `template-analysis-preview.json` fixture와 route.fulfill mock은 제거 대상이다.

## 검증 항목

- `refactor/scripts/capture-authenticated-routes.mjs`에서 preview mock 코드가 제거되었는가
- `refactor/fixtures/template-analysis-preview.json`이 제거되었는가
- `parts-template-mapping.png` threshold가 실측값 기준으로 다시 낮아졌는가
- `pnpm parity:web2`
- `pnpm --filter @fabbit/web2 exec tsc --noEmit`
- `pnpm lint:web2`
- `pnpm build:web2`
- `pnpm build-storybook`

## 작업

- 완료

## 결과

- `refactor/scripts/capture-authenticated-routes.mjs`에서 `PARITY_USE_MOCK_TEMPLATE_PREVIEW`, `PARITY_TEMPLATE_PREVIEW_FIXTURE`, `route.fulfill()` 기반 `preview mapping` mock 경로를 제거했다.
- parity 캡처는 이제 실제 `localhost:8080` 응답으로 `parts-template-analysis -> parts-template-processing -> parts-template-mapping`까지 진행한다.
- parity 전용 fixture였던 `refactor/fixtures/template-analysis-preview.json`은 삭제했다.
- `refactor/parity-thresholds.json`의 `parts-template-mapping.png` threshold를 `5000 -> 2800`, `parts-template-processing.png`를 `3000 -> 2800`으로 다시 낮췄다.

## 최종 수치

- `parts-template-mapping.png`: `2592 / 2800`
- `parts-template-processing.png`: `2596 / 2800`
- `parts-template-analysis.png`: `2733 / 4000`
- `parts-list.png`: `3231 / 4000`
- `issue-detail.png`: `3151 / 3600`
- `change-detail.png`: `3049 / 3200`
- `project-list.png`: `3035 / 3200`

## 검증 결과

- `node --check refactor/scripts/capture-authenticated-routes.mjs`
- `pnpm parity:web2`
- `pnpm --filter @fabbit/web2 exec tsc --noEmit`
- `pnpm lint:web2`
- `pnpm build:web2`
- `pnpm build-storybook`

모두 통과했다. 경고는 기존과 같은 Vite chunk size 경고, Storybook의 `stories/**/*.mdx` 없음 경고, `"use client"` 무시 경고만 남았다.
