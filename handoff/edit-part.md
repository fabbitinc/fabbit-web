# HANDOFF — Part 생성/수정 관리 방안

## Goal

Part(부품)의 생성·수정이 변경 요청(CR) 기반 리뷰 워크플로우를 거쳐 릴리즈되는 구조를 설계·구현한다.

---

## 설계 결정 사항

### 핵심 원칙

- **Part가 진실의 원천(source of truth)** — Part 상세 화면에서 생성·수정하고, CR은 diff 조회 + 리뷰 역할만 담당
- **CR 내부에서 Part를 직접 편집하지 않는다** — Git PR과 동일한 패턴 (브랜치에서 수정 → PR은 리뷰)
- Part:Project = 1:N (하나의 Part가 여러 프로젝트에 속할 수 있음)

### 기본 플로우

```
Part 생성/수정 (Part 상세 화면)
  → draft 리비전 생성 (정식 리비전 아님)
  → 연결된 프로젝트에서 CR 등록
  → CR "변경 내용" 탭에서 before/after diff 확인
  → 리뷰 & 승인
  → 병합(merge) → draft가 released(정식 리비전)으로 릴리즈
```

### 즉시 릴리즈 (CR 생략 옵션)

```
Part 생성/수정 → CR 없이 바로 released 리비전 생성
(프로젝트 설정 + 역할 권한으로 허용 여부 제어)
```

---

## 리비전 상태 모델 (Lifecycle)

| 상태          | 의미                       | 전이                                                |
| ------------- | -------------------------- | --------------------------------------------------- |
| **draft**     | 작성 중, 리뷰 전           | → in_review (CR 등록 시) / → released (즉시 릴리즈) |
| **in_review** | CR에 연결되어 리뷰 진행 중 | → released (CR 병합) / → draft (CR 닫힘/반려)       |
| **released**  | 정식 리비전, 현재 유효     | → obsolete (새 리비전 릴리즈 시)                    |
| **obsolete**  | 과거 리비전, 이력 보존용   | 최종 상태                                           |

- Part당 **released 리비전은 최대 1개**, draft도 최대 1개
- 신규 릴리즈 시 기존 released → obsolete 자동 전이

---

## 1:N 충돌 처리

동일 Part가 여러 프로젝트 CR에서 동시 수정될 수 있는 상황 대응:

- **Part당 draft 리비전 1개만 허용**
- 이미 draft가 있는 Part를 다른 CR에서 수정 시도 → "다른 CR에서 수정 중" 경고
- 기존 draft CR이 병합/닫힌 후에만 새 draft 생성 가능
- 병합 시 base 스냅샷이 변경되었으면 (다른 CR이 먼저 병합됨) → 충돌 경고 → 사용자가 diff 재확인 후 재승인

> 여러 draft를 허용하는 브랜치 방식(3-way merge)은 복잡도가 높아 1차에서는 제외.

---

## 권한/설정 범위

### 즉시 릴리즈 허용 기준

| 레벨                | 설명                                                          |
| ------------------- | ------------------------------------------------------------- |
| **프로젝트 설정**   | 프로젝트별 "즉시 릴리즈 허용" 토글                            |
| **역할 기반**       | 관리자/엔지니어만 즉시 릴리즈 가능, 일반 멤버는 CR 필수       |
| **Part 카테고리별** | 시제품(prototype)은 즉시 OK, 양산(production)은 CR 필수 (2차) |

1차 추천: **프로젝트 설정 + 역할 기반** 조합

### 동작별 권한

| 동작                 | 필요 권한                            |
| -------------------- | ------------------------------------ |
| Part draft 생성/수정 | 프로젝트 멤버                        |
| CR 등록              | 프로젝트 멤버                        |
| CR 병합 (릴리즈)     | 리뷰어 승인 + 병합 권한자            |
| 즉시 릴리즈          | 프로젝트 설정 허용 + 역할 권한       |
| Part obsolete 처리   | 자동 (새 릴리즈 시) 또는 관리자 수동 |

---

## 현재 프론트 구현 상태

### 완료된 것

- CR 상세 화면에 **"변경 내용" 탭** 추가 (PR 타입에서만 표시)
  - `apps/web/src/pages/projects/ChangesDiffTab.tsx` — diff 카드 UI (수정/추가/삭제)
  - `apps/web/src/pages/projects/changeRequestMock.ts` — `PartSnapshot`, `ChangeItem`, `CRChanges` 타입 + mock 데이터
  - `apps/web/src/pages/projects/ChangeRequestDetailPage.tsx` — 탭 바 + 조건부 렌더링
- diff 카드: 접기/펼치기 지원, 변경 유형별 색상 하이라이트 (수정=amber, 추가=emerald, 삭제=red)
- 현재 **mock 데이터 기반 읽기 전용** — 백엔드 스냅샷 API 연결 시 `MOCK_CR_CHANGES`를 실제 데이터로 교체하면 됨

### 아직 없는 것 (Next Steps)

- [ ] 백엔드: Part 리비전 모델 (draft/in_review/released/obsolete)
- [ ] 백엔드: 스냅샷 API (CR별 before/after Part 속성)
- [ ] 백엔드: draft 리비전 생성/수정 엔드포인트
- [ ] 백엔드: CR 병합 시 draft → released 전이 로직
- [ ] 백엔드: 즉시 릴리즈 엔드포인트 + 프로젝트 설정
- [ ] 백엔드: 충돌 감지 (Part당 draft 1개 제한, base 변경 감지)
- [ ] 프론트: Part 상세에서 draft 리비전 편집 UI
- [ ] 프론트: diff UI를 실제 API 데이터로 연결
- [ ] 프론트: 즉시 릴리즈 버튼/설정 UI
- [ ] 프론트: 충돌 경고 UI
