# 11 app shell 및 change create screen 검증

## 작업 목표

- [ ] `pnpm lint:web2`로 셸/생성 화면 이관 이후 타입 및 규칙 위반을 점검한다.
- [ ] `pnpm build:web2`로 실제 앱 번들 기준 회귀를 확인한다.
- [ ] `pnpm build-storybook`으로 package public import 기준 storybook 회귀를 확인한다.
- [ ] 검증 중 드러난 오류를 바로 수정하고 결과를 이 문서에 남긴다.

## 메모

- 이번 단계는 구현 추가가 아니라 검증과 마지막 회귀 정리 단계다.
- `apps/web`는 계속 읽기 전용이다.
- dirty worktree 상태를 유지한 채 필요한 수정만 누적한다.

## 검증 로그

- 대기 중
