# 26. parts analysis 및 list 잔여 패리티 보정

## 목표

- parity 상위 잔차인 `parts-template-analysis`, `parts-list`를 우선 보정한다.
- `apps/web` 구현을 읽기 전용 기준으로 다시 대조하고, `packages/components`와 `apps/web2` 연결층의 남은 차이를 줄인다.
- 단순 톤 보정이 아니라 `web -> packages -> web2` 구조 안에서 차이를 해소한다.

## 메모

- `apps/web`는 수정하지 않는다.
- `packages/components`는 props-only 조합, `apps/web2`는 hook/query/store/router 연결만 남긴다.
- 자동 parity 수치와 실제 화면 구조 차이를 함께 확인한다.

## 검증 항목

- `parts-template-analysis` 화면 차이가 추가로 줄었는가
- `parts-list` 화면 차이가 추가로 줄었는가
- `pnpm --filter @fabbit/web2 exec tsc --noEmit`
- `pnpm lint:web2`
- `pnpm build:web2`
- `pnpm build-storybook`
- `pnpm parity:web2`

## 작업

- `packages/components/src/parts-template-analysis-screen.tsx`
  - `web` 원본의 용어 안내 문구와 동일하게 `용어 기준: 부품(part), 조립품(상위 부품)(Assy/Parent Part)`로 맞췄다.
- `packages/components/src/parts-list-screen.tsx`
  - 헤더 레이아웃을 `web`의 `PartsPage.tsx`와 같은 `mb-6 flex items-start justify-between` / `flex items-center gap-2` 구조로 되돌렸다.
- `packages/components/src/parts-list-table.tsx`
  - footer 좌측 영역 간격을 `gap-3 -> gap-2`로 조정해 `web`의 페이지네이션 정보 배치와 맞췄다.
- `refactor/scripts/capture-authenticated-routes.mjs`
  - 매핑 플로우가 멈출 때 `parts-template-processing-timeout.png`, `parts-template-processing-timeout.txt`를 남기도록 진단 아티팩트를 추가했다.
  - 이제 parity가 실패해도 “매핑 확인 버튼 대기 timeout”만 보이는 게 아니라, 실제 정체 화면과 본문 텍스트를 바로 확인할 수 있다.

## 결과

- 별도 2화면 캡처 비교(`refactor/.captures-stage26`) 기준
  - `parts-template-analysis`: `3840 -> 2765`
  - `parts-list`: `3731 -> 3261`
- `parts-list`의 footer 좌측 텍스트 차이는 제거됐고, 현재 잔차는 상단 `속성 분석` 버튼 주변의 미세 차이 위주로 남아 있다.
- `parts-template-analysis`는 파일 형식 예시 상단의 안내 문구 차이를 해소하면서 diff가 크게 줄었다.

## 검증 결과

- `pnpm --filter @fabbit/web2 exec tsc --noEmit`: 통과
- `pnpm lint:web2`: 통과
- `pnpm build:web2`: 통과
  - 기존과 같은 chunk size 경고만 확인
- `pnpm build-storybook`: 통과
  - 기존과 같은 `stories/**/*.mdx` 없음 경고, `"use client"` 무시 경고만 확인
- `node --check refactor/scripts/capture-authenticated-routes.mjs`: 통과
- `pnpm parity:web2`: 실패
  - 실패 지점은 이번 보정 화면이 아니라 `parts-template-processing -> 매핑 확인` 단계
  - `web`에서도 같은 현상이 재현됐고, 별도 확인 스크립트에서 `281초` 동안 `매핑 확인` 버튼이 활성화되지 않았다
  - 즉 현재 full parity 실패 원인은 `web2` UI diff가 아니라 매핑 처리 자체가 끝나지 않는 런타임/서버 상태다
  - 진단 아티팩트 생성 확인
    - `refactor/.captures/web/parts-template-processing-timeout.png`
    - `refactor/.captures/web/parts-template-processing-timeout.txt`
    - 본문 로그에는 `오류: 속성 분석 처리 중 오류가 발생했습니다.`가 남는다
  - 대신 이번 단계에서 바꾼 화면은 별도 캡처(`refactor/.captures-stage26/compare/summary.json`)로 diff 감소를 확인했다
