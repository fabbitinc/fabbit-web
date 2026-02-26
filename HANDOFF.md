# HANDOFF — Fabbit Web 현재 상태

## 프로젝트 개요

Fabbit은 AI 기반 초경량 PLM. 도면 업로드 → AI가 표제란/부품표 인식 → BOM 자동 생성.
타겟: ERP는 쓰지만 PLM 없이 엑셀+폴더로 부품/BOM을 관리하는 제조 기업.

---

## 1. 첨부 파일 탭 API 연동 ✅ 완료

Part 상세 페이지 "첨부 파일" 탭을 로컬 mock → 실제 백엔드 API 연동.

### 변경 파일

| 파일 | 변경 |
|------|------|
| `src/api/types/parts.ts` | `PartFileItem`, `AttachFilesRequest` 타입 추가. `PartDetailResponse`에 `files` 필드 추가 |
| `src/api/parts.ts` | `attachFilesToPart()`, `detachFileFromPart()` API 함수 추가 |
| `src/api/hooks/useParts.ts` | `useAttachFiles()` (presigned URL 병렬 업로드 → 일괄 연결), `useDetachFile()` mutation 추가 |
| `src/pages/parts/PartDetailPage.tsx` | `AttachmentsTab` 리팩토링: props 기반, API 연동, ConfirmDialog 삭제 확인, 다운로드는 fetch→blob 방식 |

### API 엔드포인트

- `POST /api/v1/parts/{part_id}/files` — `{ file_ids: string[] }` → `PartFileItem[]`
- `DELETE /api/v1/parts/{part_id}/files/{file_id}` — void

### 다운로드 구현

`<a target="_blank">` 대신 `fetch → blob → createObjectURL → a.download` 방식 사용.
새 창 열리지 않고 바로 다운로드. 로컬 HTTP 환경에서 blob: insecure connection 경고는 프로덕션 HTTPS에서 해소.

---

## 2. BOM 전개 뷰 ✅ 완료 (이전 세션)

`/parts/:partId/bom` 페이지로 정전개/역전개 트리 전개 뷰 구현 완료.
3종 뷰(Multi-Level, Single-Level, Flattened) + 사이드 패널 부품 요약.

### 잔여 작업

- [ ] `src/pages/parts/bom/mock-data.ts` 삭제 (미사용)
- [ ] 사이드 패널 실제 데이터 연동 (현재 BomDisplayNode 데이터만 사용)
- [ ] 대량 노드 가상화 스크롤
- [ ] Flattened 뷰 정렬 기능

---

## 3. 프로젝트 핵심 기능 토론 — 설계 방향 결정 기록

### 토론 배경

"프로젝트 기능이 뭘 해야 하는가?"에 대해 심층 토론. 기존 mock 페이지는 단순 부품 테이블이었는데, 이것이 부품 관리 페이지와 뭐가 다른지 답이 안 됐음.

### 핵심 질문과 결론

**Q1. 프로젝트에서 부품 목록을 보여줘야 하나?**

→ **아니오.** 부품 관리 페이지가 이미 있고, 프로젝트 상세에서 부품 테이블을 또 만들면 중복. 대신 부품 관리 페이지에 "프로젝트" 필터를 추가하면 프로젝트별 부품 조회가 자연스럽게 해결됨. 프로젝트 상세에서 "부품 보기" 클릭 → `/parts?project={id}`로 이동하는 방식.

**Q2. 프로젝트 안에 폴더 구조가 필요한가?**

→ **아니오.** BOM 트리가 곧 프로젝트의 구조. 폴더는 엑셀+파일서버 시절의 차선책이지, PLM에서는 BOM 관계가 구조를 정의함. Fabbit에는 이미 BOM 정전개/역전개 뷰가 있으므로 폴더 계층은 불필요한 중복.

**Q3. 결재/승인 없이 프로젝트만 먼저 만들 수 있나?**

→ **불가.** 결재 없는 프로젝트는 "부품에 라벨 붙이는 기능"에 불과. 부품 관리의 필터 프리셋과 차이 없음. 결재/승인이 있어야 "이 부품 변경을 검토하고 승인하는 워크플로"가 생기고, 그게 프로젝트의 존재 이유.

**Q4. 그러면 프로젝트 = 뭐?**

→ **프로젝트 = 부품의 N:M 라벨 + 결재/승인 워크플로**. 구체적으로:
- 부품은 여러 프로젝트에 속할 수 있고 (N:M)
- 프로젝트는 해당 부품들의 변경에 대한 결재/승인 흐름을 관리
- 결재 = "누가 무엇을 변경했고, 누가 검토/승인했는지"의 추적

### 프로젝트 상세 페이지 — 확정된 구성

| 영역 | 역할 | 비고 |
|------|------|------|
| 프로젝트 정보 | 이름, 설명, 상태, 생성일 | 헤더 카드 |
| 대시보드 | 부품 수, BOM 커버리지, 결재 현황, 최근 변경 | 숫자 요약 |
| 결재/승인 | 결재 목록 + 승인 라인 + 변경 내역 | **프로젝트 존재의 핵심** |
| 활동 로그 | 부품 연결/해제, 결재 이벤트, 상태 변경 타임라인 | 감사 추적 |

**부품 목록은 이 페이지에 없음** — 부품 관리 페이지로 위임.

### 부품 관리 페이지 연동 (미구현)

- 기존 필터(카테고리, 상태, 도면 유무)에 **"프로젝트" 필터 추가** 필요
- 프로젝트 상세에서 "부품 보기" → `/parts?project={id}`로 이동

### 버린 방향들 (Why Not)

| 시도 | 왜 버렸나 |
|------|-----------|
| 프로젝트 = 부품 목록 뷰 | 부품 관리 화면과 기능 중복. "부품에 라벨 붙인 것에 불과" |
| 프로젝트 내 폴더 구조 | 엑셀+폴더 관리와 동일. PLM 가치 없음. BOM 트리가 이미 구조를 제공 |
| 결재 없는 프로젝트 MVP | 독자적 가치 부족. 필터 프리셋과 차이 없음 |

### 살린 인사이트

- **BOM 트리 = 프로젝트 구조**: 폴더 대신 BOM 관계가 구조를 정의
- **뷰/필터 = 폴더 대체**: 동적 필터 조합이 정적 폴더보다 유연
- **프로젝트 필터를 부품 관리에 추가**: 별도 부품 테이블 중복 없이 프로젝트별 부품 조회 가능

### 현재 구현 상태 — Mock UI (재디자인 필요)

`ProjectDetailPage.tsx`를 위 구성에 맞춰 mock 데이터로 1차 구현함. 하지만 **화면 디자인이 확정되지 않았으므로 재디자인 필요**.

현재 mock 구현 내용:
- 대시보드: 4칸 스탯 카드 (총 부품 24, BOM 83%, 결재 2건, 3일 전)
- 결재/승인: 4건 mock (대기/승인/반려/철회), 행 클릭 확장으로 승인 라인 스텝 표시
- 활동 로그: 세로 타임라인 8건 (부품 연결, 결재 요청/승인/반려, 상태 변경, 생성)

**이 파일들은 모두 임시이며, 디자인 확정 후 교체 예정:**
- `ProjectListPage.tsx` — 카드 그리드 (mock 데이터, API 미연동)
- `ProjectDetailPage.tsx` — 헤더 + 대시보드 + 결재 + 활동로그 (mock, 재디자인 대상)
- `ProjectOpsItemDetailPage.tsx` — 이전 임시 결재 상세 (레거시, 삭제 가능)
- `ProjectScheduleDetailPage.tsx` — 이전 임시 일정 상세 (레거시, 삭제 가능)
- `projectOpsMock.ts` — 이전 mock 데이터 (레거시 페이지에서 참조)

### 백엔드 API 현황

- 프로젝트 CRUD: `POST/GET/PATCH/DELETE /api/v1/projects`
- 프로젝트-부품: `GET/POST/DELETE /api/v1/projects/{id}/parts/{part_id}`
- 폴더: `POST/PATCH/DELETE /api/v1/projects/folders` (사용 보류)
- 트리: `GET /api/v1/projects/tree`
- **주의**: `ProjectResponse`에 `status` 필드 없음. 백엔드 추가 필요
- **주의**: `ProjectStats`에 `part_count` 없음 (upload/drawing/folder count만 있음)
- **결재 API 없음** — 백엔드 설계 필요

---

## 4. 기타 잔여 작업

- [ ] 이력 탭 구현 (리비전 변경 이력 + 감사 로그, 백엔드 API 선행 필요)
- [ ] 부품 수동 생성 기능 (현재 AI 파싱으로만 생성 가능)
- [ ] 대체품/호환품 기능 검토

---

## 기술 스택 참고

- React 19 + TypeScript + Vite 7 + TailwindCSS v4
- Zustand (persist), React Router v7, @tanstack/react-query
- UI: shadcn/ui (Radix UI 래퍼), lucide-react 아이콘
- API: axios 기반 apiClient, presigned URL 파일 업로드
- 디자인: Atlassian Design System 참고, CSS 변수 토큰 기반 테마
