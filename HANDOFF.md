# HANDOFF

## Goal

- EC(Engineering Change) 변경관리 화면의 백엔드 API 스펙 변경에 맞춰 프론트엔드 코드를 리팩토링하고 QA한다.
- EC step 구조 변경 (flat → assignees[] 배열 + completion_policy), 라벨 동기화 API 추가, 워크플로우 UI 개선.

## Current Progress

### 1. EC Step 구조 변환 완료
- flat `assignee_id`/`assignee_type` → `assignees[]` 배열 + `completion_policy` required로 전환
- 영향 받은 hook 3개 모두 수정 완료:
  - `use-create-engineering-change-action.ts`: `AssigneeRequestAssigneeType` import, `completion_policy: "ALL_MUST_APPROVE"` 기본값
  - `use-sync-engineering-change-steps-action.ts`: 전면 재작성. `SyncStepsStageInput` 인터페이스, `buildSyncStagesFromWorkflow` 헬퍼
  - `use-sync-engineering-change-reviewers-action.ts`: 동일 패턴 적용

### 2. API 이름 변경 반영 완료
- `engineeringChangeReplaceSteps` → `engineeringChangeSyncSteps` (orval 재생성으로 변경)
- `engineering-change.api.ts`에서 import alias 수정

### 3. Reopen hook 런타임 에러 수정
- `rejectEngineeringChange(id)` → `rejectEngineeringChange(id, { step_id, comment })` 필수 인자 추가
- `use-reopen-engineering-change-action.ts` mutationFn에 `{ stepId, comment }` 인자 추가

### 4. EC 라벨 기능 추가 완료
- `syncEngineeringChangeLabels` API 래퍼 추가 (`engineering-change.api.ts`)
- `use-sync-engineering-change-labels-action.ts` 신규 생성
- `toEngineeringChangeDetailModel`에서 `labels: []` 하드코딩 → API 응답 매핑
- `engineeringChangeViewModel`에서도 `labels: []` 하드코딩 → 실제 labels 매핑 (두 곳 모두 수정!)
- 사이드바에 `LabelPickerSection` 복원
- 타임라인에 `engineering_change:label_changed` 이벤트 처리 추가

### 5. 워크플로우 UI 개선 완료
- `WorkflowStepRailAccordion` 전면 재작성:
  - completion_policy Select (ALL_MUST_APPROVE / ANY_ONE_APPROVES / MIN_N_APPROVES)
  - MIN_N_APPROVES 선택 시 "최소 N인" Input 표시
  - 담당자 제거 X 버튼 (PENDING 상태만)
  - MemberPickerSection에 assigneeId 기반 selectedIds 전달
  - completed stage는 읽기 전용

### 6. 담당자 필터링 수정 완료
- `MemberPickerSection`: selectedIds에 포함된 멤버를 availableMembers에서 필터링
- component 타입에 `assigneeId` 정식 추가, 모든 변환 경로에 반영

### 7. 이슈/EC 라벨 패턴 통일 완료
- `issue.api.ts`: `syncIssueLabels(id, labelIds)` — 내부에서 `{ label_ids }` 래핑
- `use-sync-issue-labels-action.ts`: hook은 직접 array 전달
- `issue.queries.ts`: `SyncIssueLabelsRequestDto` → `string[]` 타입 변경

## What Worked

- EC step 구조 전환 시 생성/sync steps/sync reviewers 3개 hook을 일관되게 변경하는 접근
- 이슈 라벨 패턴을 먼저 분석하고 EC에 동일 패턴 적용
- `assigneeId` 필드를 component 타입에 정식 추가하여 근본적 해결

## What Didn't Work

- EC 라벨 미표시 버그: `toEngineeringChangeDetailModel`만 수정하고 `engineeringChangeViewModel`의 `labels: []` 하드코딩을 놓침 → 두 곳 모두 수정 필요했음
- 담당자 필터링: step ID를 selectedIds로 전달했으나 availableMembers는 user ID 사용 → ID 불일치. 우회 대신 `assigneeId` 정식 추가로 해결
- `MemberPickerSection` selectedIds 필터링 추가만으로는 부족 — 타입 체계부터 수정해야 했음

## 수정된 주요 파일

### apps/web
- `features/engineering-change/api/engineering-change.api.ts`
- `features/engineering-change/hooks/use-create-engineering-change-action.ts`
- `features/engineering-change/hooks/use-sync-engineering-change-steps-action.ts`
- `features/engineering-change/hooks/use-sync-engineering-change-reviewers-action.ts`
- `features/engineering-change/hooks/use-reopen-engineering-change-action.ts`
- `features/engineering-change/hooks/use-step-reject-action.ts`
- `features/engineering-change/hooks/use-sync-engineering-change-labels-action.ts` (신규)
- `features/engineering-change/types/engineering-change-model.ts`
- `features/engineering-change/components/engineering-change-detail-screen.tsx`
- `features/change-shared/lib/timeline-event.ts`
- `features/issue/api/issue.api.ts`
- `features/issue/hooks/use-sync-issue-labels-action.ts`
- `features/issue/api/issue.queries.ts`

### packages/components
- `engineering-change-detail-screen.tsx`
- `engineering-change-workflow-section.tsx`
- `engineering-change-sidebar.tsx`
- `member-picker-section.tsx`
- `label-picker-section.tsx`

## Next Steps

1. **EC 화면 전체 QA 계속** — 워크플로우 설정, 라벨, 담당자 등 변경된 기능 실제 동작 확인
2. **미구현 기능들**:
   - 이슈 → EC 생성 UI (`createEcFromIssue` API 래퍼만 있음, hook/UI 없음)
   - `populateWhereUsed` 버튼 UI
   - EC 생성 화면 워크플로우 설정 확장 (현재 reviewer만 가능 → 승인자/배포자/정책 추가)
   - EC deadline 설정 UI (DatePicker) — 모델 준비됨, UI 미구현
