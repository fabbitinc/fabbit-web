# HANDOFF

## Goal

아이템 상세 화면 dev 프로토타입 구현. `/dev/items` 마스터 뷰에서 행 클릭 시 `/dev/items/:partNumber`로 이동하는 상세 화면.

## Current Progress

### 완료된 작업

1. **`src/pages/dev/ItemDetailPreview.tsx` 생성** — 아이템 상세 화면 전체 구현
   - Mock 데이터: 6개 부품 (BRK-001, BRK-002, PLT-001, HSG-002, PCB-001, GR-001)
   - 헤더: 뒤로가기, 편집/더보기 버튼, 품번/상태배지/카테고리/메타정보
   - 4개 탭: 기본정보, BOM, 첨부 파일, 이력
   - 존재하지 않는 품번 → 빈 상태 화면

2. **`src/App.tsx` 수정** — `/dev/items/:partNumber` 라우트 추가

3. **`src/pages/dev/ItemsMasterPreview.tsx` 수정** — 테이블 행 클릭 시 `navigate(`/dev/items/${partNumber}`)` 호출

### 탭 상세

| 탭 | 구현 내용 |
|---|---|
| 기본정보 | 좌: 속성 테이블 (13개 필드) / 우: 요약 카드 3개 (BOM, 첨부, Rev) + 설명 |
| BOM | 전개/역전개 서브탭, 트리 테이블 (table-fixed + colgroup 폭 고정), 접기/펼치기 chevron |
| 첨부 파일 | 파일 카드 리스트 (파일명, 크기, 타입, Rev, 업로드일) |
| 이력 | 타임라인 UI (날짜, 변경자, 액션, Rev 배지, 상세) |

### 적용된 수정사항 (최신)

- 탭명 "도면" → "첨부 파일" (TabKey: `attachments`, 요약 카드 아이콘 Paperclip)
- BOM 전개/역전개 동일 테이블 포맷 (순번 컬럼 제거, 6컬럼: 품번/품명/Rev/재질/수량/단위)
- BOM 트리 테이블: `BomTreeNode` 재귀 구조, `BomTreeRow` 재귀 컴포넌트, depth별 들여쓰기
- 트리 펼침 시 컬럼 폭 변동 방지: `table-fixed` + `colgroup` 적용

## What Worked

- 단일 파일(`ItemDetailPreview.tsx`)에 타입, Mock 데이터, 서브 컴포넌트 모두 배치 → dev 프로토타입으로 적합
- `table-fixed` + `colgroup`으로 트리 펼침/접힘 시 레이아웃 안정화
- 기존 프로젝트 패턴 준수: named export, `@/components/ui/` 래퍼, lucide-react 아이콘

## What Didn't Work

- 특별히 실패한 접근 없음

## Next Steps

- BOM 트리에 다단계 Mock 데이터 보강 (현재 최대 2레벨)
- 첨부 파일 탭에 이미지 프리뷰/썸네일 기능 추가 검토
- 실제 API 연동 시 Mock 데이터 → API 호출로 전환
- 편집 모드 UI 구현 (현재 편집 버튼은 placeholder)
- 반응형 모바일 레이아웃 검토
