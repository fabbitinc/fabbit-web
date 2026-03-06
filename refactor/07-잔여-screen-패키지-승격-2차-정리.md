# 07 잔여 screen 패키지 승격 2차 정리

## 작업 목표

- [x] `bom-explore-screen`의 화면 조합을 `packages/components`로 승격하고 `web2`를 연결 래퍼로 축소한다.
- [x] `signup-screen`, `workspace-setup-screen`, `plan-selection-screen`의 온보딩 화면 조합을 `packages/components`로 승격한다.
- [x] `parts-template-analysis-screen`, `parts-template-processing-screen`, `parts-template-mapping-screen`의 플로우 화면 조합을 `packages/components`로 승격한다.
- [x] 필요한 storybook screen 스토리를 추가하고 `packages` public import만 사용하도록 유지한다.
- [x] `web2` 컨벤션과 `web` 시각 기준을 같이 확인하고 검증한다.

## 메모

- `apps/web`는 계속 읽기 전용 소스로만 사용한다.
- 이번 단계는 남아 있는 큰 로컬 screen을 `packages/components` 중심으로 한 번 더 걷어내는 작업이다.
- 병렬 축:
  - BOM/부품 상세 보조 화면 축
  - 온보딩/가입 화면 축
  - 템플릿 매핑 플로우 화면 축
- 완료 항목:
  - `BomExploreScreen`을 `packages/components`로 승격하고 `web2` wrapper를 연결 전용으로 축소했다.
  - `LoginScreen`, `AcceptInviteScreen`, `SignupScreen`, `WorkspaceSetupScreen`, `PlanSelectionScreen`을 `packages/components` public screen으로 승격했다.
  - `PartsTemplateAnalysisScreen`, `PartsTemplateProcessingScreen`, `PartsTemplateMappingScreen`을 `packages/components` public screen으로 승격했다.
  - 관련 storybook screen 스토리를 추가했다.
- 검증:
  - `pnpm build:web2` 통과
  - `pnpm lint:web2` 통과
  - `pnpm build-storybook` 통과
- 다음 단계:
  - `issue/change-request` 상세 wrapper의 공통 조합물을 `packages/components`로 승격해 `web2` 연결 책임만 남긴다.
