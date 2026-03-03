# HANDOFF — 부품 담당자 모델 단순화 + 조직 설정 기본값

## Goal

부품(Part) 담당자 모델을 단순화하고, 조직 설정에서 카테고리별 기본 담당팀/담당자를 지정하는 화면을 구현한다.

---

## 설계 결정 사항

### 배경 (왜 단순화하는가)

기존 모델은 부품마다 `6개 직무(discipline) × N명 담당자 × M개 담당팀`을 붙이는 구조였다.
이는 주류 PLM(Teamcenter, Windchill, ENOVIA 등)의 표준과 다르고, 관리 포인트가 폭발적으로 증가한다.

**기존 모델:**
```
Part ──┬── Assignees: [{user, discipline}, {user, discipline}, ...]
       └── AssignedTeams: [{team, discipline}, {team, discipline}, ...]
```

**신규 모델:**
```
Part ──┬── 담당자 (Owner): 1명 (optional)
       └── 담당팀: 1개 (optional)
```

- **discipline(직무) 구분 제거** — 부품 레벨에서도 CR 레벨에서도 불필요
- 다직무 협업은 CR에 리뷰어(사람)를 추가하는 것으로 충분 (GitHub PR 방식)
- 직무별 워크플로우 단계는 규제 산업 등 필요가 확인된 후 도입
- 부품 레벨에서는 "이 부품의 책임자/팀이 누구인가"만 답하면 됨
- 담당자, 담당팀 모두 optional

### 조직 설정: 카테고리별 기본값

조직 설정 → 새 탭(또는 기존 탭 확장)에서 부품 카테고리별 기본 담당팀/담당자를 설정한다.

```
조직 설정 → 부품 담당 기본값
┌──────────┬───────────┬───────────┐
│ 카테고리  │ 기본 담당팀 │ 기본 담당자 │
├──────────┼───────────┼───────────┤
│ 조립품    │ 설계1팀    │ —         │
│ 가공품    │ 가공팀     │ —         │
│ 구매품    │ 구매팀     │ —         │
│ 표준품    │ —         │ —         │
│ (기본값)  │ 설계1팀    │ —         │
└──────────┴───────────┴───────────┘
```

- 카테고리 = Part.category 필드 (관리 유형: 조립품/가공품/구매품/표준품 등)
- 자유 입력 string이므로, 실제 값은 `GET /api/v1/parts/filter-options`의 DISTINCT 결과에서 가져옴
- 기술 분야(전자/기구 등)와는 다른 축이지만, 현재 유일한 분류 필드이므로 이것으로 시작
- 나중에 기술 분야 필드가 추가되면 매핑 키를 전환할 수 있음 (설정 UI 구조는 동일)
- "(기본값)" 행: 카테고리가 없거나 매핑이 없는 부품에 적용되는 fallback
- 새 부품 생성 시 카테고리에 맞는 기본 담당팀/담당자가 자동 배정됨
- 개별 부품에서 오버라이드 가능

---

## 현재 구현 상태

### 조직 설정 페이지
- **파일:** `apps/web/src/pages/organization/OrganizationSettingsPage.tsx`
- **기존 탭:** 일반, 멤버, 보안, 로그 기록, 기타 설정 (`VALID_TABS`)
- 부품 관련 설정 탭은 아직 없음
- 탭 추가 패턴: `settingsTabs` 배열 (90~96행) + `VALID_TABS` Set (83행)

### 부품 상세 — 담당자 탭 (리팩터링 대상)
- **파일:** `apps/web/src/pages/parts/PartDetailPage.tsx` (1164행~ `AssigneesTab`)
- 현재 discipline 기반 복잡한 UI (6개 직무별 그룹화, 멤버/팀 각각 Popover 추가)
- **리팩터링 후:** discipline 선택 제거, 담당자 1명 + 담당팀 1개만 표시/선택

### 관련 API
- **부품 담당자 API:** `apps/web/src/api/parts.ts`
  - `GET/POST/DELETE /api/v1/parts/{part_id}/assignees`
  - `GET/POST/DELETE /api/v1/parts/{part_id}/assigned-teams`
- **타입:** `apps/web/src/api/types/parts.ts` (Discipline, PartAssigneeSummary 등)
- **훅:** `apps/web/src/api/hooks/useParts.ts` (usePartAssignees, useAddPartAssignees 등)
- **조직 설정 기본값 API:** 아직 없음 — 백엔드에 새 엔드포인트 필요

### 기존 참고 자원
- 팀 목록 조회: `useTeams` 훅 있음 (`apps/web/src/api/hooks/useTeams.ts`)
- 멤버 조회: `lookupOrgMembers` 함수 있음 (`apps/web/src/api/lookup.ts`)
- 부품 카테고리 필터: `GET /api/v1/parts/filter-options`에서 카테고리 목록 조회 가능

---

## Next Steps

### 1. 조직 설정 — "부품" 탭 추가
- `OrganizationSettingsPage.tsx`에 새 탭 추가 (예: `{ id: "parts", label: "부품", icon: ... }`)
- 탭 내용: 카테고리별 기본 담당팀/담당자 매핑 테이블
- 행 추가/삭제, 팀 선택(Select), 담당자 선택(Select, optional)
- "(기본값)" 행은 항상 존재, 삭제 불가
- 백엔드 API가 나올 때까지 UI만 먼저 구현 가능 (mock 또는 로컬 상태)

### 2. 부품 상세 — 담당자 탭 단순화
- `AssigneesTab` 컴포넌트 리팩터링
- discipline 선택 UI 제거
- 담당자: 1명 선택 (현재 사용자 표시 + 변경 가능)
- 담당팀: 1개 선택 (현재 팀 표시 + 변경 가능)
- 둘 다 optional, 비어있으면 "미지정" 표시

### 3. API/타입 정리
- `Discipline` 타입 및 관련 상수(`DISCIPLINE_LABELS`, `DISCIPLINE_ORDER`) 부품 담당자에서 제거
- `ManageAssigneesRequest`/`ManageTeamAssignmentsRequest` 단순화 (배열 → 단일 값)
- 조직 설정 기본값 API 타입 정의 (백엔드 스펙 나오면)

### 4. 백엔드에 필요한 것 (프론트 구현 전 확인)
- [ ] 카테고리별 기본 담당팀/담당자 CRUD 엔드포인트
- [ ] 부품 생성 시 기본값 자동 적용 로직
- [ ] 기존 assignee API가 discipline 없이 동작하도록 수정 (또는 새 API)
