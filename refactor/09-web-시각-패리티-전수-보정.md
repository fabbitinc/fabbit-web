# 09 web 시각 패리티 전수 보정

## 작업 목표

- [ ] `apps/web`를 읽기 전용 기준 소스로 삼아 `packages/components`의 핵심 screen 마크업/클래스/구성을 `web` 기준으로 덮어쓴다.
- [ ] `apps/web2`는 query/store/router 연결만 남기고, 화면 외형은 `packages/components`가 책임지도록 정리한다.
- [ ] `dashboard`, `projects`, `project-detail`, `parts`, `issue`, `change-request`, `settings`, `onboarding` 화면군의 남은 시각 격차를 닫는다.
- [ ] 기존 `packages/ui` 프리미티브와 충돌하는 경우 `web` 스타일 기준으로 덮어쓰되, props-only/public contract는 유지한다.
- [ ] `pnpm build:web2`, `pnpm lint:web2`, `pnpm build-storybook`으로 회귀를 검증한다.

## 메모

- `apps/web`는 계속 읽기 전용이다.
- 이번 단계의 완료 기준은 구조 정리나 패키지 승격이 아니라 `web2`가 실제로 `web`와 동일한 형태로 보이는지 여부다.
- `packages/components`는 시각/마크업 기준선을 `web`에서 가져오고, `apps/web2`는 연결 계층만 유지한다.
- 병렬 축:
  - 대시보드/프로젝트/변경관리
  - 부품/탐색
  - 상세/설정/온보딩
