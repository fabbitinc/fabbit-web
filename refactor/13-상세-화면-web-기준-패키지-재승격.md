# 13 상세 화면 web 기준 패키지 재승격

## 작업 목표

- [x] `apps/web/src/pages/projects/ChangeRequestDetailPage.tsx`의 상세 조합을 기준으로 `packages/components`의 변경 요청 상세 화면을 다시 맞춘다.
- [x] `apps/web/src/pages/changes/IssueDetailPage.tsx`가 실제로 소비하는 동일 상세 조합 기준으로 `packages/components`의 이슈 상세 화면을 다시 맞춘다.
- [x] `apps/web2`는 상세 화면에서 query/action/router 연결만 남기고, 편집 UI는 `packages/components`가 직접 소유하도록 줄인다.

## 작업 메모

- `apps/web`는 읽기 전용이다.
- 원본 `web` 상세는 우측 사이드바가 `MemberPickerSection`, `LabelPickerSection`, `PartPickerSection`과 인라인 연결 섹션/첨부파일 섹션으로 구성된다.
- 현재 `packages/components` 상세는 별도 `ChangeRequestSidebar`, `IssueSidebar`, 외부 `DetailSelectionDialog` 흐름이 남아 있어 원본과 차이가 크다.
- 이번 단계에서는 상세 화면의 배치, 액션 위치, 우측 섹션 구성을 `web` 기준으로 다시 패키지 승격한다.
- 실제 구현/검증은 후속 단계 문서 [14-상세-우측패널-인라인-편집-패키지-정렬.md](/Users/seongha.moon/code/projects/fabbit/web/refactor/14-상세-우측패널-인라인-편집-패키지-정렬.md)에서 마무리했다.

## 검증 항목

- [x] `pnpm lint:web2`
- [x] `pnpm build:web2`
- [x] `pnpm build-storybook`
