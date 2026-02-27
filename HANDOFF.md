# HANDOFF.md

## Goal

프로젝트 이슈 화면의 댓글(Comment) 기능 API 연동 및 관련 UI 개선.

## Current Progress

### 1. 댓글 CRUD API 연동 완료

백엔드 OpenAPI 스펙에 정의된 3개 엔드포인트를 프론트엔드에 연동함:

- `POST /api/v1/projects/{project_id}/issues/{issue_id}/comments` — 댓글 생성
- `PATCH /api/v1/projects/{project_id}/issues/{issue_id}/comments/{comment_id}` — 댓글 수정
- `DELETE /api/v1/projects/{project_id}/issues/{issue_id}/comments/{comment_id}` — 댓글 삭제

**변경 파일:**

| 파일 | 내용 |
|---|---|
| `apps/web/src/api/types/issue.ts` | `CommentDto`, `CreateCommentRequest`, `UpdateCommentRequest` 타입 추가. body는 `Record<string, unknown>` (TipTap JSON) |
| `apps/web/src/api/issue.ts` | `createIssueComment`, `updateIssueComment`, `deleteIssueComment` API 함수 추가 |
| `apps/web/src/api/hooks/useIssues.ts` | `useCreateIssueComment`, `useUpdateIssueComment`, `useDeleteIssueComment` React Query 훅 추가 |

### 2. 댓글 body를 TipTap JSON 형식으로 변경

처음에 댓글 body를 plain string으로 구현했으나, OpenAPI 스펙 확인 결과 이슈 body와 동일하게 `TipTapDocument` (JSON) 형식임을 확인하고 전체 수정:

- 타입: `string` → `Record<string, unknown> | null`
- API 함수: 파라미터/반환 타입 모두 JSON 객체로 변경
- Hook: mutation 시그니처 변경
- `IssueTimelineCommentDto.body`도 `Record<string, unknown> | null`로 변경
- UI 댓글 렌더링: plain text → `TiptapEditor` (읽기전용)로 변경
- UI 댓글 입력: `onChangeText` → `onChangeJson`으로 변경, ref 기반으로 JSON 수집

### 3. 라벨 API를 PUT 동기화 방식으로 변경

기존 `linkIssueLabels` (POST) + `unlinkIssueLabels` (DELETE) 분리 호출을 `syncIssueLabels` (PUT) 단일 호출로 교체:

- `PUT /api/v1/projects/{project_id}/issues/{issue_id}/labels` — `{ label_ids: string[] }` 전달하면 서버가 diff 자동 처리
- `ProjectDetailPage.tsx`에서 diff 계산 로직 제거, `syncIssueLabelsMutation.mutate(labelIds)` 한 줄로 단순화

**변경 파일:**

| 파일 | 내용 |
|---|---|
| `apps/web/src/api/issue.ts` | `linkIssueLabels`, `unlinkIssueLabels` 제거 → `syncIssueLabels` 추가 |
| `apps/web/src/api/hooks/useIssues.ts` | `useLinkIssueLabels`, `useUnlinkIssueLabels` 제거 → `useSyncIssueLabels` 추가 |
| `apps/web/src/pages/projects/ProjectDetailPage.tsx` | import 변경, diff 로직 제거, sync 호출로 교체 |

### 4. UI 개선

- **사이드 패널 "생성일" 제거** (`ChangeRequestDetailPage.tsx`)
- **"0분 전" → "방금"** 표기 변경 (`ChangeRequestDetailPage.tsx`, `ProjectDetailPage.tsx` 두 곳의 `timeAgo` 함수)

### 5. 댓글 입력 UI API 연동 완료

`ChangeRequestDetailPage.tsx`에 `onAddComment` / `isCommentPending` props 추가하여 `ProjectDetailPage.tsx`의 `IssuesView`에서 `useCreateIssueComment` 훅으로 연결됨.

## What Worked

- TipTap JSON 형식은 `onChangeJson` 콜백 + `useRef`로 수집하고, 제출 후 `key` prop 증가로 에디터 리셋하는 패턴이 잘 동작
- 타임라인의 댓글 렌더링은 `typeof content === "object"` 분기로 TipTap JSON / 기존 string mock 데이터 모두 호환 가능하게 처리

## What Didn't Work

- TiptapEditor에 `content` prop을 state로 제어하려 했으나, `useEditor`가 초기값만 사용하고 이후 prop 변경을 무시함 → `key` prop 패턴으로 해결
- 처음에 댓글 body를 plain string으로 구현했다가 전체 수정 필요했음 → OpenAPI 스펙을 먼저 꼼꼼히 확인할 것

## Next Steps

- [ ] **댓글 수정/삭제 UI 연동**: `useUpdateIssueComment`, `useDeleteIssueComment` 훅은 만들어져 있으나 UI에서 아직 사용하지 않음. 타임라인 댓글 항목에 수정/삭제 버튼 추가 필요 (본인 댓글만)
- [ ] **PR(변경 반영) 탭 API 연동**: `PullRequestsView`는 아직 `MOCK_PRS` mock 데이터 사용 중
- [ ] **이슈 목록 mock 데이터 정리**: `ProjectDetailPage.tsx`에 import된 `MOCK_ISSUES`, `MOCK_PRS` 중 이슈 쪽은 실제 API로 전환 완료됐으나 mock import가 남아있을 수 있음
- [ ] **`timeAgo` 함수 중복**: `ChangeRequestDetailPage.tsx`와 `ProjectDetailPage.tsx`에 동일한 `timeAgo` 함수가 각각 정의되어 있음. 공통 유틸로 추출 고려
