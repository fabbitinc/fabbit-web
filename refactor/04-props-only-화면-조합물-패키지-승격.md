# 04 props-only 화면 조합물 패키지 승격

## 작업 목표

- [x] `web2`의 props-only 화면 조합물 중 `packages/components`로 승격 가능한 대상을 선별한다.
- [x] 승격 대상 컴포넌트를 `packages/components`로 이동하고 export를 정리한다.
- [x] `apps/storybook`에 신규 패키지 컴포넌트 스토리를 추가한다.
- [x] `apps/web2`가 신규 패키지 컴포넌트를 소비하도록 연결을 교체한다.

## 메모

- 이번 단계는 hook/store/router 의존이 없는 화면 조합물만 대상으로 한다.
- `web` 코드는 읽기 전용으로 유지한다.
- 시각 기준은 `web`이지만, 책임 분리는 `packages/components`와 `web2` 규칙을 유지한다.
- `packages/ui`에 `InlineTabs` 프리미티브를 추가하고 readonly 탭 아이템 계약으로 정리했다.
- `packages/components`에 `UsageSection`, `OrganizationSettingsScreen`, `ProjectSettingsScreen`, `UserSettingsScreen`을 추가하고 public export를 연결했다.
- `apps/storybook`에 신규 UI/컴포넌트 스토리를 추가해 `packages` 시각 검증 경로를 확보했다.
- `apps/web2`의 조직/프로젝트/사용자 설정 화면과 사용량 화면은 로컬 조합 구현 대신 `@fabbit/components` 소비 형태로 교체했다.
- 검증 결과:
  - `pnpm build:web2` 성공
  - `pnpm lint:web2` 성공
  - `pnpm build-storybook` 성공
- storybook과 `web2` 빌드 모두 번들 크기 경고는 남아 있지만 실패 원인은 아니다.
