# HANDOFF

## Goal

- 부품 목록 화면의 필터 UX/동작을 안정화한다.
- 부품 상세 화면의 대표 도면 구조를 `DWG`, `SLDPRT`, `SLDASM`까지 수용할 수 있게 재설계한다.

## Current Progress

- 부품 목록 화면 데이터 흐름을 확인했다.
  - `카테고리`, `상태` 드롭다운은 `GET /api/v1/parts/filter-options` 응답을 사용한다.
  - `속성` 드롭다운은 화면에서 직접 정의된 정적 옵션이다.
- 부품 목록 화면의 빈 드롭다운 상태를 처리했다.
  - `packages/components/src/parts-list-screen.tsx`
  - 카테고리 옵션이 없을 때 `표시할 카테고리가 없습니다.`
  - 상태 옵션이 없을 때 `표시할 상태 옵션이 없습니다.`
- 부품 목록 화면의 검색 버튼 버그를 수정했다.
  - 기존에는 검색 버튼에서 `setSearchParams`를 여러 번 연속 호출해서 마지막 변경만 남을 수 있었다.
  - 현재는 `onFiltersApply`를 통해 필터 상태 전체를 한 번에 전달하고, `apps/web/src/pages/parts/parts-page.tsx`에서 URL 파라미터를 원자적으로 갱신한다.
  - 관련 파일:
    - `packages/components/src/parts-list-screen.tsx`
    - `apps/web/src/features/parts/components/parts-list-screen.tsx`
    - `apps/web/src/pages/parts/parts-page.tsx`
- 부품 상세 화면 도면 설계 방향을 사용자와 합의했다.
  - part당 대표 도면은 하나만 둔다.
  - 추가 자료는 첨부파일로 둔다.
  - `DWG`, `SLDPRT`, `SLDASM` 같은 원본은 보관하되, 웹에서 보이기 위한 별도 자산이 필요하다.
  - viewer가 없어도 상세 화면은 열려야 하며, placeholder 또는 업로드 안내를 보여준다.
- 현재 프론트 구조의 한계도 확인했다.
  - `apps/web/src/features/parts/types/parts-model.ts` 의 `PartDrawingModel`은 `viewerType: "PDF" | "GLB"`만 가진다.
  - `apps/web/src/api/generated/orval/model/relatedDrawingResponse.ts`도 `original_file_url`, `viewer_url`, `preview_url` 단일 세트만 가진다.
  - `apps/web/src/features/parts/components/part-detail-screen.tsx`는 현재 viewer 자산이 이미 준비되어 있다는 가정이 강하다.

## What Worked

- 드롭다운 빈 상태를 비활성 안내 항목으로 노출하는 방식은 기존 `DropdownMenu` 구조와 잘 맞았다.
- 검색 버튼 문제는 개별 필터 콜백을 연속 호출하는 대신, 필터 전체를 한 번에 적용하는 방식으로 해결됐다.
- 대표 도면 1개 + 첨부파일 보조 구조는 사용자의 운영 방식과 맞는다.
- 도면 자산을 `원본 / 뷰어용 입력 / 뷰어 / 프리뷰`로 분리하는 설계가 `DWG`, `SolidWorks` 요구사항을 가장 자연스럽게 수용한다.

## What Didn't Work

- 검색 버튼에서 `onQueryChange`, `onCategoryChange`, `onLifecycleStateChange`, `onHasDrawingChange`, `onHasChildrenChange`, `onPageChange`를 순차 호출하는 구조는 안전하지 않았다.
  - React Router `setSearchParams`가 각각 독립적으로 적용되면서 마지막 변경만 남을 수 있었다.
- 현재의 단일 `drawing` 모델은 `DWG`, `SLDPRT`, `SLDASM` 같은 원본과 별도 viewer 자산을 동시에 표현하기에 부족하다.
- 전체 프로젝트 기준 검증은 기존 저장소 오류 때문에 신뢰할 수 없었다.
  - `pnpm --filter @fabbit/web lint` 실패:
    - `apps/web/src/api/generated/orval/model/streamingResponseBody.ts`
  - `pnpm --filter @fabbit/web build` 실패:
    - `apps/web/src/pages/registration/signup-page.tsx`
    - `packages/components/src/file-icon.tsx`
    - `packages/components/src/gltf-viewer-canvas.tsx`
    - `packages/components/src/timeline-event.tsx`

## Next Steps

1. 도면 capability matrix를 확정한다.
   - `PDF`: 원본 그대로 viewer 가능, preview 자동 생성
   - `DXF`: 원본 보관, PDF viewer 생성 대상
   - `STEP/STP`: 원본 보관, GLB viewer 생성 대상
   - `DWG`: 원본 보관, `DXF` 우선 또는 `PDF` fallback 업로드 필요
   - `SLDPRT/SLDASM`: 원본 보관, `STEP` 우선 또는 `GLB` fallback 업로드 필요
2. API 계약을 재설계한다.
   - 현재 단일 `drawing` 응답 대신 대표 도면 아래에 자산 역할을 분리한다.
   - 최소 후보:
     - `originalAsset`
     - `viewerSourceAsset`
     - `viewerAsset`
     - `previewAsset`
   - 상태도 단일 `conversionStatus` 대신 분리한다.
     - `viewerStatus`
     - `previewStatus`
     - `actionRequiredReason`
3. UI/업로드 플로우를 재설계한다.
   - viewer가 없으면 상세 화면에서 placeholder와 CTA를 노출한다.
   - `DWG`, `SLDPRT`, `SLDASM` 업로드 시 추가 업로드 요구를 명확히 안내한다.
   - 우선순위는 `DXF/STEP` 업로드 권장, `PDF/GLB` 직접 업로드는 fallback으로 두는 쪽이 합리적이다.
4. `SLDASM` 정책을 문서화한다.
   - 현재 사용자 답변 기준으로는 조립품 참조 파일을 시스템이 자동으로 해석하지 않는다.
   - 당장은 본파일을 대표 원본으로 보관하고, 참조 파일은 첨부파일로 올리게 하는 방향이 맞다.
   - 추후 필요하면 `zip package` 지원을 검토한다.
5. 실제 구현에 들어갈 때 우선 확인할 파일
   - `apps/web/src/features/parts/types/parts-model.ts`
   - `apps/web/src/features/parts/api/parts.api.ts`
   - `apps/web/src/features/parts/api/parts.types.ts`
   - `apps/web/src/features/parts/components/part-detail-screen.tsx`
   - `apps/web/src/features/parts/components/part-attachments-tab.tsx`
   - Orval 생성 모델 및 OpenAPI 스펙

